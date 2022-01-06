import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OcCommonLibModule, OcMarketComponentsModule } from '@openchannel/angular-common-components';
import { ConfirmationModalComponent } from './modals/confirmation-modal/confirmation-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { PermissionDirective } from './directive/permission.directive';
import { CollapseWithTitleComponent } from './components/collapse-with-title/collapse-with-title.component';
import { PageTitleComponent } from '@shared/components/page-title/page-title.component';
import { TransactionAmountPipe } from './pipes/transaction-amount.pipe';

@NgModule({
    declarations: [ConfirmationModalComponent, PermissionDirective, CollapseWithTitleComponent, PageTitleComponent, TransactionAmountPipe],
    imports: [CommonModule, OcCommonLibModule, OcMarketComponentsModule, ReactiveFormsModule, FormsModule, NgbModule, NgSelectModule],
    exports: [
        OcCommonLibModule,
        OcMarketComponentsModule,
        FormsModule,
        PermissionDirective,
        NgbModule,
        CollapseWithTitleComponent,
        PageTitleComponent,
        TransactionAmountPipe,
    ],
})
export class SharedModule {}
