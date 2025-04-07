const User = require("../models/UserModel");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = asyncHandler(async (req, res, next) => {
    console.log(req.body);
    const { username, password } = req.body;

    // validate email & password
    if (!username || !password) {
        return next(new ErrorResponse("Please provide an username and password"), 400);
    }

    // Check for user
    const user = await User.findOne({
        where: { username }, // Search by username
    });

    if (!user) {
        return next(new ErrorResponse("Invalid Username"), 401);
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
            // Log the error if there is any
            console.error(err);
            return res.status(500).json({
                error: true,
                message: 'Server error while comparing password'
            });
        } else {
            if (isMatch) {
                // Create JWT token
                const token = jwt.sign(
                    { id: user.id, username: user.username }, // Payload with user details
                    'secret', // Your secret key
                    { expiresIn: '30d' } // Expiration time for the token
                );

                // Store the token in a cookie
                res.cookie('token', token, {
                    httpOnly: true, // Ensure cookie can't be accessed from client-side JavaScript
                    secure: process.env.NODE_ENV === 'production', // Set to true if using https
                    maxAge: 3600000 // Token expiration time (in ms), matches the JWT expiration
                });

                // Return response with success
                res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    user: {
                        id: user.id,
                        username: user.username,
                    }
                });
            } else {
                res.status(401).json({
                    error: true,
                    message: 'Password is Incorrect'
                });
            }
        }
    });
});

// get token from model, create cokie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === "production") {
        options.secure = true;
    }

    const userWithToken = { ...user.get(), token: token };

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user: userWithToken,
    });
};