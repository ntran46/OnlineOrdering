const OrderHistoryRepo   = require('../Data/OrderHistoryRepo');
const _orderHistoryRepo  = new OrderHistoryRepo();
const OrderHistory       = require('../Models/OrderHistory');

// It shows a listing of OrderHistory if any exist.
exports.Index = async function(request, response){
    let orderHistory = await _orderHistoryRepo.allOrders();
    if(orderHistory!= null) {
        response.json({ orderHistory:orderHistory })
    }
    else {
        response.json( { orderHistory:[] })
    }
};

// Receives POST data and tries to save it.
exports.AddOrder = async function(request, response) {
    // Package object up nicely using content from 'body'
    // of the POST request.
    let temporderHistoryObj  = new OrderHistory( {
        "_id"        : request.body._id,
        "serverName" : request.body.serverName,
        "orderDate"  : request.body.orderDate,
        "total"      : request.body.total
    });

    // Call Repo to save 'OrderHistory' object.
    let responseObject = await _orderHistoryRepo.create(temporderHistoryObj);

    // No errors so save is successful.
    if(responseObject.errorMessage == "") {
        console.log('Saved without errors.');
        console.log(JSON.stringify(responseObject.obj));
        response.json({ orderHistory:responseObject.obj,
                                            errorMessage:""});
    }
    // There are errors. Show form the again with an error message.
    else {
        console.log("An error occured. Item not created.");
        response.json( {
                        orderHistory:responseObject.obj,
                        errorMessage:responseObject.errorMessage});
    }
};
