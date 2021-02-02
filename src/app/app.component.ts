import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService, TitleService} from 'oc-ng-common-service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

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

  private destroy$: Subject<void> = new Subject();

  constructor(public router: Router,
              private authenticationService: AuthenticationService,
              private titleService: TitleService) {
  }

  ngOnInit() {
    // refresh JWT token if exists
    this.authenticationService.isLoggedUserByAccessOrRefreshToken()
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {});
  }
}
