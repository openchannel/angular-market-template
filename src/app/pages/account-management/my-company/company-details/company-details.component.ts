import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    AccessLevel,
    AuthHolderService,
    DeveloperTypeFieldModel,
    Permission,
    PermissionType,
    TypeMapperUtils,
    TypeModel,
    UserAccountService,
    UserCompanyModel,
    UsersService,
} from '@openchannel/angular-common-services';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-company-details',
    templateUrl: './company-details.component.html',
    styleUrls: ['./company-details.component.scss'],
})
export class CompanyDetailsComponent implements OnInit, OnDestroy {
    inProcess = false;
    formConfig: TypeModel<DeveloperTypeFieldModel>;

    private defaultFormConfig: TypeModel<DeveloperTypeFieldModel> = {
        fields: [
            {
                id: 'name',
                label: 'Company Name',
                type: 'text',
                attributes: {
                    required: true,
                },
            },
        ],
    };

    private loader: LoadingBarState;
    private organizationForm: FormGroup;
    private organizationResult: any;
    private $destroy: Subject<void> = new Subject<void>();

    readonly savePermissions: Permission[] = [
        {
            type: PermissionType.ORGANIZATIONS,
            access: [AccessLevel.MODIFY],
        },
    ];

    constructor(
        private loadingBar: LoadingBarService,
        private toastService: ToastrService,
        private authHolderService: AuthHolderService,
        private userAccountService: UserAccountService,
        private usersService: UsersService,
    ) {}

    ngOnInit(): void {
        this.loader = this.loadingBar.useRef();
        this.initCompanyForm();
    }

    ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
        if (this.loader) {
            this.loader.complete();
        }
    }

    initCompanyForm(): void {
        this.loader.start();
        this.usersService
            .getUserCompany()
            .pipe(takeUntil(this.$destroy))
            .subscribe(
                companyData => {
                    if (companyData.type) {
                        this.usersService
                            .getUserTypeDefinition(companyData.type)
                            .pipe(takeUntil(this.$destroy))
                            .subscribe(
                                typeDefinition => {
                                    this.createFormFields(typeDefinition, companyData);
                                },
                                () => {
                                    this.createFormFields(this.defaultFormConfig, companyData);
                                },
                            );
                    } else {
                        this.createFormFields(this.defaultFormConfig, companyData);
                    }
                },
                () => {
                    this.loader.complete();
                    this.toastService.error("Sorry! Can't load company details. Please, reload the page");
                },
            );
    }

    setCreatedForm(organizationForm: FormGroup): void {
        this.organizationForm = organizationForm;
    }

    setResultData(organizationData: any): void {
        this.organizationResult = organizationData;
    }

    saveOrganization(): void {
        this.organizationForm.markAllAsTouched();
        if (this.organizationForm?.valid && this.organizationResult && !this.inProcess) {
            this.inProcess = true;
            this.usersService
                .updateUserCompany(TypeMapperUtils.buildDataForSaving(this.organizationResult))
                .pipe(takeUntil(this.$destroy))
                .subscribe(
                    () => {
                        this.inProcess = false;
                        this.toastService.success('Your company details has been updated');
                    },
                    () => {
                        this.inProcess = false;
                        this.toastService.error("Sorry! Can't update a company data. Please, try again later");
                    },
                );
        }
    }

    private createFormFields(type: TypeModel<DeveloperTypeFieldModel>, companyData: UserCompanyModel): void {
        this.formConfig = TypeMapperUtils.createFormConfig(type, companyData);
        this.loader.complete();
    }
}
