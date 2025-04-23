const bcrypt = require('bcryptjs');
const User = require("../models/UserModel");
const CompanyUser = require("../models/CompanyUsers");
const subAccount = require("../models/subAccounts");
const AccountType = require("../models/AccountType");
const asyncHandler = require("../middleware/async");
const { Op } = require('sequelize');
const { forEach } = require('jszip');

// User Crud Starts here

exports.createUser = asyncHandler(async (req, res, next) => {
    const { name, password, user_type, username, company_id, notes, userId } = req.body;
    try {
        // ✅ If userId is provided → update the user's notes only
        if (userId) {
            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            user.notes = notes;
            await user.save();

            return res.status(200).json({
                success: true,
                message: "User notes updated successfully!",
                user
            });
        }

        // ✅ Else → Create new user

        // Prepare user data
        let userData = {
            user_type,
            username,
            company_id,
            notes
        };

        // Add name/password if user_type is 'Company'
        if (user_type === 'Company') {
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Name is required for Company user type!'
                });
            }

            userData.name = name;

            if (password) {
                const hashedPassword = bcrypt.hashSync(password, 10);
                userData.password = hashedPassword;
            }
        }

        // Generate account_pk
        const all_users = await User.findAll({
            where: {
                user_type: { [Op.ne]: 'Admin' }
            }
        });

        let account_pk;
        if (all_users.length > 0) {
            let last_user = all_users[all_users.length - 1];
            let last_user_account = parseFloat(last_user.account_pk.split('A')[1]);
            account_pk = 'A' + (last_user_account + 1);
        } else {
            account_pk = 'A1';
        }

        userData.account_pk = account_pk;

        const newUser = await User.create(userData);

        if (user_type === 'Company') {
            await CompanyUser.create({
                company_id: company_id,
                user_id: newUser.id
            });
        }

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

        const totalBalance = account.subAccounts.reduce((accumulator, currentValue) => {
            return accumulator + parseFloat(currentValue.balance.replace(/,/g, '')); // Convert the string to a number and sum
        }, 0);


        // Render the account details page with the fetched account data
        res.render('accounts/Detail', {
            account: account,  // Pass the account data (with included subAccounts and AccountType) to the view
            totalBalance
        });
    } catch (error) {
        next(error);  // Handle any errors
    }
});

//favt user function
exports.createFavt = asyncHandler(async (req, res, next) => {
    const { accounts, accountId } = req.body;
    if (accounts && accounts.length > 0) {
        try {
            // Loop through each account ID
            for (let accountId of accounts) {
                // Find the user by account ID
                const user = await User.findOne({ where: { id: accountId } });
                if (user) {
                    // Update the 'is_favt' column to true
                    user.is_favt = true;
                    await user.save();  // Save the changes to the database
                } else {
                    console.log(`User with ID ${accountId} not found.`);
                }
            }

            return res.status(201).json({
                success: true,
                message: 'Users Added to favt!',
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while updating users.',
            });
        }
    } else if (accountId) {
        // Find the user by account ID
        const user = await User.findOne({ where: { id: accountId } });
        if (user) {
            // Update the 'is_favt' column to true
            user.is_favt = true;
            await user.save();  // Save the changes to the database
        } else {
            console.log(`User with ID ${accountId} not found.`);
        }
        return res.status(201).json({
            success: true,
            message: 'Users Added to favt!',
        });
    } else {
        return res.status(400).json({
            success: false,
            message: 'No accounts provided.',
        });
    }
});

// Controller to update the status of a user
exports.updateUserStatus = asyncHandler(async (req, res, next) => {
    const { id, user_id } = req.params;  // Extract companyId and userId from URL parameters
    const { status } = req.body;  // Get the new status (0 or 1) from the request body
    try {
        // Find the user by companyId and userId
        const user = await User.findOne({
            where: {
                id: user_id,
                company_id: id,  // Ensure the user belongs to the company
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update the user status
        user.status = status;  // Set the new status
        await user.save();  // Save the updated user record

        // Respond with success message
        res.status(200).json({ message: 'User status updated successfully', user });
    } catch (error) {
        next(error);  // Pass error to the error-handling middleware
    }
});

//balance sheet function start here
exports.getUsersBalanceSheet = asyncHandler(async (req, res, next) => {
    try {
        const company_id = req.params.id;

        const users = await User.findAll({
            where: { company_id: company_id },
            order: [
                ['balance', 'DESC']  // Sorting by balance in descending order
            ],
        });


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
            } else if (user.balance > 0) {
                plusAccounts.push({
                    user_id: user.id,
                    account: user.username,
                    plus: user.balance.toLocaleString(),  // Format positive balance with commas
                });
            }
        });
        // Assuming you already have the minusAccounts array populated
        const sumOfMinus = minusAccounts.reduce((accumulator, currentValue) => {
            return accumulator + parseFloat(currentValue.minus.replace(/,/g, '')); // Convert the string to a number and sum
        }, 0);

        const sumOfPlus = plusAccounts.reduce((accumulator, currentValue) => {
            return accumulator + parseFloat(currentValue.plus.replace(/,/g, '')); // Convert the string to a number and sum
        }, 0);

        res.render('balancesheet/index', {
            minusAccounts,
            plusAccounts,
            totalMinus: sumOfMinus,  // Pass the formatted total minus
            totalPlus: sumOfPlus,    // Pass the formatted total plus
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


        const leftAccounts = []; // Will hold negative balances (left side)
        const rightAccounts = []; // Will hold sum values (right side)

        // Process the sub-accounts and segregate them into Left and Right based on balance
        user.subAccounts.forEach(subAccount => {
            let userBalance = subAccount.balance;

            if (userBalance < 0) {
                // Negative balance goes to the Left side
                leftAccounts.push({
                    account: subAccount.account_username,
                    negative: `-${Math.abs(userBalance).toLocaleString()}`,  // Negative value shown on the left side
                    balance: userBalance.toLocaleString(),  // Original balance
                });
            } else if (userBalance > 0) {
                // Positive balance goes to the Right side
                rightAccounts.push({
                    account: subAccount.account_username,
                    positive: `${Math.abs(userBalance).toLocaleString()}`,  // Positive balance shown on the right side
                    balance: userBalance.toLocaleString(),
                });
            }
        });

        // Handle the parent user's balance and add them to the correct side
        const parentBalance = user.balance;
        // Assuming you already have the minusAccounts array populated
        let sumOfMinus = leftAccounts.reduce((accumulator, currentValue) => {
            return accumulator + parseFloat(currentValue.balance.replace(/,/g, '')); // Convert the string to a number and sum
        }, 0);

        let sumOfPlus = rightAccounts.reduce((accumulator, currentValue) => {
            return accumulator + parseFloat(currentValue.balance.replace(/,/g, '')); // Convert the string to a number and sum
        }, 0);

        if (parentBalance > 0) {
            sumOfMinus += -parentBalance
        }

        if (parentBalance < 0) {
            sumOfPlus = sumOfPlus - parentBalance;
        }

        console.log(user);

        // Render the ledger page with the data and totals
        res.render('ledger/index', {
            leftAccounts: leftAccounts,  // Accounts with negative balances (Left side)
            rightAccounts: rightAccounts,  // Accounts with positive balances and balance key (Right side)
            totalLeft: sumOfMinus,
            totalRight: sumOfPlus,
            balanceKey: parentBalance,
            user: user// The balance key label
        });

    } catch (error) {
        next(error);  // Handle any errors
    }
});



