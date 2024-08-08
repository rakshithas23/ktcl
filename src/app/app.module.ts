// app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { StudentComponent } from './student/student.component';
import { SeniorCitizenComponent } from './senior-citizen/senior-citizen.component';
import { GeneralComponent } from './general/general.component';
import { routes } from './app.routes';
import {navbarComponent} from './navbar/navbar.component';
import {FooterComponent} from './footer/footer.component';
import {SuccessComponent} from './success/success.component';
import { LogoutComponent } from './logout/logout.component';
import {paymentComponent} from './payment/payment.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    StudentComponent,
    SeniorCitizenComponent,
    GeneralComponent,
    navbarComponent,
    FooterComponent,
    SuccessComponent,
    LogoutComponent,
    paymentComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
