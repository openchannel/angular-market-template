import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormModalComponent } from '../../../../shared/modals/form-modal/form-modal.component';
import { GraphqlService } from '../../../../graphql-client/graphql-service/graphql.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-list-generator',
  templateUrl: './form-list-generator.component.html',
  styleUrls: ['./form-list-generator.component.scss']
})
export class FormListGeneratorComponent implements OnInit, OnDestroy {

  public formJSONArray: any[] = [];
  public expandTables: boolean[] = [];

  private subscriber: Subscription = new Subscription();

  constructor(private modalService: NgbModal,
              private graphQLService: GraphqlService) { }

  ngOnInit(): void {
    this.getAllFormsList();
    this.expandTables.fill(false);
  }

  getAllFormsList(): void {
    this.subscriber.add(this.graphQLService.getAllForms('list').subscribe(
      (result: any) => {
        this.formJSONArray = result?.data?.getAllForms;
      }
    ));
  }

  openFormModal(formFieldsData: any): void {
    const modalRef = this.modalService.open(FormModalComponent, { size: 'lg' });
    modalRef.componentInstance.formData = formFieldsData;
  }

  changeActiveFormId(expand: boolean, index: number) {
    this.expandTables[index] = expand;
  }

  ngOnDestroy(): void {
    this.subscriber.unsubscribe();
  }
}
