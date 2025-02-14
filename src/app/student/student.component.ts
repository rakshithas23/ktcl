import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css'],
})
export class StudentComponent implements OnInit {
  api: any = sessionStorage.getItem('api');
  user_id: any = sessionStorage.getItem('user_id');
  imageBase64Data: string | null = null;
  buttonDisable: boolean = false;
  studentForm: FormGroup;
  minDate: string;
  defaultDob: string;
  dob: boolean = false;
  fileErrors: { [key: string]: string } = {};
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private location: Location
  ) {
    this.minDate = this.calculateMinDate();
    this.defaultDob = this.calculateDefaultDate();

    this.studentForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('[A-Za-z ]+')]],
      fatherName: ['', [Validators.required, Validators.pattern('[A-Za-z ]+')]],
      aadharNo: [
        '',
        [Validators.required, Validators.pattern('^[2-9]{1}[0-9]{11}$')],
      ],
      mobile: ['', [Validators.required]],
      dob: ['', [Validators.required, this.dateValidator.bind(this)]],
      age: ['', Validators.required],
      gender: ['', Validators.required],
      address: ['', Validators.required],
      state: ['Goa', Validators.required],
      city: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^\\d{6}$')]],
      email: ['', [Validators.email]],
      institution_type: ['', Validators.required],
      inst_address: ['', Validators.required],
      // address_proof_type: ['', Validators.required],
      proofAddress: ['', Validators.required],
      proofAge: ['', Validators.required],
      photoBase64: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.router.url === '/student') {
          this.location.replaceState('/student');
        }
      }
    });
  }
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
          this.studentForm.get(fieldName)?.setErrors({ invalidSize: true });
          alert('File size must not exceed 1 MB.');
          return;
        } else {
          this.fileErrors = { ...this.fileErrors, [fieldName]: '' };
          this.studentForm.get(fieldName)?.setErrors(null);

          // Convert the image to Base64
          const base64Image = await this.convertToBase64(resizedFile);

          // If the field is 'photo', remove any existing fake path
          if (fieldName === 'photo') {
            // Set the Base64 string to the form control
            this.studentForm.get(fieldName)?.setValue(base64Image);
          } else {
            // Handle other fields normally
            this.studentForm.get(fieldName)?.setValue(base64Image);
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

  // onFileSelected(event: any) {
  //   const fileInput = event.target;

  //   const file: File = event.target.files[0];
  //   if (file) {
  //     const maxSizeInMB = 1;
  //     const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  //     if (file.size > maxSizeInBytes) {
  //       alert('The file size exceeds 1 MB. Please Upload a smaller file.');
  //       fileInput.value = ''; // Clear the file input
  //       this.studentForm.get('photoBase64')?.setValue('');
  //       return;
  //     }

  //     this.photo(file)
  //       .then((base64: string) => {
  //         // Do something with the base64 string, e.g., set it in a form control or send it to the backend
  //         const mimeType = file.type || 'image/png'; // Default to 'image/png' if type is unavailable
  //         // Prepend the MIME type and encoding information
  //         const base64WithPrefix = `data:${mimeType};base64,${base64}`;
  //         console.log(base64WithPrefix);
  //         this.studentForm.get('photoBase64')?.setValue(base64WithPrefix);
  //       })
  //       .catch((error) => {
  //         console.error('Error converting file to Base64:', error);
  //         this.fileErrors['photo'] = 'Failed to convert the image to Base64.';
  //       });
  //   }
  // }

  onFileSelected(event: any) {
    const fileInput = event.target;
    const file: File = event.target.files[0];

    if (file) {
      const maxSizeInMB = 1;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (file.size > maxSizeInBytes) {
        this.resizephotoImage(file, maxSizeInBytes)
          .then((resizedFile) => {
            return this.photo(resizedFile);
          })
          .then((base64: string) => {
            const mimeType = file.type || 'image/png';
            const base64WithPrefix = `data:${mimeType};base64,${base64}`;
            console.log(base64WithPrefix);
            this.studentForm.get('photoBase64')?.setValue(base64WithPrefix);
          })
          .catch((error) => {
            console.error('Error processing file:', error);
            alert('Failed to process the image. Please try again.');
            fileInput.value = ''; // Clear the file input
            this.studentForm.get('photoBase64')?.setValue('');
          });
      } else {
        this.photo(file)
          .then((base64: string) => {
            const mimeType = file.type || 'image/png';
            const base64WithPrefix = `data:${mimeType};base64,${base64}`;
            console.log(base64WithPrefix);
            this.studentForm.get('photoBase64')?.setValue(base64WithPrefix);
          })
          .catch((error) => {
            console.error('Error converting file to Base64:', error);
            this.fileErrors['photo'] = 'Failed to convert the image to Base64.';
            fileInput.value = ''; // Clear the file input
            this.studentForm.get('photoBase64')?.setValue('');
          });
      }
    }
  }

  resizephotoImage(file: File, maxSizeInBytes: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate the new dimensions while maintaining the aspect ratio
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob && blob.size <= maxSizeInBytes) {
              resolve(new File([blob], file.name, { type: file.type }));
            } else {
              reject(new Error('Failed to resize the image.'));
            }
          }, file.type);
        };
        img.onerror = () => reject(new Error('Failed to load the image.'));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read the file.'));
      reader.readAsDataURL(file);
    });
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
    const aadharegex = /^[2-9]{1}[0-9]{11}$/;
    const phoneregex = /^[6-9]\d{9}$/;
    const addressregex = /^[a-zA-Z0-9\s,.'-]{3,}$/;
    const pincoderegex = /^\d{6}$/;
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
    } else if (this.studentForm.value.age < 5) {
      alert('Date of Birth has to be minimum 5 years.');
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
    if (this.studentForm.value.state === '') {
      alert('Please Select State');
      return;
    }
    if (this.studentForm.value.city === '') {
      alert('Please Enter City');
      return;
    } else if (!nameregex.test(this.studentForm.value.city)) {
      alert('Please Enter a valid city.');
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
    // if (this.studentForm.value.email === '') {
    //   alert('Please Enter Email Address');
    //   return;
    // }
    if (this.studentForm.value.email !== '') {
      if (!emailregex.test(this.studentForm.value.email)) {
        alert('Please Enter a valid Email Address');
        return;
      }
    }

    if (this.studentForm.value.institution_type === '') {
      alert('Please Select Institution Type');
      return;
    }
    if (this.studentForm.value.inst_address === '') {
      alert('Please Enter Institution Name');
      return;
    } else if (!addressregex.test(this.studentForm.value.inst_address)) {
      alert('Please Enter a valid Institution Name');
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
    if (this.studentForm.value.photoBase64 === '') {
      alert('Please Upload Photograph');
      return;
    }
    if (Object.values(this.fileErrors).some((error) => error)) {
      alert('Document Uploaded should be of maximum size 1 MB');
      return;
    }
    const data = {
      name: this.studentForm.value.name,
      user_type: '1',
      fatherName: this.studentForm.value.fatherName,
      aadharNo: this.studentForm.value.aadharNo.toString(),
      mobile: this.studentForm.value.mobile.toString(),
      dob: this.studentForm.value.dob,
      age: this.studentForm.value.age.toString(),
      gender: this.studentForm.value.gender,
      address: this.studentForm.value.address,
      state: this.studentForm.value.state,
      city: this.studentForm.value.city,
      pincode: this.studentForm.value.pincode.toString(),
      email: this.studentForm.value.email,
      institution_type: this.studentForm.value.institution_type,
      inst_name: this.studentForm.value.inst_address,
      photo: this.studentForm.value.photoBase64,
      proofAddressType: this.studentForm.value.address_proof_type,
      proofAddress: this.studentForm.value.proofAddress,
      proofAge: this.studentForm.value.proofAge,
      user_id: this.user_id,
    };
    console.log('data', data);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const options = {
      headers: headers,
    };
    this.buttonDisable = true;
    this.http.post(this.api + '/add_student_details', data, options).subscribe(
      (result: any) => {
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

          const app_number = res.message;

          // this.router.navigate(['/success'], {
          //   queryParams: { application_number: app_number },
          // });
          this.buttonDisable = false;
          this.router.navigate(['/success'], {
            queryParams: { application_number: res.message },
          });
        } else {
          alert('Failed to Submit,' + res.message);
          this.buttonDisable = false;
          console.log('error');
        }
      },
      (error: any) => {
        this.buttonDisable = false;
        alert('Failed to submit data' + JSON.stringify(error));
      }
    );
  }

  validateAadhaar(aadhaarNumber: string): boolean {
    const d = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
      [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
      [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
      [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
      [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
      [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
      [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
      [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
      [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    ];
    const p = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
      [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
      [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
      [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
      [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
      [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
      [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
    ];
    const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

    if (aadhaarNumber.length !== 12) return false;
    if (!/^\d{12}$/.test(aadhaarNumber)) return false;
    if (/^(.)\1+$/.test(aadhaarNumber)) return false;

    let c = 0;
    const aadhaarArray = aadhaarNumber.split('').reverse().map(Number);

    for (let i = 0; i < aadhaarArray.length; i++) {
      c = d[c][p[i % 8][aadhaarArray[i]]];
    }

    return c === 0;
  }

  aadhaarValidator(control: AbstractControl): ValidationErrors | null {
    const aadhaarNumber = control.value;
    if (aadhaarNumber && !this.validateAadhaar(aadhaarNumber)) {
      return { invalidAadhaar: true };
    }
    return null;
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
        this.studentForm.get('age')?.setValue(age);
      }
    }
  }
}
