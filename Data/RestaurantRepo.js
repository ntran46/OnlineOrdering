const Restaurant = require('../Models/Restaurant');

class RestaurantRepo {
    RestaurantRepo() {        
    }

    async allRestaurant() {     
        let restaurants = await Restaurant.find().exec();
        return restaurants;
    }

    async getEmployees() {
        var employees = await Restaurant.find().exec();
        if(employees) {
            return employees;
        }
        else {
            return [];
        }
    }    

    async getRestaurantByID(id) {
        var restaurant = await Restaurant.findOne({_id: id});
        if(restaurant) {
            let respose = { obj: restaurant, errorMessage:"" }
            return respose;
        }
        else {
            return null;
        }
    }

    async getRestaurantByEmail(email) {
        var restaurant = await Restaurant.findOne({email: email});
        if(restaurant) {
            let respose = { obj: restaurant, errorMessage:"" }
            return respose;
        }
        else {
            return null;
        }
    }

    async getRestaurantByLicence(license) {
        var restaurant = await Restaurant.findOne({license: license});
        if(restaurant) {
            let respose = { obj: restaurant, errorMessage:"" }
            return respose;
        }
        else {
            return null;
        }
    }

    async getRestaurantByPhone(phone) {
        var restaurant = await Restaurant.findOne({phoneNo: phone});
        if(restaurant) {
            let respose = { obj: restaurant, errorMessage:"" }
            return respose;
        }
        else {
            return null;
        }
    }


    async create(RestaurantObj) {
        try {
            var error = await RestaurantObj.validateSync();
    
            if(error) {
                let response = {
                    obj:          RestaurantObj,
                    errorMessage: error.message };

                return response;
            } 
            const result = await RestaurantObj.save();
            let response = {
                obj:          result,
                errorMessage: "" };

            return response;
        } 

        catch (err) {
            let response = {
                obj:          RestaurantObj,
                errorMessage: err.message };
    
            return  response;
        }    
    } 

    async updateItem(editedObj) { 

        let response = {
            obj:          editedObj,
            errorMessage: "" };
    
        try {
            var error = await editedObj.validateSync();
            if(error) {
                response.errorMessage = error.message;
                return response;
            } 
    
            let RestaurantObj = await this.getRestaurantByID(editedObj._id);
            if(RestaurantObj) {
                let updated = await Restaurant.updateOne(
                    { _id: editedObj._id},
                    {$set: { isApproved: editedObj.isApproved }}); 
    
                if(updated.nModified!=0) {
                    response.obj = editedObj;
                    return response;
                }
                else {
                    respons.errorMessage = 
                        "An error occurred during the update. The item did not save." 
                };
                return response; 
            }
            else {
                response.errorMessage = "No item with this id can be found." };
                return response; 
            }

        catch (err) {
            response.errorMessage = err.message;
            return  response;
        }    
    }  

    async updateMenu(tempObj){

        let response = {
            obj         : tempObj,
            errorMessage: "" };

            try {
        
                let ResObj = await this.getRestaurantByID(tempObj.id);
                let RestaurantObj = ResObj.obj

                if(RestaurantObj) {
                    var items = {"productName"  : tempObj.productName,
                                  "description" : tempObj.description,
                                  "price"       : tempObj.price
                                }
                    var checkCategory = false    
                            
                    for (var i = 0; i < RestaurantObj.menu.length; i++){
                        console.log(RestaurantObj.menu[i])
                        if (RestaurantObj.menu[i].category == (undefined,null)){
                            var categoryTemp = {"category": tempObj.category, "items": [items]}
                            RestaurantObj.menu[i] = categoryTemp
                            checkCategory = true
                        }
                        else if (RestaurantObj.menu[i].category == tempObj.category){
                            RestaurantObj.menu[i].items.push(items)
                            checkCategory = true
                        }
                    }

                    if (!checkCategory) {
                        RestaurantObj.menu.push({"category": tempObj.category, "items": [items]})
                    }

                    let updated = await Restaurant.updateOne(
                        { _id: tempObj.id},
                        { $set: { menu: RestaurantObj.menu}
                        }); 
        
                    if(updated.nModified!=0) {
                        response.obj = tempObj;
                        return response;
                    }
                    else {
                        response.errorMessage = 
                            "An error occurred during the update. The item did not save." 
                    };
                    return response; 
                }
                else {
                    response.errorMessage = "No item with this id cannot be found." };
                    return response; 
                }
    
            catch (err) {
                response.errorMessage = err.message;
                return  response;
            } 
    }

    
    async delete(ID) {
        let deletedRest =  await Restaurant.find({_id:ID}).remove().exec();
        console.log(deletedRest);
        return deletedRest;
    }
}
module.exports = RestaurantRepo;

