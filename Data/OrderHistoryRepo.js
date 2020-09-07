const OrderHistory = require('../Models/OrderHistory');

class OrderHistoryRepo {
    
    // This is the constructor.
    OrderHistoryRepo() {        
    }

    // Gets all OrderHistory records.
    async allOrders() {     
        let orderHistory = await OrderHistory.find().exec();
        return   orderHistory;
    }

    async create(orderHistoryObj) {
        try {
            // Checks if model conforms to validation rules that we set in Mongoose.
            var error = await orderHistoryObj.validateSync();
            // The model is invalid. Return the object and error message. 
            if(error) {
                let response = {
                    obj:          orderHistoryObj,
                    errorMessage: error.message };
    
                return response; // Exit if the model is invalid.
            } 
    
            // Load the actual corresponding object in the database.
            let orderCollection = await this.allOrders();

            // Check if any history record exists.
            if(orderCollection) {
                // Model is not invalid so save it.
                const result = await orderHistoryObj.save();
    
                // Success! Return the model and no error message needed.
                let response = {
                    obj:          result,
                    errorMessage: "" };
        
                return response;
            }
            else{
                let created = await OrderHistory.insert(
                    {
                        "_id"        : orderHistoryObj._id,
                        "orderDate"  : orderHistoryObj.orderDate,
                        "serverName" : orderHistoryObj.serverName,
                        "total"      : orderHistoryObj.total
                    }
                )
            }

        } 
        //  Error occurred during the save(). Return orginal model and error message.
        catch (err) {
            console.log(err)
            let response = {
                obj:          orderHistoryObj,
                errorMessage: err.message };
    
            return  response;
        }    
    } 
    
}

module.exports = OrderHistoryRepo;
