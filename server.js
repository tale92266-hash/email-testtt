// server.js (Single-file Test Application with OAuth2 Email)
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const path = require('path');

dotenv.config();
const app = express();

// --- Zaroori Middleware ---
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // 'public' folder ko serve karne ke liye

// --- Environment Variables Configuration ---
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const GMAIL_USER = process.env.EMAIL_USER;
const PORT = process.env.PORT || 5000;

// Note: Mongoose ya MongoDB connection ko is test ke liye skip kar diya gaya hai.

// -----------------------------------------------------------------------
// 💡 OAUTH2 EMAIL SERVICE LOGIC (Copy/Pasted from emailService.js)
// -----------------------------------------------------------------------
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'; 

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Transporter Creator with Timeout Fix
async function createTransporter() {
    if (!GMAIL_USER || !REFRESH_TOKEN) {
        throw new Error("OAuth Email service is not fully configured in ENV.");
    }
    
    try {
        const accessToken = await oAuth2Client.getAccessToken(); 
        
        return nodemailer.createTransport({
            service: 'gmail', 
            connectionTimeout: 30000, // Timeout Fix for Render
            socketTimeout: 30000,      // Timeout Fix for Render
            auth: {
                type: 'OAuth2',
                user: GMAIL_USER,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token, 
            },
        });
    } catch (error) {
        console.error("❌ OAuth2 Transporter Failed:", error.message);
        throw new Error(`Invalid OAuth Credentials or Token Expired: ${error.message}`);
    }
}

// Send Email Function
async function sendTestEmail(targetEmail) {
    const transporter = await createTransporter();
    const randomString = Math.random().toString(36).substring(2, 10);

    const mailOptions = { 
        from: `"Nobita Test Bot" <${GMAIL_USER}>`, 
        to: targetEmail, 
        subject: `🚀 Render OAuth Test - Code: ${randomString}`, 
        html: `
            <h2>Hello Samshaad,</h2>
            <p>This is a random test email sent via the **OAuth2 method** from your Nobita server running on Render Free Tier.</p>
            <p><strong>Random Code:</strong> ${randomString}</p>
            <p>If you see this, the **email service is working perfectly!**</p>
        `,
        text: `Test Email. Random Code: ${randomString}`,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log('✅ Test Email sent successfully! Message ID: %s', info.messageId);
    return { success: true, messageId: info.messageId };
}


// -----------------------------------------------------------------------
// 🌐 API ROUTE
// -----------------------------------------------------------------------
app.post('/api/test/send-email', async (req, res) => {
    try {
        const targetEmail = 'samshaad365@gmail.com';
        
        const mailResult = await sendTestEmail(targetEmail);

        return res.status(200).json({ 
            success: true, 
            message: `Test email sent successfully to ${targetEmail}!`,
            messageId: mailResult.messageId
        });

    } catch (error) {
        console.error('❌ API Error during email send:', error.message);
        // Return a detailed error if the email failed
        return res.status(500).json({ 
            success: false, 
            message: `Email sending failed. Error: ${error.message}`
        });
    }
});


// -----------------------------------------------------------------------
// 🚀 SERVER START
// -----------------------------------------------------------------------
app.listen(PORT, () => {
    // Check for critical ENV vars on startup
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !GMAIL_USER) {
        console.error("⚠️ CRITICAL: OAuth ENV variables are missing. Email will fail.");
    }
    console.log(`🚀 Nobita's Email Test Server running on port ${PORT}`);
});
