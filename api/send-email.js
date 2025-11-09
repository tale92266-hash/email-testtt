// Vercel Serverless Function: /api/send-email.js
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// Note: Ensure these ENV variables are set on Vercel
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const GMAIL_USER = process.env.EMAIL_USER;
const VERCEL_EMAIL_API_KEY = process.env.VERCEL_EMAIL_API_KEY; // Security Key

const REDIRECT_URI = 'https://developers.google.com/oauthplayground'; 

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function createTransporter() {
    if (!GMAIL_USER || !REFRESH_TOKEN) {
        throw new Error("OAuth Email service is not fully configured in ENV.");
    }
    const accessToken = await oAuth2Client.getAccessToken(); 
    
    return nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            type: 'OAuth2',
            user: GMAIL_USER,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken.token, 
        },
    });
}

// Vercel Function Handler
module.exports = async (req, res) => {
    // 1. Security Check
    const authHeader = req.headers['authorization'];
    if (!authHeader || authHeader !== `Bearer ${VERCEL_EMAIL_API_KEY}`) {
        return res.status(401).json({ success: false, message: 'Unauthorized access to email API.' });
    }

    // 2. Input Validation
    const { to, subject, html, text } = req.body;
    if (!to || !subject || !html) {
        return res.status(400).json({ success: false, message: 'Missing required email fields (to, subject, html).' });
    }

    try {
        const transporter = await createTransporter();
        
        const mailOptions = { 
            from: `"👉𝘕𝘖𝘉𝘐 𝘉𝘖𝘛🤟" <${GMAIL_USER}>`, // From address will be consistent
            to, 
            subject, 
            html, 
            text: text || ''
        };

        let info = await transporter.sendMail(mailOptions);
        
        // 3. Success Response
        return res.status(200).json({ 
            success: true, 
            message: 'Email sent successfully via Vercel API.',
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
