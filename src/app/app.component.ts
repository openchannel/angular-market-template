import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host: {
  '[class.not-found]' : 'this.router.url.split("?")[0] == "/not-found"',
  '[class.my-applications]' : 'this.router.url.split("?")[0] == "/my-applications"'
  }
})

export class AppComponent {
  title = 'template3-marketsite';

  constructor(private router : Router){}

  // temporary clearing sesson storage on application load, we might need to do auto login.
  ngOnInit() {
  }
  
}
