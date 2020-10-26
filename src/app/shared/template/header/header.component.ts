import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  sellerName : string = null;
  constructor(public router:Router){
 //   console.log("header component loaded.");
     this.displayUserInfo();
}

  ngOnInit(): void {
  }


  displayUserInfo(){
      if (localStorage.getItem("email")) {
        this.sellerName = localStorage.getItem("email");
      }
  }

  logout(){
    localStorage.clear();
    this.router.navigateByUrl("/login");
  }

}
