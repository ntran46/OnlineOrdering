import { BrowserModule }    from '@angular/platform-browser';
import { NgModule }         from '@angular/core';
import { RouterModule, Routes } from  '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule }  from '@angular/common/http';

import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MyMaterialModule }       from  './material.module';

import { AppComponent }   from './app.component';
import { MainComponent }  from './Main/app.main'
import { LoginComponent } from './login/login.component';
import { ErrorComponent } from './error.component'
import { FormsModule }    from '@angular/forms';
import { UserRegisterComponent }   from './register/UserRegister.component';
import { MyAccountComponent }      from './User/MyAccount.component';
import { userManagementComponent } from './administration/userManagement.component';
import { RestaurantRegisterComponent }   from './register/RestaurantRegister.component';
import { RestaurantManagementComponent } from './administration/restaurantManagement.component';
import { WaitingListComponent }    from './administration/Waiting.component';
import { ReviewComponent}          from './Review/review.component'
import { WriteReviewComponent}     from './Review/writeReviews.component'
import { MenuComponent }           from './Order/Menu.component';

import { ViewOrderComponent }     from './Order/viewOrder.component'
import { PlaceOrderComponent }    from './Order/placeOrder.component'
import { AddMenuItemComponent }   from './RestaurantOwner/addMenuItem.component'

import { ReactiveFormsModule} from '@angular/forms';
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

const  appRoutes:  Routes  = [
  {path: 'login', component:  LoginComponent},
  {path: 'Main', component:  MainComponent},
  {path: 'UserRegister', component: UserRegisterComponent},
  {path: 'MyAccount', component: MyAccountComponent},
  {path: 'RestaurantRegister', component: RestaurantRegisterComponent},
  {path: 'UserManagement', component: userManagementComponent},

  {path: 'RestaurantList', component: MainComponent},
  {path: 'RestaurantManagement', component: RestaurantManagementComponent},
  {path: 'WaitingList', component:WaitingListComponent},

  {path: 'WriteReviews', redirectTo: 'WriteReviews/',pathMatch: 'full',},
  {path: 'WriteReviews', children: [{path: ':id', component: WriteReviewComponent},
                                    {path: ':id/:edit',component: WriteReviewComponent}]},
  {path: 'ViewReview', redirectTo: 'ViewReview/',pathMatch: 'full',},
  {path: 'ViewReview', children: [{path: ':id', component: ReviewComponent,},]},

  {path: 'ViewOrder', component: ViewOrderComponent},
  {path: 'PlaceOrder', component: PlaceOrderComponent},
  {path: 'MyMenu', component: AddMenuItemComponent},
  
  {path: 'Menu', redirectTo: 'Menu/',pathMatch: 'full',},
  {path: 'Menu', children: [{path: ':id', component: MenuComponent,},]},


  {path:  '', redirectTo:  '/Main', pathMatch:  'full'},
  // {path: '**', component: MainComponent}
];

@NgModule({
  declarations: [
    AppComponent,MainComponent,MyAccountComponent,RestaurantManagementComponent,ReviewComponent,WriteReviewComponent,
    LoginComponent, ErrorComponent, UserRegisterComponent, userManagementComponent,RestaurantRegisterComponent,
    WaitingListComponent,AddMenuItemComponent,ViewOrderComponent, PlaceOrderComponent,MenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,BrowserAnimationsModule,MyMaterialModule,FormsModule,HttpClientModule,
    RouterModule.forRoot(
      appRoutes,
    )
    
  ],
  entryComponents: [ErrorComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
