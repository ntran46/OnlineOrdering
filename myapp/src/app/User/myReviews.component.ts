import {Component, OnInit}        from '@angular/core'
import {HttpClient, HttpHeaders}  from '@angular/common/http'
import {ApiService}               from '../ApiService'
import {ActivatedRoute}           from '@angular/router'

@Component({
    selector: 'app-login',
    templateUrl:`./myReviews.component.html`,
    styleUrls: ['../app.component.css'],

})

export class MyReviewsComponent {
    public site   = 'http:///localhost:1337/'
    _http         : HttpClient;
    route         : ActivatedRoute;
    _apiService   : ApiService;
    _errorMessage : String = "";
    token         : string;
    _user         : any;
    reqInfo       : any={};
    _reviewItems  : any=[];


    constructor(private http: HttpClient, route:ActivatedRoute) {
        this._apiService = new ApiService(http,this);
        this._http       = http;
        this.route       = route;
        this.getSecureData();
        this.showContentIfLoggedIn();
    }

    myReviews(){
        
        let url = this.site + 'User/myReviews';
        this.http.get<any>(url)
            .subscribe(result => {
                // this._RestaurantItem = result.restaurant.obj
                console.log(result.MyReviews)
                this._reviewItems = result.MyReviews
            }, 
            error =>{
                this._errorMessage = error;
            })
    }

    editReview(ID){
        window.location.href="../Restaurant/WriteReviews" + ID + '/edit';
    }

    deleteReview(ID){
        
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json'}),
            "body":{ id: ID}
        };
        let url = this.site + "User/DeleteReviews"
        this.http.delete(url, httpOptions)
                 .subscribe(
                    (data) => {
                        this._errorMessage = data["errorMessage"];
                        console.log(JSON.stringify(data));
                        this.myReviews();
                    },
                    error => {
                        console.log(JSON.stringify(error));
                        this._errorMessage = error; 
                    }
                 )
    }


    getSecureData() {
        this._apiService.getData('User/SecureAreaJwt', this.secureDataCallBack);
    }

    secureDataCallBack(result, _this){
        if(result.errorMessage == "") {
            _this.secureData = result.secureData;
            _this.reqInfo    = result.reqInfo;
        }
        else {
            console.log(JSON.stringify(result.errorMessage));
            alert("You are not authorized to exeucute this acction")
            window.location.href = '../login';
        }
    }

    showContentIfLoggedIn() {
        if(sessionStorage.getItem('auth_token')!=null) {
            this.token   = sessionStorage.getItem('auth_token');
            this._user   = JSON.parse(sessionStorage.getItem('user'))
            this.myReviews();
        }
        else {
            this.token   = ''
        }
    }


}