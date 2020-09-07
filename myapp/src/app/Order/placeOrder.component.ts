import { Component } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'


const BASE_URL ="http://localhost:1337/Product/";

@Component({

    templateUrl:'./placeOrder.component.html',
    styleUrls: ['../app.component.css']
})

export class PlaceOrderComponent {
  orderAmount  = [];
  day_submit   :string;
  _orderHistory:Array<any>;
  _subTotal    : number=0.00;
  _tax         : number=0.0;
  _total       : number=0.0;
  _serverName  :string;
  _productsArray: Array<any>;
  _http        :HttpClient;
  _id          :number;
  _price       :number;
  _productName :string;
  _errorMessage:string = "";


  constructor(private http: HttpClient) {
      this._http = http;
      this.getAllProducts();
  }

  //Load init value to avoid displaying validation message
  ngOnInit() {
    this._serverName = "John Smith";
  }

  //Increase number of an item's value
  incrementValue(id, price) {
    var value = parseInt(document.getElementById(id).innerHTML, 10);
    value++;
    document.getElementById(id).innerHTML = value.toString();
    this.changeAmount(id, price, value);
  }

  //Decrease number of an item's value
  decrementValue(id, price){
    var value = parseInt(document.getElementById(id).innerHTML, 10);
    if (value>0){
      value--;
    }else{
      value == 0;
    }
    document.getElementById(id).innerHTML = value.toString();
    this.changeAmount(id, price, value);
  }

  //Update the record of current order information
  //and calculate the total price
  changeAmount(id, price, value){
    let flag = true; 
    price = parseFloat(price)
    var temp = {'id': id, 'price':price, 'amount': value}


    if (this.orderAmount.length == 0){
      this.orderAmount.push(temp);
    } else{
      for (var i =0; i < this.orderAmount.length; i++){
        if (this.orderAmount[i].id == id){
          this.orderAmount[i].amount = value;
          flag = true;
          break;
        }else{ 
          flag = false;
        }
      }
    }
    if (!flag){
      this.orderAmount.push(temp)
    }
    this.caculateTotal();
  }

  //Calculate total price for current order
  caculateTotal(){
    this._subTotal = 0.0
    for(var i = 0; i < this.orderAmount.length; i++){
      this._subTotal = this._subTotal + (this.orderAmount[i].price * this.orderAmount[i].amount);
    }
    this._tax = (this._subTotal * 7/100)
    this._total = this._tax + this._subTotal;
  }

  //Apply discount to the order if Discount button is checked
  applyDiscount() {
    var checkBox = document.getElementById("discount") as HTMLInputElement;
    var dis_cal_table = document.getElementById("dis_cal_tb");
    if (checkBox.checked == true){
      dis_cal_table.style.visibility = "visible";
    } else{
      dis_cal_table.style.visibility = "hidden";
    }
  }

  //Clear every varaible's value once Clear button is clicked
  clearOrder(){
    this.ngOnInit()
    this.getAllProducts();
    this.orderAmount=[];
    this.caculateTotal()
  }

  //Get current date format to save to the database
  getCurrentDate(){
    let currentDate = new Date();
    let day         = currentDate.getDate();
    let month       = currentDate.getMonth();
    let year        = currentDate.getFullYear();
    let hour        = currentDate.getHours();
    let minute      = currentDate.getMinutes();

    if (hour > 12){
      var time_string = (hour -12).toString() + ":" + minute.toString() + " PM"
    } else{
      time_string = hour.toString() + ":" + minute.toString() + " AM"
    }

    var MON =["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    if (day < 10) {
      var day_string = '0' + day.toString();
      var formatted_date = year.toString() + " " + MON[month] + " " + day_string + ", " + time_string;
    } else{
      formatted_date = year.toString() + " " + MON[month] + " " + day.toString() + ", " + time_string;
    }

    return formatted_date;
  }
  
  //Submit date to database once Submit button is clicked
  submitOrder(serverName){
    let total = 0;
    console.log(serverName)
    const url = "http://localhost:1337/Orders/" + "Index"
    var checkBox = document.getElementById("discount") as HTMLInputElement;
    if (checkBox.checked == true){
      total = (this._subTotal * 0.85)*0.07 + this._subTotal;
    }else{
      total = this._total;
    }
    this.day_submit = this.getCurrentDate();

    this._http.get<any>(url)
        .subscribe(result => {
          this._orderHistory = result.orderHistory
           var id = this._orderHistory.length + 1;
           this.createRecord(id, serverName, total);
           this.getAllProducts();
           this.clearOrder()
        })
  }

  //Get all items in the foodItem table
  getAllProducts() {
    let url = BASE_URL + 'Index'
    this._http.get<any>(url)
        // Get data and wait for result.
        .subscribe(result => {
            this._productsArray = result.products;
        }, 

        error =>{
          // Let user know about the error.
            this._errorMessage = error;
        })
  }

  //Save the order information to the database
  createRecord(id, serverName, total) {
    console.log(this.day_submit)
    this.http.post("http://localhost:1337/Orders/" + "AddOrder",
        {
            _id        :   id,
            orderDate  :   this.day_submit,
            serverName :   serverName,
            total      :   total
        })
        .subscribe(
            (data) => {
                console.log("POST call successful. Inspect response.", 
                            JSON.stringify(data));
                this._errorMessage = data["errorMessage"];
                this.getAllProducts();  
            },
            error => {
                this._errorMessage = error;                
            });
      }
}