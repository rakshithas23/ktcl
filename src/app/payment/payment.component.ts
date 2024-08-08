import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
// import { RazorpayService } from '../razorpay.service';
declare var Razorpay: any;
@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class paymentComponent implements OnInit {
  paymentForm: FormGroup;
  orderId: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
  ) {
    this.paymentForm = this.fb.group({
      cardBalance: [{ value: 150, disabled: true }, Validators.required],
      topupValue: [
        0,
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      totalAmount: [{ value: 150, disabled: true }, Validators.required],
    });
  }

  ngOnInit(): void {
    this.paymentForm.get('topupValue')?.valueChanges.subscribe((value) => {
      this.calculateTotalAmount();
    });

    // Initial calculation
    this.calculateTotalAmount();
  }

  calculateTotalAmount() {
    const cardBalance = this.paymentForm.get('cardBalance')?.value || 0;
    const topupValue = this.paymentForm.get('topupValue')?.value || 0;
    const totalAmount = cardBalance + topupValue;
    this.paymentForm
      .get('totalAmount')
      ?.setValue(totalAmount, { emitEvent: false });
  }

  // proceedToPayment(){
  //   this.router.navigate(['/success'])
  // }
  proceedToPayment() {
    const amount = this.paymentForm.get('totalAmount')?.value;

    const options = {
      key: 'rzp_test_NuPEcIfQTbKcY4', // Enter the Key ID generated from the Dashboard
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      name: 'Kadamba Transport Corporation Limited',
      description: 'Payment for your order',
      handler: (response: any) => {
        console.log('Payment successful', response);
        console.log("response.razorpay_payment_id",response.razorpay_payment_id)
        this.router.navigate(['/success']);
      },
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp1 = new Razorpay(options);
    rzp1.open();
  }
  validateNumber(event: KeyboardEvent) {
    const pattern = /^[0-9]*$/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // Show alert if special characters or hyphen are entered
      alert('Invalid character. Only numbers are allowed.');
      event.preventDefault(); // Prevent the input of the invalid character
    }
  }
}
