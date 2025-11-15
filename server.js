// server.js (Modified for App Password - Simple Auth)
const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

// --- Zaroori Middleware ---
// body-parser ki zaroorat nahi, Express me built-in hai
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // 'public' folder ko serve karne ke liye

// --- Environment Variables Configuration ---
// OAuth wale variables (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN) ab use nahi honge
const GMAIL_USER = process.env.EMAIL_USER;
const GMAIL_PASS = process.env.EMAIL_PASS; // App Password yahan aayega
const PORT = process.env.PORT || 5000;


// -----------------------------------------------------------------------
// 💡 APP PASSWORD EMAIL SERVICE LOGIC (Like 'email' repo)
// -----------------------------------------------------------------------

// Transporter setup (Simple App Password)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER, // Yeh apka EMAIL_USER hai
        pass: GMAIL_PASS  // Yeh apka App Password hai
    }
});

// -----------------------------------------------------------------------
// 🌐 API ROUTE (Same as 'email' repo)
// -----------------------------------------------------------------------
app.post('/send-email', (req, res) => {
    // Client-side se aaye data ko lo
    const { recipient, subject, message } = req.body;

    if (!recipient || !subject || !message) {
        // Short comment (User instruction)
        return res.status(400).json({ success: false, message: '❌ Sabhi fields bharna zaroori hai: recipient, subject, aur message.' });
    }

    const mailOptions = {
        from: `"Nobita Bot (App Pass)" <${GMAIL_USER}>`,
        to: recipient,
        subject: subject,
        text: message,
        html: `<b>Hello!</b><br><br>Aapka message:<br><i>${message}</i>` // Simple HTML
    };

    // Mail send karo
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('❌ Error sending mail:', error.message);
            // Free solution (User instruction)
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


// -----------------------------------------------------------------------
// 🚀 SERVER START
// -----------------------------------------------------------------------
app.listen(PORT, () => {
    // Check for critical ENV vars on startup
    if (!GMAIL_USER || !GMAIL_PASS) {
        console.error("⚠️ CRITICAL: EMAIL_USER ya EMAIL_PASS ENV variables missing hain. Email fail hoga.");
    }
    console.log(`🚀 Nobita's Email (App Pass) Server running on port ${PORT}`);
});
