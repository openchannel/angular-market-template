import { Injectable } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

/**
 * This Service handles how the date is represented in scripts i.e. ngModel.
 */
@Injectable()
export class CustomAdapter extends NgbDateAdapter<number> {

  readonly DELIMITER = '-';

  fromModel(value: number | null): NgbDateStruct | null {
    if (value) {
      let date = new Date(value); //new Date(value)//value.split(this.DELIMITER);
      return {
        year : date.getFullYear(),
        month : date.getMonth()+1,
        day : date.getDate()
      };
    }
    return null;
  }
  toModel(date: NgbDateStruct | null): number | null {
      if(date){
        return new Date(date.year, date.month-1, date.day).getTime();
      }
    return null;
  }
}