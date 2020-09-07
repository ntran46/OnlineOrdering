import { HttpClient, HttpHeaders } from '@angular/common/http';

export class ApiService {
    public site='http://localhost:1337/';
    // Pointer to component using ApiService.
    _that:any; 

    constructor(private http: HttpClient, that) {
        // Pointer to component using ApiService.
        this._that = that; 
    }

    //------------------------------------------------------------
    // Creates request header with Jwt Bearer token.
    //------------------------------------------------------------
    getSecureHeader() {
        let token   = sessionStorage.getItem('auth_token');

        // To access data from the server while authenticated the
        // token must be included in the request.
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 
                              'application/json; charset=utf-8');
        headers = headers.append('Authorization', 'Bearer ' + token);
        return headers;
    }

    //------------------------------------------------------------
    // Implements GET request and sends data back to component 
    // through callback.
    //------------------------------------------------------------
    getData(route, callback) {  
        let url     = this.site + route;
        let headers = this.getSecureHeader();
      
        this.http.get<any>(url, {headers})
            // Get data and wait for result.
            .subscribe(result => {
             //   result.errorMessage = "";
                callback(result, this._that);
            }, 
            error =>{
                callback({errorMessage:JSON.stringify(error)}, 
                          this._that);
            })
    }

    //------------------------------------------------------------
    // Implements POST request and sends data back to component 
    // through callback.
    //------------------------------------------------------------
    postData(route, obj, callback) {
        let headers = this.getSecureHeader();
        // This free online service receives post submissions.
        this.http.post(this.site+route, {obj}, {headers})
        .subscribe(
            // Data is received from the post request.
            (data) => {
                // Inspect the data to know how to parse it.
                console.log("POST call successful. Inspect response.", 
                            JSON.stringify(data));
                data['errorMessage'] = "";
                callback(data, this._that);    
            },
            // An error occurred. Data is not received. 
            error => {
                callback({errorMessage:JSON.stringify(error)}, 
                          this._that)             
            });
    }
}
