const Review          = require('../Models/Restaurant');
const RestaurantRepo  = require('../Data/RestaurantRepo');
const _RestaurantRepo = new RestaurantRepo();

class ReviewRepo {
    
    ReviewRepo() {        
    }

    async getMyReview(userName){
        
        var myReview  = [];
        var userObj   = await Review.find({"comments.username": userName});

        for(const item of userObj){
            for(var i=0; i<item.comments.length; i++){
                if(item.comments[i].username == userName){
                    var tempvalues = [item._id, item.restaurantName];
                    let userReviewtemp = Object.values(item.comments[i].userReview);
                    tempvalues.push(userReviewtemp);
                    myReview.push(tempvalues);
                }
            }
        }
        return myReview;
    }         
  
    async checkMyReview(response, userName){

        var MyReviews  = await this.getMyReview(userName);
        for(var k=0, j=0; k<MyReviews.length; k++){
            if(MyReviews[k][j].equals(response.obj._id)){
                response.errorMessage= "You already wrote a review for this Restaurant: " + response.obj.restaurantName;
                return response;
            }
        }
        response.errorMessage= "";
        return response;
    }

    async updateReview(editedObj,userName,action) {   
    
        let response = {
            obj         : editedObj,
            errorMessage: "" };

        try {
            let RESObject = await _RestaurantRepo.getRestaurantByID(editedObj._id);

            if(RESObject) {
                if (action=="Edit"){
                    var updated = await Review.updateOne(
                        {_id: editedObj._id},
                        {$set: {'comments.username':editedObj.comments.username}}
                    ) 
                }
                else if (action =="Create"){
                    let responseObject = await this.checkMyReview(response, userName);
                    if(responseObject.errorMessage !=""){
                        return responseObject;
                    }else{
                        var updated = await Review.updateOne(
                            {_id: editedObj._id},
                            {$push: {comments:editedObj.comments},$set: {rating:editedObj.rating}},
                        );
                    }
                }  
                if(updated.nModified!=0) {      
                    response.obj = editedObj;
                    return response;
                }
                else {
                    response.errorMessage = 
                        "An error occurred during the update. The item did not save." 
                };
                return response; 
            }        
            else {
                response.errorMessage = "An item with this id cannot be found." };
                return response; 
            }

        catch (err) {
            response.errorMessage = err.message;
            return  response;
        }    
    }  

    async delete(id, username, editedObj) {
        let errorMessage = "";  

        try {
            var deletedItem =  await Review.updateOne(
                        {_id:id, 'comments.username':username},
                        {$pull: {'comments':{username:username}},$set: {rating:editedObj.rating}},
            );
            return [deletedItem, errorMessage] ;
        }
        catch (err) {
            errorMessage = err.message;
            return  [deletedItem, errorMessage];
        }  
    }

}
module.exports = ReviewRepo;
