import {Component, OnInit}       from '@angular/core'
import {HttpClient, HttpHeaders} from '@angular/common/http'
import {ApiService}              from '../ApiService'
import {AppComponent }           from '../app.component'
import { ActivatedRoute}         from '@angular/router'

@Component({
    selector: 'app-loign',
    templateUrl: `./review.component.html`,
    styleUrls: ['../app.component.css']
})

export class ReviewComponent {
    public site  = 'http://localhost:1337/Restaurant/'
    _http        : HttpClient;
    rating       : Number=0;
    review       : Number=0;
    route        : ActivatedRoute
    _RestaurantItem   : any=[];
    reqInfo      : any = {};
    _apiService  : ApiService;
    _ReviewItem  : any=[];
    _errorMessage: String = "";

    constructor(private http: HttpClient,AppComponent:AppComponent, route: ActivatedRoute) {
        this._apiService = new ApiService(http, this);
        this._http = http;
        this.route = route
        this.getReviews(this.route.snapshot.params['id']);
    }

    getReviews(RestaurantID){
        console.log(RestaurantID)
        let url = this.site + 'ReviewDetail?id=' + RestaurantID;
        this.http.get<any>(url)
            .subscribe(result => {
                this._RestaurantItem = result.restaurant.obj
                this._ReviewItem = result.restaurant.obj.comments
            }, 
            error =>{
                this._errorMessage = error;
            })
    }

    WriteReview(RestaurantID){
        window.location.href = '../WriteReviews/' + RestaurantID;
    }

    Menu(RestaurantID){
        window.location.href = '../Menu/' + RestaurantID;
    }

}

