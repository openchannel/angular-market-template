import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    InviteUserModel,
    InviteUserService,
    NativeLoginService,
    UserAccountTypeModel,
    UserAccountTypesService,
} from '@openchannel/angular-common-services';
import { Subject } from 'rxjs';
import { merge } from 'lodash';
import { LogOutService } from '@core/services/logout-service/log-out.service';
import { map, takeUntil } from 'rxjs/operators';
import { AppFormField, OcEditUserFormConfig, OcEditUserResult } from '@openchannel/angular-common-components';
import { OcEditUserTypeService } from '@core/services/user-type-service/user-type.service';

@Component({
    selector: 'app-invited-signup',
    templateUrl: './invited-signup.component.html',
    styleUrls: ['./invited-signup.component.scss'],
})
export class InvitedSignupComponent implements OnInit, OnDestroy {
    private readonly formConfigsWithoutTypeData: OcEditUserFormConfig[] = [
        {
            name: 'Default',
            account: {
                type: 'default',
                typeData: null,
                // includeFields: ['name', 'email', 'customData.company'],
                includeFields: [
                    'name',
                    'email',
                    'username',
                    'customData.number',
                    'customData.dropdown-list',
                    'customData.dfa1',
                    'customData.color',
                    'customData.company',
                    'customData.data',
                    'customData.datetime',
                ],
            },
        },
        {
            name: 'My custom 123321',
            account: {
                type: 'check-config-type',
                typeData: null,
                includeFields: ['name', 'username', 'email'],
            },
        },
        {
            name: 'Not existing type',
            account: {
                type: 'not-existing-type',
                typeData: null,
                includeFields: ['name', 'username', 'email'],
            },
        },
    ];
    private readonly formConfigsWithoutTypeDataDefault: OcEditUserFormConfig[] = [
        {
            name: 'default',
            account: { type: 'default', typeData: null, includeFields: ['name', 'email'] },
        },
    ];

    userInviteData: InviteUserModel;
    isExpired = false;
    formConfig: OcEditUserFormConfig[];
    formConfigsLoading = true;
    showSignupFeedbackPage = false;

    inProcess = false;

    private destroy$: Subject<void> = new Subject();

    constructor(
        private activeRouter: ActivatedRoute,
        private router: Router,
        private inviteUserService: InviteUserService,
        private typeService: UserAccountTypesService,
        private logOutService: LogOutService,
        private nativeLoginService: NativeLoginService,
        private ocEditTypeService: OcEditUserTypeService,
    ) {}

    ngOnInit(): void {
        this.getInviteDetails();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getFormConfig(userAccountTypeId: string): void {
        if (userAccountTypeId) {
            // Make form config according to type passed from invite data
            this.typeService
                .getUserAccountType(userAccountTypeId)
                .pipe(
                    map(type => this.mapUserAccountTypeToFormConfig(type)),
                    map(formConfig => this.getFormConfigWithInviteData(formConfig)),
                    takeUntil(this.destroy$),
                )
                .subscribe(formConfig => {
                    this.formConfig = formConfig;
                    this.formConfigsLoading = false;
                });
        } else {
            // Make form config according to config property (formConfigsWithoutTypeData or formConfigsWithoutTypeDataDefault)
            this.ocEditTypeService
                .injectTypeDataIntoConfigs(this.formConfigsWithoutTypeData || this.formConfigsWithoutTypeDataDefault, false, true)
                .pipe(
                    map(formConfig => this.getFormConfigWithInviteData(formConfig)),
                    takeUntil(this.destroy$),
                )
                .subscribe(formConfig => {
                    this.formConfig = formConfig;
                    this.formConfigsLoading = false;
                });
        }
    }

    // Get invitation details
    getInviteDetails(): void {
        const userToken = this.activeRouter.snapshot.params.token;
        if (userToken) {
            this.inviteUserService
                .getUserInviteInfoByToken(userToken)
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                    response => {
                        this.userInviteData = response;
                        if (new Date(this.userInviteData.expireDate) < new Date()) {
                            this.isExpired = true;
                        } else {
                            this.getFormConfig(null);
                        }
                    },
                    () => {
                        this.router.navigate(['']).then();
                    },
                );
        } else {
            this.router.navigate(['']).then();
        }
    }

    // Register invited user and deleting invite on success
    submitForm(userData: OcEditUserResult): void {
        if (userData && !this.inProcess) {
            this.inProcess = true;
            const request = merge(this.userInviteData, userData.account);

            this.nativeLoginService
                .signupByInvite({
                    userCustomData: request,
                    inviteToken: this.userInviteData.token,
                })
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                    () => {
                        this.logOutService
                            .logOut()
                            .pipe(takeUntil(this.destroy$))
                            .subscribe(
                                () => {
                                    this.inProcess = false;
                                    this.showSignupFeedbackPage = true;
                                },
                                () => {
                                    this.inProcess = false;
                                    this.showSignupFeedbackPage = true;
                                },
                            );
                    },
                    () => {
                        this.inProcess = false;
                    },
                );
        }
    }

    private injectInviteDataToFields(fields: AppFormField[]): AppFormField[] {
        return fields?.map(field => {
            if (!field.id.includes('customData') && this.userInviteData[field.id]) {
                field.defaultValue = this.userInviteData[field.id];
            } else if (field.id.includes('company')) {
                field.defaultValue = this.userInviteData.customData?.company;
                field.attributes.disabled = true;
            }
            return field;
        });
    }

    private getFormConfigWithInviteData(formConfig: OcEditUserFormConfig[]): OcEditUserFormConfig[] {
        return formConfig.map(item => {
            return {
                ...item,
                account: {
                    ...item.account,
                    typeData: {
                        ...item.account.typeData,
                        fields: this.injectInviteDataToFields(item.account.typeData.fields),
                    },
                },
            };
        });
    }

    private mapUserAccountTypeToFormConfig(userAccountType: UserAccountTypeModel): OcEditUserFormConfig[] {
        return [
            {
                name: '',
                account: {
                    type: userAccountType.userAccountTypeId,
                    typeData: { ...userAccountType },
                    includeFields: userAccountType.fields?.map(field => field.id),
                },
            },
        ];
    }
}
