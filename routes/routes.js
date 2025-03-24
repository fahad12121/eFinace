const express = require('express');
const route = express.Router();

// Contorller
const AuthController = require("../controller/AuthController");
const companyController = require('../controller/CompanyController');
const AccountTypeController = require('../controller/AccountTypeController');
const UserController = require('../controller/UserController');

// const route = express.Router();
module.exports = function (route) { 

    // route.use((req, res, next) => {
    //     var uemail = req.session.useremail;
    //     const allowUrls = ["/login", "/auth-validate", "/register", "/signup", "/forgotpassword", "/sendforgotpasswordlink", "/resetpassword", "/error", "/changepassword"];
    //     if (allowUrls.indexOf(req.path) !== -1) {
    //         if (uemail != null && uemail != undefined) {
    //             return res.redirect('/');
    //         }

    //     } else if (!uemail) {
    //         return res.redirect('/login');
    //     }
    //     next();
    // })
    route.get("/", function (req, res) {
        res.render("index");
    });

    route.get("/index", function (req, res) {
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

    //file maneger
    route.get('/apps-filemanager', function (req, res) {
        res.render('apps-filemanager');
    });
    //email
    route.get('/auth-confirm-mail-2', function (req, res) {
        res.render('auth-confirm-mail-2', { layout: "layouts/layout-without-nav", });
    });
    //email
    route.get('/auth-confirm-mail', function (req, res) {
        res.render('auth-confirm-mail', { layout: "layouts/layout-without-nav", });
    });
    //email
    route.get('/auth-email-verification-2', function (req, res) {
        res.render('auth-email-verification-2', { layout: "layouts/layout-without-nav", });
    });
    //email
    route.get('/auth-email-verification', function (req, res) {
        res.render('auth-email-verification', { layout: "layouts/layout-without-nav", });
    });
    //lock screen
    route.get('/auth-lock-screen-2', function (req, res) {
        res.render('auth-lock-screen-2', { layout: "layouts/layout-without-nav", });
    });
    //lock screen
    route.get('/auth-lock-screen', function (req, res) {
        res.render('auth-lock-screen', { layout: "layouts/layout-without-nav", });
    });
    route.get('/auth-login-2', function (req, res) {
        res.render('auth-login-2', { layout: "layouts/layout-without-nav", });
    });
    route.get('/auth-login', function (req, res) {
        res.render('auth-login', { layout: "layouts/layout-without-nav", });
    });
    route.get('/auth-recoverpw-2', function (req, res) {
        res.render('auth-recoverpw-2', { layout: "layouts/layout-without-nav", });
    });
    route.get('/auth-recoverpw', function (req, res) {
        res.render('auth-recoverpw', { layout: "layouts/layout-without-nav", });
    });
    route.get('/auth-register-2', function (req, res) {
        res.render('auth-register-2', { layout: "layouts/layout-without-nav", });
    });
    route.get('/auth-register', function (req, res) {
        res.render('auth-register', { layout: "layouts/layout-without-nav", });
    });
    route.get('/auth-two-step-verification-2', function (req, res) {
        res.render('auth-two-step-verification-2', { layout: "layouts/layout-without-nav", });
    });
    route.get('/auth-two-step-verification', function (req, res) {
        res.render('auth-two-step-verification', { layout: "layouts/layout-without-nav", });
    });
    route.get('/blog-details', function (req, res) {
        res.render('blog-details');
    });
    route.get('/blog-grid', function (req, res) {
        res.render('blog-grid');
    });
    route.get('/blog-list', function (req, res) {
        res.render('blog-list');
    });
    route.get('/calendar-full', function (req, res) {
        res.render('calendar-full');
    });
    route.get('/calendar', function (req, res) {
        res.render('calendar');
    });
    route.get('/candidate-list', function (req, res) {
        res.render('candidate-list');
    });
    route.get('/candidate-overview', function (req, res) {
        res.render('candidate-overview');
    });

    // charts
    route.get('/charts-apex', function (req, res) {
        res.render('charts-apex');
    });
    route.get('/charts-chartjs', function (req, res) {
        res.render('charts-chartjs');
    });
    route.get('/charts-echart', function (req, res) {
        res.render('charts-echart');
    });
    route.get('/charts-flot', function (req, res) {
        res.render('charts-flot');
    });
    route.get('/charts-knob', function (req, res) {
        res.render('charts-knob');
    });
    route.get('/charts-sparkline', function (req, res) {
        res.render('charts-sparkline');
    });
    route.get('/charts-tui', function (req, res) {
        res.render('charts-tui');
    });

    //chat
    route.get('/chat', function (req, res) {
        res.render('chat');
    });
    //contacts-grid
    route.get('/contacts-grid', function (req, res) {
        res.render('contacts-grid');
    });
    //contacts-list
    route.get('/contacts-list', function (req, res) {
        res.render('contacts-list');
    });
    //contacts-profile
    route.get('/contacts-profile', function (req, res) {
        res.render('contacts-profile');
    });
    //crypto-buy-sell
    route.get('/crypto-buy-sell', function (req, res) {
        res.render('crypto-buy-sell');
    });
    //crypto-exchange
    route.get('/crypto-exchange', function (req, res) {
        res.render('crypto-exchange');
    });
    //crypto-ico-landing
    route.get('/crypto-ico-landing', function (req, res) {
        res.render('crypto-ico-landing', { layout: 'layouts/layout-without-nav' });
    });

    //crypto-exchange
    route.get('/crypto-kyc-application', function (req, res) {
        res.render('crypto-kyc-application');
    });
    //crypto-exchange
    route.get('/crypto-lending', function (req, res) {
        res.render('crypto-lending');
    });
    //crypto-exchange
    route.get('/crypto-orders', function (req, res) {
        res.render('crypto-orders');
    });
    //crypto-exchange
    route.get('/crypto-wallet', function (req, res) {
        res.render('crypto-wallet');
    });
    //crypto-exchange
    route.get('/dashboard-blog', function (req, res) {
        res.render('dashboard-blog');
    });
    //crypto-exchange
    route.get('/dashboard-crypto', function (req, res) {
        res.render('dashboard-crypto');
    });
    //dashboard-job
    route.get('/dashboard-job', function (req, res) {
        res.render('dashboard-job');
    });
    //dashboard-job
    route.get('/dashboard-saas', function (req, res) {
        res.render('dashboard-saas');
    });
    //ecommerce-add-product
    route.get('/ecommerce-add-product', function (req, res) {
        res.render('ecommerce-add-product');
    });
    //ecommerce-add-product
    route.get('/ecommerce-cart', function (req, res) {
        res.render('ecommerce-cart');
    });
    //ecommerce-checkout
    route.get('/ecommerce-checkout', function (req, res) {
        res.render('ecommerce-checkout');
    });
    //ecommerce-checkout
    route.get('/ecommerce-customers', function (req, res) {
        res.render('ecommerce-customers');
    });
    //ecommerce-checkout
    route.get('/ecommerce-orders', function (req, res) {
        res.render('ecommerce-orders');
    });
    //ecommerce-checkout
    route.get('/ecommerce-product-detail', function (req, res) {
        res.render('ecommerce-product-detail');
    });
    //ecommerce-products
    route.get('/ecommerce-products', function (req, res) {
        res.render('ecommerce-products');
    });
    //ecommerce-shops
    route.get('/ecommerce-shops', function (req, res) {
        res.render('ecommerce-shops');
    });
    //ecommerce-shops
    route.get('/email-inbox', function (req, res) {
        res.render('email-inbox');
    });
    //ecommerce-shops
    route.get('/email-read', function (req, res) {
        res.render('email-read');
    });
    //ecommerce-shops
    route.get('/email-template-alert', function (req, res) {
        res.render('email-template-alert');
    });
    //ecommerce-shops
    route.get('/email-template-basic', function (req, res) {
        res.render('email-template-basic');
    });
    //email-template-billing
    route.get('/email-template-billing', function (req, res) {
        res.render('email-template-billing');
    });
    //email-template-billing
    route.get('/form-advanced', function (req, res) {
        res.render('form-advanced');
    });
    route.get('/form-elements', function (req, res) {
        res.render('form-elements');
    });
    //form-editors
    route.get('/form-editors', function (req, res) {
        res.render('form-editors');
    });
    //form-editors
    route.get('/form-layouts', function (req, res) {
        res.render('form-layouts');
    });
    //form-mask
    route.get('/form-mask', function (req, res) {
        res.render('form-mask');
    });
    //form-repeater
    route.get('/form-repeater', function (req, res) {
        res.render('form-repeater');
    });
    //form-repeater
    route.get('/form-uploads', function (req, res) {
        res.render('form-uploads');
    });
    //form-validation
    route.get('/form-validation', function (req, res) {
        res.render('form-validation');
    });
    //form-validation
    route.get('/form-wizard', function (req, res) {
        res.render('form-wizard');
    });
    //form-validation
    route.get('/form-xeditable', function (req, res) {
        res.render('form-xeditable');
    });
    //form-validation
    route.get('/icons-boxicons', function (req, res) {
        res.render('icons-boxicons');
    });
    route.get('/icons-materialdesign', function (req, res) {
        res.render('icons-materialdesign');
    });
    //form-validation
    route.get('/icons-dripicons', function (req, res) {
        res.render('icons-dripicons');
    });
    //form-validation
    route.get('/icons-fontawesome', function (req, res) {
        res.render('icons-fontawesome');
    });
    //form-validation
    route.get('/invoices-detail', function (req, res) {
        res.render('invoices-detail');
    });
    //form-validation
    route.get('/invoices-list', function (req, res) {
        res.render('invoices-list');
    });
    route.get('/job-apply', function (req, res) {
        res.render('job-apply');
    });
    route.get('/job-categories', function (req, res) {
        res.render('job-categories');
    });

    route.get('/job-details', function (req, res) {
        res.render('job-details');
    });

    route.get('/job-grid', function (req, res) {
        res.render('job-grid');
    });
    route.get('/job-list', function (req, res) {
        res.render('job-list');
    });
    route.get('/maps-google', function (req, res) {
        res.render('maps-google');
    });
    route.get('/maps-leaflet', function (req, res) {
        res.render('maps-leaflet');
    });
    route.get('/maps-vector', function (req, res) {
        res.render('maps-vector');
    });
    route.get('/pages-404', function (req, res) {
        res.render('pages-404', { layout: "layouts/layout-without-nav" });
    });
    route.get('/pages-500', function (req, res) {
        res.render('pages-500', { layout: "layouts/layout-without-nav" });
    });
    route.get('/pages-comingsoon', function (req, res) {
        res.render('pages-comingsoon', { layout: "layouts/layout-without-nav" });
    });
    route.get('/pages-faqs', function (req, res) {
        res.render('pages-faqs');
    });
    route.get('/pages-maintenance', function (req, res) {
        res.render('pages-maintenance', { layout: "layouts/layout-without-nav" });
    });

    route.get('/pages-pricing', function (req, res) {
        res.render('pages-pricing');
    });
    route.get('/pages-starter', function (req, res) {
        res.render('pages-starter');
    });
    route.get('/pages-timeline', function (req, res) {
        res.render('pages-timeline');
    });
    route.get('/projects-create', function (req, res) {
        res.render('projects-create');
    });
    route.get('/projects-grid', function (req, res) {
        res.render('projects-grid');
    });
    route.get('/projects-list', function (req, res) {
        res.render('projects-list');
    });
    route.get('/projects-overview', function (req, res) {
        res.render('projects-overview');
    });
    route.get('/tables-basic', function (req, res) {
        res.render('tables-basic');
    });
    route.get('/tables-datatable', function (req, res) {
        res.render('tables-datatable');
    });
    route.get('/tables-editable', function (req, res) {
        res.render('tables-editable');
    });
    route.get('/tables-responsive', function (req, res) {
        res.render('tables-responsive');
    });
    route.get('/tasks-create', function (req, res) {
        res.render('tasks-create');
    });
    route.get('/tasks-kanban', function (req, res) {
        res.render('tasks-kanban');
    });
    route.get('/tasks-list', function (req, res) {
        res.render('tasks-list');
    });
    route.get('/ui-alerts', function (req, res) {
        res.render('ui-alerts');
    });
    route.get('/ui-buttons', function (req, res) {
        res.render('ui-buttons');
    });
    route.get('/ui-cards', function (req, res) {
        res.render('ui-cards');
    });
    route.get('/ui-carousel', function (req, res) {
        res.render('ui-carousel');
    });
    route.get('/ui-colors', function (req, res) {
        res.render('ui-colors');
    });
    route.get('/ui-dropdowns', function (req, res) {
        res.render('ui-dropdowns');
    });
    route.get('/ui-general', function (req, res) {
        res.render('ui-general');
    });
    route.get('/ui-grid', function (req, res) {
        res.render('ui-grid');
    });
    route.get('/ui-images', function (req, res) {
        res.render('ui-images');
    });
    route.get('/ui-lightbox', function (req, res) {
        res.render('ui-lightbox');
    });
    route.get('/ui-modals', function (req, res) {
        res.render('ui-modals');
    });
    route.get('/ui-notifications', function (req, res) {
        res.render('ui-notifications');
    });
    route.get('/ui-offcanvas', function (req, res) {
        res.render('ui-offcanvas');
    });
    route.get('/ui-placeholders', function (req, res) {
        res.render('ui-placeholders');
    });
    route.get('/ui-progressbars', function (req, res) {
        res.render('ui-progressbars');
    });
    route.get('/ui-rangeslider', function (req, res) {
        res.render('ui-rangeslider');
    });
    route.get('/ui-rating', function (req, res) {
        res.render('ui-rating');
    });
    route.get('/ui-session-timeout', function (req, res) {
        res.render('ui-session-timeout');
    });
    route.get('/ui-sweet-alert', function (req, res) {
        res.render('ui-sweet-alert');
    });
    route.get('/ui-tabs-accordions', function (req, res) {
        res.render('ui-tabs-accordions');
    });
    route.get('/ui-toasts', function (req, res) {
        res.render('ui-toasts');
    });
    route.get('/ui-typography', function (req, res) {
        res.render('ui-typography');
    });

    route.get('/ui-utilities', function (req, res) {
        res.render('ui-utilities');
    });
    route.get('/ui-video', function (req, res) {
        res.render('ui-video');
    });












    // layouts
    route.get('/layouts-boxed', function (req, res) {
        res.render('layouts-boxed', { layout: "layouts/layout-boxed", title: "Boxed Layout", page_title: 'Boxed Layout' });
    });
    route.get('/layouts-colored-sidebar', function (req, res) {
        res.render('layouts-colored-sidebar', { layout: "layouts/layout-colored-sidebar", title: "Colored Sidebar", page_title: 'Colored Sidebar' });
    });
    route.get('/layouts-compact-sidebar', function (req, res) {
        res.render('layouts-compact-sidebar', { layout: "layouts/layout-compact-sidebar", title: "Compact Sidebar", page_title: 'Compact Sidebar' });
    });
    // layouts-horizontal
    route.get('/layouts-hori-boxed-width', function (req, res) {
        res.render('layouts-hori-boxed-width', { layout: "layouts/layouts-hori-boxed-width", title: "Horizontal Layout", page_title: 'Horizontal Layout' });
    });
    route.get('/layouts-hori-colored-header', function (req, res) {
        res.render('layouts-hori-colored-header', { layout: "layouts/layouts-hori-colored-header", title: "Icon Sidebar", page_title: 'Icon Sidebar' });
    });
    route.get('/layouts-hori-preloader', function (req, res) {
        res.render('layouts-hori-preloader', { layout: "layouts/layouts-hori-preloader", title: "Light Sidebar", page_title: 'Light Sidebar' });
    });
    route.get('/layouts-hori-scrollable', function (req, res) {
        res.render('layouts-hori-scrollable', { layout: "layouts/layouts-hori-scrollable", title: "Light Sidebar", page_title: 'Light Sidebar' });
    });
    route.get('/layouts-hori-topbar-light', function (req, res) {
        res.render('layouts-hori-topbar-light', { layout: "layouts/layouts-hori-topbar-light", title: "Light Sidebar", page_title: 'Light Sidebar' });
    });
    route.get('/layouts-horizontal', function (req, res) {
        res.render('layouts-horizontal', { layout: "layouts/layout-horizontal", title: "Horizontal Layout", page_title: 'Horizontal Layout' });
    });
    route.get('/layouts-icon-sidebar', function (req, res) {
        res.render('layouts-icon-sidebar', { layout: "layouts/layouts-icon-sidebar", title: "Icon Sidebar", page_title: 'Icon Sidebar' });
    });
    route.get('/layouts-light-sidebar', function (req, res) {
        res.render('layouts-light-sidebar', { layout: "layouts/layouts-light-sidebar", title: "Light Sidebar", page_title: 'Light Sidebar' });
    });
    route.get('/layouts-preloader', function (req, res) {
        res.render('layouts-preloader', { layout: "layouts/layouts-preloader", title: "Light Sidebar", page_title: 'Light Sidebar' });
    });
    route.get('/layouts-scrollable', function (req, res) {
        res.render('layouts-scrollable', { layout: "layouts/layouts-scrollable", title: "Light Sidebar", page_title: 'Light Sidebar' });
    });


    // // Auth
    route.get('/login', (req, res, next) => {
        res.render('Auth/login', { title: 'Login', layout: 'layouts/layout-without-nav', 'message': req.flash('message'), error: req.flash('error') })
    })

    // validate login form
    route.post("/auth-validate", AuthController.validate)

    // logout
    route.get("/logout", AuthController.logout);

    route.get('/register', (req, res, next) => {
        res.render('Auth/register', { title: 'Register', layout: 'layouts/layout-without-nav', message: req.flash('message'), error: req.flash('error') })
    })

    // validate register form
    route.post("/signup", AuthController.signup)


    route.get('/forgotpassword', (req, res, next) => {
        res.render('auth/forgotpassword', { title: 'Forgot password', layout: 'layouts/layout-without-nav', message: req.flash('message'), error: req.flash('error') })
    })

    // send forgot password link on user email
    route.post("/sendforgotpasswordlink", AuthController.forgotpassword)

    // reset password
    route.get("/resetpassword", AuthController.resetpswdview);
    // Change password
    route.post("/changepassword", AuthController.changepassword);

    //500
    route.get('/error', (req, res, next) => {
        res.render('auth/auth-500', { title: '500 Error', layout: 'layouts/layout-without-nav' });
    })
}

