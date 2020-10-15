import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  messages: any[] = [];
  errors : any[] = [];
  fieldErrors : any[] = [];
  constructor() { 
  }

  showError(messages:any){
    this.fieldErrors =[];
    this.errors =[];
    for (let message of messages) {
          if(message.field){
            this.fieldErrors.push(message)
          }else{
            if(message.type){
               delete message.type;
            }
            this.errors.push(message)
          }
    }
  }

  showSuccess(message:any, title?:string){
      this.messages.push({"message": message, "title":title});
  }


  hideErrors() {
    this.errors = [];
  }

  hideFieldErrors() {
    this.fieldErrors = [];
  }

  hideSuccessMessage() {
    this.messages = [];
  }
}
