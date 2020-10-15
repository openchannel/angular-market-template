import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  AppStatusDetails,
  CommonService,
  SellerAppCustomDataModel,
  SellerAppDetailsModel,
  SellerAppService
} from 'oc-ng-common-service';
import {DomSanitizer} from '@angular/platform-browser';
import {NotificationService} from 'src/app/shared/custom-components/notification/notification.service';
import FroalaEditor from 'froala-editor';
import {DialogService, OcPopupComponent} from 'oc-ng-common-component';

;

@Component({
  selector: 'app-edit-app-detail',
  templateUrl: './edit-app-detail.component.html',
  styleUrls: ['./edit-app-detail.component.scss']
})
export class EditAppDetailComponent implements OnInit {

  // icons: FileDetails[] = [];
  // productImages: FileDetails[] = [];

  @Input() appDetails: SellerAppDetailsModel = new SellerAppDetailsModel();
  @Input() appStatus = new AppStatusDetails();
  @Output() saveOrSubmitApp = new EventEmitter<any>();
  @Output() cancelApp = new EventEmitter<any>();
  // to indicate weather its edit or addd
  @Input() mode = 'ADD';

  videoUrl = '';

  defaultFileIconUrl = "./assets/img/file-placeholder.svg";
  closeIconUrl = "./assets/img/close-icon.svg";
  addIconUrl = "./assets/img/add-icon.svg";
  uploadIconUrl = "./assets/img/upload-icon.svg";

  appCategories = [{key: "Assembly", value: "Assembly"}, {
    key: "Communication",
    value: "Communication"
  }];
  // selectedCats: string[] = [];

  isSaveInPrcess = false;
  isFormSubmitted = false;
  customMsg = false;
  iconMsg = false;

  completeIconUrl = "./assets/img/app-icon.svg";
  uploadingIconUrl = "./assets/img/uploading-icon.svg";

  constructor(public sanitizer: DomSanitizer,
              private commonservice: CommonService,
              private notificationService: NotificationService,
              private sellerAppService: SellerAppService,
              private dialogService: DialogService) {
  }

  ngOnInit(): void {
    if (!this.appDetails.customData) {
      this.appDetails.customData = new SellerAppCustomDataModel();
      this.appDetails.customData.category = [];
      this.appDetails.customData.product__images = [];
      this.appDetails.customData.icon__file = [];
      this.appDetails.customData.product__image__file = [];
    } else {
      this.appDetails.customData.icon__file = !this.appDetails.customData.icon__file ? [] : this.appDetails.customData.icon__file;
      this.appDetails.customData.product__image__file = !this.appDetails.customData.product__image__file ? [] : this.appDetails.customData.product__image__file;
    }

    if (this.appDetails.customData.category.length) {
      this.appCategories = this.appCategories.filter((category, index) => {
        return this.appDetails.customData.category.indexOf(category.value) == -1;
      });
    }


    // this.productImages=this.appDetails.customData.product__image__file;
    // this.icons=[this.appDetails.customData.icon__file];
    FroalaEditor.DefineIcon('alert', {NAME: 'info'});
    FroalaEditor.RegisterCommand('alert', {
      title: 'Hello',
      focus: false,
      undo: false,
      refreshAfterCallback: false,

      callback: () => {
        alert('Hello!');
      }
    });
    this.getyouTubeId();
  }


  getValue(value) {
    return value;
  }

  getyouTubeId() {
    if (this.appDetails.customData.video__url && this.appDetails.customData.video__url.trim().length > 0 &&
      this.appDetails.customData.video__url.indexOf('v=') > -1) {
      var video_id = this.appDetails.customData.video__url.split('v=')[1];
      video_id = video_id.indexOf('&') > -1 ? video_id.split('&')[0] : video_id;
      this.videoUrl = "https://www.youtube.com/embed/" + video_id;
      return this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrl);
    }
    return "";
  }

  saveNewApp(newAppform, successCallback?, errorCallback?) {
    if (!newAppform.controls.appName.valid) {
      newAppform.controls.appName.markAsTouched();
      try {
        this.commonservice.scrollToFormInvalidField({form: newAppform, adjustSize: 60});
      } catch (error) {
        this.notificationService.showError([{"message": "Please fill all required fields."}]);
      }
      if (successCallback) {
        successCallback();
      }
      return;
    }
    this.prepareFinalData();
    this.isSaveInPrcess = successCallback ? false : true;
    this.sellerAppService.saveApplication(this.appDetails).subscribe((res) => {
      this.isSaveInPrcess = false;
      this.saveOrSubmitApp.emit();
      this.notificationService.showSuccess("Application saved successfully");
      if (successCallback) {
        successCallback();
      }
    }, (err) => {
      this.isSaveInPrcess = false;
      this.commonservice.scrollToFormInvalidField({form: newAppform, adjustSize: 60});
      if (errorCallback) {
        errorCallback();
      }
    });
  }

  prepareFinalData() {
    let iconFile = (this.appDetails.customData.icon__file && this.appDetails.customData.icon__file.length > 0) ? this.appDetails.customData.icon__file[0] : null;
    if (iconFile) {
      this.appDetails.customData.icon = iconFile.fileUrl;
    } else {
      this.appDetails.customData.icon = null;
    }
    let productImages = (this.appDetails.customData.product__image__file && this.appDetails.customData.product__image__file.length > 0) ? this.appDetails.customData.product__image__file : null;
    if (productImages && productImages.length > 0) {
      let productImages = this.appDetails.customData.product__image__file.map(pImage => pImage.fileUrl);
      this.appDetails.customData.product__images = productImages;
    } else {
      this.appDetails.customData.product__images = [];
    }
    var temp = document.createElement("div");
    temp.innerHTML = this.appDetails.customData.summary;
    this.appDetails.customData.summary__plain__text = temp.textContent || temp.innerText || "";
  }

  /**
   * This method is callback method in case we need to handle callback of category Add event.
   */
  updateCategory() {
  }

  /**
   * This method is used to submit the new app.
   *
   * @param form
   */
  submitApp(form) {
    this.isFormSubmitted = true;
    this.prepareFinalData();
    let scrollingField = undefined;
    if (!this.appDetails.customData.product__image__file || this.appDetails.customData.product__image__file.length < 1) {
      this.customMsg = true;
      scrollingField = "productImages";
    }

    if (!this.appDetails.customData.icon__file || this.appDetails.customData.icon__file.length < 1) {
      this.iconMsg = true;
      if (!scrollingField) {
        scrollingField = "iconImage";
      }
    }
    if (scrollingField) {
      this.commonservice.scrollToField({field: scrollingField, adjustSize: 60});
      return;
    }
    if (this.appDetails.customData.category?.length) {
      form.controls.appCategory.setErrors(null);
    }

    if (!form.valid) {
      form.control.markAllAsTouched();
      try {
        this.commonservice.scrollToFormInvalidField({form: form, adjustSize: 60});
      } catch (error) {
        this.notificationService.showError([{"message": "Please fill all required fields."}]);
      }
      return;
    }

    const infoMessage = (this.mode == 'ADD') ? "Submit this app <br> to the Marketplace now?" : "Submit changes <br> to the Marketplace now?";
    const type = this.appStatus.appStatus !== 'Pending' && this.appStatus.appStatus !== 'In Review' && this.appStatus.appStatus !== 'Rejected' ? 'newApp' : 'newAppPending';
    const modalRef = this.dialogService.showAppConfirmPopup(OcPopupComponent as Component, "Warning",
      type, "Save as Draft", "Confirm",
      infoMessage, "", "You can keep this app as draft", true,() => {
        this.sellerAppService.submitApplication(this.appDetails).subscribe((res) => {
          this.isSaveInPrcess = false;
          this.dialogService.modalService.dismissAll();
          this.saveOrSubmitApp.emit();
          this.notificationService.showSuccess("Application submitted successfully");
        }, (err) => {
          this.commonservice.scrollToFormInvalidField({form: form, adjustSize: 60});
          this.isSaveInPrcess = false;
          this.dialogService.modalService.dismissAll();
        });
      });
  }

  public options: Object = {
    charCounterCount: false,
    toolbarButtons: ['paragraphStyle', 'bold', 'italic', 'strikeThrough', 'textColor', 'backgroundColor', 'insertLink', 'formatOL', 'formatUL', 'outdent', 'indent', 'codeView'],
    toolbarButtonsXS: ['paragraphStyle', 'bold', 'italic', 'strikeThrough', 'textColor', 'backgroundColor', 'insertLink', 'formatOL', 'formatUL', 'outdent', 'indent', 'codeView'],
    toolbarButtonsSM: ['paragraphStyle', 'bold', 'italic', 'strikeThrough', 'textColor', 'backgroundColor', 'insertLink', 'formatOL', 'formatUL', 'outdent', 'indent', 'codeView'],
    toolbarButtonsMD: ['paragraphStyle', 'bold', 'italic', 'strikeThrough', 'textColor', 'backgroundColor', 'insertLink', 'formatOL', 'formatUL', 'outdent', 'indent', 'codeView'],
    key: 'wFE7nG5G4G3H4A9C5eMRPYf1h1REb1BGQOQIc2CDBREJImA11C8D6B5B1G4F3F2F3C7',
    attribution: false,
    quickInsertTags: [],
    placeholderText: ''

  };

  updateProductFiles(productImages) {
    console.log("Updated : " + productImages);
  }

  cancelNewApp() {
    this.cancelApp.emit();
  }
}
