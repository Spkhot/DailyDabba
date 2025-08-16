// const cron = require('node-cron');
// const webpush = require('web-push');
// const User = require('../models/User');
// const TiffinEntry = require('../models/TiffinEntry');

// const startScheduler = () => {
//   webpush.setVapidDetails(
//     'mailto:your-email@example.com',
//     process.env.VAPID_PUBLIC_KEY,
//     process.env.VAPID_PRIVATE_KEY
//   );

//   // --- JOB 1: Daily Meal Notifications (Runs every minute) ---
//   cron.schedule('* * * * *', async () => {
//     const now = new Date();
//     const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
//     console.log(`Scheduler running. Server time is: ${currentTime}`);

//     try {
//       // LOGIC IMPROVEMENT: Find users who match the time AND have a push subscription.
//       // This is more efficient as the database does the filtering.
//       const usersToNotify = await User.find({ 
//         notificationTimes: currentTime,
//         pushSubscription: { $exists: true, $ne: null } 
//       });

//       if (usersToNotify.length > 0) {
//         console.log(`[Daily Job - SUCCESS] Found ${usersToNotify.length} user(s) with subscriptions for time ${currentTime}.`);
//       }

//       for (const user of usersToNotify) {
//         // No need for an 'if (user.pushSubscription)' check here anymore, as the query guarantees it.
//         console.log(`[Daily Job - SUCCESS] Preparing to send notification to ${user.email}...`);
        
//         const payload = JSON.stringify({
//           title: 'Tiffin Time! 🍱',
//           body: `Hey ${user.name.split(' ')[0]}, did you take your tiffin from ${user.messName}?`,
//           time: currentTime,
//           actions: [
//               { action: 'yes', title: '✅ Yes, I did!' },
//               { action: 'no', title: '❌ No' }
//           ]
//         });

//         webpush.sendNotification(user.pushSubscription, payload)
//           .then(() => console.log(`[Daily Job - SUCCESS] Notification sent to ${user.email}!`))
//           .catch(err => console.error(`[Daily Job - ERROR] Failed to send to ${user.email}:`, err.body || err.message));
//       }
//     } catch (error) {
//       console.error('[Daily Job - CRITICAL ERROR] An error occurred in the scheduler:', error);
//     }
//   });

//   // --- JOB 2: Monthly Summary Notification (Runs once a day at a specific time, e.g., 2 AM UTC) ---
//   // Using UTC for the cron job makes it timezone-independent. '0 2 * * *' means at 2:00 AM UTC every day.
//   console.log('Monthly summary job scheduled to run daily at 02:00 UTC.');
//   cron.schedule('0 2 * * *', async () => {
//     // LOGIC IMPROVEMENT: We will check the last day of the month for EACH USER'S LOCAL TIMEZONE if available.
//     // For now, we will use a robust UTC check which is a massive improvement.
//     const today_utc = new Date();
//     const tomorrow_utc = new Date(today_utc);
//     tomorrow_utc.setUTCDate(today_utc.getUTCDate() + 1);

//     console.log(`[Monthly Job] Running daily check. Today (UTC): ${today_utc.toISOString().split('T')[0]}`);

//     if (tomorrow_utc.getUTCDate() === 1) {
//       console.log(`[Monthly Job - SUCCESS] Today is the last day of the month! Preparing summaries.`);
      
//       try {
//         const users = await User.find({ pushSubscription: { $exists: true, $ne: null } });

//         for (const user of users) {
//           // Define the start and end of the current month in UTC to get all entries correctly.
//           const firstDayOfMonth = new Date(Date.UTC(today_utc.getUTCFullYear(), today_utc.getUTCMonth(), 1));
//           const lastDayOfMonth = new Date(Date.UTC(today_utc.getUTCFullYear(), today_utc.getUTCMonth() + 1, 0, 23, 59, 59));
          
//           const entries = await TiffinEntry.find({ 
//             user: user._id, 
//             date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } 
//           });
          
//           let totalTiffins = 0;
//           entries.forEach(entry => {
//             entry.meals.forEach(meal => {
//               if (meal.status === 'taken') totalTiffins++;
//             });
//           });

//           if (totalTiffins > 0) {
//             const totalBill = totalTiffins * user.pricePerTiffin;
//             const monthName = firstDayOfMonth.toLocaleString('default', { month: 'long', timeZone: 'UTC' });

//             const payload = JSON.stringify({
//               title: `Your ${monthName} Tiffin Summary! 🍱`,
//               body: `You had ${totalTiffins} tiffins for a total bill of ₹${totalBill.toFixed(2)}. The tracker is ready for the new month!`,
//             });

//             console.log(`[Monthly Job] Sending summary to ${user.email}`);
//             webpush.sendNotification(user.pushSubscription, payload).catch(err => {
//               console.error(`[Monthly Job - ERROR] Failed to send summary to ${user.email}:`, err.body);
//             });
//           } else {
//             console.log(`[Monthly Job - INFO] No tiffins recorded for ${user.email} this month. Skipping summary.`);
//           }
//         }
//       } catch (error) {
//         console.error('[Monthly Job - CRITICAL ERROR] An error occurred:', error);
//       }
//     } else {
//         console.log(`[Monthly Job] Not the last day of the month. No action taken.`);
//     }
//   });
// };

// module.exports = { startScheduler };

const cron = require('node-cron');
const webpush = require('web-push');
const User = require('../models/User');
const TiffinEntry = require('../models/TiffinEntry');

const startScheduler = () => {
  webpush.setVapidDetails(
    'mailto:your-email@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  // --- JOB 1: Daily Meal Notifications (Runs every minute) ---
  // (This entire section remains exactly the same. No changes needed here.)
  cron.schedule('* * * * *', async () => {
    const now = new Date();
const currentTime = now.toLocaleTimeString("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});
console.log(`Scheduler running. Server time is (IST): ${currentTime}`);


    try {
      const usersToNotify = await User.find({ 
        notificationTimes: currentTime,
        pushSubscription: { $exists: true, $ne: null } 
      });

      if (usersToNotify.length > 0) {
        console.log(`[Daily Job - SUCCESS] Found ${usersToNotify.length} user(s) for time ${currentTime}.`);
      }

      for (const user of usersToNotify) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await TiffinEntry.findOneAndUpdate(
          { user: user._id, date: today },
          { $setOnInsert: { user: user._id, date: today, meals: user.notificationTimes.map(t => ({ time: t, status: 'pending' })) } },
          { upsert: true }
        );
        console.log(`[Daily Job - INFO] Ensured tiffin entry exists for user ${user.email} for today.`);
        
        console.log(`[Daily Job - SUCCESS] Preparing to send notification to ${user.email}...`);
        
        const payload = JSON.stringify({
          title: 'Tiffin Time! 🍱',
          body: `Hey ${user.name.split(' ')[0]}, did you take your tiffin from ${user.messName}?`,
          time: currentTime,
          actions: [ { action: 'yes', title: '✅ Yes, I did!' }, { action: 'no', title: '❌ No' } ]
        });

        webpush.sendNotification(user.pushSubscription, payload)
          .then(() => console.log(`[Daily Job - SUCCESS] Notification sent to ${user.email}!`))
          .catch(err => console.error(`[Daily Job - ERROR] Failed to send to ${user.email}:`, err.body || err.message));
      }
    } catch (error) {
      console.error('[Daily Job - CRITICAL ERROR] An error occurred in the scheduler:', error);
    }
  });

  // --- JOB 2: Monthly Summary Notification (Runs once a day) ---
  
  // THE FIX IS HERE. We've changed the time and added the timezone option.
  // --- JOB 2: Monthly Summary Notification (Runs once a day) ---
console.log('Monthly summary job scheduled to run daily at 10:00 PM IST.');

cron.schedule('0 22 * * *', async () => { 
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get tomorrow in IST (not UTC)
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  console.log(`[Monthly Job] Running daily check. Today (IST): ${today.toISOString().split('T')[0]}`);

  if (tomorrow.getDate() === 1) {  // ✅ Now it works in IST
    console.log(`[Monthly Job - SUCCESS] Today is the last day of the month! Preparing summaries.`);

    try {
      const users = await User.find({ pushSubscription: { $exists: true, $ne: null } });

      for (const user of users) {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        const entries = await TiffinEntry.find({ 
          user: user._id, 
          date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } 
        });

        let totalTiffins = 0;
        entries.forEach(entry => {
          entry.meals.forEach(meal => {
            if (meal.status === 'taken') totalTiffins++;
          });
        });

        if (totalTiffins > 0) {
          const totalBill = totalTiffins * user.pricePerTiffin;
          const monthName = firstDayOfMonth.toLocaleString('en-IN', { month: 'long', timeZone: 'Asia/Kolkata' });

          const payload = JSON.stringify({
            title: `Your ${monthName} Tiffin Summary! 🍱`,
            body: `You had ${totalTiffins} tiffins for a total bill of ₹${totalBill.toFixed(2)}. The tracker is ready for the new month!`,
          });

          console.log(`[Monthly Job] Sending summary to ${user.email}`);
          webpush.sendNotification(user.pushSubscription, payload).catch(err => {
            console.error(`[Monthly Job - ERROR] Failed to send summary to ${user.email}:`, err.body);
          });
        } else {
          console.log(`[Monthly Job - INFO] No tiffins recorded for ${user.email} this month. Skipping summary.`);
        }
      }
    } catch (error) {
      console.error('[Monthly Job - CRITICAL ERROR] An error occurred:', error);
    }
  } else {
    console.log(`[Monthly Job] Not the last day of the month. No action taken.`);
  }
}, { 
  scheduled: true,
  timezone: "Asia/Kolkata"  // ✅ correct placement
});
};

module.exports = { startScheduler };