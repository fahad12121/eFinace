// seeder.js
const User = require('../models/UserModel'); // Import your User model
const Accessbility = require('../models/Accessbility'); // Import your User model
const sequelize = require('../db'); // Import your sequelize instance
const { Op } = require('sequelize');
// Function to seed the admin user
const seedAcessbility = async () => {
    try {
        // Generate account_pk based on the last user (if any)
        const all_users = await User.findAll({
            where: {
                user_type: {
                    [Op.eq]: 'Admin'  // Filter out users with user_type 'Admin'
                }
            }
        });

        // console.log(all_users);

        // Iterate over all admin users and create an accessibility record
        for (let i = 0; i < all_users.length; i++) {
            await Accessbility.create({
                user_id: all_users[i].id  // Use the correct field for user ID
            });
        }

        console.log('Admin user seeded successfully!');
    } catch (error) {
        console.error('Error seeding admin user:', error);
    } finally {
        // Close the database connection
        sequelize.close();
    }
};

// Run the seeding function
seedAcessbility();
