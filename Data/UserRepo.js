const User = require('../Models/User');

class UserRepo {
    
    UserRepo() {        
    }

    async allUsers() {     
        let users = await User.find().exec();
        return users;
    }

    async getUser(username) {
        var user = await User.findOne({username: username});
        if(user) {
            let respose = { obj: user, errorMessage:"" }
            return respose;
        }
        else {
            return null;
        }
    }

    async getRolesByUsername(username) {
        var user = await User.findOne({username: username}, {_id:0, roles:1});
        if(user.roles) {
            return user.roles;
        }
        else {
            return [];
        }
    } 
    
    async getUserByEmail(email) {
        var user = await User.findOne({email: email});
        if(user) {
            let respose = { obj: user, errorMessage:"" }
            return respose;
        }
        else {
            return null;
        }
    }

    async update(editedObj, action) {   
    
        let response = {
            obj:          editedObj,
            errorMessage: "" };
    
        try {
            var error = await editedObj.validateSync();
            if(error) {
                response.errorMessage = error.message;
                return response;
            } 

            let UserObject = await this.getUser(editedObj.username);
    
            if(UserObject) {
                if (action == "Update"){
                    var updated = await User.updateOne(
                        { username: editedObj.username},
                        {$set: {firstName   :editedObj.firstName,
                                lastName    :editedObj.lastName,
                                email       :editedObj.email,
                                address     :editedObj.address,
                                zipcode     :editedObj.zipcode,
                                txtEmpPhone :editedObj.txtEmpPhone}
                            });
                    
                }
                else if (action == "Remove"){
                    var updated = await User.updateOne(
                        { username: editedObj.username},
                        // {$set: { attendee: editedObj.attendee }}
                        ); 
                }

                if(updated.nModified!=0) {
                    response.obj = editedObj;
                    return response;
                }
                else {response.errorMessage = 
                        "An error occurred during the update. The item did not save." 
                };
                return response; 
            }
            else {response.errorMessage = "An item with this id cannot be found." };
                return response; 
            }
                    
        catch (err) {
            response.errorMessage = err.message;
            return  response;
        }    
    }  

    async delete(email) {
        let deletedItem =  await User.find({email:email}).remove().exec();
        console.log(deletedItem);
        return deletedItem;
    }
}
module.exports = UserRepo;

