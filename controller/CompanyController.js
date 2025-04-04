const Company = require("../models/Company");
const asyncHandler = require("../middleware/async");

exports.createCompany = asyncHandler(async (req, res, next) => {
    // Validate required fields (if needed)
    const { name } = req.body;

    if (!name) {
        // If required fields are missing, send a response with an error message
        return res.status(400).json({
            success: false,
            message: 'Name are required!'
        });
    }

    try {
        // Create the company in the database
        const company = await Company.create(req.body);

        // If company is successfully created
        if (company) {
            return res.status(201).json({
                success: true,
                message: 'Company created successfully!',
                company: company
            });
        }

    } catch (error) {
        // Handle any errors (e.g., database errors)
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while creating the company.'
        });
    }
});

// Get all companies
exports.getCompanies = asyncHandler(async (req, res, next) => {
    try {

        res.render('companies/index');  // Render the companies.ejs view with companies data
    } catch (error) {
        next(error);
    }
});
exports.getCompaniesAjax = asyncHandler(async (req, res, next) => {
    try {
        const companies = await Company.findAll(); // Fetch all companies from the DB

        // Return the companies data as JSON (for AJAX response)
        res.status(200).json({
            success: true,
            companies: companies
        });
    } catch (error) {
        next(error);
    }
});
