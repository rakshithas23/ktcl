import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private cookieService:CookieService,private http:HttpClient ,private router: Router) { }

  ngOnInit(): void {
    sessionStorage.clear();
    this.cookieService.deleteAll();
    this.router.navigate(['/Login']);
  }

}
