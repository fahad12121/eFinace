
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/UserModel');
// protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token;

    // Make sure token exists
    if (!token) {
        return res.redirect('/');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, 'secret');

        // Attach user to the request object
        req.user = await User.findByPk(decoded.id); // Assuming Sequelize is used

        // If user doesn't exist
        if (!req.user) {
            return res.redirect('/'); // Redirect to the root (login) page
            // return next(new ErrorResponse('Not authorized to access this route', 401));
        }

        next(); // Proceed to next middleware or route handler
    } catch (err) {
        // Check if the error is due to token expiration
        if (err.name === 'TokenExpiredError') {
            // Redirect to login page if token has expired
            return res.redirect('/'); // Redirect to the root (login) page
        }

        return res.redirect('/');
    }
});