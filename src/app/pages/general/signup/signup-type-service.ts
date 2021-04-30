import { Injectable } from '@angular/core';
import {
  TypeFieldModel, TypeModel, UserAccountTypesService, UsersService
} from 'oc-ng-common-service';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {HttpHeaders} from '@angular/common/http';
import { OcTypeService } from 'oc-ng-common-component/src/lib/auth-components';

@Injectable({
  providedIn: 'root'
})
export class SignupTypeService extends OcTypeService {

  private readonly HANDLE_NOT_FOUND_ERROR = {
    headers: new HttpHeaders({'x-handle-error': '404'})
  };

  constructor(private organizationService: UsersService,
              private accountService: UserAccountTypesService) {
    super();
  }

  getAccount(): Observable<any> {
    return of({});
  }

  getAccountTypeById(typeId: string): Observable<TypeModel<TypeFieldModel>> {
    return this.accountService.getUserAccountType(typeId, this.HANDLE_NOT_FOUND_ERROR)
    .pipe(catchError(error => {
      console.error(typeId, ' is not valid user account type.');
      throw error;
    }));
  }

  getOrganization(): Observable<any> {
    return of({});
  }

  getOrganizationTypeById(typeId: string): Observable<TypeModel<TypeFieldModel>> {
    return this.organizationService.getUserTypeDefinition(typeId, this.HANDLE_NOT_FOUND_ERROR)
    .pipe(catchError(error => {
      console.error(typeId, ' is not valid user type.');
      throw error;
    }));
  }
}
