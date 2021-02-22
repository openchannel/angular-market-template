import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  goToHomePage() {
    this.router.navigate(['/']).then(() => window.scrollTo(0, 0));
  }
}
