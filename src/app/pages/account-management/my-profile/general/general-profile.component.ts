import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserAccountService } from '@openchannel/angular-common-services';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { FormGroup } from '@angular/forms';
import { OCOrganization, OcEditUserFormConfig, OcEditUserResult } from '@openchannel/angular-common-components';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { OcEditUserTypeService } from '@core/services/user-type-service/user-type.service';

@Component({
    selector: 'app-general-profile',
    templateUrl: './general-profile.component.html',
    styleUrls: ['./general-profile.component.scss'],
})
export class GeneralProfileComponent implements OnInit, OnDestroy {
    private readonly formConfigsWithoutTypeData: OcEditUserFormConfig[] = [
        {
            name: 'Default',
            account: {
                type: 'default',
                typeData: null,
                includeFields: ['name', 'email'],
            },
            organization: null,
        },
        {
            name: 'Custom',
            account: {
                type: 'custom-account-type',
                typeData: null,
                includeFields: ['name', 'username', 'email', 'customData.about-me'],
            },
            organization: null,
        },
    ];

    formConfigsLoaded = false;
    formConfigs: OcEditUserFormConfig[];
    formAccountData: OCOrganization;

    inSaveProcess = false;

    formGroup: FormGroup;
    resultData: OcEditUserResult;

    private loader: LoadingBarState;
    private $destroy = new Subject<void>();

    constructor(
        private loadingBar: LoadingBarService,
        private accountService: UserAccountService,
        private toasterService: ToastrService,
        private ocTypeService: OcEditUserTypeService,
    ) {}

    ngOnInit(): void {
        this.loader = this.loadingBar.useRef();
        this.initDefaultFormConfig();
    }

    ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
        this.loader.complete();
    }

    saveUserData(): void {
        this.formGroup.markAllAsTouched();

        const accountData = this.resultData?.account;
        if (!this.inSaveProcess && accountData) {
            this.loader.start();
            this.inSaveProcess = true;

            this.accountService
                .updateUserAccount(accountData)
                .pipe(
                    finalize(() => {
                        this.inSaveProcess = false;
                        this.loader.complete();
                    }),
                    takeUntil(this.$destroy),
                )
                .subscribe(() => {
                    this.toasterService.success('Your profile has been updated');
                });
        }
    }

    private initDefaultFormConfig(): void {
        this.loader.start();
        forkJoin({
            accountData: this.accountService.getUserAccount(),
            formConfigs: this.ocTypeService.injectTypeDataIntoConfigs(this.formConfigsWithoutTypeData, false, true),
        })
            .pipe(
                finalize(() => {
                    this.loader.complete();
                }),
                takeUntil(this.$destroy),
            )
            .subscribe(result => {
                this.formAccountData = result.accountData;
                this.formConfigs = result.formConfigs;
                this.formConfigsLoaded = true;
            });
    }
}
