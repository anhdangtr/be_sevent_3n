const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const Event = require('../models/Event');
const { sendReminderEmail } = require('./emailService');

// Hàm kiểm tra và gửi reminders
const checkAndSendReminders = async () => {
  try {
    console.log('🔍 Đang kiểm tra reminders cần gửi...');

    const now = new Date();
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60000);

    // Tìm các reminder cần gửi (trong vòng 5 phút tới và chưa gửi)
    const reminders = await Reminder.find({
      reminderTime: {
        $gte: now,
        $lte: fiveMinutesLater,
      },
      isSent: false,
    }).populate('user event');

    if (reminders.length === 0) {
      console.log('✅ Không có reminder nào cần gửi');
      return;
    }

    console.log(`📧 Tìm thấy ${reminders.length} reminder(s) cần gửi`);

    // Gửi email cho từng reminder
    for (const reminder of reminders) {
      try {
        const success = await sendReminderEmail(
          reminder.user.email,
          reminder.user.name,
          reminder.event,
          reminder.reminderTime
        );

        if (success) {
          // Cập nhật trạng thái đã gửi
          reminder.isSent = true;
          reminder.sentAt = new Date();
          await reminder.save();
          console.log(`✅ Đã gửi reminder cho ${reminder.user.email}`);
        }
      } catch (error) {
        console.error(`❌ Lỗi khi gửi reminder ${reminder._id}:`, error);
      }
    }

    console.log('✅ Hoàn thành kiểm tra reminders');
  } catch (error) {
    console.error('❌ Lỗi trong checkAndSendReminders:', error);
  }
};

// Khởi động cron job (chạy mỗi 5 phút)
const startReminderCron = () => {
  // Chạy mỗi 5 phút
  cron.schedule('*/5 * * * *', () => {
    console.log('⏰ Cron job đang chạy...');
    checkAndSendReminders();
  });

  console.log('✅ Reminder cron job đã được khởi động (mỗi 5 phút)');
  
  // Chạy ngay lần đầu
  checkAndSendReminders();
};

module.exports = {
  startReminderCron,
  checkAndSendReminders,
};