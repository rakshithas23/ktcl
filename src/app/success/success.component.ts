import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent implements OnInit {
  ngOnInit(): void {
      
  }
  mobile:string = "";
  password:any;
  // api:string="http://103.148.157.47:8081";
//   api:string="https://atte.stepnstones.in" 
  // api:string="http://localhost:8081"
  submitted = false; 
  // private cookieValue:string;

  spinnerCheck:boolean = false;
  showError:boolean = false;
  errorMsg:string = "";
  
  

  

}
