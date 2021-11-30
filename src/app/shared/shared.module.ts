import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OcCommonLibModule, OcMarketComponentsModule } from '@openchannel/angular-common-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { PermissionDirective } from './directive/permission.directive';
import { CollapseWithTitleComponent } from './components/collapse-with-title/collapse-with-title.component';
import { PageTitleComponent } from '@shared/components/page-title/page-title.component';

@NgModule({
    declarations: [PermissionDirective, CollapseWithTitleComponent, PageTitleComponent],
    imports: [CommonModule, OcCommonLibModule, OcMarketComponentsModule, ReactiveFormsModule, FormsModule, NgbModule, NgSelectModule],
    exports: [
        OcCommonLibModule,
        OcMarketComponentsModule,
        FormsModule,
        PermissionDirective,
        NgbModule,
        CollapseWithTitleComponent,
        PageTitleComponent,
    ],
})
export class SharedModule {}
