import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';



@Component({
  selector: 'app-start',
  imports: [RouterOutlet],
  templateUrl: './start.html',
  styleUrl: './start.scss'
})
export class Start {
  // currentYear: number;


  constructor(private router: Router) {
    // this.currentYear = new Date().getFullYear();
  } 


  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }

}
