import {Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
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
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
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

  @ViewChild('rejectButton') rejectButton: TemplateRef<OcButtonComponent>;
  @ViewChild('confirmButton') confirmButton: TemplateRef<OcButtonComponent>;

  public viewData: ViewData;

  public actionType: ActionType = null;

  private $destroy: Subject<void> = new Subject();

  private loader: LoadingBarState;

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
        this.processForm(this.appData.appId, this.buttonAction as FormButtonAction);
        break;
      case 'install':
        this.processOwnership(this.appData.appId, this.buttonAction as OwnershipButtonAction);
        break;
      case 'download':
        this.downloadFile(this.buttonAction as DownloadButtonAction);
        break;
      default:
        this.toasterService.error(`Error: invalid button type: ${this.buttonAction.type}`);
    }
  }

  private processForm(appId: string, formAction: FormButtonAction): void {
    this.loader.start();

    // get form from API
    this.formService.getForm(formAction?.formId)
    .pipe(takeUntil(this.$destroy))
    .subscribe(form => {
      this.loader.complete();

      // open modal with this form
      this.openFormModal(form.name, form.fields, (result) => {
        if (result) {
          result.appId = appId ? appId : null;
          this.loader.start();

          // create submission by this form
          this.formService.createFormSubmission(form.formId, result)
          .pipe(takeUntil(this.$destroy)).subscribe(() => {
            this.loader.complete();
            if (formAction?.message?.success) {
              this.toasterService.success(formAction?.message?.success);
            }
          }, () => {
            this.loader.complete();
            if (formAction?.message?.fail) {
              this.toasterService.error(formAction?.message?.fail);
            }
          });
        }
      });
    }, () => {
      this.loader.complete();
    });
  }

  private processOwnership(appId: string, ownAction: OwnershipButtonAction): void {
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
    // get all models
    if (this.appData?.model?.length > 0) {
      const modelOptions = this.appData?.model.map(model => model.modelId);
      const fields = [{
        id: 'modelId',
        label: 'Select Model',
        description: '',
        defaultValue: modelOptions[0],
        type: 'dropdownList',
        required: true,
        attributes: {required: true},
        options: modelOptions,
        subFieldDefinitions: null
      }];

      // open modal for creating a new ownership with model
      this.openFormModal('Install ownership', fields, (formData) => {
        if(formData) {
          this.loader.start()
          // create ownership
          this.ownershipService.installOwnership({
            appId: this.appData.appId,
            modelId: formData.modelId
          }).pipe(takeUntil(this.$destroy)).subscribe(() => {
            this.loader.complete();
            if(this.viewData?.message?.success) {
              this.toasterService.success(this.viewData?.message?.success);
            }
          }, () => {
            this.loader.complete();
            if(this.viewData?.message?.fail) {
              this.toasterService.error(this.viewData?.message?.fail);
            }
          })
        }
      })
    } else {
      this.toasterService.error('Missed any models for creating ownership.')
    }
  }

  private uninstallOwnership(): void {
    this.ownershipService.uninstallOwnership(this.appData.ownership.ownershipId)
    .pipe(takeUntil(this.$destroy)).subscribe(() => {
      if(this.viewData?.message?.success) {
        this.toasterService.success(this.viewData?.message?.success);
      }
    }, () => {
      if(this.viewData?.message?.fail) {
        this.toasterService.error(this.viewData?.message?.fail);
      }
    })
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
