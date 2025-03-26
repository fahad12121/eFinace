const express = require('express');
const route = express.Router();
const { protect } = require('../middleware/auth');
// Contorller
const AuthController = require("../controller/AuthController");
const companyController = require('../controller/CompanyController');
const AccountTypeController = require('../controller/AccountTypeController');
const UserController = require('../controller/UserController');
const subAccountController = require('../controller/subAccountController');

// const route = express.Router();
module.exports = function (route) {

    route.get("/", function (req, res) {
        if (req.user) {
            return res.redirect("/dashboard"); // Redirect to dashboard if user is authenticated
        }
        res.render("auth/login", { layout: 'layouts/layout-without-nav' });
    });
    route.post('/login', AuthController.login)

    route.use(protect);

    route.get("/dashboard", function (req, res) {
        res.render("index");
    });

    //Company Route
    route.get('/companies', companyController.getCompanies);
    route.get('/get/companies/ajax', companyController.getCompaniesAjax);
    route.post('/company/store', companyController.createCompany);
    // route.get('/companies/:id', companyController.getSingleCompany); // Single company page

    //Account Type Route
    route.get('/companies/:id/account_types', AccountTypeController.getAccountTypes);
    route.post('/companies/:id/account_types', AccountTypeController.createAccountType);
    route.get('/companies/:company_id/account_types/ajax', AccountTypeController.getAccountTypesAjax);

    //User Routes
    route.get('/companies/:id/users', UserController.getUsers);
    route.post('/companies/:id/users', UserController.createUser);
    route.get('/companies/:company_id/users/ajax', UserController.getUsersAjax);

    //Accounts Routes 
    route.get('/companies/:id/accounts', UserController.getAccountUsers);
    route.get('/companies/:id/accounts/:account_id', UserController.getSingleAccountUser);

    //sub accounts Routes
    route.post('/companies/:id/sub_accounts', subAccountController.createSubaccount);


    //500
    route.get('/error', (req, res, next) => {
        res.render('auth/auth-500', { title: '500 Error', layout: 'layouts/layout-without-nav' });
    })
}

