import { Component, OnInit } from '@angular/core';
import { KeyValuePairMapper, ChartService, SellerAppService, SellerAppsWrapper, CommonService } from 'oc-ng-common-service';
import { Router } from '@angular/router';
import { OcPopupComponent, DialogService } from 'oc-ng-common-component';
import { NotificationService } from 'src/app/shared/custom-components/notification/notification.service';

@Component({
  selector: 'app-app-developer',
  templateUrl: './app-developer.component.html',
  styleUrls: ['./app-developer.component.scss']
})
export class AppDeveloperComponent implements OnInit {

  labels = [];
  dataSets = [];
  count;
  countText;
  //used to detect ghaph data change.
  random;
  period = 'month';

  chartStaticstics: KeyValuePairMapper[];
  isChartProcessing = false;
  isAppProcessing = false;
  isAppsLoading = true;
  isChartLoading = true;
  applications = new SellerAppsWrapper();
  fields = [];

  selectedChartField = "downloads";

  downloadUrl = "./assets/img/cloud-download.svg";
  menuUrl = "./assets/img/dots-hr-icon.svg";
  sortIcon = "./assets/img/dropdown-icon.svg";

  menuItems = {
    menu: '',
    appId: '',
    version: '',
    hasChild: false
  };

  constructor(public chartService: ChartService, public appService: SellerAppService, public router: Router,
    private modalService: DialogService, private notificationService: NotificationService,
    private commonservice: CommonService) {

    var downloadObj = {
      key: "Downloads",
      value: "downloads"
    }
    this.fields.push(downloadObj);
    var viewObj = {
      key: "Views",
      value: "views"
    }
    this.fields.push(viewObj);

  }

  ngOnInit(): void {
    this.applications.list = [];
    this.commonservice.scrollToFormInvalidField({ form: null, adjustSize: 60 });
    this.getChartStatistics();
    this.getApps('true');
  }

  getValue(value) {
    return value;
  }


  getChartStatistics() {

    this.isChartProcessing = true;
    this.labels = [];
    this.dataSets = [];

    var obj = {
      period: this.period,
      field: this.selectedChartField,

    }
    this.chartService.getStats(obj).subscribe((res) => {

      this.chartStaticstics = res.data;
      this.chartStaticstics.forEach(c => {
        this.labels.push(c.key);
        this.dataSets.push(c.value);

      });
      this.count = res.count;
      this.random = Math.random();
      this.countText = 'Total ' + this.capitalizeFirstLetter(this.selectedChartField);

      this.isChartProcessing = false;
      this.isChartLoading = false;

    }, (err) => {
      this.isChartLoading = false;
    });
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  getApps(loader, callback?) {
    this.isAppProcessing = true;
    this.appService.getApps(loader).subscribe(res => {
      this.applications.list = res.list;
      this.isAppProcessing = false;
      this.isAppsLoading = false;
      if (callback) {
        callback();
      }
    }, (res) => {
      this.isAppProcessing = false;
      this.isAppsLoading = false;
      if (callback) {
        callback();
      }
    })
  }

  newApp() {
    this.router.navigateByUrl('app-new');
  }

  changeField(value) {
    this.selectedChartField = value;
    this.getChartStatistics();
  }

  menuchange(event) {

    this.menuItems = event;
    if (this.menuItems.menu === 'delete') {
      let deleteMessage = this.menuItems?.hasChild ? "Are you sure you want to delete <br> this app and all it's versions?" :
        "Are you sure you want to delete <br> this app version?";
      this.modalService.showConfirmDialog(OcPopupComponent as Component, "lg", "warning", "confirm",
        "Cancel", "Delete", deleteMessage, "",
        "This action is terminal and cannot be reverted", (res) => {
          this.appService.deleteApp(this.menuItems.appId, this.menuItems.version).subscribe(res => {
            this.getApps('false', (res) => {
              this.notificationService.showSuccess("Application deleted successfully");
              this.modalService.modalService.dismissAll();
            });
          }, (err) => {
            this.modalService.modalService.dismissAll();
          });

        });
    } else if (this.menuItems.menu === 'suspend') {
      // this.modalService.showConfirmDialog(OcPopupComponent as Component, "lg", "warning", "confirm",
      //   "Cancel", "Suspend", "Are you sure you want to <br> suspend this app?", "",
      //   "This action is terminal and cannot be reverted", (res) => {

      let suspend = [{
        appId: this.menuItems.appId,
        version: this.menuItems.version
      }]
      this.appService.suspendApp(suspend).subscribe(res => {
        this.getApps('true', (res) => {
          this.notificationService.showSuccess("Application suspended successfully");
          // this.modalService.modalService.dismissAll();  
        });
      }, (err) => {
        // this.modalService.modalService.dismissAll();
      });
      // });
    } else if (this.menuItems.menu === 'submit') {
      this.modalService.showConfirmDialog(OcPopupComponent as Component, "lg", "warning", "confirm",
        "Cancel", "Submit", "Are you sure you want to <br> submit this app?", "",
        "This action is terminal and cannot be reverted", (res) => {

          let submit = {
            appId: this.menuItems.appId,
            version: this.menuItems.version
          }
          this.appService.submitApp(submit).subscribe(res => {
            this.getApps('false', (res) => {
              this.notificationService.showSuccess("Application submitted successfully");
              this.modalService.modalService.dismissAll();
            });
          }, (err) => {
            this.modalService.modalService.dismissAll();
          });
        });
    } else if (this.menuItems.menu === 'edit') {
      this.router.navigateByUrl('edit-app/' + this.menuItems.appId + "/version/" + this.menuItems.version);
    } else if (this.menuItems.menu === 'unsuspend') {

      let unsuspend = [{
        appId: this.menuItems.appId,
        version: this.menuItems.version
      }]
      this.appService.unsuspendApp(unsuspend).subscribe(res => {
        this.getApps('true', (res) => {
          this.notificationService.showSuccess("Application unsuspended successfully");
          // this.modalService.modalService.dismissAll();  
        });
      }, (err) => {
        // this.modalService.modalService.dismissAll();
      });
      // });
    }
  }


}
