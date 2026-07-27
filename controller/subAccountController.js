const bcrypt = require('bcryptjs');
const subAccount = require("../models/subAccounts");
const User = require("../models/UserModel");
const asyncHandler = require("../middleware/async");
const { Op } = require('sequelize');
const sequelize = require('../db');

function duplicateTitleMessage(parentName) {
    if (parentName) {
        return `Title already exists in ${parentName}`;
    }
    return "Title already exists in a parent account";
}

async function findDuplicateTitle({ companyId, title, excludeId }) {
    const where = {
        company_id: companyId,
        [Op.and]: [
            sequelize.where(
                sequelize.fn("LOWER", sequelize.col("account_username")),
                title.toLowerCase()
            )
        ]
    };

    if (excludeId) {
        where.id = { [Op.ne]: excludeId };
    }

    const existing = await subAccount.findOne({ where });
    if (!existing) return null;

    let parentName = "";
    if (existing.user_id) {
        const parent = await User.findByPk(existing.user_id, {
            attributes: ["id", "username"]
        });
        parentName = parent?.username || "";
    }

    return { existing, parentName };
}

// Function to create a new sub account
exports.createSubaccount = asyncHandler(async (req, res, next) => {
    const { account_username, account_type_id, user_id, notes, company_id, id } = req.body;
    const trimmedTitle = typeof account_username === "string" ? account_username.trim() : "";

    try {
        // ✅ If id is provided → update the sub account
        if (id) {
            const sub_Account = await subAccount.findByPk(id);

            if (!sub_Account) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            if (trimmedTitle) {
                const existingTitle = await findDuplicateTitle({
                    companyId: sub_Account.company_id || company_id,
                    title: trimmedTitle,
                    excludeId: id
                });

                if (existingTitle) {
                    return res.status(409).json({
                        success: false,
                        message: duplicateTitleMessage(existingTitle.parentName)
                    });
                }

                sub_Account.account_username = trimmedTitle;
            }

            sub_Account.notes = notes;
            await sub_Account.save();

            return res.status(200).json({
                success: true,
                message: "Sub Account updated successfully!",
                sub_Account
            });
        }

        if (!trimmedTitle) {
            return res.status(400).json({
                success: false,
                message: "Title is required!"
            });
        }

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "Parent account is required!"
            });
        }

        const existingTitle = await findDuplicateTitle({
            companyId: company_id,
            title: trimmedTitle
        });

        if (existingTitle) {
            return res.status(409).json({
                success: false,
                message: duplicateTitleMessage(existingTitle.parentName)
            });
        }

        // ✅ Else → Create new sub account
        let newSubAccount = {
            account_username: trimmedTitle,
            account_type_id,
            user_id,
            company_id,
            notes,
            sub_account_pk: null,
            balance: 0,
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

exports.getSubAccountsByParentAjax = asyncHandler(async (req, res, next) => {
    try {
        const { company_id, user_id } = req.params;

        const subAccounts = await subAccount.findAll({
            where: {
                company_id: company_id,
                user_id: user_id
            },
            attributes: ["id", "account_username", "user_id"]
        });

        return res.status(200).json({
            success: true,
            subAccounts
        });
    } catch (error) {
        next(error);
    }
});

exports.getCompanySubAccountsAjax = asyncHandler(async (req, res, next) => {
    try {
        const { company_id } = req.params;

        const subAccounts = await subAccount.findAll({
            where: { company_id: company_id },
            attributes: ["id", "account_username", "user_id"]
        });

        const parentIds = [...new Set(
            subAccounts
                .map((sub) => sub.user_id)
                .filter(Boolean)
        )];

        const parents = parentIds.length
            ? await User.findAll({
                where: { id: { [Op.in]: parentIds } },
                attributes: ["id", "username"]
            })
            : [];

        const parentMap = {};
        parents.forEach((parent) => {
            parentMap[parent.id] = parent.username;
        });

        const payload = subAccounts.map((sub) => ({
            id: sub.id,
            account_username: sub.account_username,
            user_id: sub.user_id,
            parent_name: parentMap[sub.user_id] || ""
        }));

        return res.status(200).json({
            success: true,
            subAccounts: payload
        });
    } catch (error) {
        next(error);
    }
});
