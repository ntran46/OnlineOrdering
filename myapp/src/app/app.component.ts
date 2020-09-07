import { Component  } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from './ApiService';


@Component({
  selector: 'app-root',
  templateUrl: `./app.component.html`,

  styleUrls: ['./app.component.css']
})
export class AppComponent {
    loginInfo     = [];
    token         = '';
    message       = '';
    _user         : any;
    roles         : Array<any> = [];
    link          : string;
    secureData    : string = '';
    managerData   : string = '';
    reqInfo       : any    = {};
    msgFromServer : string = '';
    _apiService   : ApiService;

    public site='http://localhost:1337/';

  
    constructor(private http: HttpClient) {
        this._apiService = new ApiService(http, this);
        this.showContentIfLoggedIn();
    }  
    
    showContentIfLoggedIn() {
        if(sessionStorage.getItem('auth_token')!=null) {
            this.getSecureData()
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
            _this.reqInfo    = result.reqInfo;
        }
        else {
            console.log(JSON.stringify(result.errorMessage));
            alert("Unauthorized Area");
            window.location.href = './login';
        }   
    }
  
    getManagerData() {  
        this._apiService.getData('User/ManagerAreaJwt', 
                                this.managerDataCallback);
    }
    managerDataCallback(result, _this) {
        if(result.errorMessage == "") {
            _this.reqInfo = result.reqInfo;
        }
        else {
            console.log(JSON.stringify(result.errorMessage));
            alert("Unauthorized Area");
            window.location.href = './Main';
        }
    }
      
    logout() {
        sessionStorage.clear();
        this.showContentIfLoggedIn();

        this.secureData    = ""; 
        this.managerData   = "";
        this.reqInfo       = {};
        this.msgFromServer = "";
    }
}
