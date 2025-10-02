import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate, createVerificationEmailTemplate } from "../emails/emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: "Welcome to Chatify!",
    html: createWelcomeEmailTemplate(name, clientURL),
  });

  if (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }

  console.log("Welcome Email sent successfully", data);
};

export const sendVerificationEmail = async (email, name, verificationToken, clientURL) => {
  const verificationLink = `${clientURL}/verify-email?token=${verificationToken}`;
  
  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: "Verify Your Email - ChatApp",
    html: createVerificationEmailTemplate(name, verificationLink),
  });

  if (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }

  console.log("Verification email sent successfully", data);
  return data;
};