const asyncHandler = require("../middleware/async");

exports.getTransaction = asyncHandler(async (req, res, next) => {
    try {

        res.render('transactions/index');  // Render the companies.ejs view with companies data
    } catch (error) {
        next(error);
    }
});