const bcrypt = require('bcryptjs');
const User = require("../models/UserModel");
const CompanyUser = require("../models/CompanyUsers");
const asyncHandler = require("../middleware/async");
const { Op } = require('sequelize');

exports.createUser = asyncHandler(async (req, res, next) => {
    const { name, password, user_type, username, company_id, notes } = req.body;

    try {
        // Initialize user data
        let userData = {
            user_type,
            username,
            company_id,
            notes
        };

        // Include name and password if user_type is 'Company'
        if (user_type === 'Company') {
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Name is required for Company user type!'
                });
            }
            // Add the name field
            userData.name = name;

            if (password) {
                // Hash the password before saving it
                const hashedPassword = bcrypt.hashSync(password, 10);
                userData.password = hashedPassword; // Add the hashed password to the user data
            }
        }

        // Generate account_pk based on the last user (if any)
        const all_users = await User.findAll({
            where: {
                user_type: {
                    [Op.ne]: 'Admin'  // Filter out users with user_type 'Admin'
                }
            }
        });

        let account_pk;
        if (all_users.length > 0) {
            let last_user = all_users[all_users.length - 1];
            let last_user_account = parseFloat(last_user.account_pk.split('A')[1]);
            account_pk = 'A' + (last_user_account + 1);
        } else {
            // First ever account in the system
            account_pk = 'A1';
        }

        // Add the account_pk to userData
        userData.account_pk = account_pk;

        // Create the new user in the database
        const newUser = await User.create(userData);

        // Create a record in CompanyUser to associate the user with the company
        if (user_type === 'Company') {
            await CompanyUser.create({
                company_id: company_id,
                user_id: newUser.id // Assuming the CompanyUser model uses `user_id` and `company_id`
            });
        }

        // Return the response with the newly created user
        return res.status(201).json({
            success: true,
            message: 'User created successfully!',
            user: newUser
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while creating the user.'
        });
    }
});


// Get all companies
exports.getUsers = asyncHandler(async (req, res, next) => {
    try {

        res.render('users/index');  // Render the companies.ejs view with companies data
    } catch (error) {
        next(error);
    }
});

exports.getUsersAjax = asyncHandler(async (req, res, next) => {
    try {
        const companyId = req.params.company_id; // Get company_id from request parameters
        const { user_type } = req.query; // Get user_type from query parameters

        // Build the query to filter users by company_id and user_type
        const whereClause = { company_id: companyId };

        // If user_type is provided, add it to the where clause
        if (user_type) {
            whereClause.user_type = user_type;
        }

        // Fetch users associated with the specific company_id and optionally filtered by user_type
        const users = await User.findAll({
            where: whereClause // Apply the where clause with both company_id and user_type if available
        });

        // Check if users are found
        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No users found for the provided company ID and user type'
            });
        }

        // Return the users data as JSON (for AJAX response)
        res.status(200).json({
            success: true,
            users: users
        });
    } catch (error) {
        next(error);
    }
});


// Get all companies
exports.getAccountUsers = asyncHandler(async (req, res, next) => {
    try {
        // Generate account_pk based on the last user (if any)
        const all_users = await User.findAll({
            where: {
                user_type: {
                    [Op.ne]: 'Admin'  // Filter out users with user_type 'Admin'
                }
            }
        });

        let account_pk;
        if (all_users.length > 0) {
            let last_user = all_users[all_users.length - 1];
            let last_user_account = parseFloat(last_user.account_pk.split('A')[1]);
            account_pk = 'A' + (last_user_account + 1);
        } else {
            // First ever account in the system
            account_pk = 'A1';
        }

        res.render('accounts/index', { account_pk });  // Render the companies.ejs view with companies data
    } catch (error) {
        next(error);
    }
});
