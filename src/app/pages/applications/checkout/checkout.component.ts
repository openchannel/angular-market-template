import { Component, OnInit } from '@angular/core';
import { StripeLoaderService } from '@core/services/stripe-loader.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  constructor(private stripeLoader: StripeLoaderService) { }

  ngOnInit(): void {
    this.stripeLoader.loadStripe();
  }

}
