import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterOutlet, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginData = {
    email: '',
    password: ''
  };

  constructor(private router: Router, private authService: AuthService) { }

  onLogin() {
    console.log('Data being sent to backend:', this.loginData);

    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        console.log('Login success:', res);
        // No token storage needed (session is handled by cookies)
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login error:', err);
        alert('Login failed. Please check your credentials.');
      }
    });
  }
}
