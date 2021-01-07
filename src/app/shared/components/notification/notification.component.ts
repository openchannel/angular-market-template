import { Component, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  host: {'[class.ngb-toasts]': 'true'},
  encapsulation: ViewEncapsulation.None
})
export class NotificationComponent implements OnInit {

  constructor(public notificationService: NotificationService) { }

  ngOnInit(): void {
  }

  getValue(value) {
    return value;
  }
  
  hideErrors() : void {    
    this.notificationService.hideErrors();
  };

  hideFieldErrors() : void {    
    this.notificationService.hideFieldErrors();
  };

  hideSuccessMessage() : void {    
    this.notificationService.hideSuccessMessage();
  };
}
