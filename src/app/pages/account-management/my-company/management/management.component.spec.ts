import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManagementComponent } from './management.component';
import {
    mockInviteUserServiceProvider,
    mockInviteUserAccountServiceProvider,
    mockUserServiceProvider,
    mockToastrService,
    mockUserRoleServiceProvider,
    MockOcMenuUserGridComponent, MockUserRoleService,
} from '../../../../../mock/mock';
import {Observable, of, throwError} from 'rxjs';
import {UserAccount} from '@openchannel/angular-common-services';
import { ManagementModalService } from './management-modal.service';
import {InviteUserModel} from '@openchannel/angular-common-services/lib/model/api/invite-user.model';
import {times} from 'lodash';

class MockManagementModalService {
     openDeleteInviteModal(): Observable<boolean> {
         return null;
     }

     openDeleteCurrentUserAccountModal(): Observable<boolean> {
         return null;
     }

     openDeleteAnotherUserAccountModal(): Observable<boolean> {
         return null;
     }

     openEditUserAccountModal(userAccount: UserAccount): Observable<boolean> {
         return null;
     }

     openEditUserInviteModal(userInvite: UserAccount): Observable<boolean> {
         return null;
     }
}

jest.mock('./management-modal.service', () => {
    class ManagementModalService {}
    return {ManagementModalService};
})

describe('ManagementComponent', () => {
    let component: ManagementComponent;
    let fixture: ComponentFixture<ManagementComponent>;

    const userId = "testUserId";

    const mainUserAccount: UserAccount = {
        userAccountId: "mainUserAccountId",
        userId,
        name: 'mainUserAccount',
        roles: [MockUserRoleService.ADMIN_ROLE_ID]
    } as UserAccount;

    const userInvites: InviteUserModel[] = times(3, (index) => ({
        userId,
        userInviteId: `inviteId_${index}`,
        userAccountId: `inviteAccountId_${index}`,
        name: `inviteName_${index}`,
        roles: [MockUserRoleService.ADMIN_ROLE_ID]
    }));

    const userAccounts: UserAccount[] = times(3, (index) => ({
        userId,
        userAccountId: `userAccountId_${index}`,
        name: `userAccountName_${index}`,
        roles: [MockUserRoleService.ADMIN_ROLE_ID],
    }));

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                providers: [
                    { provide: ManagementModalService, useClass: MockManagementModalService },
                    mockUserServiceProvider(),
                    mockUserRoleServiceProvider(),
                    mockToastrService(),
                    mockInviteUserServiceProvider(userInvites),
                    mockInviteUserAccountServiceProvider(mainUserAccount, userAccounts),
                ],
                declarations: [ManagementComponent, MockOcMenuUserGridComponent ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ManagementComponent);
        component = fixture.componentInstance;
        (component as any)['USERS_LIMIT_PER_REQUEST'] = 1;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('Component life cycle function ngOnDestroy. destroy$ and loader bar must be closed.', () => {
        fixture.detectChanges();

        jest.spyOn((component as any).destroy$, 'next');
        jest.spyOn((component as any).destroy$, 'complete');
        jest.spyOn((component as any).loader, 'complete');

        component.ngOnDestroy();
        fixture.detectChanges();

        expect((component as any).destroy$.next).toHaveBeenCalled();
        expect((component as any).destroy$.complete).toHaveBeenCalled();
        expect((component as any).loader.complete).toHaveBeenCalled();
    })

    it('The loader bar must be opened and then closed when we load new users and invites. All HTTP requests with successful responses.', () => {
        fixture.detectChanges();
        jest.spyOn((component as any).loader, 'start');
        jest.spyOn((component as any).loader, 'complete');
        component.getAllUsers(false);
        fixture.detectChanges();

        expect((component as any).loader.start).toHaveBeenCalled();
        expect((component as any).loader.complete).toHaveBeenCalled();
    });

    it('The loader bar must be opened and then closed when we load new users and invites. HTTP request for getting users will be failed.', () => {
        fixture.detectChanges();

        jest.spyOn((component as any).loader, 'start');
        jest.spyOn((component as any).loader, 'complete');

        jest.spyOn((component as any).userAccountService, 'getUserAccounts')
        .mockReturnValue(throwError(() => 'an error'));

        component.getAllUsers(false);
        fixture.detectChanges();

        expect((component as any).loader.start).toHaveBeenCalled();
        expect((component as any).loader.complete).toHaveBeenCalled();
    });

    it('Start new pagination for getting users and invites.', () => {
        fixture.detectChanges(); // load first page.
        component.getAllUsers(false); // load second page, total loaded users with invites must be 4.
        fixture.detectChanges();
        expect(component.userProperties.data.list.length).toBe(4);
        const accountIdsFromTwoPages = component.userProperties.data.list.map(account => account.userAccountId);

        expect(accountIdsFromTwoPages.length).toBe(4);

        component.getAllUsers(true); // clear old pages and load one new page, total loaded users with invites must be 2.
        fixture.detectChanges();

        expect(component.userProperties.data.list.length).toBe(2);

        component.getAllUsers(false); // load second page, total loaded users with invites must be 4.
        fixture.detectChanges();

        expect(component.userProperties.data.list.length).toBe(4);
        expect(component.userProperties.data.list[0].userAccountId).toBe(accountIdsFromTwoPages[0]);
        expect(component.userProperties.data.list[1].userAccountId).toBe(accountIdsFromTwoPages[1]);
        expect(component.userProperties.data.list[2].userAccountId).toBe(accountIdsFromTwoPages[2]);
        expect(component.userProperties.data.list[3].userAccountId).toBe(accountIdsFromTwoPages[3]);
    })

    it('Table scrolling and loading a new invites and accounts.', () => {
        fixture.detectChanges();
        // first page, will be loaded in the ngOnInit function.
        expect(component.userProperties.data.list.length).toBe(2);
        expect(component.userProperties.data.list[0].inviteStatus).toBe('INVITED');
        expect(component.userProperties.data.list[0].userAccountId).toBe('inviteAccountId_0');
        expect(component.userProperties.data.list[1].inviteStatus).toBe('ACTIVE');
        expect(component.userProperties.data.list[1].userAccountId).toBe('mainUserAccountId');

        // second page
        component.getAllUsers(false);
        fixture.detectChanges();
        expect(component.userProperties.data.list.length).toBe(4);
        expect(component.userProperties.data.list[0].userAccountId).toBe('inviteAccountId_0');
        expect(component.userProperties.data.list[1].userAccountId).toBe('inviteAccountId_1');
        expect(component.userProperties.data.list[2].userAccountId).toBe('mainUserAccountId');
        expect(component.userProperties.data.list[3].userAccountId).toBe('userAccountId_0');
    });

    it('Mapping role Id in role name for invite/account models.', () => {
        fixture.detectChanges();
        expect(component.userProperties.data.list[0].roles).toEqual([MockUserRoleService.ADMIN_ROLE_NAME]);
        expect(component.userProperties.data.list[1].roles).toEqual([MockUserRoleService.ADMIN_ROLE_NAME]);
    });

    /**
     * OpenChannel docs for sorting API {@link https://support.openchannel.io/documentation/api/#381-sort-document}.
     * Value (-1) - descending
     * Value (1) - ascending
     */
    it('Default sorting by created date (descending).', () => {
        jest.spyOn((component as any).inviteUserService, 'getUserInvites');
        jest.spyOn((component as any).userAccountService, 'getUserAccounts');
        fixture.detectChanges();
        const searchQuery = "{'createdDate':-1}";
        expect((component as any).inviteUserService.getUserInvites).toHaveBeenCalledWith(1, 1, searchQuery);
        expect((component as any).userAccountService.getUserAccounts).toHaveBeenCalledWith(1, 1, searchQuery);
    });

    it('Change sorting to created date (ascending).', () => {
        fixture.detectChanges();
        jest.spyOn((component as any).inviteUserService, 'getUserInvites');
        jest.spyOn((component as any).userAccountService, 'getUserAccounts');

        component.catchSortChanges({
            sortOptions: {
                role: -1,
                name: -1,
                email: -1,
                date: 1,
            },
            changedSortOption: 'date'
        });

        fixture.detectChanges();
        const searchQuery = '{\"createdDate\":1}';
        expect((component as any).inviteUserService.getUserInvites).toHaveBeenCalledWith(1, 1, searchQuery);
        expect((component as any).userAccountService.getUserAccounts).toHaveBeenCalledWith(1, 1, searchQuery);
    });

    it('Change sorting to email (descending).', () => {
        fixture.detectChanges();
        jest.spyOn((component as any).inviteUserService, 'getUserInvites');
        jest.spyOn((component as any).userAccountService, 'getUserAccounts');

        component.catchSortChanges({
            sortOptions: {
                role: -1,
                name: -1,
                email: 1,
                date: 1,
            },
            changedSortOption: 'email'
        });

        fixture.detectChanges();
        const searchQuery = '{\"email\":1}';
        expect((component as any).inviteUserService.getUserInvites).toHaveBeenCalledWith(1, 1, searchQuery);
        expect((component as any).userAccountService.getUserAccounts).toHaveBeenCalledWith(1, 1, searchQuery);
    });

    it('Delete user invite. When modal returns a success status.', () => {
        const inviteId = 'inviteId_0';
        fixture.detectChanges(); // loading user and invites.
        deleteUserInvite(inviteId, true);
        expect((component as any).inviteUserService.deleteUserInvite).toHaveBeenCalledWith(inviteId);
    });

    it('Delete user invite. When modal returns a reject status.', () => {
        const inviteId = 'inviteId_0';
        fixture.detectChanges(); // loading user and invites.
        deleteUserInvite(inviteId, false);
        expect((component as any).inviteUserService.deleteUserInvite).not.toHaveBeenCalled();
    });

    it('Delete the current user account. When modal returns a success status.', () => {
        deleteCurrentUserAccount(true);
        expect((component as any).userAccountService.deleteUserAccount).not.toHaveBeenCalled();
    });

    it('Delete the current user account. When modal returns a reject status.', () => {
        deleteCurrentUserAccount(false);
        expect((component as any).userAccountService.deleteUserAccount).not.toHaveBeenCalled();
    });

    it('Delete the another user account. When modal returns a success status.', () => {
        const userAccountId = 'userAccountId_0';
        deleteAnotherUserAccount(userAccountId, true);
        expect((component as any).userAccountService.deleteUserAccount).toHaveBeenCalledWith(userAccountId);
    });

    it('Delete the another user account. When modal returns a reject status.', () => {
        const userAccountId = 'userAccountId_0';
        deleteAnotherUserAccount(userAccountId, false);
        expect((component as any).userAccountService.deleteUserAccount).not.toHaveBeenCalled();
    });

    it('Open edit invite modal.', () => {
        fixture.detectChanges();

        jest.spyOn((component as any).managementModalService, 'openEditUserInviteModal').mockReturnValue(toModalResult(true));

        component.getAllUsers(false);

        component.userAction({
            userId,
            action: 'EDIT',
            inviteId: 'inviteId_0',
        })

        fixture.detectChanges();

        expect((component as any).managementModalService.openEditUserInviteModal).toHaveBeenCalled();
    });

    it('Open edit user account modal.', () => {
        fixture.detectChanges();

        jest.spyOn((component as any).managementModalService, 'openEditUserAccountModal').mockReturnValue(toModalResult(true));

        component.userAction({
            userId,
            action: 'EDIT',
            userAccountId: 'mainUserAccountId',
        });
        fixture.detectChanges();
        expect((component as any).managementModalService.openEditUserAccountModal).toHaveBeenCalled()
    });

    function deleteUserInvite(inviteId: string, modalResult: boolean) {
        jest.spyOn((component as any).managementModalService, 'openDeleteInviteModal').mockReturnValue(toModalResult(modalResult));
        jest.spyOn((component as any).inviteUserService, 'deleteUserInvite');
        component.userAction({
            userId,
            inviteId,
            action: 'DELETE',
        });

        fixture.detectChanges();
    }

    function deleteCurrentUserAccount(modalResult: boolean) {
        const userAccountId = 'mainUserAccountId';

        (component as any).authHolderService.userDetails = {
            individualId: userAccountId
        };

        fixture.detectChanges(); // loading user and invites.

        expect(component.userProperties.data.list[1].userAccountId).toBe(userAccountId);

        jest.spyOn((component as any).managementModalService, 'openDeleteCurrentUserAccountModal').mockReturnValue(toModalResult(modalResult));
        jest.spyOn((component as any).userAccountService, 'deleteUserAccount');

        component.userAction({
            userId,
            userAccountId,
            action: 'DELETE',
        });

        fixture.detectChanges();

        expect((component as any).managementModalService.openDeleteCurrentUserAccountModal).toHaveBeenCalled();
    }

    function deleteAnotherUserAccount(userAccountId: string, modalResult: boolean): void {

        (component as any).authHolderService.userDetails = { individualId: 'mainUserAccountId' };

        // loading first page
        fixture.detectChanges();

        // second page
        component.getAllUsers(false);
        fixture.detectChanges();

        expect(component.userProperties.data.list[3].userAccountId).toBe(userAccountId);

        jest.spyOn((component as any).managementModalService, 'openDeleteAnotherUserAccountModal').mockReturnValue(toModalResult(modalResult));
        jest.spyOn((component as any).userAccountService, 'deleteUserAccount');

        component.userAction({
            userId,
            userAccountId,
            action: 'DELETE',
        });

        fixture.detectChanges();
    }

    function toModalResult(modalResult: boolean): Observable<boolean> {
        return modalResult ? of(modalResult) : of();
    }
});
