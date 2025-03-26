const User = require("../models/UserModel");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

exports.login = asyncHandler(async (req, res, next) => {
    console.log(req.body);
    const { username, password } = req.body;

    // validate email & password
    if (!username || !password) {
        return next(new ErrorResponse("Please provide an username an password"), 400);
    }

    // check for user
        // Check for user
        const user = await User.findOne({
            where: { username }, // Search by username
            attributes: ['id', 'username', 'password', 'user_type'] // Explicitly select the required fields
        });

    if (!user) {
        return next(new ErrorResponse("Invalid credentials"), 401);
    }

    // check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse("Invalid credentials"), 401);
    }

    sendTokenResponse(user, 200, res);
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