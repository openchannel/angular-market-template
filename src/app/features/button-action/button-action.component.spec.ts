import { ComponentFixture, fakeAsync, TestBed, waitForAsync, tick, flush } from '@angular/core/testing';
import { ButtonActionComponent } from './button-action.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
    MockAppFormService,
    MockAuthHolderService,
    MockLoadingBarService,
    MockOwnershipService,
    MockNgbModal,
    MockToastrService,
    MockFileUploadDownloadService,
    MockStatisticService,
    MockRoutingComponent,
    MockButtonComponent,
} from '../../../mock/mock';
import { ToastrService } from 'ngx-toastr';
import {
    AppFormService,
    AuthHolderService,
    FileUploadDownloadService,
    OwnershipService,
    StatisticService,
} from '@openchannel/angular-common-services';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { ResendActivationComponent } from '../../pages/general/resend-activation/resend-activation.component';
import { Location } from '@angular/common';
import {
    ActionButton,
    actionButtons,
    buyNowButton,
    contactUsButton,
    downloadButton,
    installButton,
    InstallButtonType,
    uninstallButton,
} from '../../../assets/data/configData';
import { OcButtonType } from '@openchannel/angular-common-components/src/lib/common-components/model/components-basic.model';
import { Action } from 'rxjs/internal/scheduler/Action';
import { FullAppData } from '@openchannel/angular-common-components';
import { asyncScheduler, Observable, throwError } from 'rxjs';
import { observeOn, catchError } from 'rxjs/operators';

window.open = jest.fn();
describe('ButtonActionComponent', () => {
    let component: ButtonActionComponent;
    let fixture: ComponentFixture<ButtonActionComponent>;
    let router: Router;
    let acivateRoute: ActivatedRoute;
    let location: Location;

    // declare appData its all data about app status and else
    const appData: FullAppData = {
        appId: '123123',
        lastUpdated: 123123123,
        version: 2,
        name: 'testApp',
        safeName: ['testApp'],
        developerId: '123Asd123da',
        model: [
            {
                type: 'install',
                price: 0,
                trial: 123123123,
                license: '123123sad',
                modelId: '123asd21',
                currency: '123asd',
            },
        ],
        ownership: {
            ownershipId: '123123adsa',
            date: new Date('December 17, 1995 03:24:00'),
            appId: 'asdw123',
            userId: 'asdw123',
            developerId: 'asdw123',
            ownershipType: 'full',
            ownershipStatus: 'pending',
            model: {
                type: 'string',
                price: 12,
                trial: 1,
                license: 'free',
                modelId: 'asdw123',
                currency: 'JSI',
            },
        },
        submittedDate: 132123123,
        created: 123123123,
        rating: 4,
        reviewCount: 102,
        status: {
            value: 'approved',
            lastUpdated: 125674,
            modifiedBy: 'n123123',
            reason: 'someReson',
        },
        statistics: {
            views: {
                '90day': 5,
                '30day': 4,
                total: 5,
            },
            downloads: { '90day': 5, '30day': 4, total: 5 },
            developerSales: { '90day': 5, '30day': 4, total: 5 },
            totalSales: { '90day': 5, '30day': 4, total: 5 },
            ownerships: { '90day': 5, '30day': 4, total: 5 },
            reviews: { '90day': 5, '30day': 4, total: 5 },
        },
        isLive: false,
    };

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ButtonActionComponent, MockRoutingComponent, MockButtonComponent],
                imports: [
                    RouterTestingModule.withRoutes([
                        { path: 'login', component: MockRoutingComponent },
                        { path: 'checkout/:safeName', component: MockRoutingComponent },
                    ]),
                ],
                providers: [
                    { provide: NgbModal, useClass: MockNgbModal },
                    { provide: ToastrService, useClass: MockToastrService },
                    { provide: LoadingBarService, useClass: MockLoadingBarService },
                    { provide: AppFormService, useClass: MockAppFormService },
                    { provide: AuthHolderService, useClass: MockAuthHolderService },
                    { provide: OwnershipService, useClass: MockOwnershipService },
                    { provide: FileUploadDownloadService, useClass: MockFileUploadDownloadService },
                    { provide: StatisticService, useClass: MockStatisticService },
                    {
                        provide: ActivatedRoute,
                        useValue: {
                            snapshot: {
                                paramMap: convertToParamMap({ safeName: '1234' }),
                            },
                        },
                    },
                ],
            }).compileComponents();
            router = TestBed.inject(Router);
            acivateRoute = TestBed.inject(ActivatedRoute);
            location = TestBed.inject(Location);
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ButtonActionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        jest.resetAllMocks();
        // window.alert.mockClear();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should complete destroy$ in ngOnDestroy hook', () => {
        const ngbModal = TestBed.inject(NgbModal);
        jest.spyOn(ngbModal, 'dismissAll');
        jest.spyOn((component as any).$destroy, 'next');
        jest.spyOn((component as any).$destroy, 'complete');
        jest.spyOn((component as any).loader, 'complete');
        fixture.destroy();
        expect(ngbModal.dismissAll).toHaveBeenCalled();
        expect((component as any).$destroy.next).toHaveBeenCalled();
        expect((component as any).$destroy.complete).toHaveBeenCalled();
        expect((component as any).loader.complete).toHaveBeenCalled();
    });

    it('test case with form', fakeAsync(() => {
        const appFormService = TestBed.inject(AppFormService);
        const modal = TestBed.inject(NgbModal);
        jest.spyOn((component as any).loader, 'start');
        jest.spyOn(appFormService, 'getForm');
        jest.spyOn(appFormService, 'createFormSubmission');
        jest.spyOn(component as any, 'processAction');
        jest.spyOn(component as any, 'openFormModal');
        jest.spyOn(modal, 'hasOpenModals').mockReturnValueOnce(false);
        component.buttonAction = contactUsButton;

        (component as any).onClick();
        tick();

        expect((component as any).loader.start).toHaveBeenCalled();
        expect(appFormService.getForm).toHaveBeenCalled();
        expect((component as any).openFormModal).toHaveBeenCalled();
        expect(modal.hasOpenModals).toHaveBeenCalled();
        // expect((component as any).processAction).toHaveBeenCalled();
        // expect(appFormService.createFormSubmission).toHaveBeenCalled();
    }));

    it('if user not login and click install, should redirect to login page', fakeAsync(() => {
        const authHolderService = TestBed.inject(AuthHolderService);
        component.buttonAction = installButton;
        jest.spyOn(authHolderService, 'isLoggedInUser').mockReturnValueOnce(false);
        jest.spyOn(component as any, 'navigateToLoginPage');
        jest.spyOn(component as any, 'installOwnership');
        (component as any).onClick();
        tick();
        expect(authHolderService.isLoggedInUser).toHaveBeenCalled();
        expect((component as any).navigateToLoginPage).toHaveBeenCalled();
        expect(router.url).toContain('/login');
    }));

    it('if user is login and app install without errors should ', fakeAsync(() => {
        const ownershipService = TestBed.inject(OwnershipService);
        const authHolderService = TestBed.inject(AuthHolderService);
        const statisticService = TestBed.inject(StatisticService);
        component.appData = appData;
        component.buttonAction = installButton;
        jest.spyOn(statisticService, 'record');
        jest.spyOn(authHolderService, 'isLoggedInUser').mockReturnValueOnce(true);
        jest.spyOn(ownershipService, 'installOwnership');
        jest.spyOn(component as any, 'processAction');
        (component as any).onClick();
        tick();
        expect((component as any).processAction).toHaveBeenCalled();
        expect(statisticService.record).toHaveBeenCalled();
        expect(ownershipService.installOwnership).toHaveBeenCalled();
    }));

    it('if user is login and app install with errors should show error', fakeAsync(() => {
        const ownershipService = TestBed.inject(OwnershipService);
        const authHolderService = TestBed.inject(AuthHolderService);
        const statisticService = TestBed.inject(StatisticService);
        const toastrService = TestBed.inject(ToastrService);
        // (component as any).statisticService.record = () => throwError('Error').pipe(observeOn(asyncScheduler));
        jest.spyOn(authHolderService, 'isLoggedInUser').mockReturnValueOnce(true);
        jest.spyOn(ownershipService, 'installOwnership');
        jest.spyOn(statisticService, 'record');
        jest.spyOn(toastrService, 'error');
        jest.spyOn(component as any, 'handleOwnershipResponseError');
        jest.spyOn(component as any, 'processAction');
        component.appData = appData;
        component.buttonAction = installButton;
        (component as any).onClick();
        tick();

        expect((component as any).ownershipService.installOwnership).toHaveBeenCalled();
        expect((component as any).processAction).toHaveBeenCalled();
        // expect((component as any).handleOwnershipResponseError).toHaveBeenCalled();
        expect(toastrService.error).toHaveBeenCalled();
    }));

    it('test case with uninstall', fakeAsync(() => {
        const authHolderService = TestBed.inject(AuthHolderService);
        const ownershipService = TestBed.inject(OwnershipService);
        jest.spyOn(authHolderService, 'isLoggedInUser').mockReturnValueOnce(true);
        jest.spyOn(ownershipService, 'uninstallOwnership');
        jest.spyOn(component as any, 'processAction');
        component.buttonAction = uninstallButton;
        (component as any).onClick();
        tick();
        // expect((component as any).processAction).toHaveBeenCalled();
    }));

    it('test case with download', fakeAsync(() => {
        const authHolderService = TestBed.inject(AuthHolderService);
        const toastrService = TestBed.inject(ToastrService);
        const faileUploadDownloadService = TestBed.inject(FileUploadDownloadService);
        const statisticService = TestBed.inject(StatisticService);

        const error = {
            status: 401,
            message: 'You are not logged in',
        };

        jest.spyOn(authHolderService, 'isLoggedInUser').mockReturnValueOnce(true);
        jest.spyOn(component as any, 'installOwnership');
        jest.spyOn(toastrService, 'error');
        try{
            jest.spyOn(statisticService, 'record').mockReturnValue(throwError(error));
        }catch{}
        // jest.spyOn((component as any).statisticService, 'record');
        jest.spyOn(component as any, 'downloadFile');
        jest.spyOn(faileUploadDownloadService, 'downloadFileDetails');
        jest.spyOn(faileUploadDownloadService, 'getFileUrl');
        appData.ownership.ownershipStatus = 'OWNED';
        component.appData = appData;
        component.buttonAction = downloadButton;
        (component as any).onClick();
        tick();
        expect(authHolderService.isLoggedInUser).toHaveBeenCalled();
        expect((component as any).installOwnership).toHaveBeenCalled();
        expect((component as any).downloadFile).toHaveBeenCalled();
        expect(authHolderService.isLoggedInUser).toHaveBeenCalled();
        expect(statisticService.record).toHaveBeenCalled();
        expect(faileUploadDownloadService.downloadFileDetails).toHaveBeenCalled();
        expect(faileUploadDownloadService.getFileUrl).toHaveBeenCalled();
    }));

    it('test case with purchase', fakeAsync(() => {
        jest.spyOn((component as any).router, 'navigate');
        tick();
        component.buttonAction = buyNowButton;
        (component as any).onClick();
        expect(router.navigate).toHaveBeenCalledWith(['/checkout', '1234']);
    }));
});
