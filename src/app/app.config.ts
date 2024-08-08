// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { HttpClientModule } from '@angular/common/http';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { RouterModule } from '@angular/router';

// import { LoginComponent } from '../app/login/login.component';
// import { routes } from './app.routes';

// @NgModule({
//   declarations: [
//     LoginComponent,
//   ],
//   imports: [
//     BrowserModule,
//     HttpClientModule,
//     FormsModule,
//     ReactiveFormsModule,
//     RouterModule.forRoot(routes),
//   ],
//   providers: []
// })
// export class AppModule { }
// app.config.ts

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
  ],
};
