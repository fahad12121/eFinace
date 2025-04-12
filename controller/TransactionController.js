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
        const { sender_sub_account_id, receiver_sub_account_id, amount, narration, transaction_date } = req.body;

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
            },
            { transaction: t }
        );

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
            },
            { transaction: t }
        );


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
            },
            { transaction: t }
        );
        // Update the sub-account balances and associate account statements
        sender_sub_account.balance = parseFloat(sender_sub_account.balance) + parseFloat(amount);
        receiver_sub_account.balance = parseFloat(receiver_sub_account.balance) - parseFloat(amount);
        console.log('receiver', receiver_sub_account.balance);

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
    const user_sub_accounts = await SubAccount.findAll({
        where: { user_id: user.id },
        transaction,
    });

    let total_balance = 0;
    for (let sub_account of user_sub_accounts) {
        total_balance = parseFloat(sub_account.balance);
    }

    user.balance = total_balance;
    await user.save({ transaction });
};
