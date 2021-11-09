import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    AuthHolderService,
    InviteUserModel,
    InviteUserService,
    Page,
    UserAccount,
    UserAccountGridModel,
    UserAccountService,
    UserGridActionModel,
    UserRoleService,
    UsersGridParametersModel,
    UsersService,
} from '@openchannel/angular-common-services';
import { Observable, of, Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { OcConfirmationModalComponent, OcInviteModalComponent, ModalUpdateUserModel } from '@openchannel/angular-common-components';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { mergeMap, map, takeUntil, tap } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { SortField, UserGridSortOrder, UserSortChosen } from '@openchannel/angular-common-components/src/lib/management-components';

@Component({
    selector: 'app-management',
    templateUrl: './management.component.html',
    styleUrls: ['./management.component.scss'],
})
export class ManagementComponent implements OnInit, OnDestroy {
    userProperties: UsersGridParametersModel = {
        data: {
            pageNumber: 1,
            pages: 50,
            list: [],
            count: 0,
        },
        layout: 'table',
        options: ['EDIT', 'DELETE'],
    };

    tableSortFieldName: { [name in SortField]: string } = {
        name: 'name',
        email: 'email',
        role: 'roles',
        date: 'createdDate',
    };

    tableSortOptions: UserGridSortOrder = {
        role: -1,
        name: -1,
        email: -1,
        date: -1,
    };

    private listRoles: any = {};
    private sortQuery: string = `{'${this.tableSortFieldName.date}':${this.tableSortOptions.date}}`;

    private destroy$: Subject<void> = new Subject();
    private loader: LoadingBarState;

    private readonly USERS_LIMIT_PER_REQUEST = 30;
    private inProcessGettingUsers = false;

    constructor(
        private loadingBar: LoadingBarService,
        private userService: UsersService,
        private inviteUserService: InviteUserService,
        private userAccountService: UserAccountService,
        private userRolesService: UserRoleService,
        private toaster: ToastrService,
        private modal: NgbModal,
        private authHolderService: AuthHolderService,
    ) {}

    ngOnInit(): void {
        this.loader = this.loadingBar.useRef();
        this.getAllUsers(true);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.loader) {
            this.loader.complete();
        }
    }

    catchSortChanges(sortChosen: UserSortChosen): void {
        for (const field of Object.keys(sortChosen.sortOptions)) {
            if (field === sortChosen.changedSortOption) {
                this.tableSortOptions[field] = sortChosen.sortOptions[sortChosen.changedSortOption];
                // build sort query for the current table column
                this.sortQuery = `{\"${this.tableSortFieldName[sortChosen.changedSortOption]}\":
                ${this.tableSortOptions[sortChosen.changedSortOption]}}`;
            } else {
                this.tableSortOptions[field] = -1;
            }
        }
        this.getAllUsers(true);
    }

    getRoles(startNewPagination: boolean, oldRoles: any): Observable<any> {
        return startNewPagination
            ? this.userRolesService.getUserRoles(1, 100).pipe(
                  map(response => {
                      const tempRoles = {};
                      response.list.forEach(r => (tempRoles[r.userRoleId] = r.name));
                      return tempRoles;
                  }),
              )
            : of(oldRoles);
    }

    getAllUsers(startNewPagination: boolean): void {
        if (!this.inProcessGettingUsers) {
            this.loader.start();
            this.inProcessGettingUsers = true;
            if (startNewPagination) {
                this.userProperties.data.pageNumber = 1;
            }
            let inviteResponse: Page<InviteUserModel>;
            let activeResponse: Page<UserAccount>;
            this.inviteUserService
                .getUserInvites(this.userProperties.data.pageNumber, this.USERS_LIMIT_PER_REQUEST, this.sortQuery)
                .pipe(
                    tap(response => (inviteResponse = response)),
                    mergeMap(() =>
                        this.userAccountService.getUserAccounts(
                            this.userProperties.data.pageNumber,
                            this.USERS_LIMIT_PER_REQUEST,
                            this.sortQuery,
                        ),
                    ),
                    tap(response => (activeResponse = response)),
                    mergeMap(() => this.getRoles(startNewPagination, this.listRoles)),
                    tap(mappedRoles => (this.listRoles = mappedRoles)),
                    takeUntil(this.destroy$),
                )
                .subscribe(
                    () => {
                        this.loader.complete();

                        if (startNewPagination) {
                            this.userProperties.data.list = [];
                        }

                        const invites = inviteResponse.list.map(userInvite => this.mapToGridUserFromInvite(userInvite));

                        if (this.userProperties.data.pageNumber === 1) {
                            this.userProperties.data.list.push(...invites);
                        } else {
                            const lastInvitedDev = this.userProperties.data.list.filter(user => user.inviteStatus === 'INVITED').pop();
                            if (lastInvitedDev) {
                                this.userProperties.data.list.splice(
                                    this.userProperties.data.list.lastIndexOf(lastInvitedDev) + 1,
                                    0,
                                    ...invites,
                                );
                            }
                        }
                        // push new users
                        this.userProperties.data.pageNumber++;
                        this.userProperties.data.list.push(...activeResponse.list.map(user => this.mapToGridUserFromUser(user)));
                        this.inProcessGettingUsers = false;
                    },
                    () => {
                        this.loader.complete();
                        this.inProcessGettingUsers = false;
                    },
                );
        }
    }

    userAction(userAction: UserGridActionModel): void {
        const user = this.findUserByAction(userAction);
        if (user) {
            switch (userAction.action) {
                case 'DELETE':
                    this.deleteUser(userAction, user);
                    break;
                case 'EDIT':
                    this.editUser(userAction, user);
                    break;
                default:
                    // tslint:disable-next-line:no-console
                    console.error('Not implement');
            }
        } else {
            // tslint:disable-next-line:no-console
            console.error("Can't find user from mail array by action");
        }
    }

    deleteUser(userAction: UserGridActionModel, user: UserAccountGridModel): void {
        if (user?.inviteStatus === 'INVITED') {
            this.deleteInvite(user);
        } else if (user?.inviteStatus === 'ACTIVE') {
            this.deleteAccount(user);
        } else {
            // tslint:disable-next-line:no-console
            console.error('Not implement edit type : ', user?.inviteStatus);
        }
    }

    deleteInvite(user: UserAccountGridModel): void {
        this.openDeleteModal('Delete invite', 'Are you sure you want to delete this invite?', 'Yes, delete invite', () =>
            this.inviteUserService.deleteUserInvite(user?.inviteId).subscribe(() => {
                this.deleteUserFromResultArray(user);
                this.toaster.success('Invite has been deleted');
            }),
        );
    }

    deleteAccount(user: UserAccountGridModel): void {
        if (user.userAccountId === this.authHolderService.userDetails.individualId) {
            this.openDeleteModal('Delete user', "You can't delete yourself!", 'Ok', null, 'Close');
        } else {
            this.openDeleteModal('Delete user', 'Delete this user from the marketplace now?', 'Yes, delete user', () =>
                this.userAccountService.deleteUserAccount(user?.userAccountId).subscribe(() => {
                    this.deleteUserFromResultArray(user);
                    this.toaster.success('User has been deleted from your organization');
                }),
            );
        }
    }

    private mapToGridUserFromUser(user: UserAccount): UserAccountGridModel {
        return {
            ...user,
            name: user.name,
            email: user.email,
            customData: user.customData,
            userId: user.userId,
            userAccountId: user.userAccountId,
            created: user.created,
            inviteStatus: 'ACTIVE',
            roles: this.toRoleName(user.roles),
        };
    }

    private toRoleName(userRoles: string[]): any[] {
        const roleName = [];
        userRoles?.forEach(r => roleName.push(this.listRoles[r]));
        return roleName;
    }

    private mapToGridUserFromInvite(user: InviteUserModel): UserAccountGridModel {
        return {
            ...user,
            name: user.name,
            email: user.email,
            customData: user.customData,
            userId: user.userId,
            userAccountId: user.userAccountId,
            created: user.createdDate,
            inviteId: user.userInviteId,
            inviteToken: user.token,
            inviteStatus: 'INVITED',
            roles: this.toRoleName(user.roles),
        };
    }

    private findUserByAction(userAction: UserGridActionModel): UserAccountGridModel {
        if (this.userProperties.data.list?.length > 0) {
            if (userAction?.inviteId) {
                return this.userProperties.data.list.filter(developer => developer?.inviteId === userAction.inviteId)[0];
            } else {
                return this.userProperties.data.list.filter(developer => developer?.userAccountId === userAction.userAccountId)[0];
            }
        }
        return null;
    }

    private openDeleteModal(
        modalTitle: string,
        modalText: string,
        confirmText: string,
        deleteCallback: () => void,
        cancelText?: string,
    ): void {
        const modalSuspendRef = this.modal.open(OcConfirmationModalComponent, { size: 'md' });
        modalSuspendRef.componentInstance.modalTitle = modalTitle;
        modalSuspendRef.componentInstance.modalText = modalText;
        modalSuspendRef.componentInstance.confirmButtonText = confirmText;
        modalSuspendRef.componentInstance.confirmButtonType = 'danger';
        if (cancelText) {
            modalSuspendRef.componentInstance.rejectButtonText = cancelText;
        }
        modalSuspendRef.result.then(deleteCallback, () => {});
    }

    private editUser(userAction: UserGridActionModel, user: UserAccountGridModel): void {
        const userAccount = { ...user };
        if (user?.inviteStatus === 'INVITED') {
            this.editUserInvite(userAccount);
        } else if (user?.inviteStatus === 'ACTIVE') {
            this.editUserAccount(userAccount);
        } else {
            // tslint:disable-next-line:no-console
            console.error('Not implement edit type : ', user?.inviteStatus);
        }
    }

    private editUserAccount(userAccount: UserAccount): void {
        const modalRef = this.modal.open(OcInviteModalComponent, { size: 'sm' });
        modalRef.componentInstance.ngbModalRef = modalRef;

        const modalData = new ModalUpdateUserModel();
        modalData.userData = cloneDeep(userAccount);
        modalData.modalTitle = 'Edit member';
        modalData.successButtonText = 'Save';

        modalData.requestFindUserRoles = () => {
            return this.userRolesService.getUserRoles(1, 100);
        };

        modalData.requestUpdateAccount = (accountId: string, accountData: any) => {
            return this.userAccountService.updateUserAccountFieldsForAnotherUser(accountId, true, accountData);
        };

        modalRef.componentInstance.modalData = modalData;
        modalRef.result.then(
            () => {
                this.getAllUsers(true);
                this.toaster.success('User details have been updated');
            },
            () => {},
        );
    }

    private deleteUserFromResultArray(user: UserAccountGridModel): void {
        if (this.userProperties.data.list?.length > 0) {
            const userIndex = this.userProperties.data.list.indexOf(user);
            if (userIndex >= 0) {
                this.userProperties.data.list.splice(userIndex, 1);
            }
        }
    }

    private editUserInvite(userInvite: UserAccount): void {
        const modalRef = this.modal.open(OcInviteModalComponent, { size: 'sm' });
        const modalData = new ModalUpdateUserModel();
        modalData.userData = userInvite;
        modalData.modalTitle = 'Edit invite';
        modalData.successButtonText = 'Save';
        modalData.requestFindUserRoles = () => this.userRolesService.getUserRoles(1, 100);
        modalData.requestUpdateAccount = (accountId: string, accountData: any) =>
            this.inviteUserService.editUserInvite(accountData.inviteId, accountData);
        modalRef.componentInstance.modalData = modalData;
        modalRef.result.then(
            () => {
                this.getAllUsers(true);
                this.toaster.success('User details have been updated');
            },
            () => {},
        );
    }
}
