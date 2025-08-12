import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: 'app-payment',
  imports: [CommonModule,FormsModule],
  templateUrl: './payments.html',
  styleUrls: ['./payments.scss']
})
export class Payments{
  amount: number = 1000; // in cents
  loading: boolean = false;

  constructor(private authService: AuthService) {}

  checkout() {
    this.loading = true;

    // Call the backend to create a Stripe Checkout Session using AuthService
    this.authService.postPayments({ amount: this.amount }).subscribe({
      next: async (session) => {
        // Once session is created, get publishable key from backend using AuthService
        this.authService.getstripepublishablekey('').subscribe({
          next: (keyResp) => {
            this.loading = false;
            const stripe = (window as any).Stripe(keyResp.publishableKey);
            console.log(keyResp.publishableKey)
            // Redirect to Stripe Checkout
            stripe.redirectToCheckout({ sessionId: session.id });
          },
          error: (err) => {
            this.loading = false;
            alert('Failed to load Stripe publishable key!');
            console.error(err);
          }
        });
      },
      error: (err) => {
        this.loading = false;
        alert('Payment error!');
        console.error(err);
      }
    });
  }
}
