const asyncHandler = require("../middleware/async");
const sequelize = require('../db'); // Import the Sequelize instance
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
// Get all companies
exports.index = asyncHandler(async (req, res, next) => {
    try {
        const companyId = req.params.id; // Get company_id from request parameters
        const currentUser = jwt.verify(req.cookies.token, 'secret');
        // Fetch the user type from the User model based on the currentUser.id
        const user = await User.findOne({
            where: { id: currentUser.id }
        });
        const users = await User.findAll({
            where: { company_id: companyId },
        });

        const favtUsersCount = await User.count({
            where: { is_favt: true },
        });

        let sumOfMinus = 0, sumOfPlus = 0;

        users.forEach(user => {
            const balance = user.balance;
            if (balance < 0) {
                sumOfMinus += parseFloat(balance);  // Add positive value of the negative balance
            } else if (balance > 0) {
                sumOfPlus += parseFloat(balance);  // Add positive balance
            }
        });

        // Get the current date and the date two days ago
        const currentDate = new Date();
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(currentDate.getDate() - 2); // Set the date to two days ago

        // Format the dates as 'YYYY-MM-DD' for SQL query compatibility
        const currentDateString = currentDate.toISOString().split('T')[0];
        const twoDaysAgoString = twoDaysAgo.toISOString().split('T')[0];

        // Update the whereClause to filter by transaction date in the last two days
        let whereClause = `t.company_id = ${companyId} AND (sa.company_id = ${companyId} OR rsa.company_id = ${companyId}) 
                   AND t.transaction_date BETWEEN '${twoDaysAgoString}' AND '${currentDateString}'`;

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

        // Execute the raw SQL query with the date range filter
        const transactions = await sequelize.query(sqlQuery, {
            type: sequelize.QueryTypes.SELECT, // SELECT query type
        });
        // Log the result of the query for debugging

        res.render('dashboard/index', { transactions, user, sumOfMinus, sumOfPlus, companyId, favtUsersCount });  // Render the companies.ejs view with companies data
    } catch (error) {
        next(error);
    }
});


exports.favtList = asyncHandler(async (req, res, next) => {
    try {
        const companyId = req.params.id; // Get company_id from request parameters

        const favtUsers = await User.findAll({
            where: { is_favt: true, company_id: companyId },
        });

        const totalBalance = favtUsers.reduce((sum, account) => sum + parseFloat(account.balance || 0), 0);

        // Log the result of the query for debugging

        res.render('dashboard/favt_list', { companyId, favtUsers, totalBalance });  // Render the companies.ejs view with companies data
    } catch (error) {
        next(error);
    }
});