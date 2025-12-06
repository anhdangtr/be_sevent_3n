const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const Event = require('../models/Event');
const { sendReminderEmail } = require('./emailService');

// Kiểm tra reminders mỗi phút
const startReminderScheduler = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Tìm các reminder trong vòng 2 phút
      const reminders = await Reminder.find({
        isSent: false,
        reminderDateTime: {
          $gte: new Date(now.getTime() - 120000),
          $lte: now
        }
      }).populate('userId').populate('eventId');

      for (const reminder of reminders) {
        try {
          const user = reminder.userId;
          const event = reminder.eventId;

          // Gửi email
          const emailSent = await sendReminderEmail(
            user.email,
            user.name,
            event.title,
            reminder.note,
            reminder.reminderDateTime
          );

          // Cập nhật status nếu gửi thành công
          if (emailSent) {
            reminder.isSent = true;
            await reminder.save();
          }
        } catch (error) {
          console.error(`Lỗi xử lý reminder ${reminder._id}:`, error);
        }
      }
    } catch (error) {
      console.error('Lỗi reminder scheduler:', error);
    }
  });

  console.log('Reminder scheduler đã khởi động');
};

module.exports = { startReminderScheduler };