import { ComponentFixture, TestBed, waitForAsync, tick, fakeAsync } from '@angular/core/testing';

import { ActivationComponent } from './activation.component';
import {
    MockNativeLoginService,
    MockNgbModal,
    MockOcActivationComponent,
    MockRoutingComponent,
    MockToastrService,
} from '../../../../mock/mock';

import { RouterTestingModule } from '@angular/router/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { Router } from '@angular/router';
import { NativeLoginService } from '@openchannel/angular-common-services';
import { throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ActivationComponent', () => {
    let component: ActivationComponent;
    let fixture: ComponentFixture<ActivationComponent>;
    let router: Router;

    const getActivationDE = () => fixture.debugElement.query(By.directive(MockOcActivationComponent));
    const tokenValue = 's1123sa1a';
    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ActivationComponent, MockOcActivationComponent, MockRoutingComponent],
                imports: [
                    RouterTestingModule.withRoutes([
                        {
                            path: 'login',
                            component: MockRoutingComponent,
                        },
                    ]),
                ],
                providers: [
                    { provide: NgbModal, useClass: MockNgbModal },
                    { provide: ToastrService, useClass: MockToastrService },
                    { provide: NativeLoginService, useClass: MockNativeLoginService },
                ],
            }).compileComponents();
            router = TestBed.inject(Router);
            router.navigate(['/'], { queryParams: { token: tokenValue } });
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ActivationComponent);

        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should reander', () => {
        expect(fixture).toBeTruthy();
    });

    it('should complete destroy$ in ngOnDestroy hook', () => {
        jest.spyOn((component as any).destroy$, 'complete');
        fixture.destroy();
        expect((component as any).destroy$.complete).toHaveBeenCalled();
    });

    it('check rendered of oc-activate element', () => {
        component.inProcess = false;
        let activateElement = fixture.nativeElement.querySelector('oc-activation');
        expect(activateElement).toBeTruthy();
    });

    it('pass all necessary variables to the app-activation', () => {
        component.activationModel = {
            password: '221122',
            email: 'test@test.com',
            code: '2211321',
        };

        component.inProcess = true;

        fixture.detectChanges();

        const activationInstance = getActivationDE().componentInstance;

        expect(activationInstance.activationModel).toEqual(component.activationModel);
        expect(activationInstance.process).toBe(component.inProcess);
    });

    it('check set this.activationModel.code from route parameter', fakeAsync(() => {
        expect(component.activationModel.code).toEqual((component as any).route.queryParams.value.token);
    }));

    it('check button click trigger function event', fakeAsync(() => {
        const path = router.url;
        const activationInstance = getActivationDE().componentInstance;
        jest.spyOn(component, 'activate');
        activationInstance.buttonClick.emit(false);

        tick();
        expect(component.activate).toHaveBeenCalled();
        expect(router.url).toBe(path);
    }));

    it('should dont navigate to login page and dont show success message if token is broken and nativeLoginService doesnt work ', fakeAsync(() => {
        const event = true;
        component.inProcess = false;
        const oldPath = router.url;

        (component as any).nativeLoginService.activate = () => throwError('Error');
        jest.spyOn((component as any).toastr, 'success');
        jest.spyOn((component as any).nativeLoginService, 'activate');

        component.activate(event);
        tick();
        expect((component as any).nativeLoginService.activate).toHaveBeenCalled();

        expect((component as any).toastr.success).not.toHaveBeenCalled();
        // stay on the activate  page
        expect(router.url).toBe(oldPath);

        expect(component.inProcess).toBeFalsy();
    }));

    it('should navigate to login page and show success message if token is right and nativeLoginService worked out', fakeAsync(() => {
        const event = true;
        component.inProcess = false;

        jest.spyOn((component as any).toastr, 'success');
        jest.spyOn((component as any).nativeLoginService, 'activate');

        component.activate(event);
        tick();
        expect((component as any).nativeLoginService.activate).toHaveBeenCalled();
        // go to the next page
        expect(router.url).toBe('/login');
        expect((component as any).toastr.success).toHaveBeenCalled();

        expect(component.inProcess).toBeFalsy();
    }));
});
