import { ComponentFixture, TestBed, waitForAsync, tick, fakeAsync } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { MockOcResetPasswordComponent, MockRoutingComponent } from '../../../../mock/components.mock';
import { mockNativeLoginService, mockNgbModal, mockToastrService } from '../../../../mock/providers.mock';

describe('ResetPasswordComponent', () => {
    let component: ResetPasswordComponent;
    let fixture: ComponentFixture<ResetPasswordComponent>;
    let router: Router;

    const resetPasswordDE = () => fixture.debugElement.query(By.directive(MockOcResetPasswordComponent));
    const tokenValue = '1123saa1a';
    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ResetPasswordComponent, MockOcResetPasswordComponent, MockRoutingComponent],
                imports: [
                    RouterTestingModule.withRoutes([
                        {
                            path: 'login',

                            component: MockRoutingComponent,
                        },
                    ]),
                ],
                providers: [mockNgbModal(), mockToastrService(), mockNativeLoginService()],
            }).compileComponents();
            router = TestBed.inject(Router);
            router.navigate(['/'], { queryParams: { token: tokenValue } });
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ResetPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should complete destroy$ in ngOnDestroy hook', () => {
        jest.spyOn((component as any).destroy$, 'complete');
        fixture.destroy();
        expect((component as any).destroy$.complete).toHaveBeenCalled();
    });

    it('check set this.activationModel.code from route parameter', fakeAsync(() => {
        expect(component.resetModel.code).toEqual((component as any).route.queryParams.value.token);
    }));

    it('check rendered of oc-reset-password element', () => {
        component.inProcess = false;
        const activateElement = fixture.debugElement.query(By.css('.reset-position'));
        expect(activateElement).toBeTruthy();
    });

    it('pass all necessary variables to the oc-reset-password', () => {
        component.resetModel = {
            newPassword: 'password',
            code: 'asdasda',
        };
        component.inProcess = true;
        fixture.detectChanges();

        const resetPasswordInstance = resetPasswordDE().componentInstance;
        expect(resetPasswordInstance.resetModel).toEqual(component.resetModel);
        expect(resetPasswordInstance.process).toBe(component.inProcess);
    });

    it('check button click trigger function event', fakeAsync(() => {
        const resetPasswordInstance = resetPasswordDE().componentInstance;
        jest.spyOn(component, 'reset');
        resetPasswordInstance.buttonClick.emit(true);
        tick();
        expect(component.reset).toHaveBeenCalled();
        expect(router.url).toBe('/login');
    }));

    it('should navigate to login page and show success message if code is right', fakeAsync(() => {
        component.inProcess = false;
        jest.spyOn((component as any).toaster, 'success');
        jest.spyOn((component as any).nativeLoginService, 'resetPassword');
        component.reset(true);
        tick();
        expect((component as any).nativeLoginService.resetPassword).toHaveBeenCalled();
        // go to the next page
        expect(router.url).toBe('/login');
        expect((component as any).toaster.success).toHaveBeenCalled();
        expect(component.inProcess).toBeFalsy();
    }));

    it('should dont navigate to login page and dont show success message if token is broken and nativeLoginService doesnt work', fakeAsync(() => {
        const oldPath = router.url;
        (component as any).nativeLoginService.resetPassword = () => throwError('Error');
        jest.spyOn(component, 'reset');
        jest.spyOn((component as any).nativeLoginService, 'resetPassword');
        component.reset(true);
        tick();
        expect((component as any).nativeLoginService.resetPassword).toHaveBeenCalled();
        // stay on the activate  page
        expect(router.url).toBe(oldPath);
        expect(component.inProcess).toBeFalsy();
    }));
});
