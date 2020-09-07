import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatTableDataSource }      from '@angular/material/table';
import { MatSort }                 from '@angular/material/sort'
import { MatPaginator }            from '@angular/material/paginator'
import { ApiService }              from '../ApiService';
import { AppComponent}             from '../app.component'
import { AotCompiler }             from '@angular/compiler';

const BASE_URL = "http://localhost:1337/User/";

@Component({
  templateUrl:'./userManagement.component.html',
  styleUrls: ['./Management.component.css']
})

export class userManagementComponent implements OnInit, AfterViewInit { 
  _UserArray    : Array<any>;
  _role         : String;
  _username     : String;
  _firstname    : String;
  _lastname     : String;
  _email        : String;
  _gender       : any;
  _address      : string;
  _zipcode      : any;
  _txtEmpPhone  : any;
  _user         : any;
  reqInfo       : any;
  _http         : HttpClient;
  _apiService   : ApiService;
  _errorMessage : String = "";
  
  public ELEMENT_DATA: PeriodicElement[] = [];
  displayedColumns: string[] = ['username', 'firstName', 'lastName', 'email', 'txtEmpPhone', 'update', 'delete'];
  dataSource = new MatTableDataSource<PeriodicElement>(this.ELEMENT_DATA);

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  token: string;

  constructor(private http: HttpClient, AppComponent:AppComponent) {
    this._apiService = new ApiService(http, this);
    this._http = http;
    this.showContentIfLoggedIn()
  }

    ngOnInit() {
      this.getAllUsers();
    }
  
    ngAfterViewInit(): void {
       this.dataSource.sort = this.sort;
       this.dataSource.paginator = this.paginator;
    }

    applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    getAllUsers() {
      let url = BASE_URL + 'Index'
      this._http.get<any>(url)
          .subscribe(result => {
              this._UserArray = result.users;
              this.ELEMENT_DATA = []
              for (var i=0; i < this._UserArray.length; i++){
                this.ELEMENT_DATA.push(this._UserArray[i])
              }
              this.dataSource.data = []
              this.dataSource.data = this.ELEMENT_DATA
          },
          error =>{
              this._errorMessage = error;
          })
    }

    public redirectToUpdate = (id: string) => {
    
    }
  
    public redirectToDelete = (email: string) => {
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }), 
        "body": { email:email}
      };
      let url = BASE_URL + "Delete"
  
      this.http.delete(url, httpOptions) 
                .subscribe(
                  (data) => {
                      this._errorMessage = data["errorMessage"];
                      this.getAllUsers(); 
                  },
                  error  => {
                      this._errorMessage = error; 
                  });
    }

    showContentIfLoggedIn() {
      if(sessionStorage.getItem('auth_token')!=null) {
          this.token   = sessionStorage.getItem('auth_token');
          this._user   = JSON.parse(sessionStorage.getItem('user'))
          this.getSecureData();
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
            alert("You are not authorized to exeucute this acction")
            window.location.href = '../login';
        }   
    }
    
}
export interface PeriodicElement {
}
