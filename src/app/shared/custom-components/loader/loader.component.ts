import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoaderService } from '../../services/loader.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit  {

  loading: boolean;



  constructor(public loaderService: LoaderService,
    private router: Router) {

    this.loaderService.inProcess.subscribe((v) => {
      this.loading = v;
    });

  }
  ngOnInit() {
  }

  toggle() {
    this.loading = !this.loading;
  }

  getClass(){

      if(this.router.url.split('?')[0] == "/applications"){
        return 'filter-menu';
      } else if(this.router.url.split('?')[0].includes("/invite/")
             || this.router.url.split('?')[0].includes("/sso/authenticate")){
          return '';
      }
      return 'left-menu';
  }

}
