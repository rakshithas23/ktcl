import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css'],
})
export class SuccessComponent implements OnInit {
  successForm: FormGroup;
  applicationNumber: any;
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.applicationNumber = params['application_number'];
    });
    this.successForm.patchValue({ applicationNumber: this.applicationNumber });

  }

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.successForm = this.fb.group({
      applicationNumber: [''],
    });
  }
}
