const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');  // Adjust the path if necessary

// Check if the 'uploads' directory exists, if not, create it
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const route = express.Router();
const { protect } = require('../middleware/auth');
// Contorller
const AuthController = require("../controller/AuthController");
const companyController = require('../controller/CompanyController');
const DashboardController = require('../controller/DashboardController');
const AccountTypeController = require('../controller/AccountTypeController');
const UserController = require('../controller/UserController');
const subAccountController = require('../controller/subAccountController');
const TransactionController = require('../controller/TransactionController');
const importController = require('../controller/ImportController');
const AccessbilityController = require('../controller/AccessbilityController');
const upload = multer({ dest: 'uploads/' }).single('import_data');

// const route = express.Router();
module.exports = function (route) {

    route.get("/", function (req, res) {
        if (req.user) {
            return res.redirect("/companies"); // Redirect to dashboard if user is authenticated
        }
        res.render("auth/login", { layout: 'layouts/layout-without-nav' });
    });
    route.post('/login', AuthController.login)

    route.use(protect);

    route.get('/companies/:id/dashboard', DashboardController.index);
    route.get('/companies/:id/favourite_list', DashboardController.favtList);

    //Company Route
    route.get('/companies', companyController.getCompanies);
    route.get('/get/companies/ajax', companyController.getCompaniesAjax);
    route.post('/company/store', companyController.createCompany);
    // route.get('/companies/:id', companyController.getSingleCompany); // Single company page

    //Account Type Route
    route.get('/companies/:id/account_types', AccountTypeController.getAccountTypes);
    route.post('/companies/:id/account_types', AccountTypeController.createAccountType);
    route.get('/companies/:company_id/account_types/ajax', AccountTypeController.getAccountTypesAjax);
    route.get('/companies/:id/account_types/:type_id', AccountTypeController.show);


    //User Routes
    route.get('/companies/:id/users', UserController.getUsers);
    route.post('/companies/:id/users', UserController.createUser);
    route.post('/companies/:id/add_to_favt', UserController.createFavt);
    route.post('/companies/:id/user/:user_id/status', UserController.updateUserStatus);
    route.get('/companies/:company_id/users/ajax', UserController.getUsersAjax);
    route.get('/companies/:company_id/user/:user_id', AccessbilityController.getAccessbility);
    route.put('/companies/:company_id/user/:user_id', AccessbilityController.updateAccessbility);

    //Accounts Routes 
    route.get('/companies/:id/accounts', UserController.getAccountUsers);
    route.get('/companies/:id/accounts/:account_id', UserController.getSingleAccountUser);

    //sub accounts Routes
    route.post('/companies/:id/sub_accounts', subAccountController.createSubaccount);


    //import file Routes
    route.get('/companies/:id/import', importController.getImport);
    route.post('/companies/:id/read-csv', upload, importController.readCsv);
    route.post('/companies/:id/store-csv', upload, importController.store);

    //Balance Sheet Route
    route.get('/companies/:id/balance-sheet', UserController.getUsersBalanceSheet);

    //Ledger Sheet Route
    route.get('/companies/:id/ledger/:user_id', UserController.getUsersLedger);

    //Transaction Route
    route.get('/companies/:id/transactions', TransactionController.getTransaction);
    route.post('/companies/:id/transactions', TransactionController.createTransaction);
    route.get('/companies/:id/transactions/ajax', TransactionController.getTransactionAjax);

    //statement routes
    route.get('/companies/:id/accounts/:account_id/account_statements', TransactionController.getSubAccountStatement);
    route.get('/companies/:id/accounts/:account_id/account_statements/ajax', TransactionController.getSubAccountStatementAJax);

    // Route to log out
    route.post('/logout', AuthController.logout);

    //500
    route.get('/error', (req, res, next) => {
        res.render('auth/auth-500', { title: '500 Error', layout: 'layouts/layout-without-nav' });
    })
}

