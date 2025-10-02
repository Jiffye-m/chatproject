export function createWelcomeEmailTemplate(name, clientURL) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Messenger</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background: linear-gradient(to right, #36D1DC, #5B86E5); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="https://img.freepik.com/free-vector/hand-drawn-message-element-vector-cute-sticker_53876-118344.jpg?t=st=1741295028~exp=1741298628~hmac=0d076f885d7095f0b5bc8d34136cd6d64749455f8cb5f29a924281bafc11b96c&w=1480" alt="Messenger Logo" style="width: 80px; height: 80px; margin-bottom: 20px; border-radius: 50%; background-color: white; padding: 10px;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 500;">Welcome to Messenger!</h1>
    </div>
    <div style="background-color: #ffffff; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      <p style="font-size: 18px; color: #5B86E5;"><strong>Hello ${name},</strong></p>
      <p>We're excited to have you join our messaging platform! Messenger connects you with friends, family, and colleagues in real-time, no matter where they are.</p>
      
      <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #36D1DC;">
        <p style="font-size: 16px; margin: 0 0 15px 0;"><strong>Get started in just a few steps:</strong></p>
        <ul style="padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 10px;">Set up your profile picture</li>
          <li style="margin-bottom: 10px;">Find and add your contacts</li>
          <li style="margin-bottom: 10px;">Start a conversation</li>
          <li style="margin-bottom: 0;">Share photos, videos, and more</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href=${clientURL} style="background: linear-gradient(to right, #36D1DC, #5B86E5); color: white; text-decoration: none; padding: 12px 30px; border-radius: 50px; font-weight: 500; display: inline-block;">Open Messenger</a>
      </div>
      
      <p style="margin-bottom: 5px;">If you need any help or have questions, we're always here to assist you.</p>
      <p style="margin-top: 0;">Happy messaging!</p>
      
      <p style="margin-top: 25px; margin-bottom: 0;">Best regards,<br>The Messenger Team</p>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p>© 2025 Messenger. All rights reserved.</p>
      <p>
        <a href="#" style="color: #5B86E5; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
        <a href="#" style="color: #5B86E5; text-decoration: none; margin: 0 10px;">Terms of Service</a>
        <a href="#" style="color: #5B86E5; text-decoration: none; margin: 0 10px;">Contact Us</a>
      </p>
    </div>
  </body>
  </html>
  `;
}

export function createVerificationEmailTemplate(name, verificationLink) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - ChatApp</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background: linear-gradient(to right, #3B82F6, #1D4ED8); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <div style="width: 80px; height: 80px; margin: 0 auto 20px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 32px; color: #3B82F6;">✉️</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Verify Your Email</h1>
    </div>
    <div style="background-color: #ffffff; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      <p style="font-size: 18px; color: #3B82F6; font-weight: 600;"><strong>Hi ${name},</strong></p>
      <p style="font-size: 16px; margin-bottom: 25px;">Thank you for signing up for ChatApp! To complete your registration and start chatting, please verify your email address.</p>
      
      <div style="background-color: #F8FAFC; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #3B82F6;">
        <p style="font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">Why verify your email?</p>
        <ul style="padding-left: 20px; margin: 0; color: #64748B;">
          <li style="margin-bottom: 8px;">Secure your account</li>
          <li style="margin-bottom: 8px;">Receive important notifications</li>
          <li style="margin-bottom: 8px;">Enable password reset</li>
          <li style="margin-bottom: 0;">Access all features</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 35px 0;">
        <a href="${verificationLink}" style="background: linear-gradient(to right, #3B82F6, #1D4ED8); color: white; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);">Verify Email Address</a>
      </div>
      
      <div style="background-color: #FEF2F2; border: 1px solid #FECACA; padding: 15px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0; color: #DC2626; font-size: 14px; font-weight: 500;">⚠️ This verification link will expire in 24 hours for security reasons.</p>
      </div>
      
      <p style="font-size: 14px; color: #6B7280; line-height: 1.6; margin: 20px 0 0 0;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${verificationLink}" style="color: #3B82F6; word-break: break-all;">${verificationLink}</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
      
      <p style="margin-bottom: 5px; font-size: 14px;">If you didn't create an account with ChatApp, you can safely ignore this email.</p>
      
      <p style="margin-top: 25px; margin-bottom: 0; font-weight: 600;">Best regards,<br>The ChatApp Team</p>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p>© 2025 ChatApp. All rights reserved.</p>
      <p>
        <a href="#" style="color: #3B82F6; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
        <a href="#" style="color: #3B82F6; text-decoration: none; margin: 0 10px;">Terms of Service</a>
        <a href="#" style="color: #3B82F6; text-decoration: none; margin: 0 10px;">Contact Us</a>
      </p>
    </div>
  </body>
  </html>
  `;
}
