import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {InitService} from "oc-ng-common-service";
import {first} from "rxjs/operators";

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

  csrfInited = false;

  constructor(private router: Router,
              private initService: InitService) {

  }

  // temporary clearing sesson storage on application load, we might need to do auto login.
  ngOnInit() {
    this.initService.initCsrf()
        .pipe(first())
        .subscribe(value => {
          console.log('csrf inited!');
          this.csrfInited = true;
        }, error => this.csrfInited = true);
  }
  
}
