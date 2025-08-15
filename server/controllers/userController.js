const User = require('../models/User');
const TiffinEntry = require('../models/TiffinEntry'); // The one and only require for TiffinEntry

// Initial setup after signup
exports.setupUserDetails = async (req, res) => {
  const { messName, pricePerTiffin, notificationTimes } = req.body;
  const user = await User.findById(req.user._id);
  if (user) {
    user.messName = messName;
    user.pricePerTiffin = pricePerTiffin;
    user.notificationTimes = notificationTimes;
    await user.save();
    res.json({ message: 'User details updated successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// GET data for the dashboard
exports.getDashboardData = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user || !user.messName) {
     return res.status(400).json({ message: 'User setup not complete.' });
  }

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const entries = await TiffinEntry.find({ user: req.user._id, date: { $gte: firstDayOfMonth } });
  
  let totalTiffins = 0;
  entries.forEach(entry => {
    entry.meals.forEach(meal => {
      if (meal.status === 'taken') {
        totalTiffins++;
      }
    });
  });

  const totalBill = totalTiffins * user.pricePerTiffin;

  res.json({
    name: user.name,
    email: user.email,
    messName: user.messName,
    notificationTimes: user.notificationTimes,
    totalTiffins,
    totalBill,
    entries
  });
};

// RECORD a single meal as taken
exports.recordTiffin = async (req, res) => {
  const { time } = req.body;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let entry = await TiffinEntry.findOne({ user: req.user._id, date: today });

  if (!entry) {
    const user = await User.findById(req.user._id);
    const newMeals = user.notificationTimes.map(t => ({ time: t, status: 'pending' }));
    entry = await TiffinEntry.create({ user: req.user._id, date: today, meals: newMeals });
  }

  const mealToUpdate = entry.meals.find(meal => meal.time === time);
  if (mealToUpdate) {
    mealToUpdate.status = 'taken';
  } else {
    entry.meals.push({ time, status: 'taken' });
  }

  await entry.save();
  res.status(200).json({ message: 'Tiffin recorded successfully' });
};

// RECORD a meal as skipped with a reason
exports.skipTiffin = async (req, res) => {
  const { time, reason } = req.body;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let entry = await TiffinEntry.findOne({ user: req.user._id, date: today });

  if (!entry) {
    const user = await User.findById(req.user._id);
    const newMeals = user.notificationTimes.map(t => ({ time: t, status: 'pending' }));
    entry = await TiffinEntry.create({ user: req.user._id, date: today, meals: newMeals });
  }

  const mealToUpdate = entry.meals.find(meal => meal.time === time);
  if (mealToUpdate) {
    mealToUpdate.status = 'skipped';
    mealToUpdate.reason = reason;
  } else {
    entry.meals.push({ time, status: 'skipped', reason: reason });
  }

  await entry.save();
  res.status(200).json({ message: 'Tiffin skip recorded successfully' });
};

// GET current user settings for the modal
exports.getUserSettings = async (req, res) => {
  const user = await User.findById(req.user._id).select('messName pricePerTiffin notificationTimes');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// UPDATE user settings from the modal
exports.updateUserSettings = async (req, res) => {
  const { messName, pricePerTiffin, notificationTimes } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    user.messName = messName || user.messName;
    user.pricePerTiffin = pricePerTiffin || user.pricePerTiffin;
    user.notificationTimes = notificationTimes || user.notificationTimes;
    await user.save();
    res.json({ message: 'Settings updated successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// Save push notification subscription
exports.saveSubscription = async (req, res) => {
  const subscription = req.body;
  await User.findByIdAndUpdate(req.user._id, { pushSubscription: subscription });
  res.status(201).json({ message: 'Subscription saved.' });
};

// DELETE user account and all their data
exports.deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Step 1: Delete all of the user's tiffin entries
    await TiffinEntry.deleteMany({ user: userId });

    // Step 2: Delete the user themselves
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Account and all associated data deleted successfully.' });

  } catch (error) {
    console.error('Error during account deletion:', error);
    res.status(500).json({ message: 'Server error during account deletion.' });
  }
};

// ADD THIS ENTIRE NEW FUNCTION
exports.getHistoryData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const history = await TiffinEntry.aggregate([
      // 1. Find all entries for this user
      { $match: { user: req.user._id } },
      
      // 2. Unwind the meals array to process each meal individually
      { $unwind: '$meals' },
      
      // 3. Filter for only the meals that were actually taken
      { $match: { 'meals.status': 'taken' } },
      
      // 4. Group by year and month, and count the tiffins
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalTiffins: { $sum: 1 }
        }
      },
      
      // 5. Sort by most recent first
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // An array to convert month numbers (1-12) to names
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Calculate the bill for each month and format the data nicely
    const formattedHistory = history.map(item => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      totalTiffins: item.totalTiffins,
      totalBill: (item.totalTiffins * user.pricePerTiffin).toFixed(2)
    }));

    res.json(formattedHistory);

  } catch (error) {
    console.error('Error fetching history data:', error);
    res.status(500).json({ message: 'Server error fetching history.' });
  }
};