
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/UserModel');
// protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for token in the Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // If no token found in Authorization header, check cookies
    if (!token && req.cookies.token) {
        token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to the request object
        req.user = await User.findByPk(decoded.id); // Assuming Sequelize is used

        // If user doesn't exist
        if (!req.user) {
            
            return next(new ErrorResponse('Not authorized to access this route', 401));
        }

        next(); // Proceed to next middleware or route handler
    } catch (err) {
        // Check if the error is due to token expiration
        if (err.name === 'TokenExpiredError') {
            // Redirect to login page if token has expired
            return res.redirect('/'); // Redirect to the root (login) page
        }
        
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});