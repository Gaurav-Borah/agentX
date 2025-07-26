import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  imports: [RouterOutlet],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss'
})
export class TopBar {

  constructor(private router: Router) {
    // this.currentYear = new Date().getFullYear();
  } 


  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }

  goToPricing() {
    this.router.navigate(['/pricing']);
  }

}
