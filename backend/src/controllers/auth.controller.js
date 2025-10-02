import { sendWelcomeEmail, sendVerificationEmail } from "../emails/emailHandlers.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // check if email is valid: regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isEmailVerified: false
    });

    const savedUser = await newUser.save();

    // Send verification email
    try {
      await sendVerificationEmail(savedUser.email, savedUser.fullName, verificationToken, ENV.CLIENT_URL);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      // Don't fail the signup if email fails
    }

    res.status(201).json({
      message: "Account created successfully! Please check your email to verify your account.",
      requiresVerification: true,
      email: savedUser.email
    });

  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired verification token",
        expired: true 
      });
    }

    // Verify the user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Generate auth token
    generateToken(user._id, res);

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.fullName, ENV.CLIENT_URL);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }

    res.status(200).json({
      message: "Email verified successfully! Welcome to ChatApp!",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });

  } catch (error) {
    console.error("Error in verifyEmail controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Rate limiting: max 3 attempts per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (user.lastResendAt && user.lastResendAt > oneHourAgo && user.resendAttempts >= 3) {
      return res.status(429).json({ 
        message: "Too many verification emails sent. Please wait 1 hour before requesting another.",
        retryAfter: user.lastResendAt.getTime() + (60 * 60 * 1000) - Date.now()
      });
    }

    // Reset attempts if it's been more than an hour
    if (!user.lastResendAt || user.lastResendAt <= oneHourAgo) {
      user.resendAttempts = 0;
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    user.resendAttempts += 1;
    user.lastResendAt = new Date();

    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, user.fullName, verificationToken, ENV.CLIENT_URL);

    res.status(200).json({
      message: "Verification email sent successfully! Please check your email.",
      attemptsLeft: 3 - user.resendAttempts
    });

  } catch (error) {
    console.error("Error in resendVerification controller:", error);
    res.status(500).json({ message: "Failed to send verification email" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        message: "Please verify your email address to continue",
        requiresVerification: true,
        email: user.email
      });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName, email } = req.body;
    const userId = req.user._id;

    // Validation
    if (fullName !== undefined && !fullName.trim()) {
      return res.status(400).json({ message: "Full name cannot be empty" });
    }

    if (email !== undefined) {
      if (!email.trim()) {
        return res.status(400).json({ message: "Email cannot be empty" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email: email.trim(), 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: "Email is already taken" });
      }
    }

    const updateData = {};

    // Handle profile picture upload
    if (profilePic) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
          folder: "profile_pics",
          width: 200,
          height: 200,
          crop: "fill"
        });
        updateData.profilePic = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(400).json({ message: "Failed to upload profile picture" });
      }
    }

    // Handle other profile updates
    if (fullName !== undefined) {
      updateData.fullName = fullName.trim();
    }

    if (email !== undefined) {
      // If email is changing, require re-verification
      const currentUser = await User.findById(userId);
      if (currentUser.email !== email.trim()) {
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        updateData.email = email.trim();
        updateData.isEmailVerified = false;
        updateData.emailVerificationToken = verificationToken;
        updateData.emailVerificationExpires = verificationExpires;

        // Send verification email to new address
        try {
          await sendVerificationEmail(email.trim(), currentUser.fullName, verificationToken, ENV.CLIENT_URL);
        } catch (error) {
          console.error("Failed to send verification email:", error);
        }
      }
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const response = {
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      isEmailVerified: updatedUser.isEmailVerified,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    // Add message if email verification is required
    if (updateData.email && !updatedUser.isEmailVerified) {
      response.message = "Email updated! Please check your email to verify your new address.";
      response.requiresVerification = true;
    }

    res.status(200).json(response);
  } catch (error) {
    console.log("Error in update profile:", error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email is already taken" });
    }
    
    res.status(500).json({ message: "Internal server error" });
  }
};