import nodemailer from "nodemailer"

// Configure transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // e.g., smtp.gmail.com
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // your email
        pass: process.env.SMTP_PASS, // your email password or app password
    },
});

// Generic send mail function
export const sendMail = async ({ to, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"File Cloud" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        console.log('Email sent:', info.messageId);
        return true;
    } catch (err) {
        console.error('Email sending failed:', err);
        return false;
    }
};

