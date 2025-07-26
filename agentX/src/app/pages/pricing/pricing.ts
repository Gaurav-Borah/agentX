import { Component } from '@angular/core';
import { TopBar } from '../top-bar/top-bar';




@Component({
  selector: 'app-pricing',
  imports: [TopBar],
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss'
})
export class Pricing {
  selectedPlan: string = 'annually';


}
