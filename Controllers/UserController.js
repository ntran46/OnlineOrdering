const User           = require('../Models/User');
var   passport       = require('passport');
const RequestService = require('../Services/RequestService');
const UserRepo       = require('../Data/UserRepo');
const _userRepo      = new UserRepo();


exports.Index = async function (request, response) {
    let users = await _userRepo.allUsers();
    if (users != null) {
        response.json({ users: users });
    }
    else {
        response.json({ users: [] });
    }
};


// Displays registration form.
exports.Register = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req);
    res.render('User/Register', { errorMessage: "", user: {}, reqInfo: reqInfo })
};


// Handles 'POST' with registration form submission.
exports.RegisterUser = async function (req, res) {
    var password = req.body.password;
    var passwordConfirm = req.body.passwordConfirm;
    let username = req.body.username;
    let email    = req.body.email;
    let phone    = req.body.txtEmpPhone;

    var roles = req.body.roles
    if (roles == (null, undefined)){
        roles = "Customer"
    }

    let userUsername = await _userRepo.getUser(username);
    let userEmail    = await _userRepo.getUserByEmail(email);

    let validatedUser = ValidateUserInfo(username, email, phone, password, passwordConfirm, userUsername, userEmail);
    // console.log(validatedUser.errorMessage)

    if (validatedUser.errorMessage == "") {
        // Creates user object with mongoose model.
        // Note that the password is not present.
        var newUser = new User({
            username    : req.body.username,
            firstName   : req.body.firstName,
            lastName    : req.body.lastName,
            email       : req.body.email,
            gender      : req.body.gender,
            address     : req.body.address,
            zipcode     : req.body.zipcode,
            txtEmpPhone : req.body.txtEmpPhone,
            roles       : roles
        });

        User.register(new User(newUser), req.body.password,
            function (err, account) {
                // Show registration form with errors if fail.
                let reqInfo = RequestService.reqHelper(req);
                if (err) { return res.json({ user: newUser, errorMessage: err, reqInfo: reqInfo }); }
                return res.json({ Message: "Registered successfully", errorMessage: "", user: newUser, reqInfo: reqInfo });
            });
    }
    else {
        res.json({ errorMessage: validatedUser.errorMessage })
    }
};


// Shows login form.
exports.Login = async function (req, res) {
    let reqInfo      = RequestService.reqHelper(req);
    let errorMessage = req.query.errorMessage;

    res.render('User/Login', {
        user: {}, errorMessage: errorMessage,
        reqInfo: reqInfo
    });
};


exports.LoginUser = async function (req, res, next) {
    let roles = await _userRepo.getRolesByUsername(req.body.username);
    sessionData       = req.session;
    sessionData.roles = roles;

    passport.authenticate('local', {
        successRedirect: '/User/SecureArea',
        failureRedirect: '/User/Login?errorMessage=Invalid login.',
    })(req, res, next);
};


// Log user out and direct them to the login screen.
exports.Logout = (req, res) => {
    req.logout();
    let reqInfo = RequestService.reqHelper(req);

    res.render('User/Login', {
        user: {}, isLoggedIn: false, errorMessage: "",
        reqInfo: reqInfo
    });
};


exports.Delete = async function (req, res) {
    let email       = req.body.email;
    let deletedItem = await _userRepo.delete(email);

    // Some debug data to ensure the item is deleted.

    if (JSON.stringify(deletedItem.deletedCount) == 1) {
        let users = await _userRepo.allUsers();
        res.json({ users: users, errorMessage: "" });
    } else {
        res.json({ errorMessage: "An error occured while deleting!" });
    }
};


exports.MyAccount = async function (req, res) {
    // req.query used to get url parameter.
    let username = req.query.username;

    let UserObj = await _userRepo.getUser(username);
    res.json({ user: UserObj });
};


// Receives posted data that is used to update the item.
exports.EditMyAccount = async function (req, res) {
    let username = req.body.username;

    let password = req.body.password;
    let confirm = req.body.passwordConfirm;
    
    if (password == confirm) {
    let tempUserObj = new User({
        username   : req.body.username,
        firstName  : req.body.firstName,
        lastName   : req.body.lastName,
        email      : req.body.email,
        address    : req.body.address,
        zipcode    : req.body.zipcode,
        txtEmpPhone: req.body.txtEmpPhone,
    });

    // Call update() function in repository with the object.
    let responseObject = await _userRepo.update(tempUserObj, "Update");

    // Update was successful. Show detail page with updated object.
    if (responseObject.errorMessage == "") {
        res.json({
            user: responseObject.obj,
            errorMessage: ""
        });
    }

    // Update not successful. Show edit form again.
    else {
        res.json({
            user: responseObject.obj,
            errorMessage: responseObject.errorMessage
        });
    }
} 
else {
    res.json({
        errorMessage: "Passwords do not match!"
    });
}
};


// This displays a view called 'securearea' but only 
// if user is authenticated.
exports.SecureArea = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req);

    if (reqInfo.authenticated) {
        res.render('User/SecureArea', { errorMessage: "", reqInfo: reqInfo })
    }
    else {
        res.redirect('/User/Login?errorMessage=You ' +
            'must be logged in to view this page.')
    }
};


// This displays a view called 'securearea' but only 
// if user is authenticated.
exports.ManagerArea = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req, ['Admin', 'Manager']);

    if (reqInfo.rolePermitted) {
        res.render('User/ManagerArea', { errorMessage: "", reqInfo: reqInfo })
    }
    else {
        res.redirect('/User/Login?errorMessage=You ' +
            'must be logged in with proper permissions to view this page.')
    }
};


// This function returns data to authenticated users only.
exports.SecureAreaJwt = async function (req, res) {
    let reqInfo = await RequestService.jwtReqHelper(req);

    if (reqInfo.authenticated) {
        res.json({
            errorMessage: "", reqInfo: reqInfo,
            secureData: "Congratulations! You are authenticated and you have "
                + "successfully accessed this message."
        })
    }
    else {
        res.json({
            errorMessage: '/User/Login?errorMessage=You ' +
                'must be logged in to view this page.'
        })
    }
};


// This function returns data to logged in managers only.
exports.ManagerAreaJwt = async function (req, res) {
    let reqInfo = await RequestService.jwtReqHelper(req, ['Admin', 'Manager']);

    if (reqInfo.rolePermitted) {
        res.json({ errorMessage: "", reqInfo: reqInfo })
    }
    else {
        res.json({
            errorMessage: 'You must be logged in with proper ' +
                'permissions to view this page.'
        });
    }
};


// This function receives a post from logged in users only.
exports.PostAreaJwt = async function (req, res) {
    let reqInfo = await RequestService.jwtReqHelper(req, []);
    console.log(req.body.obj.msgFromClient);
    res.json({
        errorMessage: "", reqInfo: reqInfo,
        msgFromServer: "Hi from server"
    })
};


function ValidateUserInfo(username, email, phone, password, confirm, userUsername, userEmail) {
    let phonePattern    = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;
    let emailPattern    = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    var passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/;

    if (username == "") {
        return { errorMessage: "Username is required!" }
    } else if (username.length < 4) {
        return { errorMessage: "Username must be at least 4 character." }
    } else if (userUsername != null) {
        return { errorMessage: "This username is not available!" }
    } else if (!String(phone).match(phonePattern)) {
        return { errorMessage: "Please enter a valid phone number [e.g. (123) 456-7890, 123-456-7890, 123 456 7890, +91 (123) 456-7890]." }
    } else if (!String(email).match(emailPattern)) {
        return { errorMessage: "Please enter a valid email [e.g. joe@aol.com, joe@wrox.co.uk, joe@domain.info]." }
    } else if (userEmail != null) {
        return { errorMessage: "There is a record of regitration with this email! PLease try another email."}
    } else if (!password.match(passwordPattern)) {
        return { errorMessage: "Must contain at least 1 number, 1 uppercase, 1 lowercase letter, 1 special character, and at least 8 or more characters." }
    } else if (password != confirm) {
        return { errorMessage: "Passwords do not match." }
    } else {
        return { errorMessage: "" }
    }
};
