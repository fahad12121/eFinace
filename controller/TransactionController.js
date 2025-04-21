const asyncHandler = require("../middleware/async");
const User = require("../models/UserModel");
const SubAccount = require("../models/subAccounts");
const AccountStatement = require("../models/AccountStatement");
const Transaction = require("../models/Transaction");
const sequelize = require('../db'); // Import the Sequelize instance

exports.getTransaction = asyncHandler(async (req, res, next) => {
    try {
        // Extract company_id (user_id) and account_id from the URL
        const company_id = req.params.id;

        // Fetch the user and include related subAccounts and AccountType
        const sender_accounts = await User.findAll({
            where: {
                company_id: company_id,
                user_type: 'User',  // Only fetch users of type 'User'
            },
            include: [{
                model: SubAccount,  // Include SubAccount association
                required: false,     // Include users without subaccounts too
            }]
        });
        const receiver_accounts = await User.findAll({
            where: {
                company_id: company_id,
                user_type: 'User', // company_id to filter the account under the specific company
            },
            include: [{
                model: SubAccount,  // Include the associated subAccounts for the user
            }]
        });

        res.render('transactions/index', { sender_accounts, receiver_accounts });  // Render the companies.ejs view with companies data
    } catch (error) {
        next(error);
    }
});

// This function handles the transaction creation
exports.createTransaction = asyncHandler(async (req, res, next) => {
    const t = await sequelize.transaction(); // Start a transaction

    try {
        const { sender_sub_account_id, receiver_sub_account_id, amount, narration, transaction_date, company_id, notes } = req.body;

        // Fetch sender sub-account and user
        let sender_sub_account = await SubAccount.findByPk(sender_sub_account_id, { transaction: t });

        let sender_user = await User.findByPk(sender_sub_account.user_id, { transaction: t });


        // Fetch receiver sub-account and user
        let receiver_sub_account = await SubAccount.findByPk(receiver_sub_account_id, { transaction: t });

        let receiver_user = await User.findByPk(receiver_sub_account.user_id, { transaction: t });
        if (!receiver_user) throw new Error('Receiver User not found');

        // Create the transaction
        let transaction = await Transaction.create(
            {
                sender_sub_account_id: sender_sub_account.id,
                receiver_sub_account_id: receiver_sub_account.id,
                sender_id: sender_sub_account.user_id,
                receiver_id: receiver_sub_account.user_id,
                transaction_date,
                amount,
                narration,
                company_id,
                notes
            },
            { transaction: t }
        );

        console.log('transaction', transaction);

        // Create sender account statement
        const sender_balance = await getAccountStatementBalance(sender_sub_account.id);
        const sender_account_statement = await AccountStatement.create(
            {
                sub_account_id: sender_sub_account.id,
                other_sub_account_id: receiver_sub_account.id,
                user_id: sender_sub_account.user_id,
                other_user_id: receiver_sub_account.user_id,
                transaction_id: transaction.id,
                amount,
                balance: parseFloat(sender_balance) + parseFloat(amount),
                narration,
                transaction_date,
                company_id,
                notes
            },
            { transaction: t }
        );

        console.log('sender_account_statement', sender_account_statement);


        // Create receiver account statement
        const receiver_balance = await getAccountStatementBalance(receiver_sub_account.id);
        const receiver_account_statement = await AccountStatement.create(
            {
                sub_account_id: receiver_sub_account.id,
                other_sub_account_id: sender_sub_account.id,
                user_id: receiver_sub_account.user_id,
                other_user_id: sender_sub_account.user_id,
                transaction_id: transaction.id,
                amount: -amount,
                balance: parseFloat(receiver_balance) - parseFloat(amount),
                narration,
                transaction_date,
                company_id,
                notes
            },
            { transaction: t }
        );
        console.log('receiver_account_statement', receiver_account_statement);
        // Update the sub-account balances and associate account statements
        sender_sub_account.balance = parseFloat(sender_sub_account.balance) + parseFloat(amount);
        receiver_sub_account.balance = parseFloat(receiver_sub_account.balance) - parseFloat(amount);

        await sender_sub_account.save({ transaction: t });
        await receiver_sub_account.save({ transaction: t });

        // Update sender and receiver user balances
        await updateUserBalance(sender_user, t);
        await updateUserBalance(receiver_user, t);

        // Commit the transaction
        await t.commit();

        res.status(200).json(transaction);
    } catch (error) {
        console.error(error);
        await t.rollback(); // Rollback if there’s an error
        res.status(500).json({ error: error.message });
    }
});

// Helper function to get the account statement balance for a sub-account
const getAccountStatementBalance = async (sub_account_id) => {
    const account_statements = await AccountStatement.findAll({
        where: { sub_account_id },
        attributes: ['balance'],
    });

    return account_statements.reduce((total, statement) => total + statement.balance, 0);
};

// Helper function to update user balance
const updateUserBalance = async (user, transaction) => {
    // Fetch all sub-accounts associated with the user
    const user_sub_accounts = await SubAccount.findAll({
        where: { user_id: user.id },
        transaction,
    });

    let total_balance = 0;  // Initialize total_balance to 0

    // Iterate through all sub-accounts to accumulate their balances
    for (let sub_account of user_sub_accounts) {
        total_balance += parseFloat(sub_account.balance);  // Add each sub-account's balance to total_balance
    }

    console.log('total_balance', total_balance);

    // Update the user's balance with the accumulated total_balance
    user.balance = total_balance;

    // Save the user with the updated balance within the transaction
    await user.save({ transaction });
};

// exports.getTransactionAjax = asyncHandler(async (req, res, next) => {
//     try {
//         const companyId = req.params.id; // Get company_id from request parameters

//         // Get the date range from the request query (optional)
//         const { startDate, endDate } = req.query; // Example: /transactions/1?startDate=2025-04-01&endDate=2025-04-14

//         // Get the current date and create a Date object for the start and end of today
//         const currentDate = new Date();

//         // Get the start of the day (00:00:00) in local time
//         const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0)); // Set time to 00:00:00:000 (local time)

//         // Get the end of the day (23:59:59) in local time
//         const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999)); // Set time to 23:59:59:999 (local time)

//         // If date range is provided, use it, otherwise, use today's date
//         const whereClause = {
//             company_id: companyId,
//             transaction_date: {
//                 [Op.gte]: startDate ? new Date(startDate).setHours(0, 0, 0, 0) : startOfDay, // Apply start date
//                 [Op.lte]: endDate ? new Date(endDate).setHours(23, 59, 59, 999) : endOfDay // Apply end date
//             }
//         };

//         // Fetch transactions associated with the specific company_id and filtered by the date range
//         const transactions = await Transaction.findAll({
//             where: whereClause, // Apply the where clause
//             include: [{
//                 model: SubAccount,  // Include the associated subAccounts for the user
//                 required: false,  // Make this optional if not all users have subAccounts
//             }]
//         });

//         console.log(transactions);

//         // Return the formatted transactions data as JSON (for AJAX response)
//         res.status(200).json({
//             success: true,
//             transactions: formattedTransactions
//         });
//     } catch (error) {
//         next(error);
//     }
// });


exports.getTransactionAjax = asyncHandler(async (req, res, next) => {
    try {
        const companyId = req.params.id; // Get company_id from request parameters
        let whereClause = `t.company_id = ${companyId} AND (sa.company_id = ${companyId} OR rsa.company_id = ${companyId})`;
        console.log(req.query.startDate, req.query.endDate);
        if (req.query.startDate && req.query.endDate) {
            const startDate = new Date(req.query.startDate);
            startDate.setHours(0, 0, 0, 0); // Set start date to the beginning of the day
            const endDate = new Date(req.query.endDate);
            endDate.setHours(23, 59, 59, 999); // Set end date to the end of the day
        
            // Compare the full datetime (with time part)
            whereClause += ` AND t.transaction_date >= '${startDate.toISOString()}' 
                             AND t.transaction_date <= '${endDate.toISOString()}'`;
        }
        else {
            // If no start_date or end_date is provided, use the current date
            const currentDate = new Date();
            // Adjust the date for the local timezone
            const timezoneOffset = currentDate.getTimezoneOffset(); // Get timezone offset in minutes
            currentDate.setMinutes(currentDate.getMinutes() - timezoneOffset); // Adjust the time to the local timezone
            // currentDate.setHours(0, 0, 0, 0); // Set current date to the beginning of the day (local midnight)

            const currentDateString = currentDate.toISOString().split('T')[0]; // Get the current date string (YYYY-MM-DD)

            whereClause += ` AND t.transaction_date = '${currentDateString}'`;

        }
        console.log(whereClause);
        // Get current date in 'YYYY-MM-DD' format

        // SQL query to fetch transactions along with both sender and receiver sub-account information for the given company_id
        const sqlQuery = `
            SELECT t.*, 
                sa.account_username as sender_sub_account, 
                sa.company_id as sender_company_id,
                rsa.account_username as receiver_sub_account,
                rsa.company_id as receiver_company_id,
                su.username as sender_user, 
                ru.username as receiver_user
            FROM transactions AS t
            LEFT JOIN sub_accounts AS sa ON sa.id = t.sender_sub_account_id
            LEFT JOIN sub_accounts AS rsa ON rsa.id = t.receiver_sub_account_id
            LEFT JOIN users AS su ON su.id = t.sender_id  -- JOIN with the 'users' table for sender's details
            LEFT JOIN users AS ru ON ru.id = t.receiver_id  -- JOIN with the 'users' table for receiver's details
           WHERE ${whereClause}
        `;

        // Execute the raw SQL query with the current date
        const transactions = await sequelize.query(sqlQuery, {
            type: sequelize.QueryTypes.SELECT // SELECT query type
        });


        // Return the formatted transactions data as JSON (for AJAX response)
        res.status(200).json({
            success: true,
            transactions: transactions
        });
    } catch (error) {
        next(error);
    }
});

exports.getSubAccountStatement = asyncHandler(async (req, res, next) => {
    try {


        res.render('accounts/account_statement');

    } catch (error) {
        next(error); // Handle errors
    }
});

exports.getSubAccountStatementAJax = asyncHandler(async (req, res, next) => {
    try {
        const subAccountId = req.query.account_id; // Get sub_account_id from request parameters
        let whereClause = `sa.id = ${subAccountId}`; // Condition to find sub_account by ID
        // If start_date and end_date are provided, filter account statements by those dates
        if (req.query.startDate && req.query.endDate) {
            const startDate = new Date(req.query.startDate);
            startDate.setHours(0, 0, 0, 0); // Set start date to the beginning of the day
            const endDate = new Date(req.query.endDate);
            endDate.setHours(23, 59, 59, 999); // Set end date to the end of the day
            whereClause += ` AND asn.transaction_date >= '${startDate.toISOString().split('T')[0]}' 
                             AND asn.transaction_date <= '${endDate.toISOString().split('T')[0]}'`;
        } else {
            // If no start_date or end_date is provided, use the current date
            const currentDate = new Date();
            // Adjust the date for the local timezone
            const timezoneOffset = currentDate.getTimezoneOffset(); // Get timezone offset in minutes
            currentDate.setMinutes(currentDate.getMinutes() - timezoneOffset); // Adjust the time to the local timezone
            // currentDate.setHours(0, 0, 0, 0); // Set current date to the beginning of the day (local midnight)

            const currentDateString = currentDate.toISOString().split('T')[0]; // Get the current date string (YYYY-MM-DD)

            whereClause += ` AND asn.transaction_date = '${currentDateString}'`;
        }

        // SQL query to fetch sub_account and account_statements with user information
        const sqlQuery = `
            SELECT 
                sa.account_username AS sub_account_username, 
                sa.company_id AS sub_account_company_id,
                asn.id AS account_statement_id,
                asn.transaction_date AS account_statement_date,
                asn.amount AS account_statement_amount,
                asn.balance AS account_statement_balance,
                asn.narration AS account_statement_narration,
                su.username AS sender_user,
                ru.username AS receiver_user,
                rsa.account_username AS receiver_sub_account_username
            FROM sub_accounts AS sa
            LEFT JOIN account_statements AS asn ON asn.sub_account_id = sa.id
            LEFT JOIN users AS su ON su.id = sa.user_id  -- Sender user details
            LEFT JOIN sub_accounts AS rsa ON rsa.id = asn.other_sub_account_id  -- Receiver sub-account
            LEFT JOIN users AS ru ON ru.id = rsa.user_id  -- Receiver user details
            WHERE ${whereClause}
        `;

        // Execute the raw SQL query
        const subAccountDetails = await sequelize.query(sqlQuery, {
            type: sequelize.QueryTypes.SELECT, // SELECT query type
        });

        console.log(subAccountDetails);

        // Return the formatted sub account details
        res.status(200).json({
            success: true,
            sub_account: subAccountDetails
        });

    } catch (error) {
        next(error); // Handle errors
    }
});









