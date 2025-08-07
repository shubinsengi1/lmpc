const nodemailer = require('nodemailer');
require('dotenv').config();

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Send donation receipt email
const sendDonationReceipt = async ({ donorEmail, donorName, amount, designation, donationId, date }) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: {
                name: process.env.EMAIL_FROM_NAME || 'Light Mission Pentecostal Church of Atlanta',
                address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
            },
            to: donorEmail,
            subject: `Thank You for Your Donation - Receipt #LMPCA-${donationId}`,
            html: generateReceiptHTML({ donorName, amount, designation, donationId, date }),
            text: generateReceiptText({ donorName, amount, designation, donationId, date })
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Receipt email sent successfully:', result.messageId);
        return result;
    } catch (error) {
        console.error('Error sending receipt email:', error);
        throw error;
    }
};

// Generate HTML receipt template
const generateReceiptHTML = ({ donorName, amount, designation, donationId, date }) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Donation Receipt</title>
        <style>
            body {
                font-family: 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .header {
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                color: white;
                padding: 30px;
                border-radius: 12px 12px 0 0;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }
            .header p {
                margin: 10px 0 0 0;
                opacity: 0.9;
            }
            .content {
                background: white;
                padding: 30px;
                border-radius: 0 0 12px 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .thank-you {
                font-size: 18px;
                color: #059669;
                font-weight: 600;
                margin-bottom: 20px;
            }
            .receipt-details {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
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
                color: #374151;
            }
            .detail-value {
                color: #1f2937;
            }
            .amount {
                font-size: 20px;
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
            .tax-info h3 {
                margin: 0 0 10px 0;
                color: #92400e;
                font-size: 16px;
            }
            .tax-info p {
                margin: 5px 0;
                color: #92400e;
                font-size: 14px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                color: #6b7280;
                font-size: 14px;
            }
            .church-info {
                margin-top: 20px;
                text-align: center;
                font-size: 14px;
                color: #6b7280;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Light Mission Pentecostal Church of Atlanta</h1>
            <p>Growing in Grace, Serving in Love</p>
        </div>
        
        <div class="content">
            <div class="thank-you">Thank you for your generous donation!</div>
            
            <p>Dear ${donorName},</p>
            
            <p>We are deeply grateful for your generous donation to Light Mission Pentecostal Church of Atlanta. Your gift helps us continue our mission of loving God, loving others, and making disciples in our community and around the world.</p>
            
            <div class="receipt-details">
                <div class="detail-row">
                    <span class="detail-label">Receipt Number:</span>
                    <span class="detail-value">#LMPCA-${donationId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${date}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Designation:</span>
                    <span class="detail-value">${designation}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value amount">$${parseFloat(amount).toFixed(2)}</span>
                </div>
            </div>
            
            <div class="tax-info">
                <h3>Tax Information</h3>
                <p><strong>Tax ID:</strong> ${process.env.CHURCH_TAX_ID || '12-3456789'}</p>
                <p>This donation is tax-deductible to the full extent allowed by law. No goods or services were provided in exchange for this contribution.</p>
                <p>Please retain this receipt for your tax records.</p>
            </div>
            
            <p>Your faithfulness in giving is a blessing to our church family and enables us to fulfill the Great Commission. We are grateful for your partnership in ministry.</p>
            
            <p>May God bless you abundantly for your generosity!</p>
            
            <p style="margin-top: 30px;">
                <strong>Blessings,</strong><br>
                The LMPCA Finance Team
            </p>
            
            <div class="church-info">
                <p><strong>Light Mission Pentecostal Church of Atlanta</strong></p>
                <p>123 Faith Street, Atlanta, GA 30309</p>
                <p>Phone: (555) 123-4567 | Email: info@lmpca.org</p>
            </div>
        </div>
        
        <div class="footer">
            <p>If you have any questions about this donation or your receipt, please contact our finance team at finance@lmpca.org or (555) 123-4567.</p>
        </div>
    </body>
    </html>
    `;
};

// Generate plain text receipt
const generateReceiptText = ({ donorName, amount, designation, donationId, date }) => {
    return `
Light Mission Pentecostal Church of Atlanta
Donation Receipt

Dear ${donorName},

Thank you for your generous donation to Light Mission Pentecostal Church of Atlanta!

RECEIPT DETAILS:
- Receipt Number: #LMPCA-${donationId}
- Date: ${date}
- Amount: $${parseFloat(amount).toFixed(2)}
- Designation: ${designation}

TAX INFORMATION:
- Tax ID: ${process.env.CHURCH_TAX_ID || '12-3456789'}
- This donation is tax-deductible to the full extent allowed by law
- No goods or services were provided in exchange for this contribution

Your faithfulness in giving enables us to fulfill our mission of loving God, loving others, and making disciples. We are grateful for your partnership in ministry.

Blessings,
The LMPCA Finance Team

Light Mission Pentecostal Church of Atlanta
123 Faith Street, Atlanta, GA 30309
Phone: (555) 123-4567 | Email: info@lmpca.org

If you have questions about this donation, please contact finance@lmpca.org
    `;
};

// Test email configuration
const testEmailConfig = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('Email configuration is valid');
        return true;
    } catch (error) {
        console.error('Email configuration error:', error);
        return false;
    }
};

module.exports = {
    sendDonationReceipt,
    testEmailConfig
};