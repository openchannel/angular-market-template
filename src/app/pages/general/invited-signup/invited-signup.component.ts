import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    AuthenticationService,
    InviteUserModel,
    InviteUserService,
    NativeLoginService,
    UserAccountTypeModel,
    UserAccountTypesService,
} from '@openchannel/angular-common-services';
import { Subject } from 'rxjs';
import { merge } from 'lodash';
import { LogOutService } from '@core/services/logout-service/log-out.service';
import { filter, finalize, map, takeUntil } from 'rxjs/operators';
import { AppFormField, OcEditUserFormConfig, OcEditUserResult } from '@openchannel/angular-common-components';
import { OcEditUserTypeService } from '@core/services/user-type-service/user-type.service';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { ToastrService } from 'ngx-toastr';

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
    private readonly fieldsIdsToDisable = ['email', 'customData.company'];

    userInviteData: InviteUserModel;
    isExpired = false;
    formConfigs: OcEditUserFormConfig[];
    formConfigsLoading = true;
    showSignupFeedbackPage = false;

    inProcess = false;

    private destroy$: Subject<void> = new Subject();
    private loaderBar: LoadingBarState;

    constructor(
        private activeRouter: ActivatedRoute,
        private router: Router,
        private inviteUserService: InviteUserService,
        private typeService: UserAccountTypesService,
        private logOutService: LogOutService,
        private nativeLoginService: NativeLoginService,
        private loadingBarService: LoadingBarService,
        private ocEditTypeService: OcEditUserTypeService,
        private toaster: ToastrService,
        private authService: AuthenticationService,
    ) {}

    ngOnInit(): void {
        this.loaderBar = this.loadingBarService.useRef();
        this.checkSSO();
        this.getInviteDetails();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.loaderBar.complete();
    }

    getFormConfigs(userAccountTypeId: string): void {
        if (userAccountTypeId) {
            // Make form config according to type passed from invite data
            this.typeService
                .getUserAccountType(userAccountTypeId)
                .pipe(
                    map(type => this.mapUserAccountTypeToFormConfigs(type)),
                    map(formConfigs => this.getFormConfigsWithConfiguredFields(formConfigs)),
                    finalize(() => {
                        this.loaderBar.complete();
                        this.formConfigsLoading = false;
                    }),
                    takeUntil(this.destroy$),
                )
                .subscribe(formConfigs => {
                    this.formConfigs = formConfigs;
                });
        } else {
            // Make form config according to config property (formConfigsWithoutTypeData or formConfigsWithoutTypeDataDefault)
            this.ocEditTypeService
                .injectTypeDataIntoConfigs(this.formConfigsWithoutTypeData || this.formConfigsWithoutTypeDataDefault, false, true)
                .pipe(
                        map(formConfigs => this.getFormConfigsWithConfiguredFields(formConfigs)),
                    finalize(() => {
                        this.loaderBar.complete();
                        this.formConfigsLoading = false;
                    }),
                    takeUntil(this.destroy$),
                )
                .subscribe(formConfigs => {
                    this.formConfigs = formConfigs;
                });
        }
    }

    // Get invitation details
    getInviteDetails(): void {
        this.loaderBar.start();
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
                            this.loaderBar.complete();
                        } else {
                            this.getFormConfigs(response.type);
                        }
                    },
                    () => {
                        this.toaster.error('Invite has been deleted');
                        this.loaderBar.complete();
                        this.router.navigate(['']).then();
                    },
                );
        } else {
            this.loaderBar.complete();
            this.router.navigate(['']).then();
        }
    }

    // Register invited user and delete invite on success
    submitForm(userData: OcEditUserResult): void {
        if (userData && !this.inProcess) {
            this.loaderBar.start();
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
                            .pipe(
                                finalize(() => {
                                    this.inProcess = false;
                                    this.showSignupFeedbackPage = true;
                                    this.loaderBar.complete();
                                }),
                                takeUntil(this.destroy$),
                            )
                            .subscribe();
                    },
                    () => {
                        this.inProcess = false;
                        this.loaderBar.complete();
                    },
                );
        }
    }

    private getConfiguredFields(fields: AppFormField[]): AppFormField[] {
        return fields?.map(field => this.disableField(this.injectInviteDataToField(field)));
    }

    private injectInviteDataToField(field: AppFormField): AppFormField {
        if (!field.id.includes('customData') && this.userInviteData[field.id]) {
            field.defaultValue = this.userInviteData[field.id];
        } else if (field.id.includes('company')) {
            field.defaultValue = this.userInviteData.customData?.company;
        }

        return field;
    }

    private disableField(field: AppFormField): AppFormField {
        if (this.fieldsIdsToDisable.includes(field.id)) {
            field.attributes.disabled = true;
        }

        return field;
    }

    private getFormConfigsWithConfiguredFields(formConfigs: OcEditUserFormConfig[]): OcEditUserFormConfig[] {
        return formConfigs.map(item => {
            return {
                ...item,
                account: {
                    ...item.account,
                    typeData: {
                        ...item.account.typeData,
                        fields: this.getConfiguredFields(item.account.typeData.fields),
                    },
                },
            };
        });
    }

    private mapUserAccountTypeToFormConfigs(userAccountType: UserAccountTypeModel): OcEditUserFormConfig[] {
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

    private checkSSO(): void {
        this.authService
            .getAuthConfig()
            .pipe(
                map(value => !!value),
                filter(isSSO => isSSO),
                takeUntil(this.destroy$),
            )
            .subscribe(() => {
                this.router.navigate(['login']).then();
            });
    }
}
