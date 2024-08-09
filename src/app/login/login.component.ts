import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  // api: string = 'https://ktclitms.com/buspass/API/Mob_users';
  api: string = 'https://goa.smarttransit.in/API/Mob_users';
  constructor(
    private fb: FormBuilder,
    private cookieService: CookieService,
    private frmbuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  passwordFieldType: string = 'password'; // Default to password field type

  togglePassword(): void {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  onSubmit(): void {
    if (this.loginForm.value.username === '') {
      alert('Please Enter Username');
      return;
    }
    if (this.loginForm.value.password === '') {
      alert('Please Enter Password');
      return;
    }

    const formData = new FormData();
    formData.append('username', this.loginForm.value.username);
    formData.append('password', this.loginForm.value.password);

    this.http
      .post<any>(this.api + '/authenticate_mob_user', formData)
      .subscribe((result: any) => {
        let obj = JSON.stringify(result);
        interface Obj {
          status: number;
          message: string;
          user_id: any;
        }
        interface ObjData {
          id: any;
          userName: any;
          userRole: any;
          user_ward: any;
        }

        let res: Obj = JSON.parse(obj);
        if (res.status == 1) {
          let dataRes: any = JSON.stringify(res.user_id);
          sessionStorage.setItem('api', this.api);
          sessionStorage.setItem('user_id',res.user_id);

          this.router.navigate(['/home']);
        } else {
          alert('Failed to Login,' +res.message);
        }
      });
  }
}
