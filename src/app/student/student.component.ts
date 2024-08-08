import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css'],
})
export class StudentComponent implements OnInit {
  api: any = sessionStorage.getItem('api');
  studentForm: FormGroup;
  minDate: string;
  defaultDob: string;
  dob: boolean = false;
  fileErrors: { [key: string]: string } = {};
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.minDate = this.calculateMinDate();
    this.defaultDob = this.calculateDefaultDate();

    this.studentForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('[A-Za-z ]+')]],
      fatherName: ['', [Validators.required, Validators.pattern('[A-Za-z ]+')]],
      aadharNo: ['', [Validators.required, Validators.pattern('\\d{12}')]],
      mobile: ['', [Validators.required, Validators.pattern('\\d{10}')]],
      dob: ['', [Validators.required, this.dateValidator.bind(this)]],
      age: [{ value: '', disabled: true }, Validators.required],
      gender: ['', Validators.required],
      address: ['', Validators.required],
      state: [{ value: 'Goa', disabled: true }, Validators.required],
      city: [{ value: 'Panaji', disabled: true }, Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^403\\d{3}$')]],
      email: ['', [Validators.email]],
      institution_type: ['', Validators.required],
      inst_address: ['', Validators.required],
      proofAddress: [null, Validators.required],
      proofAge: [null, Validators.required],
      photo: [null, Validators.required],
    });
  }

  ngOnInit(): void {}
  async validateFileSize(event: Event, fieldName: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      try {
        const resizedFile = await this.resizeImage(file);
        const fileSizeMB = resizedFile.size / (1024 * 1024); // Convert size to MB

        if (fileSizeMB > 1) {
          this.fileErrors = { ...this.fileErrors, [fieldName]: 'File size must not exceed 1 MB.' };
          this.studentForm.get(fieldName)?.setErrors({ invalidSize: true });
        } else {
          this.fileErrors = { ...this.fileErrors, [fieldName]: '' };
          this.studentForm.get(fieldName)?.setErrors(null);
          // Update the form control with resized image
          this.studentForm.get(fieldName)?.setValue(resizedFile);
        }
      } catch (error) {
        console.error('Error resizing image:', error);
      }
    }
  }
  resizeImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = 1024; // Set max width
          const maxHeight = 1024; // Set max height
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }

          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }));
            } else {
              reject('Failed to convert image to blob');
            }
          }, file.type);
        };
        img.src = event.target.result;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  onSubmit(): void {
    this.router.navigate(['/payment']);
    const nameregex = /^[A-Za-zÀ-ÖØ-ÿ' -]{3,50}$/;
    const aadharegex = /^\d{12}$/;
    const phoneregex = /^[6-9]\d{9}$/;
    const addressregex = /^[a-zA-Z0-9\s,.'-]{3,}$/;
    const pincoderegex = /^403\d{3}$/;
    const emailregex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (this.studentForm.value.name === '') {
      alert('Please Enter Name');
      return;
    } else if (!nameregex.test(this.studentForm.value.name)) {
      alert('Please Enter a valid Name.');
      return;
    }
    if (this.studentForm.value.fatherName === '') {
      alert("Please Enter Father's Name");
      return;
    } else if (!nameregex.test(this.studentForm.value.fatherName)) {
      alert("Please Enter a valid Father's Name.");
      return;
    }
    if (this.studentForm.value.aadharNo === '') {
      alert('Please Enter Your Aadhar Number.');
      return;
    } else if (!aadharegex.test(this.studentForm.value.aadharNo)) {
      alert('Please Enter a valid Aadhar Number, should contain 12 Digits.');
      return;
    }
    if (this.studentForm.value.mobile === '') {
      alert('Please Enter Your Mobile Number.');
      return;
    } else if (!phoneregex.test(this.studentForm.value.mobile)) {
      alert('Please Enter a valid Mobile Number, should contain 10 Digits.');
      return;
    }
    if (this.studentForm.value.dob === '') {
      alert('Please Enter Date of Birth');
      return;
    } else if (this.dob === true) {
      alert('Date of Birth has to be 5 years.');
      return;
    }
    if (this.studentForm.value.gender === '') {
      alert('Please Select Gender');
      return;
    }
    if (this.studentForm.value.address === '') {
      alert('Please Enter Address');
      return;
    }
    if (!addressregex.test(this.studentForm.value.address)) {
      alert('Please Enter a valid Address');
      return;
    }
    if (this.studentForm.value.pincode === '') {
      alert('Please Enter Pincode');
      return;
    }
    if (!pincoderegex.test(this.studentForm.value.pincode)) {
      alert('Please Enter a valid Pincode');
      return;
    }
    if (this.studentForm.value.email === '') {
      alert('Please Enter Email Address');
      return;
    }
    if (!emailregex.test(this.studentForm.value.email)) {
      alert('Please Enter a valid Email Address');
      return;
    }
    if (this.studentForm.value.institution_type === '') {
      alert('Please Select Institution Type');
      return;
    }
    if (this.studentForm.value.inst_address === '') {
      alert('Please Enter Institution Name');
      return;
    }
    
    if (this.studentForm.value.proofAddress === '') {
      alert('Please Upload Address proof document');
      return;
    }
    if (this.studentForm.value.proofAge === '') {
      alert('Please Upload Student ID');
      return;
    }
    if (this.studentForm.value.photo === '') {
      alert('Please Upload Photograph');
      return;
    }
    if(Object.values(this.fileErrors).some(error => error)){
      alert("Document Uploaded should be of maximum size 1 MB");
      return;
    }
    const data = {
      name: this.studentForm.value.name,
      fatherName: this.studentForm.value.fatherName,
      aadharNo: this.studentForm.value.aadharNo,
      mobile: this.studentForm.value.mobile,
      dob: this.studentForm.value.dob,
      age: this.studentForm.value.age,
      gender: this.studentForm.value.gender,
      address: this.studentForm.value.address,
      state: this.studentForm.value.state,
      city: this.studentForm.value.city,
      pincode: this.studentForm.value.pincode,
      email: this.studentForm.value.email,
      institution_type: this.studentForm.value.institution_type,
      inst_address: this.studentForm.value.inst_address,
      proofAddress: this.studentForm.value.proofAddress,
      proofAge: this.studentForm.value.proofAge,
      photo: this.studentForm.value.photo,
    };
    this.router.navigate(['/payment']);
    this.http.post(this.api + '', data).subscribe((result: any) => {
      let obj = JSON.stringify(result);
      interface Obj {
        insertId: any;
        status: number;
        msg: string;
        data: any;
      }
      interface ObjData {
        id: any;
        username: string;
      }
      let res: Obj = JSON.parse(obj);
      if (res.status == 1) {
        alert('Details Submitted Successfully!');
        this.router.navigate(['/payment']);
      } else {
        alert('Failed to Submit, Please Try Again');
        console.log('error');
      }
    });
  }

  calculateMinDate(): string {
    const today = new Date();
    const minDate = new Date(
      today.getFullYear() - 5,
      today.getMonth(),
      today.getDate()
    );
    return minDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  calculateDefaultDate(): string {
    const today = new Date();
    const defaultDate = new Date(
      today.getFullYear() - 5,
      today.getMonth(),
      today.getDate()
    );
    return defaultDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  dateValidator(control: FormControl) {
    const today = new Date();
    const inputDate = new Date(control.value);
    const minDate = new Date(
      today.getFullYear() - 5,
      today.getMonth(),
      today.getDate()
    );
    return inputDate <= minDate ? null : { invalidDate: true };
  }

  calculateAge() {
    const dob = this.studentForm.get('dob')?.value;
    if (dob) {
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      console.log('Age:', age);

      // Update the age in the form control

      // Check if age is less than 5 and show an alert
      if (age < 5) {
        alert('Age must be at least 5 years old.');
        return;
      } else {
        this.studentForm.patchValue({ age: age });
      }
    }
  }
}
