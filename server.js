// server.js (Updated with Smart Template Router & Backward Compatibility)
const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

// Set Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); 

// Set ENV Vars
const GMAIL_USER = process.env.EMAIL_USER;
const GMAIL_PASS = process.env.EMAIL_PASS; 
const PORT = process.env.PORT || 5000;

// Setup Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER, 
        pass: GMAIL_PASS  
    }
});

// Helper: Beautiful HTML OTP Template (ORIGINAL - DO NOT MODIFY)
const getOtpTemplate = (otp) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
    <div style="background-color: #0f172a; padding: 25px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px;">VerifyHub Security</h1>
    </div>
    <div style="padding: 40px 30px; text-align: center; color: #334155;">
        <h2 style="font-size: 20px; margin-top: 0; color: #1e293b;">Authentication Required</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">An authorized login attempt was detected. Please use the following Secure Access PIN to complete your verification.</p>

        <div style="margin: 35px 0;">
            <span style="font-size: 38px; font-weight: 700; letter-spacing: 8px; color: #2563eb; background-color: #f1f5f9; padding: 20px 40px; border-radius: 8px; display: inline-block; border: 1px dashed #cbd5e1;">${otp}</span>
        </div>

        <p style="font-size: 15px; color: #64748b; margin-top: 30px;">This code is valid for your current session only.</p>
    </div>
    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">If you did not request this OTP, please check your server security logs immediately.</p>
        <p style="font-size: 12px; color: #94a3b8; margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} VerifyHub Native Node Engine</p>
    </div>
</div>
`;

// Helper: Beautiful HTML Reset Link Template (NEW - ADDED FOR CHATVERSE)
const getResetTemplate = (resetLink) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
    <div style="background-color: #0f172a; padding: 25px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px;">VerifyHub Security</h1>
    </div>
    <div style="padding: 40px 30px; text-align: center; color: #334155;">
        <h2 style="font-size: 20px; margin-top: 0; color: #1e293b;">Password Reset Request</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">We received a request to reset the password for your account. Click the button below to set a new password securely.</p>

        <div style="margin: 35px 0;">
            <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block; transition: background-color 0.3s;">Reset Password</a>
        </div>

        <p style="font-size: 14px; color: #64748b; margin-top: 30px;">Or copy and paste this link into your browser:</p>
        <p style="font-size: 12px; color: #2563eb; word-break: break-all;">${resetLink}</p>
    </div>
    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">If you did not request a password reset, please ignore this email or contact support.</p>
        <p style="font-size: 12px; color: #94a3b8; margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} VerifyHub Native Node Engine</p>
    </div>
</div>
`;

// Setup API Route
app.post('/send-email', (req, res) => {
    // Handle all possible incoming payload styles safely
    const { recipient, to, subject, message, html, text, type, otp, resetLink } = req.body;
    const finalTo = recipient || to;

    if (!finalTo || !subject) {
        return res.status(400).json({ success: false, message: '❌ Sabhi fields bharna zaroori hai: recipient/to aur subject.' });
    }

    // Smart Template Router: Default to whatever the old websites were sending
    let finalHtml = html || message || ''; 
    let finalText = text || '';

    // Old Website Logic: If explicitly requests an OTP type, use OTP template
    if (type === 'otp' && otp) {
        finalHtml = getOtpTemplate(otp);
        finalText = `VerifyHub Login OTP: ${otp}`;
    }
    // New ChatVerse Logic: If explicitly requests a Reset type, use Reset template
    else if (type === 'reset' && resetLink) {
        finalHtml = getResetTemplate(resetLink);
        finalText = `Reset your password using this link: ${resetLink}`;
    }

    const mailOptions = {
        from: `"Nobita Bot" <${GMAIL_USER}>`,
        to: finalTo,
        subject: subject,
        text: finalText,
        html: finalHtml 
    };

    // Send Email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('❌ Error sending mail:', error.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Mail bhejte samay error aa gaya. Server logs dekho.' 
            });
        } else {
            console.log('✅ Email sent:', info.response);
            return res.status(200).json({ 
                success: true, 
                message: `Email successfully sent to ${finalTo}.` 
            });
        }
    });
});

// Start Server
app.listen(PORT, () => {
    if (!GMAIL_USER || !GMAIL_PASS) {
        console.error("⚠️ CRITICAL: EMAIL_USER ya EMAIL_PASS ENV variables missing hain. Email fail hoga.");
    }
    console.log(`🚀 Nobita's Email Server running on port ${PORT}`);
});
