const AccountTypes = require("../models/AccountType");
const subAccount = require("../models/subAccounts");
const asyncHandler = require("../middleware/async");
const sequelize = require("../db");
const { Op } = require("sequelize");

exports.createAccountType = asyncHandler(async (req, res, next) => {
    const { name, company_id } = req.body;
    const trimmedName = typeof name === "string" ? name.trim() : "";

    if (!trimmedName) {
        return res.status(400).json({
            success: false,
            message: "Name is required!"
        });
    }

    try {
        const existing = await AccountTypes.findOne({
            where: {
                company_id: company_id,
                [Op.and]: [
                    sequelize.where(
                        sequelize.fn("LOWER", sequelize.col("name")),
                        trimmedName.toLowerCase()
                    )
                ]
            }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "This account type already exists"
            });
        }

        const AccountType = await AccountTypes.create({
            ...req.body,
            name: trimmedName
        });

        if (AccountType) {
            return res.status(201).json({
                success: true,
                message: "Account Type created successfully!",
                AccountType: AccountType
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while creating the account type."
        });
    }
});

// Get all companies
exports.getAccountTypes = asyncHandler(async (req, res, next) => {
    try {

        res.render('accountType/index');  // Render the companies.ejs view with companies data
    } catch (error) {
        next(error);
    }
});
exports.getAccountTypesAjax = asyncHandler(async (req, res, next) => {
    try {
        const companyId = req.params.company_id; // Get company_id from request parameters

        // Fetch account types associated with the specific company_id
        const accountTypes = await AccountTypes.findAll({
            where: { company_id: companyId } // Filter account types by company_id
        });

        // Return the account types data as JSON (for AJAX response)
        res.status(200).json({
            success: true,
            accountTypes: accountTypes
        });
    } catch (error) {
        next(error);
    }
});

exports.show = asyncHandler(async (req, res, next) => {
    try {
        const companyId = req.params.id; // Get company_id from request parameters
        const type_id = req.params.type_id; // Get type_id from request parameters

        // Fetch the sub_accounts from the database
        const sub_accounts = await subAccount.findAll({
            where: {
                account_type_id: type_id,
                company_id: companyId
            }
        });

        const accountType = await AccountTypes.findOne({
            where: { id: type_id, company_id: companyId }
        });

        res.render('accountType/Detail', { sub_accounts, accountType });
        // Return the sub_accounts data as JSON (for AJAX response)
    } catch (error) {
        next(error); // Pass the error to the error handling middleware
    }
});