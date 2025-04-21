const jwt = require('jsonwebtoken');
const asyncHandler = require("../middleware/async");
const Accessibility = require("../models/Accessbility");
const User = require('../models/UserModel');

exports.getAccessbility = asyncHandler(async (req, res, next) => {
    try {
        const currentUser = jwt.verify(req.cookies.token, 'secret');
        console.log(currentUser);
        // Fetch the user type from the User model based on the currentUser.id
        const user = await User.findOne({
            where: { id: currentUser.id }
        });
        let accessibility;
        
        console.log(req.params.user_id);
        // Check if user_id is passed in query parameters
        if (req.params.user_id) {
            // Admin is getting permissions for a specific user
            accessibility = await Accessibility.findOne({
                where: { user_id: req.params.user_id }
            });
        } else {
            // This is for the logged-in company user
            // Assuming `req.user.id` stores the logged-in user's ID
            accessibility = await Accessibility.findOne({
                where: { user_id: currentUser.id } // Use logged-in user's ID
            });
        }
        console.log(accessibility);
        res.render('users/accessbility', { accessibility });

    } catch (error) {
        console.log(error);
        // Handle error properly and send a response
        res.status(403).send({
            message: error.message || 'An error occurred while fetching the accessibility data',
        });
    }
});

exports.updateAccessbility = asyncHandler(async (req, res, next) => {

    try {
        // Verify the JWT token (assuming req.token is being sent in headers)
        const decoded = jwt.verify(req.token, 'secret');

        // Fetch the current accessibility record for the given user
        let accessibility = await Accessibility.findOne({
            where: {
                user_id: req.query.user_id, // Find by user_id
            }
        });

        if (!accessibility) {
            return res.status(404).send({ message: 'Accessibility not found' });
        }

        // Resource Handling for 'viewable_accounts'
        if (req.body.resource === 'viewable_accounts') {
            if (req.body.is_checked) {
                accessibility.viewable_accounts.push(req.body.accountId); // Add accountId
            } else {
                accessibility.viewable_accounts = accessibility.viewable_accounts.filter(accountId => accountId !== req.body.accountId); // Remove accountId
            }
        }
        // Handling for 'transactions' and 'accounts'
        else if (['transactions', 'accounts'].includes(req.body.resource)) {
            const resource = req.body.resource;

            if (req.body.action === 'view') {
                accessibility[resource].view = req.body.is_checked;
                if (!req.body.is_checked) {
                    accessibility[resource].edit = false;
                    accessibility[resource].add = false;
                }
            } else if (req.body.action === 'edit') {
                if (req.body.is_checked) {
                    accessibility[resource].view = true;
                    accessibility[resource].edit = true;
                } else {
                    accessibility[resource].edit = false;
                }
            } else if (req.body.action === 'add') {
                if (req.body.is_checked) {
                    accessibility[resource].view = true;
                    accessibility[resource].add = true;
                } else {
                    accessibility[resource].add = false;
                }
            }
        }
        // Handling for 'account_types'
        else if (req.body.resource === 'account_types') {
            if (req.body.action === 'view') {
                accessibility[req.body.resource].view = req.body.is_checked;
                if (!req.body.is_checked) {
                    accessibility[req.body.resource].add = false;
                }
            } else if (req.body.action === 'add') {
                accessibility[req.body.resource].add = req.body.is_checked;
                if (req.body.is_checked) {
                    accessibility[req.body.resource].view = true;
                }
            }
        }
        // Handling for 'balance_sheet'
        else if (req.body.resource === 'balance_sheet') {
            if (req.body.action === 'view') {
                accessibility[req.body.resource].view = req.body.is_checked;
            }
        }
        // Handling for 'import'
        else if (req.body.resource === 'import') {
            if (req.body.action === 'add') {
                accessibility[req.body.resource].add = req.body.is_checked;
            }
        }

        // Save the updated accessibility object to the database
        await accessibility.save();

        res.send({ accessibility });
    } catch (error) {
        console.error(error);
        res.status(403).send({
            message: error.message || 'An error occurred while processing the request',
        });
    }

});

