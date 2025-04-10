const bcrypt = require('bcryptjs');
const subAccount = require("../models/subAccounts");
const asyncHandler = require("../middleware/async");
const { Op } = require('sequelize');

// Function to create a new sub account
exports.createSubaccount = asyncHandler(async (req, res, next) => {
    const { account_username, account_type_id, user_id, notes, company_id, id } = req.body;

    try {
        // ✅ If userId is provided → update the user's notes only
        if (id) { 
            const sub_Account = await subAccount.findByPk(id);

            if (!sub_Account) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            sub_Account.notes = notes;
            sub_Account.account_username = account_username;
            await sub_Account.save();

            return res.status(200).json({
                success: true,
                message: "Sub Account updated successfully!",
                sub_Account
            });
        }

        // ✅ Else → Create new user
        // Create a new instance of subAccount with the provided data
        let newSubAccount = {
            account_username,
            account_type_id,
            user_id,
            company_id,
            notes,
            sub_account_pk: null, // We'll assign the PK dynamically
            balance: 0, // Default balance is 0 (you can change this based on your logic)
        };

        // Fetch all sub accounts to determine the last sub account
        const allSubAccounts = await subAccount.findAll();

        // Check if there are existing sub accounts
        if (allSubAccounts.length > 0) {
            let lastSubAccount = allSubAccounts[allSubAccounts.length - 1];
            let lastSubAccountNumber = parseFloat(lastSubAccount.sub_account_pk.split('SA')[1]);
            newSubAccount.sub_account_pk = 'SA' + (lastSubAccountNumber + 1);
        } else {
            // First sub account in the system
            newSubAccount.sub_account_pk = 'SA1';
        }

        // Now check for uniqueness based on sub_account_pk (if needed, you can use a unique constraint in the database)
        const existingSubAccount = await subAccount.findOne({
            where: {
                sub_account_pk: newSubAccount.sub_account_pk
            }
        });

        if (existingSubAccount) {
            throw new Error('Sub Account Already exists');
        }

        // Create and save the new subAccount
        const createdSubAccount = await subAccount.create(newSubAccount);

        console.log('new', createdSubAccount);

        // Return a success response with the created sub account data
        return res.status(201).json({
            success: true,
            message: 'Sub Account created successfully!',
            subAccount: createdSubAccount
        });

    } catch (error) {
        console.error('error', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while creating the sub account.',
            error: error.message
        });
    }
});
