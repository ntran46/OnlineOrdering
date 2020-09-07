import { Component, Input }        from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { ApiService}               from '../ApiService'
import { ActivatedRoute}           from '@angular/router'

const BASE_URL ="http://localhost:1337/Restaurant/";

@Component({

    templateUrl:'./Menu.component.html',
    styleUrls: ['./Menu.component.css']
})

export class MenuComponent {
  _restaurant  :any =[];
  _http        :HttpClient;
  _id          :Number;
  _category    :String;
  _price       :Number;
  _productName :String;
  _description :String;
  _errorMessage:String = "";
  _UserArray   : any;
  token        : string; 
  reqInfo      : any = {};
  _apiService  : ApiService;
  panelOpenState = false;
  email        : any;
  menu         : any =[];
  route        : ActivatedRoute


  constructor(private http: HttpClient, route: ActivatedRoute) {
      this._apiService = new ApiService(http, this);
      this._http = http;
      this.route = route
      this.getMenu(this.route.snapshot.params['id']);
    }
  

  getMenu(RestaurantID) {

    let url = BASE_URL +  'RestaurantInfo?id=' + RestaurantID
    this._http.get<any>(url)
        .subscribe(result => {
            this.menu = []
            console.log(result)
            this._restaurant = result.obj
            this.menu = result.obj.menu
        }, 
        error =>{
            console.log(error)
            this._errorMessage = error;
        })
  }

}