import { Pipe, PipeTransform } from '@angular/core';
const S = require('string');

@Pipe({
  name: 'camelCaseToNormal'
})
export class CamelCaseToNormalPipe implements PipeTransform {

  transform(value: string, ...args: any[]): string {
    return S(value).humanize().s;
  }

}
