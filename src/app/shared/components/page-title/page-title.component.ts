import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-page-title',
  templateUrl: './page-title.component.html',
  styleUrls: ['./page-title.component.scss']
})
export class PageTitleComponent {

  @Input() pageTitle: string;
  @Input() navigateText: string;
  @Input() buttonText: string;
  @Output() navigateClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() buttonClick: EventEmitter<void> = new EventEmitter<void>();
}
