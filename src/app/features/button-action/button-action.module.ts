import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonActionComponent } from './button-action.component';
import { ButtonActionService } from './button-action.service';
import { OcCommonLibModule } from '@openchannel/angular-common-components';

@NgModule({
    declarations: [ButtonActionComponent],
    exports: [ButtonActionComponent],
    providers: [ButtonActionService],
    imports: [CommonModule, OcCommonLibModule],
})
export class ButtonActionModule {}
