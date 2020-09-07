var mongoose         = require('mongoose');


var orderHistorySchema = mongoose.Schema({

    _id       : {type : Number },
    customer  : {type : String},
    customerID: {type : String},
    orderDate : {type: String},
    restaurantName: {type: String},
    items     : {type: Array},
    total     : {type: String}
    
    },
    
    { collection : 'orderHistory' },

    { versionKey: false }
    
    );

var orderHistory  = mongoose.model('orderHistory', orderHistorySchema);
module.exports = orderHistory;
