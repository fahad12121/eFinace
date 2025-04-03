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

            for (i = 0; i < sub_accounts.length; i++) {
                let single_sub_account = sub_accounts[i];

                // Fetch the associated User for the sub-account
                let sub_account_user = await User.findOne({
                    where: { id: single_sub_account.user_id },
                    include: [{
                        model: SubAccount,
                    }],
                });

                if (sub_account_user.company_id == req.params.company_id) {
                    // Current Sub Account is in given company
                    if (account_username == single_sub_account.account_username) {
                        // Now we have our concerned sub account in given company
                        let take_val = sheetData[index][take_index];
                        let give_val = sheetData[index][give_index];

                        if (parseFloat(take_val) >= 0) {
                            // Take Val is not null, so update Take Val
                            single_sub_account.balance = -take_val;
                            await single_sub_account.save();
                        } else if (parseFloat(give_val) >= 0) {
                            // Give Val is not Null, so update Give Val
                            single_sub_account.balance = give_val;
                            await single_sub_account.save();
                        } else if (take_val === '' && give_val === '') {
                            single_sub_account.balance = 0;
                            await single_sub_account.save();
                        }

                        let total_user_balance = 0;


                        for (j = 0; j < sub_account_user.sub_accounts.length; j++) {
                            total_user_balance += parseFloat(
                                sub_account_user.sub_accounts[j].balance
                            );
                        }

                        sub_account_user.balance = total_user_balance;
                        await sub_account_user.save();

                        // Update Account Type at the end also
                        // Update the AccountType
                        await AccountType.update(
                            { updated_at: new Date() },
                            { where: { id: single_sub_account.account_type_id } }
                        );
                    }
                }
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