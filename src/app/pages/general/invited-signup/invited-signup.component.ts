import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
  InviteUserModel,
  InviteUserService, NativeLoginService, UserAccountTypesService,
} from 'oc-ng-common-service';
import {Subscription} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-invited-signup',
  templateUrl: './invited-signup.component.html',
  styleUrls: ['./invited-signup.component.scss']
})
export class InvitedSignupComponent implements OnInit, OnDestroy {

  public userInviteData: InviteUserModel;
  public isExpired = false;
  public formConfig: any;

  public signUpGroup: FormGroup;

  public inProcess = false;

  private requestSubscriber: Subscription = new Subscription();

  public termsControl = new FormControl(false, Validators.requiredTrue);

  constructor(private activeRouter: ActivatedRoute,
              private router: Router,
              private inviteUserService: InviteUserService,
              private typeService: UserAccountTypesService,
              private nativeLoginService: NativeLoginService) {
  }

  ngOnInit(): void {
    this.getInviteDetails();
  }

  ngOnDestroy() {
    this.requestSubscriber.unsubscribe();
  }

  // making form config according to form type
  getFormType(type) {
    if (type) {
      this.requestSubscriber.add(
          this.typeService.getUserAccountType(type).subscribe(
              resp => {
                this.formConfig = {
                  fields: this.mapDataToField(resp.fields)
                };
              }
          )
      );
    } else {
      this.formConfig = {
        fields: [
          {
            id: 'uname',
            label: 'Name',
            type: 'text',
            attributes: {required: false}
          },
          {
            id: 'email',
            label: 'Email',
            type: 'emailAddress',
            attributes: {required: true},
          },
          {
            id: 'password',
            label: 'Password',
            type: 'password',
            attributes: {required: true},
          }
        ]
      };
    }
  }

  // getting invitation details
  getInviteDetails(): void {
    const userToken = this.activeRouter.snapshot.params.token;
    if (userToken) {
      this.requestSubscriber.add(this.inviteUserService.getUserInviteInfoByToken(userToken)
      .subscribe(response => {
        this.userInviteData = response;
        if (new Date(this.userInviteData.expireDate) < new Date()) {
          this.isExpired = true;
        } else {
          this.getFormType(this.userInviteData.type);
        }
      }, () => {
        this.router.navigate(['']);
      }));
    } else {
      this.router.navigate(['']);
    }
  }

  mapDataToField(fields) {
    const mappedFields = fields.map(field => {
      if (!field.id.includes('customData') && this.userInviteData[field.id]) {
        field.defaultValue = this.userInviteData[field.id];
      } else if (field.id.includes('company')) {
        field.defaultValue = this.userInviteData.customData?.company;
      }
      if(field.id === 'name') {
        field.id = 'uname';
      }
      return field;
    });
    mappedFields.push({
      id: 'password',
      label: 'Password',
      type: 'password',
      attributes: {},
    });

    return mappedFields;
  }

  // getting generated form group for disabling special fields
  getCreatedForm(form) {
    form.get('email').disable();
    const companyKey = Object.keys(form.value).find(key => key.includes('company'));
    if (companyKey) {
      form.get(companyKey).disable();
    }
    this.signUpGroup = form;

    // add terms control into signup form
    this.signUpGroup.addControl('terms', this.termsControl);
  }

  // register invited user and deleting invite on success
  submitForm() {
    this.signUpGroup.markAllAsTouched();
    if (this.signUpGroup.valid && !this.inProcess) {
      this.inProcess = true;

      const request = this.signUpGroup.getRawValue();
      delete request['terms'];

      this.requestSubscriber.add(this.nativeLoginService.signupByInvite({
        userCustomData: request,
        inviteToken: this.userInviteData.token
      }).subscribe(() => {
        this.inProcess = false;
        this.router.navigate(['login']);
      }, () => {
        this.inProcess = false;
      }));
    }
  }
}
