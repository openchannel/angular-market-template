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

describe('ActivationComponent', () => {
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
        console.log(fixture.componentInstance);
    });

    it('should complete destroy$ in ngOnDestroy hook', () => {
        jest.spyOn((component as any).destroy$, 'complete');
        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnDestroy();
        expect((component as any).destroy$.complete).toHaveBeenCalled();
    });

    it('check rendered of oc-activate element', () => {
        component.inProcess = false;
        fixture.detectChanges();
        let activateElement = fixture.debugElement.query(By.css('activation-position'));
        console.log('activate Element', activateElement);
        // expect(activateElement).toBeTruthy();
    });

    it('test1', fakeAsync(() => {
        // (component as any).nativeLoginService.activate = () => throwError('Error');
        expect(component.testBool).toBeFalsy();
        console.log('expect false', component.testBool);
        component.activate(true);
        tick();
        expect(component.testBool).toBeTruthy();
        console.log('expect true', component.testBool);
    }));
});
