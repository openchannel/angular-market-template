import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
  DeveloperAccountTypesService,
  InviteUserModel,
  InviteUserService, UserAccountTypesService,
  UsersService
} from 'oc-ng-common-service';
import {Subscription} from 'rxjs';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-invited-signup',
  templateUrl: './invited-signup.component.html',
  styleUrls: ['./invited-signup.component.scss']
})
export class InvitedSignupComponent implements OnInit, OnDestroy {

  public userInviteData: InviteUserModel;
  public isExpired = false;
  public inviteFormData: any;
  public formConfig: any;
  public isTerms = false;
  public isFormInvalid = true;
  public inProcess = false;
  private inviteForm: FormGroup;


  private requestSubscriber: Subscription = new Subscription();

  constructor(private activeRouter: ActivatedRoute,
              private router: Router,
              private inviteUserService: InviteUserService,
              private typeService: UserAccountTypesService,
              private usersService: UsersService) {
  }

  ngOnInit(): void {
    console.log('getInviteDetails');
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
            id: 'name',
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
      return field;
    });
    mappedFields.push({
      id: 'password',
      label: 'Password',
      type: 'password',
      attributes: {required: true},
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
    this.inviteForm = form;
  }

  // getting last values of form for submission
  getFormValues(form) {
    this.inviteFormData = form;
  }

  // Active form validation
  getFormValidity(status) {
    this.isFormInvalid = status;
  }

  // register invited user and deleting invite on success
  submitForm() {
    this.inProcess = true;
    this.inviteFormData.inviteToken = this.userInviteData.token;
    this.requestSubscriber.add(this.usersService.signupByInvite({
      userCustomData: this.inviteFormData,
      inviteToken: this.userInviteData.token
    }).subscribe(resp => {
      this.inProcess = false;
      this.router.navigate(['login']);
    }, () => {
      this.inProcess = false;
    }));
  }
}
