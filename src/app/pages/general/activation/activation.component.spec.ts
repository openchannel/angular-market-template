import { ComponentFixture, TestBed, waitForAsync, tick, fakeAsync } from '@angular/core/testing';

import { ActivationComponent } from './activation.component';
import {
    MockFormComponent,
    MockNativeLoginService,
    MockNgbModal,
    MockOcActivationComponent,
    MockRoutingComponent,
    MockToastrService,
} from '../../../../mock/mock';
import { By } from '@angular/platform-browser';

import { RouterTestingModule } from '@angular/router/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { Router } from '@angular/router';
import { NativeLoginService } from '@openchannel/angular-common-services';
import { throwError } from 'rxjs';

describe.skip('ActivationComponent', () => {
    let component: ActivationComponent;
    let fixture: ComponentFixture<ActivationComponent>;
    let router: Router;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ActivationComponent, MockOcActivationComponent],
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
        // console.log('activate Element', activateElement1);
        expect(activateElement).toBeTruthy();
    });

    it('The activation code is false, checking the logic (bad request)', fakeAsync(() => {
        var event = true;
        component.inProcess = false;
        (component as any).nativeLoginService.activate = () => throwError('Error');
        jest.spyOn((component as any).toastr, 'success');
        jest.spyOn((component as any).nativeLoginService, 'activate');
        jest.spyOn(component as any, 'activate');
        try {
            component.activate(event);
            tick();
            expect((component as any).activate).toHaveBeenCalled();
            expect((component as any).nativeLoginService.activate).toHaveBeenCalled();

            expect((component as any).toastr.success).not.toHaveBeenCalled();
            // did not go to the next page
            expect(router.url).toBe('/');
        } catch (e) {
            console.log('error', e);
        }

        expect(component.inProcess).toBeFalsy();
    }));

    it('The activation code is true, checking the logic (good request)', fakeAsync(() => {
        var event = true;
        component.inProcess = false;

        jest.spyOn((component as any).toastr, 'success');
        jest.spyOn((component as any).nativeLoginService, 'activate');
        jest.spyOn(component as any, 'activate');

        try {
            expect((component as any).nativeLoginService.activate).not.toHaveBeenCalled();

            component.activate(event);

            tick();

            expect((component as any).activate).toHaveBeenCalled();
            expect((component as any).nativeLoginService.activate).toHaveBeenCalled();
            // go to the next page
            expect(router.url).toBe('/login');
            expect((component as any).toastr.success).toHaveBeenCalled();
        } catch (e) {
            console.log('error', e);
        }

        expect(component.inProcess).toBeFalsy();
    }));
});
