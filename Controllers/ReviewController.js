const ReviewRepo      = require('../Data/ReviewRepo');
const _reviewRepo     = new ReviewRepo();
const Restaurant      = require('../Models/Restaurant');
const RestaurantRepo  = require('../Data/RestaurantRepo');
const _RestaurantRepo = new RestaurantRepo();
const RequestService  = require('../Services/RequestService');


exports.ReviewDetail = async function (request, response) {

    let RestaurantID = request.query.id; 
    let reqInfo      = RequestService.reqHelper(request);
    let RESObj       = await _RestaurantRepo.getRestaurantByID(RestaurantID);

    var objArray = [];
    if (RESObj.obj.comments) {
        for (var i = 0; i < RESObj.obj.comments.length; i++) {
            var userkey = RESObj.obj.comments[i].username;
            objArray.push([userkey, RESObj.obj.comments[i].userReview.rating,
                                    RESObj.obj.comments[i].userReview.review,
                                    RESObj.obj.comments[i].userReview.date]);
        }
    }
    response.json({ restaurant: RESObj, comments: objArray, errorMessage: "", reqInfo: reqInfo });
};


exports.MyReviews = async function(request, response) {

    let reqInfo    = RequestService.reqHelper(request);

    if(reqInfo.authenticated) {      
        let MyReviews  = await _reviewRepo.getMyReview(reqInfo.username);  
        response.json({myReviews:MyReviews, errorMessage: "" , reqInfo:reqInfo})
    }
    else {
        response.redirect('/User/Login?errorMessage=You ' + 
                     'must be logged in to view this page.')
    }
}


exports.EditMyReview = async function(request, response){

    let reqInfo      = RequestService.reqHelper(request);
    let RestaurantID = request.body._id;
    let RestObj      = await _RestaurantRepo.getRestaurantByID(RestaurantID);
    response.json({restaurants:RestObj, reqInfo:reqInfo, comments: "", 
                   username:reqInfo.username, review:"", rating:""});
}


exports.UpdateMyReview = async function(request, response){

    let reqInfo     = RequestService.reqHelper(request);
    let RestaurantID=  request.body._id;
    let RestObj     = await _RestaurantRepo.getRestaurantByID(RestaurantID);
    let loginName   = request.user.username;
    let rating      = request.body.rating;
    let review      = request.body.review;
    
    let tempReviewObj = createTempObj(RestObj.obj,loginName,rating,review, "Edit");

    // Call update() function in repository with the object.
    let responseObject = await _reviewRepo.updateReview(tempReviewObj, loginName, "Edit");
    let myReviews      = await _reviewRepo.getMyReview(reqInfo.username);

    // Update was successful. Show detail page with updated object.
    if(responseObject.errorMessage == "") {
        response.json({restaurants : myReviews,
                       errorMessage: "" ,
                       reqInfo     : reqInfo
                    });
    }
    else {
        response.json({restaurants : myReviews,
                       errorMessage: responseObject.errorMessage,
                       reqInfo     : reqInfo });
    }
}
 
// Receives posted data that is used to update the item.
exports.WriteReviews = async function (request, response) {

    let username    = request.body.username;
    let rating      = request.body.rating;
    let review      = request.body.review;
    let RestaurantID= request.body._id;

    let RESObj      = await _RestaurantRepo.getRestaurantByID(RestaurantID);
    let reqInfo     = RequestService.reqHelper(request);

    let validatedReview = validateReview(rating);

    if (validatedReview.errorMessage == "") {
        
        let tempReviewObj = createTempObj(RESObj.obj, username, rating, review, "Create");
        let responseObject = await _reviewRepo.updateReview(tempReviewObj, username, "Create");
        let myReviews = await _reviewRepo.getMyReview(username);

        if (responseObject.errorMessage == "") {
            response.json({
                restaurant  : myReviews,
                errorMessage: "",
                Message     : "Review saved Successfully.",
                reqInfo     : reqInfo
            });
        }
        else {
            response.json({
                restaurant  : myReviews,
                errorMessage: responseObject.errorMessage,
                Message     : "An error occured! Review did not save.",
                reqInfo     : reqInfo
            });
        }
    } else {
        response.json({ errorMessage: validatedReview.errorMessage })
    }
};    


exports.DeleteReview = async function(request, response) {

    let RestaurantID= request.body._id;
    let userName    = request.user.username;
    let reqInfo     = RequestService.reqHelper(request);
    let RESObj      = await _RestaurantRepo.getRestaurantByID(RestaurantID)  
    
    for (var i=0; i<RESObj.comments.length; i++){
        if (RESObj.comments[i].username == userName){
            RESObj.comments[i].splice(i, 1);
        }
        break;
    }
    let stars =  CalRating(RESObj);
    RESObj.rating.stars       = stars[0];
    RESObj.rating.reviewCount = stars[1];

    let deletedItem   = await _reviewRepo.delete(id,userName,RESObj);

    // Some debug data to ensure the item is deleted.
    console.log(JSON.stringify(deletedItem));
    let MyReview    = await _reviewRepo.getMyReview(userName);
    if(deletedItem[1] == "") { 
        response.json({MyReview:MyReview, errorMessage:deletedItem[1],reqInfo: reqInfo});
    }
    else{
        response.json({MyReview:MyReview, errorMessage:deletedItem[1],reqInfo: reqInfo});
    }
}


function getCurrentDate() {
    let currentDate = new Date();
    let day = currentDate.getDate();
    let month = currentDate.getMonth();
    let year = currentDate.getFullYear();
    var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (day < 10) {
        day = '0' + day.toString();
    }
    let formatted_date = day.toString() + "-" + MON[month] + "-" + year.toString()
    // let formatted_date1 = day.toString() + "-" + MON[month] + "-" + year.toString()

    return formatted_date.slice(-100, -2);
};


function createTempObj(RESObj, loginName, rate, review, action) {
    let date        = getCurrentDate();
    let userReview  = { rating: rate, review: review, date: date };
    let userObject  = { username: loginName, userReview };
    
    if (action == "Create"){
        let stars =  CalRating(RESObj, rate, 1);
        RESObj.rating.stars       = stars[0];
        RESObj.rating.reviewCount = stars[1]; 
    }

    let tempReviewObj = new Restaurant({
        _id             : RESObj._id,
        restaurantName  : RESObj.restaurantName,
        email           : RESObj.email,
        comments        : userObject,
        rating          : RESObj.rating
    });

    return tempReviewObj;
};

function CalRating(RESObj, rate = 0, review = 0) {
    let total       = 0;
    let countReview = 0;

    for (var i = 0; i < RESObj.comments.length; i++) {
        if (RESObj.comments[i].userReview.rating != (null, "", undefined)) {
            total += parseInt(RESObj.comments[i].userReview.rating, 10);
        };
        countReview += 1;
    }
        
    if (total != 0) {
        return [((total + rate) / (countReview + review)).toFixed(1) , (countReview + review)];
    }
    else {
        return [total + rate, countReview + review];
    }
};

function validateReview(rating) {
    let pattern = /^(?:[1-9]|0[1-9]|10)$/;

    if (!String(rating).match(pattern)) {
        return { errorMessage: "Rating must be a number between 0 and 10." }
    } else {
        return { errorMessage: "" }
    }
};
