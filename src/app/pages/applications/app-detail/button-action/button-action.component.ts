import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  ButtonAction, DownloadButtonAction,
  FormButtonAction,
  OwnershipButtonAction, ViewData,
} from './models/button-action.model';
import {
  AppFormService,
  AuthHolderService,
  FullAppData, OwnershipService,
  FileUploadDownloadService
} from 'oc-ng-common-service';
import {Observable, Subject, throwError} from 'rxjs';
import {catchError, takeUntil, tap} from 'rxjs/operators';
import {LoadingBarState} from '@ngx-loading-bar/core/loading-bar.state';
import {LoadingBarService} from '@ngx-loading-bar/core';
import {ToastrService} from 'ngx-toastr';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {OcButtonComponent, OcFormModalComponent} from 'oc-ng-common-component';
import {Router} from '@angular/router';
import * as _ from 'lodash';

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
        if(this.appData?.ownership?.ownershipStatus === 'active') {
          this.setViewData('OWNED', (this.buttonAction as OwnershipButtonAction)?.owned);
        } else {
          this.setViewData('UNOWNED', (this.buttonAction as OwnershipButtonAction)?.unowned);
        }
        break;
      case 'download':
          this.viewData = {
            button: (this.buttonAction as DownloadButtonAction).button,
            message: null
          }
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
    this.loader.start();

    // get form from API
    this.formService.getForm(formAction?.formId)
    .pipe(takeUntil(this.$destroy))
    .subscribe(form => {
      this.loader.complete();

      // open modal with this form
      this.openFormModal(form.name, form.fields, (result) => {
        if (result) {
          result.appId = this.appData.appId ? this.appData.appId : null;

          // create submission by this form
          this.processAction(this.formService.createFormSubmission(form.formId, result));
        }
      });
    }, () => {
      this.loader.complete();
    });
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
          modelId: this.appData?.model[0].modelId
        }));
    } else {
      this.toasterService.error('Missed any models for creating ownership.')
    }
  }

  private uninstallOwnership(): void {
    this.processAction(this.ownershipService.uninstallOwnership(this.appData.ownership.ownershipId));
  }

  private processAction<T>(action: Observable<T>): void {
    if (!this.inProcess) {
      this.inProcess = true;
      action.pipe(takeUntil(this.$destroy), catchError(error => {
        this.inProcess = false;
        if (this.viewData?.message?.fail) {
          this.toasterService.error(this.viewData?.message?.success);
        }
        return throwError(error);
      }), tap(() => {
        this.inProcess = false;
        if (this.viewData?.message?.success) {
          this.toasterService.success(this.viewData?.message?.success);
        }
        this.updateAppData.emit();
      })).subscribe();
    }
  }

  private openFormModal(modalTitle: string, formFields: any, callback: (formData: any) => void): void {

    const modalRef = this.modal.open(OcFormModalComponent, {size: 'sm'});
    modalRef.componentInstance.ngbModalRef = modalRef;
    modalRef.componentInstance.modalTitle = modalTitle;
    modalRef.componentInstance.confirmButton = this.confirmButton;
    modalRef.componentInstance.rejectButton = this.rejectButton;
    modalRef.componentInstance.formJsonData = {
      fields: formFields
    };
    modalRef.result.then(result => callback(result));
  }

  private downloadFile(actionConfig: DownloadButtonAction) {
    const file = _.get(this.appData, actionConfig.fileField);
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
}
