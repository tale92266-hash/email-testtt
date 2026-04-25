// server.js (Modified for App Password - Simple Auth)
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

// Setup API Route
app.post('/send-email', (req, res) => {
    const { recipient, subject, message } = req.body;

    if (!recipient || !subject || !message) {
        return res.status(400).json({ success: false, message: '❌ Sabhi fields bharna zaroori hai: recipient, subject, aur message.' });
    }

    const mailOptions = {
        from: `"Nobita Bot" <${GMAIL_USER}>`,
        to: recipient,
        subject: subject,
        text: message,
        html: message 
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
                message: `Email successfully sent to ${recipient}.` 
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
