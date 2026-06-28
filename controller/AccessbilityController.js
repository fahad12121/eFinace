const jwt = require('jsonwebtoken');
const asyncHandler = require("../middleware/async");
const Accessibility = require("../models/Accessbility");
const User = require('../models/UserModel');

exports.getAccessbility = asyncHandler(async (req, res, next) => {
    try {
        req.params.user_id;
        const currentUser = jwt.verify(req.cookies.token, 'secret');
        // Fetch the user type from the User model based on the currentUser.id
        const user = await User.findOne({
            where: { id: currentUser.id }
        });
        let accessibility;

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
        const user_id = req.params.user_id;
        const company_id = req.params.company_id;

        res.render('users/accessbility', { accessibility, user_id, company_id });

    } catch (error) {
        console.log(error);
        // Handle error properly and send a response
        res.status(403).send({
            message: error.message || 'An error occurred while fetching the accessibility data',
        });
    }
});

exports.getAccessbilityAccounts = asyncHandler(async (req, res, next) => {
    try {
        const currentUser = jwt.verify(req.cookies.token, 'secret');
        // Fetch the user type from the User model based on the currentUser.id
        const user = await User.findOne({
            where: { id: currentUser.id }
        });

        let accessibility;

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
        const user_id = req.params.user_id;
        const company_id = req.params.company_id;
        res.render('users/accountAccess', { accessibility, user_id, company_id });

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
        let accessibility = await Accessibility.findOne({
            where: { user_id: req.params.user_id },
        });
        // console.log(req.body, accessibility)

        if (req.body.resource === 'viewable_accounts') {
            accessibility.viewable_accounts = req.body.selectedAccounts.map(id => parseInt(id, 10));
        } else {
            accessibility[req.body.resource] = JSON.parse(accessibility[req.body.resource])

            accessibility[req.body.resource][req.body.action] = req.body.is_checked == 'true' ? true : false;
        }

        // Save updated accessibility record
        await accessibility.save();
        return res.status(200).json({ success: true, message: 'Permission updated successfully.' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error updating accessibility' });
    }

});


