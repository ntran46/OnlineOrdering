import {Component, OnInit} from '@angular/core'
import {HttpClient, HttpHeaders} from '@angular/common/http'
import {ApiService} from '../ApiService'
// import {AppComponent } from '../app.component'
import { ActivatedRoute} from '@angular/router'
// import {ReviewComponent} from './review.component'

@Component({
    selector: 'app-loign',
    templateUrl: `./writeReviews.component.html`,
    styleUrls: ['../app.component.css'],
    // providers: [ReviewComponent]
})

export class WriteReviewComponent {
    public site  = 'http://localhost:1337/'
    _http        : HttpClient;
    rating       : Number=0;
    review       : Number=0;
    route        : ActivatedRoute
    _RestaurantItem   : any=[];
    reqInfo      : any = {};
    _apiService  : ApiService;
    _ReviewItem  : any=[];
    _review      : String ="";
    _rating      : Number;
    _user        : any;
    _errorMessage: String = "";
    token        : string
    _editParams  : boolean = false;

    constructor(private http: HttpClient, route: ActivatedRoute) {
        this._apiService = new ApiService(http, this);
        this._http = http;
        this.route = route
        this.getSecureData()
        this.showContentIfLoggedIn();
        let param = this.route.snapshot.params
        console.log(param)
        this.getReviews(param['id']);
        if (param['id/edit'] != [null, undefined, ""]){
            this._editParams == true;
        }
    }

    getReviews(RestaurantID){
        
        let url = this.site + 'Restaurant/ReviewDetail?_id=' + RestaurantID
        this.http.get<any>(url)
            .subscribe(result => {
                this._RestaurantItem = result.restaurant.obj
                this._ReviewItem     = result.restaurant.obj.comments
                console.log(this._RestaurantItem)
            }, 
            error =>{
                this._errorMessage = error;
            })
    }

    Submit(RestaurantID){

        let url = this.site
        console.log(RestaurantID)
        if (this._editParams == true) {
            url = url + 'User/EditReviews?_id=' + RestaurantID
        }
        else {
            url = url + 'Restaurant/WriteReviews?_id=' + RestaurantID
        }

        this.http.post(url, {
                _id     : RestaurantID,
                rating  : this._rating,
                review  : this._review,  
                username: this._user.username
            })
        .subscribe(result => {
            console.log(JSON.stringify(result))
            if (result['errorMessage'] !=""){
                alert(result['errorMessage'])
            }
            else{
                window.location.href = '../ViewReview/' + RestaurantID;
            }
        }, 
        error =>{
            this._errorMessage = error;
            alert(this._errorMessage)  
        })
    
    }

    Cancel(){
        window.location.href = '../Main';
    }

    showContentIfLoggedIn() {
        if(sessionStorage.getItem('auth_token')!=null) {
            this.token   = sessionStorage.getItem('auth_token');
            this._user   = JSON.parse(sessionStorage.getItem('user'))
        }
        else {
            this.token   = ''
        }
    }

    getSecureData() {  
        this._apiService.getData('User/SecureAreaJwt', 
                                this.secureDataCallback);
    }
    secureDataCallback(result, _this) {
        if(result.errorMessage == "") {
            _this.secureData = result.secureData;
            _this.reqInfo = result.reqInfo;
        }
        else {
            console.log(JSON.stringify(result.errorMessage));
            alert("You are not authorized to exeucute this acction")
            window.location.href = '../login';
        }   
    }
}

