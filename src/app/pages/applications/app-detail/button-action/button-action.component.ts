import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonAction,
  DownloadButtonAction,
  FormButtonAction,
  OwnershipButtonAction,
  ViewData,
} from './models/button-action.model';
import {
  AppFormService,
  AuthHolderService,
  FileUploadDownloadService,
  OwnershipService,
} from '@openchannel/angular-common-services';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OcButtonComponent, OcFormModalComponent, FullAppData } from '@openchannel/angular-common-components';
import { Router } from '@angular/router';
import { get } from 'lodash';
import { HttpHeaders } from '@angular/common/http';

declare type ActionType = 'OWNED' | 'UNOWNED';

@Component({
  selector: 'app-button-action',
  templateUrl: './button-action.component.html',
  styleUrls: ['./button-action.component.scss']
})
export class ButtonActionComponent implements OnInit, OnDestroy {

  @Input() buttonAction: ButtonAction;
  @Input() appData: FullAppData;
  @Output() updateAppData: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('rejectButton') rejectButton: TemplateRef<OcButtonComponent>;
  @ViewChild('confirmButton') confirmButton: TemplateRef<OcButtonComponent>;

  public viewData: ViewData;

  public actionType: ActionType = null;

  private $destroy: Subject<void> = new Subject();

  private loader: LoadingBarState;

  public inProcess = false;

  constructor(private formService: AppFormService,
              private modal: NgbModal,
              private loadingBar: LoadingBarService,
              private toasterService: ToastrService,
              private authService: AuthHolderService,
              private ownershipService: OwnershipService,
              private fileService: FileUploadDownloadService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.loader = this.loadingBar.useRef();
    this.initButtonData();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
    if (this.loader) {
      this.loader.complete();
    }
  }

  initButtonData(): void {

    switch (this.buttonAction.type) {
      case 'form':
        this.setViewData(null, (this.buttonAction as FormButtonAction));
        break;
      case 'install':
        if (this.appData?.ownership?.ownershipStatus === 'active') {
          this.setViewData('OWNED', (this.buttonAction as OwnershipButtonAction)?.owned);
        } else {
          this.setViewData('UNOWNED', (this.buttonAction as OwnershipButtonAction)?.unowned);
        }
        break;
      case 'download':
          this.viewData = {
            button: (this.buttonAction as DownloadButtonAction).button,
            message: null
          };
          break;
      default:
        this.toasterService.error(`Error: invalid button type: ${this.buttonAction.type}`);
    }
  }

  private setViewData(actionType: ActionType, viewData: ViewData): void {
    this.actionType = actionType;
    this.viewData = viewData;
  }

  onClick() {
    switch (this.buttonAction.type) {
      case 'form':
        this.processForm(this.buttonAction as FormButtonAction);
        break;
      case 'install':
        this.processOwnership();
        break;
      case 'download':
        this.downloadFile(this.buttonAction as DownloadButtonAction);
        break;
      default:
        this.toasterService.error(`Error: invalid button type: ${this.buttonAction.type}`);
    }
  }

  private processForm(formAction: FormButtonAction): void {
    if (!this.inProcess) {
      this.loader.start();
      this.inProcess = true;
      // get form from API
      this.formService.getForm(formAction?.formId)
        .pipe(takeUntil(this.$destroy))
        .subscribe(form => {
          this.loader.complete();
          this.inProcess = false;

          // open modal with this form
          this.openFormModal(form.name, form.fields, (result) => {
            if (result) {
              // create submission by this form
              this.processAction(this.formService.createFormSubmission(form.formId, {
                appId: this.appData.appId,
                name: result.name,
                userId: '',
                email: result.email,
                formData: {
                  ...result,
                },
              }));
            }
          });
        }, () => {
          this.loader.complete();
          this.inProcess = false;
        });
    }
  }

  private processOwnership(): void {
    if (this.authService.isLoggedInUser()) {
      switch (this.actionType) {
        case 'OWNED':
          this.uninstallOwnership();
          break;
        case 'UNOWNED':
          this.installOwnership();
          break;
        default:
          this.toasterService.error(`Error: invalid owned button type: ${this.actionType}`);
      }
    } else {
      this.router.navigate(['login'], {queryParams: {returnUrl: window.location.pathname}})
      .then();
    }
  }

  private installOwnership(): void {
    if (this.appData?.model?.length > 0) {
      this.processAction(this.ownershipService.installOwnership({
          appId: this.appData.appId,
          modelId: this.appData?.model[0].modelId,
        },
        new HttpHeaders({'x-handle-error': '403, 500'})),
          (error) => this.handleOwnershipResponseError(error,
              "You don’t have permission to install this app"));
    } else {
      this.toasterService.error('Missed any models for creating ownership.');
    }
  }

  private uninstallOwnership(): void {
    this.processAction(this.ownershipService.uninstallOwnership(
        this.appData.ownership.ownershipId, new HttpHeaders({'x-handle-error': '403, 500'})),
        (error) => this.handleOwnershipResponseError(error,
            "You don’t have permission to uninstall this app"));
  }

  private processAction<T>(action: Observable<T>, errorHandler?: (error: any) => Observable<any>): void {
    if (!this.inProcess) {
      this.inProcess = true;
      action.pipe(
        catchError(errorHandler ? errorHandler : error => {
          this.inProcess = false;
          if (this.viewData?.message?.fail) {
            this.toasterService.error(this.viewData?.message?.fail);
          }
          return throwError(error);
        }),
        tap(() => {
          this.inProcess = false;
          if (this.viewData?.message?.success) {
            this.toasterService.success(this.viewData?.message?.success);
          }
          this.updateAppData.emit();
        }),
        takeUntil(this.$destroy)).subscribe();
    }
  }

  private openFormModal(modalTitle: string, formFields: any, callback: (formData: any) => void): void {
    if (!this.modal.hasOpenModals()) {
      this.modal.dismissAll('Opening a new button action modal');

      const modalRef = this.modal.open(OcFormModalComponent, {size: 'sm'});
      modalRef.componentInstance.modalTitle = modalTitle;
      modalRef.componentInstance.confirmButton = this.confirmButton;
      modalRef.componentInstance.rejectButton = this.rejectButton;
      modalRef.componentInstance.formJsonData = {
        fields: formFields
      };
      modalRef.result.then(result => callback(result), () => {});
    }
  }

  private downloadFile(actionConfig: DownloadButtonAction) {
    const file = get(this.appData, actionConfig.fileField);
    const regex: RegExp = new RegExp(/^(http(s)?:)?\/\//gm);
    if (regex.test(file)) {
      window.open(file);
    } else {
      this.fileService.downloadFileDetails(file).pipe(takeUntil(this.$destroy))
        .subscribe(fileInfo => this.fileService.getFileUrl(fileInfo.fileId).pipe(takeUntil(this.$destroy))
          .subscribe(res => {
            window.open(res.url);
          }));
    }
  }

  private handleOwnershipResponseError(error: any, forbiddenMessage: string) {
    this.inProcess = false;
    if (error.status === 403) {
      this.toasterService.error(forbiddenMessage);
    } else if (this.viewData?.message?.fail) {
      this.toasterService.error(this.viewData?.message?.fail);
    }
    return throwError(error);
  }
}
