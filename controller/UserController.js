const bcrypt = require('bcryptjs');
const User = require("../models/UserModel");
const CompanyUser = require("../models/CompanyUsers");
const subAccount = require("../models/subAccounts");
const AccountType = require("../models/AccountType");
const asyncHandler = require("../middleware/async");
const { Op } = require('sequelize');

// User Crud Starts here

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

        // Return the users data as JSON (for AJAX response)
        res.status(200).json({
            success: true,
            users: users
        });
    } catch (error) {
        next(error);
    }
});


// Account function starts here
exports.getAccountUsers = asyncHandler(async (req, res, next) => {
    try {
        const company_id = req.headers['company_id'];
        console.log(company_id);
        // Generate account_pk based on the last user (if any)
        const all_users = await User.findAll({
            where: {
                user_type: {
                    [Op.ne]: 'Admin'  // Filter out users with user_type 'Admin'
                }
            }
        });

        const parent_accounts = await User.findAll({
            where: {
                user_type: {
                    [Op.eq]: 'User'  // Filter out users with user_type 'User'
                }
            }
        });

        // Fetch all sub accounts to determine the last sub account
        const allSubAccounts = await subAccount.findAll();
        let sub_account_pk;
        // Check if there are existing sub accounts
        if (allSubAccounts.length > 0) {
            let lastSubAccount = allSubAccounts[allSubAccounts.length - 1];
            let lastSubAccountNumber = parseFloat(lastSubAccount.sub_account_pk.split('SA')[1]);
            sub_account_pk = 'SA' + (lastSubAccountNumber + 1);
        } else {
            // First sub account in the system
            sub_account_pk = 'SA1';
        }


        let account_pk;
        if (all_users.length > 0) {
            let last_user = all_users[all_users.length - 1];
            let last_user_account = parseFloat(last_user.account_pk.split('A')[1]);
            account_pk = 'A' + (last_user_account + 1);
        } else {
            // First ever account in the system
            account_pk = 'A1';
        }

        res.render('accounts/index', { account_pk, parent_accounts, sub_account_pk });  // Render the companies.ejs view with companies data
    } catch (error) {
        next(error);
    }
});

exports.getSingleAccountUser = asyncHandler(async (req, res, next) => {
    try {
        // Extract company_id (user_id) and account_id from the URL
        const company_id = req.params.id;
        const account_id = req.params.account_id;

        // Fetch the user and include related subAccounts and AccountType
        const account = await User.findOne({
            where: {
                id: account_id,  // account_id in the User table
                company_id: company_id  // company_id to filter the account under the specific company
            },
            include: [{
                model: subAccount,  // Include the associated subAccounts for the user
                where: {
                    user_id: account_id  // Filter the subAccount for the specific user
                },
                required: false,  // Make this optional if not all users have subAccounts
                include: [{
                    model: AccountType,  // Include AccountType model
                }]
            }]
        });


        // Render the account details page with the fetched account data
        res.render('accounts/Detail', {
            account: account,  // Pass the account data (with included subAccounts and AccountType) to the view
        });
    } catch (error) {
        next(error);  // Handle any errors
    }
});

//balance sheet function start here
exports.getUsersBalanceSheet = asyncHandler(async (req, res, next) => {
    try {
        const company_id = req.params.id;

        const users = await User.findAll({
            where: {
                company_id: company_id
            },
        });

        let totalMinus = '';
        let totalPlus = '';

        const minusAccounts = [];
        const plusAccounts = [];

        users.forEach(user => {
            // Handling the balance check and populating the minus and plus account lists
            if (user.balance < 0) {
                minusAccounts.push({
                    user_id: user.id,
                    account: user.username,
                    minus: user.balance.toLocaleString(),  // Format negative balance with commas
                });
                totalMinus += user.balance;
            } else if (user.balance > 0) {
                plusAccounts.push({
                    user_id: user.id,
                    account: user.username,
                    plus: user.balance.toLocaleString(),  // Format positive balance with commas
                });
                totalPlus += user.balance;
            }
        });

        // Format totals
        const formattedTotalMinus = totalMinus.toLocaleString();
        const formattedTotalPlus = totalPlus.toLocaleString();

        res.render('balancesheet/index', {
            minusAccounts,
            plusAccounts,
            totalMinus: formattedTotalMinus,  // Pass the formatted total minus
            totalPlus: formattedTotalPlus,    // Pass the formatted total plus
            company_id
        });

    } catch (error) {
        next(error);
    }
});


//Ledger function start here
exports.getUsersLedger = asyncHandler(async (req, res, next) => {
    try {
        const company_id = req.params.id;  // Extract the company_id from the URL
        const user_id = req.params.user_id;  // Extract the user_id from the URL

        // Fetch the user by user_id and company_id
        const user = await User.findByPk(user_id, {
            where: {
                company_id: company_id  // Only fetch the user under the specific company
            },
            include: [
                {
                    model: subAccount,  // Assuming SubAccount is the related model for user accounts
                    required: false,  // Optional if the user has no sub-accounts
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found under this company." });
        }

        let totalMinus = 0;
        let totalPlus = 0;

        const minusAccounts = [];
        const plusAccounts = [];

        // Process the sub-accounts and segregate them into Minus and Plus based on balance
        user.subAccounts.forEach(subAccount => {
            let userBalance = subAccount.balance;

            if (userBalance < 0) {
                // If balance is negative, show it in Plus (without the negative sign)
                plusAccounts.push({
                    account: subAccount.account_username,
                    plus: Math.abs(userBalance).toLocaleString(),  // Convert negative to positive for Plus
                    balance: userBalance.toLocaleString(),  // Balance for Minus
                });
                totalPlus += Math.abs(userBalance);
            } else if (userBalance > 0) {
                // If balance is positive, show it in Minus (with the negative sign)
                minusAccounts.push({
                    account: subAccount.account_username,
                    minus: `-${userBalance.toLocaleString()}`,  // Show negative value on Minus side
                    balance: `-${userBalance.toLocaleString()}`,  // Balance for Minus
                });
                totalMinus += userBalance;
            }
        });

        // Handle the parent user's balance and add them to the correct side
        if (user) {
            let parentBalance = user.balance;

            if (parentBalance < 0) {
                // If parent user's balance is negative, show it on the Plus side as positive
                plusAccounts.push({
                    account: `${user.username} (Parent)`,
                    plus: Math.abs(parentBalance).toLocaleString(),  // Convert negative to positive for Plus
                    balance: parentBalance.toLocaleString(),  // Parent balance
                });
                totalPlus += Math.abs(parentBalance);
            } else if (parentBalance > 0) {
                // If parent user's balance is positive, show it on the Minus side as negative
                minusAccounts.push({
                    account: `${user.username} (Parent)`,
                    minus: `-${parentBalance.toLocaleString()}`,  // Negative value on Minus side
                    balance: `-${parentBalance.toLocaleString()}`,  // Parent balance
                });
                totalMinus += parentBalance;
            }
        }

        // Render the ledger page with the data and totals
        res.render('ledger/index', {
            minusAccounts: minusAccounts,
            plusAccounts: plusAccounts,
            totalMinus: totalMinus.toLocaleString(),
            totalPlus: totalPlus.toLocaleString(),
            balanceKey: 'Balance',  // Key for the balance row
        });

    } catch (error) {
        next(error);  // Handle any errors
    }
});





