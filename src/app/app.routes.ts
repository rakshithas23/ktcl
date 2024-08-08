// app.routes.ts

import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { StudentComponent } from './student/student.component';
import { SeniorCitizenComponent } from './senior-citizen/senior-citizen.component';
import { GeneralComponent } from './general/general.component';
import { SuccessComponent } from './success/success.component';
import { LogoutComponent } from './logout/logout.component';
import { paymentComponent } from './payment/payment.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'student', component: StudentComponent },
  { path: 'senior-citizen', component: SeniorCitizenComponent },
  { path: 'general', component: GeneralComponent },
  { path: 'success', component: SuccessComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'payment', component: paymentComponent },
  { path: '**', redirectTo: '/login' },
];
