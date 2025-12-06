const transporter = require('../config/email');

const EMAIL_USER = process.env.EMAIL_USER && process.env.EMAIL_USER.trim();
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD.trim();

const sendReminderEmail = async (userEmail, userName, eventName, note, reminderDateTime) => {
  // If credentials are not configured, skip attempting to send and log a clear message.
  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    console.warn('[email] Skipping sendReminderEmail: missing EMAIL_USER or EMAIL_PASSWORD');
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `🔔 Nhắc nhở sự kiện: ${eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">⏰ Nhắc Nhở Sự Kiện</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <p>Xin chào <strong>${userName}</strong>,</p>
          
          <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">${eventName}</h2>
            <p><strong>⏱ Thời gian:</strong> ${new Date(reminderDateTime).toLocaleString('vi-VN')}</p>
            ${note ? `<p><strong>📝 Ghi chú:</strong> ${note}</p>` : ''}
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Đây là thông báo tự động từ hệ thống. Vui lòng kiểm tra chi tiết sự kiện của bạn.
          </p>
        </div>
        
        <div style="background: #f0f0f0; padding: 15px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 Event Reminder System. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email gửi thành công đến ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Lỗi gửi email:', error && error.message ? error.message : error);
    return false;
  }
};

module.exports = { sendReminderEmail };