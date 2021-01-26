import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService, TitleService} from 'oc-ng-common-service';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host: {
  '[class.not-found]' : 'this.router.url.split("?")[0] == "/not-found"',
  '[class.my-applications]' : 'this.router.url.split("?")[0] == "/my-applications"'
  }
})

export class AppComponent implements OnInit {
  title = 'template3-marketsite';

  csrfInited = false;

  constructor(public router: Router,
              private authenticationService: AuthenticationService,
              private titleService: TitleService) {
  }

  // temporary clearing session storage on application load, we might need to do auto login.
  ngOnInit() {
    this.authenticationService.initCsrf()
        .pipe(first())
        .subscribe(value => {
          console.log('csrf inited!');
          this.csrfInited = true;
        }, error => this.csrfInited = true);
  }

}
