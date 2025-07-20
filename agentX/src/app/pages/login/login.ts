import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-login',
  imports: [RouterOutlet],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  constructor(private router: Router) {  } 

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

}
