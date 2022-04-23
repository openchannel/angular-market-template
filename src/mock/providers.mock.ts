import { Provider } from '@angular/core';
import {
    AppFormService,
    AppsService,
    AuthenticationService,
    AuthHolderService,
    FileUploadDownloadService,
    FrontendService,
    InviteUserService,
    NativeLoginService,
    OwnershipService,
    SiteConfigService,
    StatisticService,
    TitleService,
    TransactionsService,
    UserAccount,
    UserAccountService,
    UserRoleService,
    UsersService,
} from '@openchannel/angular-common-services';
import { InviteUserModel } from '@openchannel/angular-common-services/lib/model/api/invite-user.model';
import { ToastrService } from 'ngx-toastr';
import {
    MockAppFormService,
    MockAppsService,
    MockAuthenticationService,
    MockAuthHolderService,
    MockButtonActionService,
    MockCmsContentService,
    MockEditUserTypeService,
    MockFileUploadDownloadService,
    MockFrontendService,
    MockInviteUserService,
    MockLoadingBarService,
    MockLogOutService,
    MockManagementModalService,
    MockNativeLoginService,
    MockOAuthService,
    MockOwnershipService,
    MockSiteConfigService,
    MockStatisticService,
    MockTitleService,
    MockToastrService,
    MockTransactionsService,
    MockUserAccountService,
    MockUserRoleService,
    MockUsersService,
} from './services.mock';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MockNgbActiveModal, MockNgbModal } from './components.mock';
import { OcEditUserTypeService } from '@core/services/user-type-service/user-type.service';
import { CmsContentService } from '@core/services/cms-content-service/cms-content-service.service';
import { LogOutService } from '@core/services/logout-service/log-out.service';
import { ButtonActionService } from '@features/button-action/button-action.service';
import { ManagementModalService } from '../app/pages/account-management/my-company/management/management-modal.service';
import { OAuthService } from 'angular-oauth2-oidc';

export function mockUserServiceProvider(): Provider {
    return { provide: UsersService, useClass: MockUsersService };
}

export function mockInviteUserServiceProvider(userInvites?: InviteUserModel[]): Provider {
    return { provide: InviteUserService, useFactory: () => new MockInviteUserService(userInvites) };
}

export function mockInviteUserAccountServiceProvider(currentUserAccount: UserAccount, otherUserAccounts: UserAccount[]): Provider {
    return { provide: UserAccountService, useFactory: () => new MockUserAccountService(currentUserAccount, otherUserAccounts) };
}

export function mockUserRoleServiceProvider(): Provider {
    return { provide: UserRoleService, useClass: MockUserRoleService };
}

export function mockToastrService(): Provider {
    return { provide: ToastrService, useClass: MockToastrService };
}

export function mockLoadingBarService(): Provider {
    return { provide: LoadingBarService, useClass: MockLoadingBarService };
}

export function mockAppFormService(): Provider {
    return { provide: AppFormService, useClass: MockAppFormService };
}

export function mockNgbModal(): Provider {
    return { provide: NgbModal, useClass: MockNgbModal };
}

export function mockNativeLoginService(): Provider {
    return { provide: NativeLoginService, useClass: MockNativeLoginService };
}

export function mockEditUserTypeService(): Provider {
    return { provide: OcEditUserTypeService, useClass: MockEditUserTypeService };
}

export function mockAuthenticationService(): Provider {
    return { provide: AuthenticationService, useClass: MockAuthenticationService };
}

export function mockSiteConfigService(): Provider {
    return { provide: SiteConfigService, useClass: MockSiteConfigService };
}

export function mockAppsService(): Provider {
    return { provide: AppsService, useClass: MockAppsService };
}

export function mockTransactionsService(): Provider {
    return { provide: TransactionsService, useClass: MockTransactionsService };
}

export function mockFrontendService(): Provider {
    return { provide: FrontendService, useClass: MockFrontendService };
}

export function mockTitleService(): Provider {
    return { provide: TitleService, useClass: MockTitleService };
}

export function mockCmsContentService(): Provider {
    return { provide: CmsContentService, useClass: MockCmsContentService };
}

export function mockLogOutService(): Provider {
    return { provide: LogOutService, useClass: MockLogOutService };
}

export function mockNgbActiveModal(): Provider {
    return { provide: NgbActiveModal, useClass: MockNgbActiveModal };
}

export function mockButtonActionService(): Provider {
    return { provide: ButtonActionService, useClass: MockButtonActionService };
}

export function mockManagementModalService(): Provider {
    return { provide: ManagementModalService, useClass: MockManagementModalService };
}

export function mockOwnershipService(): Provider {
    return { provide: OwnershipService, useClass: MockOwnershipService };
}

export function mockFileUploadDownloadService(): Provider {
    return { provide: FileUploadDownloadService, useClass: MockFileUploadDownloadService };
}

export function mockStatisticService(): Provider {
    return { provide: StatisticService, useClass: MockStatisticService };
}

export function mockAuthHolderService(): Provider {
    return { provide: AuthHolderService, useClass: MockAuthHolderService };
}

export function mockOAuthService(): Provider {
    return { provide: OAuthService, useClass: MockOAuthService };
}
