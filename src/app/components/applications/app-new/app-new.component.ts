import { Component, OnInit } from '@angular/core';
import { SellerAppDetailsModel } from 'oc-ng-common-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-app-new',
  templateUrl: './app-new.component.html',
  styleUrls: [
    './app-new.component.scss']
})
export class AppNewComponent implements OnInit {

  appDetails =new SellerAppDetailsModel();
  constructor(
    private router: Router) { }

  ngOnInit(): void {
    
  }

  gotoAppsList(){
    this.router.navigate(['./app-developer']);
  }

  cancelNewApp() {
    this.router.navigate(['./app-developer']);
  }
}
