import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { GraphqlService } from '../../../graphql-client/graphql-service/graphql.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-submissions-data-view-modal',
  templateUrl: './submissions-data-view-modal.component.html',
  styleUrls: ['./submissions-data-view-modal.component.scss']
})
export class SubmissionsDataViewModalComponent implements OnInit {

  @Input() formId: string;
  @Input() submissionId: string;

  public submissionData: any;

  private subscriber: Subscription = new Subscription();

  constructor(private activeModal: NgbActiveModal,
              private graphQLService: GraphqlService,
              public sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.getSubmissionDetails();
  }

  getSubmissionDetails() {
    this.subscriber.add(this.graphQLService.getFormSubmissionData(this.formId, this.submissionId)
      .subscribe(res => {
        this.submissionData = res.data.getFormSubmissionData;
      }));
  }

  checkForSpecialData(value): 'array' | 'html' | 'string' {
    if (Array.isArray(value)) {
      return 'array';
    } else if (value.includes('</')) {
      return 'html';
    } else {
      return 'string';
    }
  }

  closeModal() {
    this.subscriber.unsubscribe();
    this.activeModal.close();
  }
}
