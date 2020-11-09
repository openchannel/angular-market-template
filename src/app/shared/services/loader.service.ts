import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LoaderService implements OnDestroy  {

 public inProcess: BehaviorSubject<boolean>;

  pendingLoaderRequests = 0;
  isLeftMenuAvailable : boolean;

  loaderRequestIds = [];

  constructor() {
  this.isLeftMenuAvailable = true;  
  this.inProcess = new BehaviorSubject<boolean>(false);  
  }

  /**
   * This method is responsible for show the loader.
   */
  showLoader(requestId:string){

    if(requestId.indexOf("?") != -1){
      requestId = requestId.substring(0, requestId.indexOf("?"));
    }
    this.loaderRequestIds.push(requestId);
    //this.pendingLoaderRequests++;
    this.inProcess.next(true);
  }
  /**
   * This method is responsible for close the loader.
   */
  closeLoader(requestId:string){
    if(requestId.indexOf("?") != -1){
      requestId = requestId.substring(0, requestId.indexOf("?"));
    }
    let index = this.loaderRequestIds.indexOf(requestId);
    if( index != -1){
      this.loaderRequestIds.splice(index, 1);
      //this.pendingLoaderRequests--;
      if(this.loaderRequestIds.length == 0){
        this.inProcess.next(false);
      }    
    }
  }
  /**
   * This method is responsible for destroy subscription when current service destroy.
   */
  ngOnDestroy() {
    this.inProcess.unsubscribe();
  }

}
