import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class Signup {
  userData = {
    username: '',
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) { }

  onSignup() {
    console.log('Data being sent to backend:', this.userData);

    this.authService.signup(this.userData).subscribe({
      next: (res) => {
        console.log('Signup success:', res);
        // Redirect to login page after signup
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Signup error:', err);
        alert('Signup failed. Please check your details.');
      }
    });
  }
}


