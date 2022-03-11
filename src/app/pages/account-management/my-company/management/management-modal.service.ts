import {
    InviteUserService,
    UserAccount,
    UserAccountService,
    UserRoleService
} from '@openchannel/angular-common-services';
import { from, Observable, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OcConfirmationModalComponent } from '@openchannel/angular-common-components/src/lib/common-components';
import { catchError, filter} from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { OcInviteModalComponent, ModalUpdateUserModel } from '@openchannel/angular-common-components/src/lib/management-components';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ManagementModalService {

    constructor(
        private modal: NgbModal,
        private userRolesService: UserRoleService,
        private userAccountService: UserAccountService,
        private inviteUserService: InviteUserService,
    ) {}

    /**
     * Modal window for deleting an invite.
     * @return Observable<true>
     */
    openDeleteInviteModal(): Observable<boolean> {
        return this.openDeleteModal(
            'Delete invite',
            'Are you sure you want to delete this invite?',
            'Yes, delete invite', );
    }

    /**
     * Modal window for deleting current user account.
     * @return Observable<true>
     */
    openDeleteCurrentUserAccountModal(): Observable<boolean> {
        return this.openDeleteModal(
            'Delete user',
            "You can't delete yourself!",
            'Ok',
            'Close');
    }

    /**
     * Modal window for deleting another user account.
     * @return Observable<true>
     */
    openDeleteAnotherUserAccountModal(): Observable<boolean> {
        return this.openDeleteModal(
            'Delete user',
            'Delete this user from the marketplace now?',
            'Yes, delete user');
    }

    /**
     * Modal window for updating another user account.
     * @return Observable<true>
     */
    openEditUserAccountModal(userAccount: UserAccount): Observable<boolean> {
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
        return this.catchCancelModalStatus(modalRef.result);
    }

    /**
     * Modal window for updating another user invite.
     * @return Observable<true>
     */
    openEditUserInviteModal(userInvite: UserAccount): Observable<boolean> {
        const modalRef = this.modal.open(OcInviteModalComponent, { size: 'sm' });
        const modalData = new ModalUpdateUserModel();
        modalData.userData = userInvite;
        modalData.modalTitle = 'Edit invite';
        modalData.successButtonText = 'Save';
        modalData.requestFindUserRoles = () => this.userRolesService.getUserRoles(1, 100);
        modalData.requestUpdateAccount = (accountId: string, accountData: any) =>
            this.inviteUserService.editUserInvite(accountData.inviteId, accountData);

        modalRef.componentInstance.modalData = modalData;

        return this.catchCancelModalStatus(modalRef.result);
    }

    private openDeleteModal(
        modalTitle: string,
        modalText: string,
        confirmText: string,
        cancelText?: string,
    ): Observable<boolean> {
        const modalRef = this.modal.open(OcConfirmationModalComponent, { size: 'md' });
        const modalData = modalRef.componentInstance as OcConfirmationModalComponent;
        modalData.modalTitle = modalTitle;
        modalData.modalText = modalText;
        modalData.confirmButtonText = confirmText;
        modalData.confirmButtonType = 'danger';
        if (cancelText) {
            modalData.rejectButtonText = cancelText;
        }
        return this.catchCancelModalStatus(modalRef.result);
    }


    /**
     * All rejected values will be converted to the empty Observable.
     */
    private catchCancelModalStatus(modalResult: Promise<any>): Observable<boolean> {
        return from(modalResult).pipe(
            catchError(() => of()), // catch rejected status
            filter(isConfirm => isConfirm));
    }
}
