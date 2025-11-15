// Vercel Serverless Function: /api/send-email.js
// MODIFIED to use App Password (like 'email' repo)

const nodemailer = require('nodemailer');

// --- Environment Variables ---
const GMAIL_USER = process.env.EMAIL_USER;
const GMAIL_PASS = process.env.EMAIL_PASS; // App Password yahan aayega
const VERCEL_EMAIL_API_KEY = process.env.VERCEL_EMAIL_API_KEY; // Security Key

// --- Transporter Setup (Simple App Password) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER, // Yeh apka EMAIL_USER hai
        pass: GMAIL_PASS  // Yeh apka App Password hai
    }
});

// --- Vercel Function Handler ---
module.exports = async (req, res) => {
    // 1. Security Check (Same as before)
    const authHeader = req.headers['authorization'];
    if (!authHeader || authHeader !== `Bearer ${VERCEL_EMAIL_API_KEY}`) {
        return res.status(401).json({ success: false, message: 'Unauthorized access to email API.' });
    }

    // 2. Input Validation (Same as before)
    const { to, subject, html, text } = req.body;
    if (!to || !subject || !html) {
        return res.status(400).json({ success: false, message: 'Missing required email fields (to, subject, html).' });
    }

    try {
        const mailOptions = { 
            from: `"👉𝘕𝘖BI 𝘉𝘖𝘛🤟 (App Pass)" <${GMAIL_USER}>`,
            to, 
            subject, 
            html, 
            text: text || ''
        };

        let info = await transporter.sendMail(mailOptions);
        
        // 3. Success Response
        return res.status(200).json({ 
            success: true, 
            message: 'Email sent successfully via Vercel API (App Pass).',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('❌ Vercel Function Email Send Error:', error);
        // 4. Error Response
        return res.status(500).json({ 
            success: false, 
            message: `Failed to send email: ${error.message}`
        });
    }
};
