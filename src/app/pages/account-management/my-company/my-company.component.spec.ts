import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { MyCompanyComponent } from './my-company.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
    MockAuthHolderService,
    MockCompanyDetailsComponent,
    MockInviteModalComponent,
    MockInviteUserService,
    MockManagementComponent,
    MockModalInviteUserModel,
    MockNgbModal,
    MockPageTitleComponent,
    MockRoutingComponent,
    MockToastrService,
    MockUserRoleService,
    MockUsersService,
} from '../../../../mock/mock';
import { ToastrService } from 'ngx-toastr';
import { AuthHolderService, InviteUserService, UserRoleService, UsersService } from '@openchannel/angular-common-services';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

jest.mock('@openchannel/angular-common-components', () => ({
    ModalInviteUserModel: jest.fn().mockImplementation(() => MockModalInviteUserModel),
    OcInviteModalComponent: jest.fn().mockImplementation(() => MockInviteModalComponent),
}));

describe('MyCompanyComponent', () => {
    let component: MyCompanyComponent;
    let fixture: ComponentFixture<MyCompanyComponent>;
    let router: Router;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [MyCompanyComponent, MockPageTitleComponent, MockCompanyDetailsComponent, MockManagementComponent],
                imports: [
                    RouterTestingModule.withRoutes([
                        {
                            path: 'not-existing-page',
                            component: MockRoutingComponent,
                        },
                        {
                            path: 'my-company/new-page',
                            component: MockRoutingComponent,
                        },
                    ]),
                ],
                providers: [
                    { provide: NgbModal, useClass: MockNgbModal },
                    { provide: ToastrService, useClass: MockToastrService },
                    { provide: AuthHolderService, useClass: MockAuthHolderService },
                    { provide: UserRoleService, useClass: MockUserRoleService },
                    { provide: UsersService, useClass: MockUsersService },
                    { provide: InviteUserService, useClass: MockInviteUserService },
                ],
            }).compileComponents();
            router = TestBed.inject(Router);
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(MyCompanyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should complete destroy$ and companyName$ in ngOnDestroy hook', () => {
        jest.spyOn((component as any).destroy$, 'complete');
        jest.spyOn((component as any).companyName$, 'complete');

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnDestroy();

        expect((component as any).destroy$.complete).toHaveBeenCalled();
        expect((component as any).companyName$.complete).toHaveBeenCalled();
    });

    it('filterPagesByUserType method should return empty array if the user has no permissions', () => {
        MockAuthHolderService.MOCK_HAS_ANY_PERMISSION_RESPONSE = false;

        expect((component as any).filterPagesByUserType()).toEqual([]);

        MockAuthHolderService.MOCK_HAS_ANY_PERMISSION_RESPONSE = true;
    });

    it('filterPagesByUserType method should return correct pages according to the user permissions', () => {
        MockAuthHolderService.MOCK_HAS_ANY_PERMISSION_RESPONSE = true;

        expect((component as any).filterPagesByUserType()).toEqual(component.pages);
    });

    it('initMainPage method should set first item of the currentPages to selectedPage if current url is not equal to any currentPages urls', fakeAsync(() => {
        router.navigate(['not-existing-page']);
        tick();

        (component as any).initMainPage();
        expect(component.selectedPage).toEqual(component.currentPages[0]);
    }));

    it('initMainPage method should set correct item of the currentPages to selectedPage if current url is equal to one of the currentPages urls', fakeAsync(() => {
        const newPage = {
            pageId: 'new-page',
            placeholder: 'New Page',
            routerLink: '/my-company/new-page',
            permissions: [],
        };

        component.currentPages.push(newPage);
        router.navigate([newPage.routerLink]);
        tick();

        (component as any).initMainPage();
        expect(component.selectedPage).toEqual(newPage);

        component.currentPages.pop();
    }));

    it('initCompanyName method should pass company name as a new value of companyName$ subject', fakeAsync(() => {
        jest.spyOn((component as any).companyName$, 'next');

        (component as any).initCompanyName();
        tick();

        expect((component as any).companyName$.next).toHaveBeenCalledWith(MockUsersService.MOCK_USER_COMPANY_RESPONSE.name);
    }));

    it('should set current pages in ngOnInit', () => {
        MockAuthHolderService.MOCK_HAS_ANY_PERMISSION_RESPONSE = true;
        component.currentPages = null;

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnInit();

        expect(component.currentPages).toEqual(component.pages);
    });

    it('should call initMainPage method in ngOnInit', () => {
        jest.spyOn(component as any, 'initMainPage');

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnInit();

        expect((component as any).initMainPage).toHaveBeenCalled();
    });

    it('should call initCompanyName method in ngOnInit', () => {
        jest.spyOn(component as any, 'initCompanyName');

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnInit();

        expect((component as any).initCompanyName).toHaveBeenCalled();
    });

    it('goToPage method should set new selectedPage', () => {
        const newPage = component.currentPages[0];
        component.selectedPage = null;

        component.gotoPage(newPage);

        expect(component.selectedPage).toEqual(newPage);
    });

    it('goToPage method should call location.replaceState method with newPage url', () => {
        const newPage = component.currentPages[0];
        jest.spyOn((component as any).location, 'replaceState');

        component.gotoPage(newPage);

        expect((component as any).location.replaceState).toHaveBeenCalledWith(newPage.routerLink);
    });

    it('goBack method should call history.back method', () => {
        history.back = jest.fn();

        component.goBack();

        expect(history.back).toHaveBeenCalled();
    });

    it('openInviteModal method should call modal.open method', () => {
        jest.spyOn((component as any).modal, 'open');

        component.openInviteModal();

        expect((component as any).modal.open).toHaveBeenCalled();
    });

    it('userRolesService.getUserRoles method should be called when invite modal invoke requestFindUserRoles method', () => {
        jest.spyOn((component as any).userRolesService, 'getUserRoles');

        component.openInviteModal();
        MockNgbModal.ACTIVE_MODALS[MockNgbModal.ACTIVE_MODALS.length - 1].componentInstance.modalData.requestFindUserRoles();

        expect((component as any).userRolesService.getUserRoles).toHaveBeenCalled();
    });

    it('inviteService.sendUserInvite method should be called when invite modal invoke requestSendInvite method', () => {
        jest.spyOn((component as any).inviteService, 'sendUserInvite');

        component.openInviteModal();
        MockNgbModal.ACTIVE_MODALS[MockNgbModal.ACTIVE_MODALS.length - 1].componentInstance.modalData.requestSendInvite();

        expect((component as any).inviteService.sendUserInvite).toHaveBeenCalled();
    });

    it('invite modal should call toaster.success and appManagement.getAllUsers methods when modal was closed', fakeAsync(() => {
        component.selectedPage = component.currentPages[1];
        fixture.detectChanges();

        jest.spyOn((component as any).toaster, 'success');
        (component as any).appManagement.getAllUsers = jest.fn();

        component.openInviteModal();
        MockNgbModal.ACTIVE_MODALS[MockNgbModal.ACTIVE_MODALS.length - 1].close();
        tick();

        expect((component as any).toaster.success).toHaveBeenCalled();
        expect((component as any).appManagement.getAllUsers).toHaveBeenCalled();
    }));

    it('goBack method should be called when app-page-title emits navigateClick', () => {
        jest.spyOn(component, 'goBack');

        const pageTitleDE = fixture.debugElement.query(By.directive(MockPageTitleComponent));
        pageTitleDE.triggerEventHandler('navigateClick', {});

        expect(component.goBack).toHaveBeenCalled();
    });

    it('should pass "Invite a member" to app-page-title buttonText if selectedPage is a profile page', () => {
        component.selectedPage = component.pages[1];
        fixture.detectChanges();

        const pageTitleInstance = fixture.debugElement.query(By.directive(MockPageTitleComponent)).componentInstance;
        expect(pageTitleInstance.buttonText).toBe('Invite a member');
    });

    it('should pass null to app-page-title buttonText if selectedPage is not a profile page', () => {
        component.selectedPage = component.pages[0];
        fixture.detectChanges();

        const pageTitleInstance = fixture.debugElement.query(By.directive(MockPageTitleComponent)).componentInstance;
        expect(pageTitleInstance.buttonText).toBeNull();
    });

    it('openInviteModal method should be called when app-page-title emits buttonClick', () => {
        jest.spyOn(component, 'openInviteModal');

        const pageTitleDE = fixture.debugElement.query(By.directive(MockPageTitleComponent));
        pageTitleDE.triggerEventHandler('buttonClick', {});
    });

    it('should render li items for each currentPages item', () => {
        const pagesItems = fixture.debugElement.queryAll(By.css('.page-link'));
        expect(component.currentPages.length).toBe(pagesItems.length);
    });

    it('gotoPage method should be called when page was clicked', () => {
        jest.spyOn(component, 'gotoPage');

        const pageLinkElement = fixture.debugElement.query(By.css('.page-link a')).nativeElement;
        pageLinkElement.click();

        expect(component.gotoPage).toHaveBeenCalledWith(component.currentPages[0]);
    });

    it('should add active-link class to page if it is a current page', () => {
        component.selectedPage = component.currentPages[0];
        fixture.detectChanges();

        const pageLinkElement = fixture.debugElement.query(By.css('.page-link a')).nativeElement;
        expect(pageLinkElement.classList.contains('active-link')).toBeTruthy();
    });

    it('should use page.placeholder as page name in template', () => {
        const pageLinkElement = fixture.debugElement.query(By.css('.page-link a')).nativeElement;
        expect(pageLinkElement.textContent.trim()).toBe(component.currentPages[0].placeholder.trim());
    });

    it('should render correct page according to selectedPage.pageId', () => {
        component.selectedPage = component.currentPages[0];
        fixture.detectChanges();

        const companyDetails = fixture.debugElement.query(By.directive(MockCompanyDetailsComponent));
        const management = fixture.debugElement.query(By.directive(MockManagementComponent));

        expect(companyDetails).toBeTruthy();
        expect(management).toBeNull();
    });
});
