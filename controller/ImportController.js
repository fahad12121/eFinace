const asyncHandler = require("../middleware/async");
const XLSX = require('xlsx');
const AccountType = require("../models/AccountType");
const SubAccount = require('../models/subAccounts');
const User = require('../models/UserModel');

exports.getImport = asyncHandler(async (req, res, next) => {
    try {
        const companyId = req.params.id; // Get company_id from request parameters

        // Fetch account types associated with the specific company_id
        const accountTypes = await AccountType.findAll({
            where: { company_id: companyId } // Filter account types by company_id
        });
        res.render('import/index', { accountTypes });  // Render the companies.ejs view with companies data
    } catch (error) {
        next(error);
    }
});

exports.store = asyncHandler(async (req, res, next) => {
    try {
        const account_type_param = req.body.account_type;
        const workBook = XLSX.readFile(req.file.path);

        let sheet_name = workBook.SheetNames[0];
        let sheetData = XLSX.utils.sheet_to_json(workBook.Sheets[sheet_name], {
            header: 1,
            defval: '',
            blankrows: true,
        });

        let headers = sheetData[0];
        let login_index = 0;
        let take_index = 0;
        let give_index = 0;

        // Identifying column indices
        for (let index = 0; index < headers.length; index++) {
            if (headers[index] === 'Login Name') {
                login_index = index;
            } else if (headers[index] === 'Take') {
                take_index = index;
            } else if (headers[index] === 'Give') {
                give_index = index;
            }
        }

        // Iterate through each row of the data (skipping the header)
        for (let index = 1; index < sheetData.length; index++) {
            let account_username = sheetData[index][login_index];

            // Find all sub-accounts for the given account_username and account_type_id
            let sub_accounts = await SubAccount.findAll({
                where: {
                    account_username: account_username,
                    account_type_id: account_type_param,
                },
            });

            // Iterate through each sub-account
            for (i = 0; i < sub_accounts.length; i++) {
                let single_sub_account = sub_accounts[i];

                // Fetch the associated User for the sub-account
                let sub_account_user = await User.findOne({
                    where: { id: single_sub_account.user_id },
                    include: [{
                        model: SubAccount,
                    }],
                });

                if (sub_account_user.company_id == req.params.id) {
                    // Check if the sub-account belongs to the correct company
                    if (account_username == single_sub_account.account_username) {
                        // Process the take and give values
                        let take_val = sheetData[index][take_index];
                        let give_val = sheetData[index][give_index];

                        // Update the sub-account balance based on the "Take" or "Give" value
                        if (parseFloat(take_val) >= 0) {
                            single_sub_account.balance = -take_val;  // Set Take balance
                            await single_sub_account.save();
                        } else if (parseFloat(give_val) >= 0) {
                            single_sub_account.balance = give_val;  // Set Give balance
                            await single_sub_account.save();
                        } else if (take_val === '' && give_val === '') {
                            single_sub_account.balance = 0;  // Set balance to 0 if both Take and Give are empty
                            await single_sub_account.save();
                        }
                    }
                }

                // Now update the parent balance immediately after updating the sub-account balance
                let total_user_balance = 0;
                sub_account_user = await User.findOne({
                    where: { id: single_sub_account.user_id },
                    include: [{
                        model: SubAccount,
                    }],
                });
                
                for (j = 0; j < sub_account_user.subAccounts.length; j++) {
                    total_user_balance += parseFloat(sub_account_user.subAccounts[j].balance);
                }

                // Update parent user's balance immediately
                sub_account_user.balance = total_user_balance;
                await sub_account_user.save();
            }

            // After processing all sub-accounts for this login, update the Account Type for each sub-account's account type
            for (i = 0; i < sub_accounts.length; i++) {
                let single_sub_account = sub_accounts[i];

                // Update Account Type at the end for each sub-account's account type
                await AccountType.update(
                    { updated_at: new Date() },
                    { where: { id: single_sub_account.account_type_id } }
                );
            }
        }

        res.status(200).send({ message: 'Data Imported' });

    } catch (error) {
        next(error);
    }


});

exports.readCsv = asyncHandler(async (req, res, next) => {
    try {
        const account_type_param = req.body.account_type;
        const workBook = XLSX.readFile(req.file.path);

        let sheet_name = workBook.SheetNames[0];
        let sheetData = XLSX.utils.sheet_to_json(workBook.Sheets[sheet_name], {
            header: 1,
            defval: '',
            blankrows: true,
        });

        let headers = sheetData[0];
        let login_index = 0;
        let take_index = 0;
        let give_index = 0;
        let sheetJson = [];

        let account_username = '';
        let take_val = '';
        let give_val = '';
        let is_found = false;

        for (let index = 0; index < headers.length; index++) {
            if (headers[index] === 'Login Name') {
                login_index = index;
            } else if (headers[index] === 'Take') {
                take_index = index;
            } else if (headers[index] === 'Give') {
                give_index = index;
            }
        }

        for (let index = 1; index < sheetData.length; index++) {
            // We are not fetching 0 index because it contains only headers
            let account_username = sheetData[index][login_index];

            let sub_accounts = await SubAccount.findAll({
                where: {
                    account_username: account_username,
                    account_type_id: account_type_param,
                }
            });


            if (sub_accounts.length > 0) {
                is_found = true;
            } else {
                is_found = false;
            }

            account_username = sheetData[index][login_index];
            take_val = sheetData[index][take_index];
            give_val = sheetData[index][give_index];

            sheetJson.push({
                username: account_username,
                take: take_val,
                give: give_val,
                is_found: is_found,
            });
        }
        res.status(200).json({
            success: true,
            sheetJson: sheetJson
        });

    } catch (error) {
        next(error);
    }
});