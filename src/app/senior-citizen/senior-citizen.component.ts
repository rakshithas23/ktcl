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
  selector: 'app-senior-citizen',
  templateUrl: './senior-citizen.component.html',
  styleUrls: ['./senior-citizen.component.css'],
})
export class SeniorCitizenComponent implements OnInit {
  api: any = sessionStorage.getItem('api');
  user_id: any = sessionStorage.getItem('user_id');
  imageBase64Data: string | null = null;

  seniorcitizenForm: FormGroup;
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

    this.seniorcitizenForm = this.fb.group({
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
      pincode: ['', [Validators.required, Validators.pattern('^\d{6}$')]],
      email: ['', [Validators.email]],
      // address_proof_type: ['',[Validators.required]],
      proofAddress: ['', Validators.required],
      proofAge: ['', Validators.required],
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
          this.seniorcitizenForm
            .get(fieldName)
            ?.setErrors({ invalidSize: true });
          alert('File size must not exceed 1 MB.');
          return;
        } else {
          this.fileErrors = { ...this.fileErrors, [fieldName]: '' };
          this.seniorcitizenForm.get(fieldName)?.setErrors(null);

          // Convert the image to Base64
          const base64Image = await this.convertToBase64(resizedFile);

          // If the field is 'photo', remove any existing fake path
          if (fieldName === 'photo') {
            // Set the Base64 string to the form control
            this.seniorcitizenForm.get(fieldName)?.setValue(base64Image);
          } else {
            // Handle other fields normally
            this.seniorcitizenForm.get(fieldName)?.setValue(base64Image);
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
  //       this.seniorcitizenForm.get('photoBase64')?.setValue('');
  //       return;
  //     }
  //     this.photo(file)
  //       .then((base64: string) => {
  //         // Do something with the base64 string, e.g., set it in a form control or send it to the backend
  //         const mimeType = file.type || 'image/png'; // Default to 'image/png' if type is unavailable
  //         // Prepend the MIME type and encoding information
  //         const base64WithPrefix = `data:${mimeType};base64,${base64}`;
  //         console.log(base64WithPrefix);
  //         this.seniorcitizenForm.get('photoBase64')?.setValue(base64WithPrefix);
  //       })
  //       .catch((error) => {
  //         console.error('Error converting file to Base64:', error);
  //         this.fileErrors['photo'] = 'Failed to convert the image to Base64.';
  //       });
  //   }
  // }

  // photo(file: File): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       const base64String = (reader.result as string).split(',')[1];
  //       resolve(base64String);
  //     };
  //     reader.onerror = (error) => reject(error);
  //     reader.readAsDataURL(file);
  //   });
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
            this.seniorcitizenForm
              .get('photoBase64')
              ?.setValue(base64WithPrefix);
          })
          .catch((error) => {
            console.error('Error processing file:', error);
            alert('Failed to process the image. Please try again.');
            fileInput.value = ''; // Clear the file input
            this.seniorcitizenForm.get('photoBase64')?.setValue('');
          });
      } else {
        this.photo(file)
          .then((base64: string) => {
            const mimeType = file.type || 'image/png';
            const base64WithPrefix = `data:${mimeType};base64,${base64}`;
            console.log(base64WithPrefix);
            this.seniorcitizenForm
              .get('photoBase64')
              ?.setValue(base64WithPrefix);
          })
          .catch((error) => {
            console.error('Error converting file to Base64:', error);
            this.fileErrors['photo'] = 'Failed to convert the image to Base64.';
            fileInput.value = ''; // Clear the file input
            this.seniorcitizenForm.get('photoBase64')?.setValue('');
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
    // this.router.navigate(['/payment']);
    const nameregex = /^[A-Za-zÀ-ÖØ-ÿ' -]{3,50}$/;
    const aadharegex = /^[2-9]{1}[0-9]{11}$/;
    const phoneregex = /^[6-9]\d{9}$/;
    const addressregex = /^[a-zA-Z0-9\s,.'-]{3,}$/;
    const pincoderegex = /^\d{6}$/;
    const emailregex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (this.seniorcitizenForm.value.name === '') {
      alert('Please Enter Name');
      return;
    } else if (!nameregex.test(this.seniorcitizenForm.value.name)) {
      alert('Please Enter a valid Name.');
      return;
    }
    if (this.seniorcitizenForm.value.fatherName === '') {
      alert("Please Enter Father's Name");
      return;
    } else if (!nameregex.test(this.seniorcitizenForm.value.fatherName)) {
      alert("Please Enter a valid Father's Name.");
      return;
    }
    if (this.seniorcitizenForm.value.aadharNo === '') {
      alert('Please Enter Your Aadhar Number.');
      return;
    } else if (!aadharegex.test(this.seniorcitizenForm.value.aadharNo)) {
      alert('Please Enter a valid Aadhar Number, should contain 12 Digits.');
      return;
    }
    if (this.seniorcitizenForm.value.mobile === '') {
      alert('Please Enter Your Mobile Number.');
      return;
    } else if (!phoneregex.test(this.seniorcitizenForm.value.mobile)) {
      alert('Please Enter a valid Mobile Number, should contain 10 Digits.');
      return;
    }
    if (this.seniorcitizenForm.value.dob === '') {
      alert('Please Enter Date of Birth');
      return;
    } else if (this.seniorcitizenForm.value.age < 60) {
      alert('Date of Birth has to be atleast 60 years.');
      return;
    }
    if (this.seniorcitizenForm.value.gender === '') {
      alert('Please Select Gender');
      return;
    }
    if (this.seniorcitizenForm.value.address === '') {
      alert('Please Enter Address');
      return;
    }
    if (!addressregex.test(this.seniorcitizenForm.value.address)) {
      alert('Please Enter a valid Address');
      return;
    }
    if (this.seniorcitizenForm.value.state === '') {
      alert('Please Select State');
      return;
    }
    if (this.seniorcitizenForm.value.city === '') {
      alert('Please Enter City');
      return;
    }
    else if (!nameregex.test(this.seniorcitizenForm.value.city)) {
      alert('Please Enter a valid city.');
      return;
    }
    if (this.seniorcitizenForm.value.pincode === '') {
      alert('Please Enter Pincode');
      return;
    }
    if (!pincoderegex.test(this.seniorcitizenForm.value.pincode)) {
      alert('Please Enter a valid Pincode');
      return;
    }
    if (this.seniorcitizenForm.value.email === '') {
      alert('Please Enter Email Address');
      return;
    }
    if (!emailregex.test(this.seniorcitizenForm.value.email)) {
      alert('Please Enter a valid Email Address');
      return;
    }

    // if (this.seniorcitizenForm.value.address_proof_type === '') {
    //   alert('Please Select Address proof type');
    //   return;
    // }

    if (this.seniorcitizenForm.value.proofAddress === '') {
      alert('Please Upload Address proof document');
      return;
    }
    if (this.seniorcitizenForm.value.proofAge === '') {
      alert('Please Upload Age Proof Document');
      return;
    }
    if (this.seniorcitizenForm.value.photoBase64 === '') {
      alert('Please Upload Photograph');
      return;
    }
    if (Object.values(this.fileErrors).some((error) => error)) {
      alert('Document Uploaded should be of maximum size 1 MB');
      return;
    }
    const data = {
      name: this.seniorcitizenForm.value.name,
      user_type: '2',
      fatherName: this.seniorcitizenForm.value.fatherName,
      aadharNo: this.seniorcitizenForm.value.aadharNo,
      mobile: this.seniorcitizenForm.value.mobile,
      dob: this.seniorcitizenForm.value.dob,
      age: this.seniorcitizenForm.value.age.toString(),
      gender: this.seniorcitizenForm.value.gender,
      address: this.seniorcitizenForm.value.address,
      state: this.seniorcitizenForm.value.state,
      city: this.seniorcitizenForm.value.city,
      pincode: this.seniorcitizenForm.value.pincode,
      email: this.seniorcitizenForm.value.email,
      proofAddressType: this.seniorcitizenForm.value.address_proof_type,
      proofAddress: this.seniorcitizenForm.value.proofAddress,
      proofAge: this.seniorcitizenForm.value.proofAge,
      photo: this.seniorcitizenForm.value.photoBase64,
      user_id: this.user_id,
    };
    console.log('data', data);

    this.http
      .post(this.api + '/add_sc_details', data)
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
          const mobile = this.seniorcitizenForm.value.mobile;
          const app_number = res.message; // Assuming the OTP is the application number, adjust as necessary
          // this.sendSms(mobile, app_number);
          this.router.navigate(['/success'], {
            queryParams: { application_number: res.message },
          });
        } else {
          alert('Failed to Submit,' + res.message);
          console.log('error');
        }
      });
  }

  sendSms(mobile: string, app_number: string): void {
    const username = 'Sathish@Stepnstones.in';
    const password = 'Sns12345';
    const approvedSenderId = 'SNSTPL';
    const message = `Dear Passenger your Application has been submitted successfully. Your Application Number is - ${app_number}. Kindly Click on the below link to make the payment. - STEPNSTONES`;

    const encMsg = encodeURIComponent(message);

    const fullApiUrl = `http://securesmsc.com/httpapi/send?username=${username}&password=${password}&sender_id=${approvedSenderId}&route=T&phonenumber=${mobile}&message=${encMsg}`;

    this.http.post(fullApiUrl, {}).subscribe(
      (response: any) => {
        console.log('SMS sent successfully', response);
      },
      (error: any) => {
        console.error('Failed to send SMS', error);
      }
    );
  }

  calculateMinDate(): string {
    const today = new Date();
    const minDate = new Date(
      today.getFullYear() - 60, // Set to 60 years ago
      today.getMonth(),
      today.getDate()
    );
    return minDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  calculateDefaultDate(): string {
    const today = new Date();
    const defaultDate = new Date(
      today.getFullYear() - 60, // Set default date to 60 years ago
      today.getMonth(),
      today.getDate()
    );
    return defaultDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  dateValidator(control: FormControl) {
    const today = new Date();
    const inputDate = new Date(control.value);
    const minDate = new Date(
      today.getFullYear() - 60, // Minimum age is 60 years
      today.getMonth(),
      today.getDate()
    );
    return inputDate <= minDate ? null : { invalidDate: true };
  }

  calculateAge() {
    const dob = this.seniorcitizenForm.get('dob')?.value;
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
      this.seniorcitizenForm.get('age')?.setValue(age);

      // Check if age is less than 60 and show an alert
      if (age < 60) {
        this.dob = true;
        alert('Age must be minimum 60 years old.');
        return;
      }
    }
  }
}
