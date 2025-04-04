// seeder.js
const bcrypt = require('bcryptjs');
const User = require('../models/UserModel'); // Import your User model
const sequelize = require('../db'); // Import your sequelize instance

// Function to seed the admin user
const seedAdminUser = async () => {
  try {
   
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin1122', 10);
    console.log(hashedPassword);

    // Create the admin user
    const adminUser = await User.create({
      username: 'superadmin',
      password: hashedPassword,
      user_type: 'Admin', // Set the user_type to 'Admin'
    });

    console.log('Admin user seeded successfully!');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    // Close the database connection
    sequelize.close();
  }
};

// Run the seeding function
seedAdminUser();
