import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.css'],
})
export class GeneralComponent implements OnInit {
  api: any = sessionStorage.getItem('api');
  user_id: any = sessionStorage.getItem('user_id');

  generalForm: FormGroup;
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

    this.generalForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('[A-Za-z ]+')]],
      fatherName: ['', [Validators.required, Validators.pattern('[A-Za-z ]+')]],
      aadharNo: ['', [Validators.required, Validators.pattern('^[2-9]{1}[0-9]{3}\\s[0-9]{4}\\s[0-9]{4}$')]],
      mobile: ['', [Validators.required, Validators.pattern('^[6-9]\d{9}$')]],
      dob: ['', [Validators.required, this.dateValidator.bind(this)]],
      age: ['', Validators.required],
      gender: ['', Validators.required],
      address: ['', Validators.required],
      state: ['Goa', Validators.required],
      city: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^403\\d{3}$')]],
      email: ['', [Validators.email]],
      // address_proof_type: ['', [Validators.required]],
      proofAddress: ['', Validators.required],
      photoBase64: ['', Validators.required],
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
          this.fileErrors = {
            ...this.fileErrors,
            [fieldName]: 'File size must not exceed 1 MB.',
          };
          this.generalForm.get(fieldName)?.setErrors({ invalidSize: true });
          alert("File size must not exceed 1 MB.");
          return;
        } else {
          this.fileErrors = { ...this.fileErrors, [fieldName]: '' };
          this.generalForm.get(fieldName)?.setErrors(null);

          // Convert the image to Base64
          const base64Image = await this.convertToBase64(resizedFile);

          // If the field is 'photo', remove any existing fake path
          if (fieldName === 'photo') {
            // Set the Base64 string to the form control
            this.generalForm.get(fieldName)?.setValue(base64Image);
          } else {
            // Handle other fields normally
            this.generalForm.get(fieldName)?.setValue(base64Image);
          }

          console.log(`${fieldName} Base64 Image:`, base64Image);
        }
      } catch (error) {
        console.error('Error processing image:', error);
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

  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  onFileSelected(event: any) {
    const fileInput = event.target;
    console.log("fileInput",fileInput)

    const file: File = event.target.files[0];
    if (file) {
      const maxSizeInMB = 1;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  
      if (file.size > maxSizeInBytes) {
        alert('The file size exceeds 1 MB. Please Upload a smaller file.');
        fileInput.value = ''; // Clear the file input
        this.generalForm.get('photoBase64')?.setValue('');
        return;
      }
  
      this.photo(file)
        .then((base64: string) => {
          // Do something with the base64 string, e.g., set it in a form control or send it to the backend
          const mimeType = file.type || 'image/png'; // Default to 'image/png' if type is unavailable
          // Prepend the MIME type and encoding information
          const base64WithPrefix = `data:${mimeType};base64,${base64}`;
          // console.log(base64WithPrefix);
          this.generalForm.get('photoBase64')?.setValue(base64WithPrefix);
          console.log(this.generalForm.value.photoBase64);
        })
        .catch((error) => {
          console.error('Error converting file to Base64:', error);
          this.fileErrors['photo'] = 'Failed to convert the image to Base64.';
        });
    }
  }

  photo(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
  onSubmit(): void {
    const nameregex = /^[A-Za-zÀ-ÖØ-ÿ' -]{3,50}$/;
    const aadharegex = /^[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}$/;    
    const phoneregex = /^[6-9]\d{9}$/;
    const addressregex = /^[a-zA-Z0-9\s,.'-]{3,}$/;
    const pincoderegex = /^403\d{3}$/;
    const emailregex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (this.generalForm.value.name === '') {
      alert('Please Enter Name');
      return;
    } else if (!nameregex.test(this.generalForm.value.name)) {
      alert('Please Enter a valid Name.');
      return;
    }
    if (this.generalForm.value.fatherName === '') {
      alert("Please Enter Father's Name");
      return;
    } else if (!nameregex.test(this.generalForm.value.fatherName)) {
      alert("Please Enter a valid Father's Name.");
      return;
    }
    if (this.generalForm.value.aadharNo === '') {
      alert('Please Enter Your Aadhar Number.');
      return;
    } else if (!aadharegex.test(this.generalForm.value.aadharNo)) {
      alert('Please Enter a valid Aadhar Number, should contain 12 Digits.');
      return;
    }
    if (this.generalForm.value.mobile === '') {
      alert('Please Enter Your Mobile Number.');
      return;
    } else if (!phoneregex.test(this.generalForm.value.mobile)) {
      alert('Please Enter a valid Mobile Number, should contain 10 Digits.');
      return;
    }
    if (this.generalForm.value.dob === '') {
      alert('Please Enter Date of Birth');
      return;
    } else if (this.generalForm.value.age < 5) {
      alert('Date of Birth has to be minimum 5 years.');
      return;
    }
    if (this.generalForm.value.gender === '') {
      alert('Please Select Gender');
      return;
    }
    if (this.generalForm.value.address === '') {
      alert('Please Enter Address');
      return;
    }
    if (!addressregex.test(this.generalForm.value.address)) {
      alert('Please Enter a valid Address');
      return;
    }
    if (this.generalForm.value.pincode === '') {
      alert('Please Enter Pincode');
      return;
    }
    if (!pincoderegex.test(this.generalForm.value.pincode)) {
      alert('Please Enter a valid Pincode');
      return;
    }
    if (this.generalForm.value.email === '') {
      alert('Please Enter Email Address');
      return;
    }
    if (!emailregex.test(this.generalForm.value.email)) {
      alert('Please Enter a valid Email Address');
      return;
    }

    // if (this.generalForm.value.address_proof_type === '') {
    //   alert('Please Select Address Proof Type');
    //   return;
    // }

    if (this.generalForm.value.proofAddress === '') {
      alert('Please Upload Address proof document');
      return;
    }

    if (this.generalForm.value.photoBase64 === '') {
      alert('Please Upload Photograph');
      return;
    }
    if (Object.values(this.fileErrors).some((error) => error)) {
      alert('Document Uploaded should be of maximum size 1 MB');
      return;
    }
    const data = {
      name: this.generalForm.value.name,
      user_type: '3',
      fatherName: this.generalForm.value.fatherName,
      aadharNo: this.generalForm.value.aadharNo,
      mobile: this.generalForm.value.mobile,
      dob: this.generalForm.value.dob,
      age: this.generalForm.value.age.toString(),
      gender: this.generalForm.value.gender,
      address: this.generalForm.value.address,
      state: this.generalForm.value.state,
      city: this.generalForm.value.city,
      pincode: this.generalForm.value.pincode,
      email: this.generalForm.value.email,
      proofAddressType: this.generalForm.value.address_proof_type,
      proofAddress: this.generalForm.value.proofAddress,
      photo: this.generalForm.value.photoBase64,
      user_id: this.user_id,
    };

    console.log('data', data);

    this.http
      .post(this.api + '/add_gen_details', data)
      .subscribe((result: any) => {
        let obj = JSON.stringify(result);
        interface Obj {
          insertId: any;
          status: any;
          message: string;
          application_number: any;
        }
        let res: Obj = JSON.parse(obj);
        if (res.status === 'success') {
          alert('Details Submitted Successfully!');
          this.router.navigate(['/payment'], {
            queryParams: { application_number: res.application_number },
          });
        } else {
          alert('Failed to Submit,' + res.message);
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
    const dob = this.generalForm.get('dob')?.value;
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
        this.generalForm.get('age')?.setValue(age);
      }
    }
  }
}
