import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-collapse-with-title',
  templateUrl: './collapse-with-title.component.html',
  styleUrls: ['./collapse-with-title.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CollapseWithTitleComponent),
    multi: true
  }],
})
export class CollapseWithTitleComponent implements OnInit, ControlValueAccessor {

  @Input() titleForClose: string;
  @Input() titleForOpen: string;

  collapsed = true;

  private onTouched = () => {};
  private onChange: (value: any) => void = () => {};

  constructor() { }

  ngOnInit(): void {
  }

  changeCollapseStatus() {
    this.collapsed = !this.collapsed;
    this.onChange(this.collapsed);
  }

  registerOnChange(onChange: (value: any) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  writeValue(obj: boolean): void {
    this.collapsed = obj;
  }

}
