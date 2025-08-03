import { Component } from '@angular/core';
import { TopBar } from '../top-bar/top-bar';
import { Router } from '@angular/router';




@Component({
  selector: 'app-pricing',
  imports: [TopBar],
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss'
})
export class Pricing {
  selectedPlan: string = 'annually';


   constructor(private router: Router) {
  } 


  goToPricing() {
    this.router.navigate(['/payments']);
  }


}
