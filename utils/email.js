const nodemailer = require('nodemailer');

// Create email transporter (configure based on your email service)
const createTransporter = () => {
    // For development, you can use a service like Gmail or Outlook
    // For production, use a professional email service like SendGrid, Mailgun, etc.
    
    if (process.env.EMAIL_SERVICE === 'gmail') {
        return nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD // Use app-specific password
            }
        });
    }
    
    if (process.env.EMAIL_SERVICE === 'smtp') {
        return nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }
    
    // Default: Use Ethereal Email for testing
    return nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'ethereal.user@ethereal.email',
            pass: 'ethereal.pass'
        }
    });
};

const sendDonationReceipt = async (receiptData) => {
    try {
        const transporter = createTransporter();
        const { donorEmail, donorName, amount, designation, donationId, date } = receiptData;
        
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Donation Receipt - Living Mercy Presbyterian Church</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                    font-weight: 600;
                }
                .content {
                    background: white;
                    padding: 30px;
                    border: 1px solid #e2e8f0;
                    border-top: none;
                    border-radius: 0 0 8px 8px;
                }
                .receipt-details {
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #2563eb;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .detail-row:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }
                .detail-label {
                    font-weight: 600;
                    color: #475569;
                }
                .amount {
                    font-size: 24px;
                    font-weight: 700;
                    color: #059669;
                }
                .tax-info {
                    background: #fef3c7;
                    border: 1px solid #f59e0b;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                    color: #64748b;
                    font-size: 14px;
                }
                .contact-info {
                    background: #f1f5f9;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Living Mercy Presbyterian Church</h1>
                <p>Donation Receipt</p>
            </div>
            
            <div class="content">
                <p>Dear ${donorName},</p>
                
                <p>Thank you for your generous donation to Living Mercy Presbyterian Church. Your gift helps us continue our mission of loving God, loving others, and making disciples.</p>
                
                <div class="receipt-details">
                    <div class="detail-row">
                        <span class="detail-label">Donation Amount:</span>
                        <span class="amount">$${amount.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Designation:</span>
                        <span>${designation}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date:</span>
                        <span>${date}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Receipt ID:</span>
                        <span>#LMPC-${donationId}</span>
                    </div>
                </div>
                
                <div class="tax-info">
                    <p><strong>Tax Information:</strong> This receipt serves as your official record for tax purposes. Living Mercy Presbyterian Church is a 501(c)(3) tax-exempt organization (EIN: 12-3456789). No goods or services were provided in exchange for this donation.</p>
                </div>
                
                <div class="contact-info">
                    <h3>Church Contact Information</h3>
                    <p>
                        Living Mercy Presbyterian Church<br>
                        123 Faith Street<br>
                        Cityville, ST 12345<br>
                        Phone: (555) 123-4567<br>
                        Email: info@lmpc.org
                    </p>
                </div>
                
                <p>Your faithfulness in giving is a blessing to our church family and community. We are grateful for your partnership in ministry.</p>
                
                <p>Blessings,<br>
                <strong>Living Mercy Presbyterian Church</strong></p>
            </div>
            
            <div class="footer">
                <p>This is an automated receipt. Please save this email for your records.</p>
                <p>If you have any questions, please contact us at info@lmpc.org or (555) 123-4567.</p>
            </div>
        </body>
        </html>
        `;
        
        const textContent = `
        Living Mercy Presbyterian Church - Donation Receipt
        
        Dear ${donorName},
        
        Thank you for your generous donation to Living Mercy Presbyterian Church.
        
        Donation Details:
        - Amount: $${amount.toFixed(2)}
        - Designation: ${designation}
        - Date: ${date}
        - Receipt ID: #LMPC-${donationId}
        
        Tax Information: This receipt serves as your official record for tax purposes. 
        Living Mercy Presbyterian Church is a 501(c)(3) tax-exempt organization (EIN: 12-3456789). 
        No goods or services were provided in exchange for this donation.
        
        Contact Information:
        Living Mercy Presbyterian Church
        123 Faith Street
        Cityville, ST 12345
        Phone: (555) 123-4567
        Email: info@lmpc.org
        
        Blessings,
        Living Mercy Presbyterian Church
        `;

        const mailOptions = {
            from: process.env.FROM_EMAIL || 'donations@lmpc.org',
            to: donorEmail,
            subject: `Donation Receipt - Thank You for Your Gift ($${amount.toFixed(2)})`,
            text: textContent,
            html: htmlContent,
            attachments: [] // Could add PDF receipt attachment here
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Receipt email sent:', info.messageId);
        
        return {
            success: true,
            messageId: info.messageId,
            recipient: donorEmail
        };
        
    } catch (error) {
        console.error('Error sending receipt email:', error);
        throw new Error('Failed to send donation receipt');
    }
};

const sendAdminNotification = async (donationData) => {
    try {
        const transporter = createTransporter();
        const { donorName, amount, designation, donationId } = donationData;
        
        const htmlContent = `
        <h2>New Donation Received</h2>
        <p><strong>Donor:</strong> ${donorName}</p>
        <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
        <p><strong>Designation:</strong> ${designation}</p>
        <p><strong>Donation ID:</strong> #LMPC-${donationId}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        `;

        const mailOptions = {
            from: process.env.FROM_EMAIL || 'donations@lmpc.org',
            to: process.env.ADMIN_EMAIL || 'admin@lmpc.org',
            subject: `New Donation: $${amount.toFixed(2)} from ${donorName}`,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log('Admin notification sent');
        
    } catch (error) {
        console.error('Error sending admin notification:', error);
        // Don't throw error - admin notification failure shouldn't affect donation process
    }
};

module.exports = {
    sendDonationReceipt,
    sendAdminNotification
};