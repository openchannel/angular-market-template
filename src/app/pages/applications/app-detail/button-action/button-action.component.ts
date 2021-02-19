import {Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ButtonAction} from './models/button-action.model';
import {AppFormModel, AppFormService,} from 'oc-ng-common-service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {LoadingBarState} from '@ngx-loading-bar/core/loading-bar.state';
import {LoadingBarService} from '@ngx-loading-bar/core';
import {ToastrService} from 'ngx-toastr';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {OcButtonComponent, OcFormModalComponent} from 'oc-ng-common-component';

@Component({
  selector: 'app-button-action',
  templateUrl: './button-action.component.html',
  styleUrls: ['./button-action.component.scss']
})
export class ButtonActionComponent implements OnInit, OnDestroy {

  @Input() buttonAction: ButtonAction;
  @Input() appId: string;

  @ViewChild('rejectButton') rejectButton: TemplateRef<OcButtonComponent>;
  @ViewChild('confirmButton') confirmButton: TemplateRef<OcButtonComponent>;

  public process = false;

  private $destroy: Subject<void> = new Subject();

  private loader: LoadingBarState;

  constructor(private formService: AppFormService,
              private modal: NgbModal,
              private loadingBar: LoadingBarService,
              private toasterService: ToastrService) {
  }

  ngOnInit(): void {
    this.loader = this.loadingBar.useRef();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
    if (this.loader) {
      this.loader.complete();
    }
  }

  onClick() {
    this.loader.start();
    this.formService.getForm(this.buttonAction?.formId)
    .pipe(takeUntil(this.$destroy))
    .subscribe(form => {
      this.openFormModal(this.appId, form);
      this.loader.complete();
    }, () => {
      this.loader.complete();
    });
  }

  private openFormModal(appId: string, formModel: AppFormModel): void {

    const modalRef = this.modal.open(OcFormModalComponent, {size: 'sm'});
    modalRef.componentInstance.ngbModalRef = modalRef;
    modalRef.componentInstance.modalTitle = formModel.name;
    modalRef.componentInstance.confirmButton = this.confirmButton;
    modalRef.componentInstance.rejectButton = this.rejectButton;

    modalRef.componentInstance.formJsonData = {
      fields: formModel.fields
    };

    modalRef.result.then(result => {
      if (result) {
        result.appId = appId ? appId : null;
        this.loader.start();
        this.formService.createFormSubmission(formModel.formId, result)
        .pipe(takeUntil(this.$destroy)).subscribe(() => {
          this.loader.stop();
          if (this.buttonAction?.message?.success) {
            this.toasterService.success(this.buttonAction?.message?.success);
          }
        }, () => {
          this.loader.stop();
          if (this.buttonAction?.message?.fail) {
            this.toasterService.error(this.buttonAction?.message?.fail);
          }
        });
      }
    });
  }
}
