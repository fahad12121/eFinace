const cron = require('node-cron');
const User = require('../models/UserModel'); // Assuming you're using Sequelize or another ORM to interact with the database
console.log(User);
// Schedule the cron job to run every Friday at 12:00 AM
cron.schedule('0 0 * * 5', async () => {
  try {
    console.log('Running cron job to update favorite user status...');

    // Update all users' is_favt to false (or adjust as needed)
    const result = await User.update(
      { is_favt: false }, // Change to false or true based on your requirements
      { where: { is_favt: true } } // Optionally filter to update only favorite users
    );

    console.log(`Successfully updated ${result[0]} users to non-favorite status.`);

  } catch (error) {
    console.error('Error updating user status:', error);
  }
});

console.log('Cron job has been scheduled.');

// Trigger the cron job manually for testing
// (async () => {
//   try {
//     console.log('Manually triggering cron job for testing...');
    
//     // Manually execute the cron job logic
//     const result = await User.update(
//       { is_favt: false }, // Update the favorite status to false
//       { where: { is_favt: true } } // Target users who are currently marked as favorite
//     );

//     console.log(`Successfully manually updated ${result[0]} users to non-favorite status.`);
//   } catch (error) {
//     console.error('Error during manual cron job execution:', error);
//   }
// })();
