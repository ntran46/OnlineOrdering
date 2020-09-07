import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const BASE_URL = "http://localhost:1337/Restaurant/";


@Component({
  selector: 'app-register',
  templateUrl: './RestaurantRegister.component.html',
  styleUrls: ['./register.component.css'],
})

export class RestaurantRegisterComponent implements OnInit {
  _UserArray : Array<any>;
  _role      : String;
  _email     : String;
  _city      : any;
  _zipcode   : any = '';
  _phoneNo   : any = '';
  _menu      : String = '';
  _license   : String = '';
  _employees : any = '';
  _reqInfo   : any;
  _http      :HttpClient;
  _errorMessage  :String = "";
  _restaurantName: String;
  _strAddress    : string = '';
  _branchLocation: any = '';
  _description   :String = '';

  constructor(private http: HttpClient) { 
    this._http = http;
  }

  ngOnInit(): void {
  }

  RegisterRestaurant() {

    this.http.post(BASE_URL + "RegisterRestaurant",
        {
          email       : this._email,
          restaurantName : this._restaurantName,
          strAddress  : this._strAddress,
          city        : this._city,
          zipcode     : this._zipcode,
          phoneNo     : this._phoneNo,
          menu        : this._menu,
          description : this._description,
          license     : this._license,
          branchLocation  : this._branchLocation,
          employees   : this._employees,
        })
    .subscribe(
        (data) => {
            console.log("POST call successful. Inspect response.", JSON.stringify(data));

            this._errorMessage = data["errorMessage"];

            if (this._errorMessage !=""){
              alert(this._errorMessage)
              window.location.href = './RestaurantRegister';
          }
          else{
            window.location.href = './Main';
          }
        },
        error => {
            this._errorMessage = error;
            alert(error)
        });
  }

}
