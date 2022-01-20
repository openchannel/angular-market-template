import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import {
    AppFormService,
    AuthHolderService,
    FileUploadDownloadService,
    OwnershipService,
    StatisticService,
} from '@openchannel/angular-common-services';
import { Observable, of, Subject, throwError } from 'rxjs';
import { catchError, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FullAppData, OcButtonComponent, OcFormModalComponent, OcConfirmationModalComponent } from '@openchannel/angular-common-components';
import { ActivatedRoute, Router } from '@angular/router';
import { get } from 'lodash';
import { HttpHeaders } from '@angular/common/http';
import { ActionButton, DownloadButtonType, FormButtonType } from 'assets/data/configData';

@Component({
    selector: 'app-button-action',
    templateUrl: './button-action.component.html',
    styleUrls: ['./button-action.component.scss'],
})
export class ButtonActionComponent implements OnInit, OnDestroy {
    @Input() buttonAction: ActionButton;
    @Input() appData: FullAppData;
    @Input() viewType: 'simple' | 'button' = 'button';
    @Output() readonly updateAppData: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild('rejectButton') rejectButton: TemplateRef<OcButtonComponent>;
    @ViewChild('confirmButton') confirmButton: TemplateRef<OcButtonComponent>;

    private $destroy: Subject<void> = new Subject();

    private loader: LoadingBarState;

    inProcess = false;

    constructor(
        private formService: AppFormService,
        private modal: NgbModal,
        private loadingBar: LoadingBarService,
        private toasterService: ToastrService,
        private authService: AuthHolderService,
        private ownershipService: OwnershipService,
        private fileService: FileUploadDownloadService,
        private router: Router,
        private statisticService: StatisticService,
        private activeRoute: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.loader = this.loadingBar.useRef();
    }

    ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
        if (this.loader) {
            this.loader.complete();
        }
        this.modal.dismissAll();
    }

    onClick(): void {
        switch (this.buttonAction.type) {
            case 'form':
                this.processForm(this.buttonAction);
                break;
            case 'install':
                this.installOwnership();
                break;
            case 'uninstall':
                this.uninstallOwnership();
                break;
            case 'download':
                this.downloadFile(this.buttonAction);
                break;
            case 'purchase':
                this.processPurchase();
                break;
            default:
                break;
        }
    }

    private processForm(formAction: FormButtonType): void {
        if (!this.inProcess) {
            this.loader.start();
            this.inProcess = true;
            // get form from API
            this.formService
                .getForm(formAction?.formId, new HttpHeaders({ 'x-handle-error': '404' }))
                .pipe(takeUntil(this.$destroy))
                .subscribe(
                    form => {
                        this.loader.complete();
                        this.inProcess = false;

                        // open modal with this form
                        this.openFormModal(form.name, form.fields, result => {
                            if (result) {
                                // create submission by this form
                                this.processAction(
                                    this.formService.createFormSubmission(
                                        form.formId,
                                        {
                                            appId: this.appData.appId,
                                            name: result.name,
                                            userId: '',
                                            email: result.email,
                                            formData: {
                                                ...result,
                                            },
                                        },
                                        new HttpHeaders({ 'x-handle-error': '429' }),
                                    ),
                                    err => {
                                        switch (err.status) {
                                            case 429:
                                                this.toasterService.error(formAction.showToaster.tooManyAttemptsMessage);
                                                break;
                                            default:
                                                this.toasterService.error(formAction.showToaster.errorMessage);
                                                break;
                                        }

                                        return throwError(err);
                                    },
                                );
                            }
                        });
                    },
                    () => {
                        this.toasterService.error(formAction.showToaster.notFoundFormMessage);
                        this.loader.complete();
                        this.inProcess = false;
                    },
                );
        }
    }

    private installOwnership(): void {
        if (!this.authService.isLoggedInUser()) {
            this.navigateToLoginPage();
        } else if (this.appData?.model?.length > 0) {
            this.processAction(
                this.ownershipService.installOwnership(
                    {
                        appId: this.appData.appId,
                        modelId: this.appData?.model[0].modelId,
                    },
                    new HttpHeaders({ 'x-handle-error': '403, 500' }),
                ),
                error => this.handleOwnershipResponseError(error, 'You don’t have permission to install this app'),
            );
        } else {
            this.toasterService.error('Missed any models for creating ownership.');
        }
    }

    private uninstallOwnership(): void {
        if (!this.authService.isLoggedInUser()) {
            this.navigateToLoginPage();
        } else {
            const modalRef = this.modal.open(OcConfirmationModalComponent, { size: 'md', backdrop: 'static' });

            modalRef.componentInstance.modalTitle = 'Delete App';
            modalRef.componentInstance.modalText = 'Are you sure you want to delete this app?';
            modalRef.componentInstance.confirmButtonText = 'Delete';
            modalRef.componentInstance.confirmButtonType = 'danger';
            modalRef.result.then(result => {
                if (result) {
                    this.processAction(
                        this.ownershipService.uninstallOwnership(
                            this.appData.ownership.ownershipId,
                            new HttpHeaders({ 'x-handle-error': '403, 500' }),
                        ),
                        error => this.handleOwnershipResponseError(error, 'You don’t have permission to uninstall this app'),
                        false,
                    );
                }
            });
        }
    }

    private processAction<T>(action: Observable<T>, errorHandler?: (error: any) => Observable<any>, reportStatistic: boolean = true): void {
        if (!this.inProcess) {
            this.inProcess = true;

            action
                .pipe(
                    mergeMap(res =>
                        reportStatistic && this.buttonAction.statistic
                            ? this.statisticService.record(this.buttonAction.statistic, this.appData.appId)
                            : of(res),
                    ),
                    catchError(
                        errorHandler
                            ? errorHandler
                            : error => {
                                  this.inProcess = false;
                                  if (error.status !== 429 && this.buttonAction?.showToaster?.errorMessage) {
                                      this.toasterService.error(this.buttonAction?.showToaster?.errorMessage);
                                  }

                                  return throwError(error);
                              },
                    ),
                    tap(() => {
                        this.inProcess = false;
                        if (this.buttonAction?.showToaster?.successMessage) {
                            this.toasterService.success(this.buttonAction?.showToaster?.successMessage);
                        }
                        this.updateAppData.emit();
                    }),
                    takeUntil(this.$destroy),
                )
                .subscribe();
        }
    }

    private openFormModal(modalTitle: string, formFields: any, callback: (formData: any) => void): void {
        if (!this.modal.hasOpenModals()) {
            this.modal.dismissAll('Opening a new button action modal');

            const modalRef = this.modal.open(OcFormModalComponent, { size: 'sm', backdrop: 'static' });
            modalRef.componentInstance.modalTitle = modalTitle;
            modalRef.componentInstance.confirmButton = this.confirmButton;
            modalRef.componentInstance.rejectButton = this.rejectButton;
            modalRef.componentInstance.formJsonData = {
                fields: formFields,
            };
            modalRef.result.then(callback, () => {});
        }
    }

    private downloadFile(actionConfig: DownloadButtonType): void {
        const file = get(this.appData, actionConfig.pathToFile);
        const regex: RegExp = new RegExp(/^(http(s)?:)?\/\//gm);
        if (regex.test(file)) {
            window.open(file);
        } else {
            this.fileService
                .downloadFileDetails(file)
                .pipe(
                    mergeMap(fileInfo => this.fileService.getFileUrl(fileInfo.fileId)),
                    tap(res => window.open(res.url)),
                    mergeMap(fileUrl =>
                        this.buttonAction.statistic
                            ? this.statisticService.record(this.buttonAction.statistic, this.appData.appId)
                            : of(fileUrl),
                    ),
                    takeUntil(this.$destroy),
                )
                .subscribe(() => {});
        }
    }

    private handleOwnershipResponseError(error: any, forbiddenMessage: string): Observable<never> {
        this.inProcess = false;
        if (error.status === 403) {
            this.toasterService.error(forbiddenMessage);
        } else if (this.buttonAction?.showToaster?.errorMessage) {
            this.toasterService.error(this.buttonAction?.showToaster?.errorMessage);
        }
        return throwError(error);
    }

    private processPurchase(): void {
        const safeName = this.activeRoute.snapshot.paramMap.get('safeName');
        this.router.navigate(['/checkout', safeName]).then();
    }

    private navigateToLoginPage(): void {
        this.router.navigate(['login'], { queryParams: { returnUrl: window.location.pathname } }).then();
    }
}
