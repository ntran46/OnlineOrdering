const Restaurant        = require('../Models/Restaurant');
// var passport            = require('passport');
const RequestService    = require('../Services/RequestService');
const RestaurantRepo    = require('../Data/RestaurantRepo');
const _RestaurantRepo   = new RestaurantRepo();


exports.Index = async function (req, res) {

    let reqInfo = RequestService.reqHelper(req);
    let RESObj  = await _RestaurantRepo.allRestaurant();

    return res.json({ reqInfo: reqInfo, restaurants: RESObj });
};


exports.RestaurantInfo= async function(req, res) {
    let Restaurant = new Object ;

    if (req.query.id != undefined){
        let RestaurantID = req.query.id;
        Restaurant = await _RestaurantRepo.getRestaurantByID(RestaurantID)     
    }

    if (req.query.id == undefined && req.query.email != undefined){
        let RestaurantEmail = req.query.email;
        Restaurant = await _RestaurantRepo.getRestaurantByEmail(RestaurantEmail)     
    }
    
    if (Restaurant != null){
        return res.json({ obj: Restaurant.obj, errorMessage:"" })
    }else {
        return res.json({ obj: Restaurant, errorMessage:"Cannot find the restaurant Info" })
    }
}


exports.RegisterRestaurant = async function (req, res) {

    let email  = req.body.email;
    let phone  = req.body.phoneNo;
    let license= req.body.license;
    let street = req.body.strAddress;
    let city   = req.body.city;
    let zipcode= req.body.zipcode;                                 

    let restEmail   = await _RestaurantRepo.getRestaurantByEmail(email);
    let restPhone   = await _RestaurantRepo.getRestaurantByPhone(phone);
    let restLicense = await _RestaurantRepo.getRestaurantByLicence(license);

    let validatedRest = ValidateRestInfo(email, restEmail, phone, restPhone, restLicense, street, city, zipcode);

    if (validatedRest.errorMessage == "") {
        var newRestaurant   = new Restaurant({
            email           : req.body.email,
            restaurantName  : req.body.restaurantName,
            strAddress      : req.body.strAddress,
            city            : req.body.city,
            zipcode         : req.body.zipcode,
            phoneNo         : req.body.phoneNo,
            description     : req.body.description,
            license         : req.body.license,
            menu            : req.body.menu,
            branchLocation  : req.body.branchLocation,
            employees       : req.body.employees,
        });

        let responseObject = await _RestaurantRepo.create(newRestaurant);

        if (responseObject.errorMessage == "") {
            res.json({
                restaurant  : responseObject.obj,
                Message     : "Saved without errors.",
                errorMessage: ""
            });
        }
        else {
            res.json({
                restaurant  : responseObject.obj,
                errorMessage: responseObject.errorMessage,
                Message     : "An error occured. Item not created."
            });
        }
    }
    else {
        console.log(validatedRest.errorMessage)
        res.json({errorMessage: validatedRest.errorMessage });
    }
};


exports.addMenuItem = async function (req, res) {

    let tempReviewObj = ({
        id         : req.body.id,
        category   : req.body.category,
        description: req.body.description,
        productName: req.body.productName,
        price      : req.body.price
    });

    let restaurant = await _RestaurantRepo.updateMenu(tempReviewObj);

    if (restaurant.errorMessage == "") {
        res.json({
            restaurant  : restaurant,
            errorMessage: "",
            Message     : "Item saved successfully.",
        });
    }
    else {
        res.json({
            restaurant  : restaurant,
            errorMessage: restaurant.errorMessage,
            Message     : "An error occured! Item did not save.",
        });
    }
}


exports.approveRestaurant = async function (req, res) {

    let tempReviewObj = new Restaurant({
        _id         : req.body._id,
        email       : req.body.email,
        isApproved  : req.body.isApproved
    });

    let restaurant = await _RestaurantRepo.updateItem(tempReviewObj);
    if (restaurant != null) {
        res.json({ restaurant: restaurant });
    }
    else {
        res.json({ restaurant: [] });
    }
};


exports.Delete = async function (req, res) {
    let id = req.body.id;
    let deletedItem = await _RestaurantRepo.delete(id);

    if (JSON.stringify(deletedItem.deletedCount) == 1) {
        let restaurants = await _RestaurantRepo.allRestaurant();
        res.json({ restaurants: restaurants, errorMessage: "" });
    } else {
        res.json({ errorMessage: "An error occured while deleting!" });
    }
};


// This displays a view called 'securearea' but only 
// if user is authenticated.
exports.SecureArea = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req);

    if (reqInfo.authenticated) {
        res.render('Restaurant/SecureArea', { errorMessage: "", reqInfo: reqInfo })
    }
    else {
        res.redirect('/Restaurant/Login?errorMessage=You ' +
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


function ValidateRestInfo(email, restEmail, phone, restPhone, restLicense, street, city, zipcode) {
    let phonePattern = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;
    let emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!emailPattern.test(email)) {
        return { errorMessage: "Please enter a valid email [abc@abc.com]." }
    } else if (restEmail != null) {
        return { errorMessage: "Email address is already registered! PLease try another email." }
    } else if (!phonePattern.test(phone)) {
        return { errorMessage: "Please enter a valid phone number [e.g. (123) 456-7890, 123-456-7890, 123 456 7890, +91 (123) 456-7890]." }
    } else if (restPhone != null) {
        return { errorMessage: "Phone Number is already registered! PLease try another number." }
    } else if (restLicense != null) {
        return { errorMessage: "This License is already registered!" }
    }else if (street == "") {
        return { errorMessage: "Please enter your branch street address!" }
    } else if (city == "") {
        return { errorMessage: "Please enter your branch city!" }
    } else if (zipcode == "") {
        return { errorMessage: "Please enter your branch zipcode!" }
    } else {
        return { errorMessage: "" }
    }
};

// function CalRating(RESObj) {

//     let restaurants = [];

//     for (var key = 0; key < RESObj.length; key++) {
//         let total       = 0;
//         let countStars  = 0;
//         let countReview = 0;
//         if ((RESObj[key].comments)) {
//             for (var i = 0; i < RESObj[key].comments.length; i++) {
//                 countStars = countStars + 1;
//                 if (RESObj[key].comments[i].userReview.rating != (null, "", undefined)) {
//                     total = total + parseInt(RESObj[key].comments[i].userReview.rating, 10);
//                 };
//                 if (RESObj[key].comments[i].userReview.review != (null, "", undefined)) {
//                     countReview = countReview + 1;
//                 };
//             }
//         }
//         if (total != 0) {
//             restaurants.push([RESObj[key], (total / countStars).toFixed(1), countReview]);
//             // restaurants.push([RESObj[key]._id, RESObj[key].restaurantName, (total/countStars).toFixed(1), countReview]);
//         }
//         else {
//             restaurants.push([RESObj[key], total, countReview]);
//             // restaurants.push([RESObj[key]._id, RESObj[key].restaurantName, total, countReview]);
//         }
//     }    

//     return restaurants;
// };