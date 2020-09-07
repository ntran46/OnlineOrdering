import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from '../app.component'
import { ApiService }               from '../ApiService';

const BASE_URL = "http://localhost:1337/User/";

export interface PeriodicElement {
    username: string;
    firstname: number;
    lastname: number;
    txtEmpPhone: string;
  }
const ELEMENT_DATA: PeriodicElement[] = [];

@Component({
  templateUrl:'./MyAccount.component.html',
  styleUrls: ['./MyAccount.component.css']
  
})
export class MyAccountComponent { 
  selectedGender: string = "male";
  _UserArray    : any;
  _role         : String;
  _username     : String;
  _firstname    : String;
  _lastname     : String;
  _email        : String;
  _password     : any;
  _confirm      : any;
  _gender       : any;
  _address      : string;
  _zipcode      : any;
  _txtEmpPhone  : any;
  reqInfo       : any;
  _http         :HttpClient;
  token         = '';
  _errorMessage :String = "";
  secureData    : string = '';
  managerData   : string = '';
  msgFromServer : string = '';
  _apiService   : ApiService;

  constructor(private http: HttpClient, AppComponent:AppComponent) {
    // this._apiService = new ApiService(http, this);
      this._http = http;
      this._apiService = new ApiService(http, this);
      this.getSecureData()
      this.showContentIfLoggedIn()
      // setTimeout(() => {this.View();}, 200)
    }

    showContentIfLoggedIn() {
      if(sessionStorage.getItem('auth_token')!=null) {
          this.token   = sessionStorage.getItem('auth_token');
          this._UserArray = JSON.parse(sessionStorage.user)
      }
      else {
          this.token   = ''
          alert("Unauthorized Area");
          window.location.href = './login';
      }
  }

    Submit() {
      console.log(this._UserArray.username)
      console.log(this._firstname)
      if (this._password != this._confirm) {
        alert("Passwords do not match!")
      } else {
        let url = BASE_URL + 'EditMyAccount'
        this._http.put(url, {
          username       : this._UserArray.username,
          firstName      : this._firstname,
          lastName       : this._lastname,
          email          : this._email,
          address        : this._address,
          zipcode        : this._zipcode,
          txtEmpPhone    : this._txtEmpPhone
    })
    .subscribe(
      // Data is received from the post request.0
      (data) => {
          // Inspect the data to know how to parse it.
          console.log("Edit successsful. Inspect response.", JSON.stringify(data));
          this._errorMessage = data["errorMessage"];
          console.log( JSON.stringify(data))
          

          if (this._errorMessage !=""){
            alert(this._errorMessage)
            this.logout()
            window.location.href = '../login';
        }
        else{
          alert("Your account info has been successfully updated!");
          window.location.href = '../Main';
        }  
      },
            error =>{
              console.log(JSON.stringify(error));
              this._errorMessage = error;
            });
        }
    }

    View(){
      document.getElementById("Save").style.visibility='visible'
      document.getElementById("Cancel").style.visibility='visible'
      document.getElementById("ViewTable").style.display='none'
      document.getElementById("EditTable").style.display='inline'
      document.getElementById("View").style.visibility='hidden'


    }

    Edit() {

      this.showContentIfLoggedIn()
      document.getElementById("View").style.display = "none";
      document.getElementById("Edit").style.display ="inline";
    }

    Cancel() {
      this.showContentIfLoggedIn()
      document.getElementById("ViewTable").style.display='inline'
      document.getElementById("EditTable").style.display='none'
      document.getElementById("View").style.visibility='visible'
      document.getElementById("Save").style.visibility='hidden'
      document.getElementById("Cancel").style.visibility='hidden'
    }
    
getSecureData() {  
      this._apiService.getData('User/SecureAreaJwt', 
                              this.secureDataCallback);
  }
  // Callback needs a pointer '_this' to current instance.
  secureDataCallback(result, _this) {
      if(result.errorMessage == "") {
          _this.secureData = result.secureData;
          _this.reqInfo = result.reqInfo;
          console.log(result.reqInfo)
      }
      else {
          console.log(JSON.stringify(result.errorMessage));
          alert("You are not authorized to exeucute this acction")
          window.location.href = '../login';
      }   
  }

    //------------------------------------------------------------
    // Log user out. Destroy token.
    //------------------------------------------------------------
    logout() {
      sessionStorage.clear();
      this.showContentIfLoggedIn();

      // Clear data.
      this.secureData    = ""; 
      this.managerData   = "";
      this.reqInfo       = {};
      this.msgFromServer = "";
  }

}