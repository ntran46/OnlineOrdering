import { Component }               from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'


const BASE_URL ="http://localhost:1337/Orders/";

@Component({
    templateUrl: './viewOrder.component..html',
    styleUrls: ['../app.component.css']
})

export class ViewOrderComponent {
    _orderHistory:Array<any>;
    _id          :number;
    _total       :number=0.0;
    _serverName  :string;
    _orderDate   :string;
    _http        :HttpClient;
    _errorMessage:string = "";

  constructor(private http:HttpClient) {
    this._http = http;
    this.getAllRecords();
  }

  getAllRecords(){
    const url = BASE_URL + "Index"

    this._http.get<any>(url)
        .subscribe(result => {
          this._orderHistory = result.orderHistory
        },
        error => {
          this._errorMessage = error;
        })
  }
}
