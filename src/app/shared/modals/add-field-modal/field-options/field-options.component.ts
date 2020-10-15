import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FieldType } from '../../../../core/services/apps-services/model/apps-model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { mimeTypes } from '../../../../core/services/apps-services/model/mime-type';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-field-options',
  templateUrl: './field-options.component.html',
  styleUrls: ['./field-options.component.scss']
})
export class FieldOptionsComponent implements OnInit, OnChanges, OnDestroy {
  /** Type of the field. Required parameter */
  @Input() type: FieldType;
  /** Options data for editing app */
  @Input() optionsData: any;

  @Output() optionsValue: EventEmitter<any> = new EventEmitter<any>();

  public optionsForm: FormGroup;
  // list of hashes for file type fields
  public hashes: string [] = ['SHA-1', 'MD5', 'SHA-256'];
  // list of extensions for file type fields
  public fileExtensions: string [];
  public extensionsResultArray: string [];
  public resultHashes: string [];
  public isRequired: boolean = true;

  private firstType: FieldType;
  private subscriber: Subscription = new Subscription();
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.firstType = this.type;
    this.fileExtensions = this.generateMime();

    if (this.optionsData) {
      this.fillOptionsForm(this.optionsData);
    } else {
      this.initOptionsForm();
    }
    this.subscribeToValueChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.type.previousValue !== changes.type.currentValue) {
      if (changes.type.currentValue === this.firstType) {
        this.fillOptionsForm(this.optionsData);
      } else {
        this.initOptionsForm();
      }
    }
  }

  initOptionsForm(): void {
    switch (this.type) {
      case FieldType.text:
      // case FieldType.longText:
      case FieldType.richText:
        this.optionsForm = this.fb.group({
          minChars: [],
          maxChars: [],
          required: []
        });
        break;
      // case FieldType.multiselectList:
      case FieldType.tags:
      // case FieldType.booleanTags:
      // case FieldType.numberTags:
      // case FieldType.dynamicFieldArray:
        this.optionsForm = this.fb.group({
          minCount: [],
          maxCount: [],
          required: []
        });
        break;
      // case FieldType.number:
      //   this.optionsForm = this.fb.group({
      //     min: [],
      //     max: [],
      //     required: []
      //   });
      //   break;
      // case FieldType.singleFile:
      //   this.optionsForm = this.fb.group({
      //     accept: [],
      //     hash: [],
      //     required: []
      //   });
      //   break;
      // case FieldType.singleImage:
      // case FieldType.multiImage:
      //   this.optionsForm = this.fb.group({
      //     accept: [],
      //     hash: [],
      //     required: [],
      //     height: [],
      //     width: []
      //   });
      //   break;
      default:
        this.optionsForm = this.fb.group({
          required: []
        });
        break;
    }
  }

  fillOptionsForm(optionsFields) {
    const group = {};
    if (optionsFields) {
      Object.keys(optionsFields).forEach(key => {
        group[key] = new FormControl(optionsFields[key]);
      });
      this.optionsForm = new FormGroup(group);
      if (optionsFields.required) {
        this.isRequired = optionsFields.required;
      }
    }
  }

  generateMime(): string [] {
    return mimeTypes.map(mime => {
      return mime.MIMEType;
    });
  }

  setMimeValue(): void {
    this.optionsForm.get('accept').setValue(this.extensionsResultArray.join());
  }

  setHashes(): void {
    this.optionsForm.get('hash').setValue(this.resultHashes.join());
  }

  subscribeToValueChanges() {
    this.subscriber.add(this.optionsForm.valueChanges.subscribe(value => {
      this.sendOptionsData();
    }));
  }

  sendOptionsData() {
    if (this.optionsForm.get('accept')) {
      this.setMimeValue();
    }
    if (this.optionsForm.get('hash')) {
      this.setHashes();
    }
    this.optionsValue.emit(this.optionsForm.getRawValue());
  }

  requiredChanged(status) {
    this.optionsForm.get('required').setValue(status);
    this.isRequired = status;
  }
  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }
}
