import { Pipe, PipeTransform } from '@angular/core';
import S from 'string';

@Pipe({
  name: 'camelCaseToNormal'
})
export class CamelCaseToNormalPipe implements PipeTransform {

  transform(value: string, ...args: any[]): string {
    return S(value).humanize().s;
  }

}
