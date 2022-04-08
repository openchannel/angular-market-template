import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InvitedSignupComponent } from './invited-signup.component';
import { SignupComponent } from '../signup/signup.component';
import {
    MockAuthenticationService,
    MockEditUserTypeService,
    MockInviteUserService,
    mockInviteUserServiceProvider,
    MockLoadingBarService,
    MockLogOutService,
    MockNativeLoginService,
    MockSignupCustom,
    MockToastrService,
    MockUserAccountTypesService,
} from '../../../../mock/mock';
import { RouterTestingModule } from '@angular/router/testing';
import {
    AuthenticationService,
    InviteUserService,
    NativeLoginService,
    UserAccountTypesService,
} from '@openchannel/angular-common-services';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { OcEditUserTypeService } from '@core/services/user-type-service/user-type.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LogOutService } from '@core/services/logout-service/log-out.service';
import { By } from '@angular/platform-browser';

describe('InvitedSignupComponent', () => {
    let component: InvitedSignupComponent;
    let fixture: ComponentFixture<InvitedSignupComponent>;
    let router: Router;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [InvitedSignupComponent, MockSignupCustom],
                imports: [RouterTestingModule],
                providers: [
                    { provide: NativeLoginService, useClass: MockNativeLoginService },
                    { provide: LoadingBarService, useClass: MockLoadingBarService },
                    { provide: OcEditUserTypeService, useClass: MockEditUserTypeService },
                    { provide: ToastrService, useClass: MockToastrService },
                    { provide: LogOutService, useClass: MockLogOutService },
                    { provide: OcEditUserTypeService, useClass: MockEditUserTypeService },
                    { provide: AuthenticationService, useClass: MockAuthenticationService },
                    { provide: UserAccountTypesService, useClass: MockUserAccountTypesService },

                    mockInviteUserServiceProvider([]),
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(InvitedSignupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should complete destroy$ and loaderBar in ngOnDestroy hook', () => {
        jest.spyOn((component as any).destroy$, 'complete');
        jest.spyOn((component as any).loaderBar, 'complete');
        fixture.destroy();
        expect((component as any).destroy$.complete).toHaveBeenCalled();
        expect((component as any).loaderBar.complete).toHaveBeenCalled();
    });

    it('check rendered of invited-signup element', () => {
        const activateElement = fixture.debugElement.query(By.css('.signup-position'));
        expect(activateElement).toBeTruthy();
    });



});
