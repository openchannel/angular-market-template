import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { OcEditUserFormConfig } from '@openchannel/angular-common-components';
import {
    Page,
    TypeFieldModel,
    TypeModel,
    UserAccountService,
    UserAccountTypeModel,
    UserAccountTypesService,
    UsersService,
} from '@openchannel/angular-common-services';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { map, tap } from 'rxjs/operators';
import { cloneDeep, keyBy } from 'lodash';

@Injectable({
    providedIn: 'root',
})
export class OcEditUserTypeService {
    private readonly EMPTY_TYPE_RESPONSE: Observable<any> = of({
        list: [],
        pages: 1,
        count: 0,
        pageNumber: 1,
    });

    constructor(
        private organizationService: UsersService,
        private accountService: UserAccountService,
        private accountTypeService: UserAccountTypesService,
    ) {}

    injectTypeDataIntoConfigs(
        configs: OcEditUserFormConfig[],
        injectOrganizationTypes: boolean,
        injectAccountTypes: boolean,
    ): Observable<OcEditUserFormConfig[]> {
        if (!configs) {
            return null;
        }

        return forkJoin({
            organizationTypes: this.getUserTypes(injectOrganizationTypes, configs),
            accountTypes: this.getUserAccountTypes(injectAccountTypes, configs),
        }).pipe(
            map(data => {
                const accTypes = keyBy(data.accountTypes.list, 'userAccountTypeId');
                const orgTypes = keyBy(data.organizationTypes.list, 'userTypeId');
                const newConfigs = cloneDeep(configs) as OcEditUserFormConfig[];

                return newConfigs
                    .map(config => {
                        const accountTypeData = accTypes[config?.account?.type];
                        const organizationTypeData = orgTypes[config?.organization?.type];

                        let isInvalid = !(injectOrganizationTypes || injectAccountTypes);

                        // put organization type
                        if (injectOrganizationTypes) {
                            if (organizationTypeData) {
                                config.organization.typeData = organizationTypeData;
                            } else {
                                isInvalid = true;
                            }
                        }
                        // put account type
                        if (injectAccountTypes) {
                            if (accountTypeData) {
                                config.account.typeData = accountTypeData;
                            } else {
                                isInvalid = true;
                            }
                        }
                        return isInvalid ? null : config;
                    })
                    .filter(config => config);
            }),
        );
    }

    private getUserTypes(injectOrganizationType: boolean, configs: OcEditUserFormConfig[]): Observable<Page<TypeModel<TypeFieldModel>>> {
        if (injectOrganizationType) {
            const orgTypesIDs = configs.map(config => config?.organization?.type).filter(type => type);
            const searchQuery = orgTypesIDs?.length > 0 ? `{'userTypeId':{'$in': ['${orgTypesIDs.join("','")}']}}` : '';
            if (searchQuery) {
                return this.organizationService.getUserTypes(searchQuery, null, 1, 100);
            }
        }
        return this.EMPTY_TYPE_RESPONSE;
    }

    private getUserAccountTypes(injectAccountType: boolean, configs: OcEditUserFormConfig[]): Observable<Page<UserAccountTypeModel>> {
        if (injectAccountType) {
            const accTypesIDs = configs.map(config => config?.account?.type).filter(type => type);
            const searchQuery = accTypesIDs?.length > 0 ? `{'userAccountTypeId':{'$in': ['${accTypesIDs.join("','")}']}}` : '';
            if (searchQuery) {
                return this.accountTypeService
                    .getUserAccountTypes(1, 100, searchQuery)
                    .pipe(tap(types => this.logInvalidAccountTypes(types.list, accTypesIDs)));
            }
        }
        return this.EMPTY_TYPE_RESPONSE;
    }

    private logInvalidAccountTypes(fetchedTypesData: UserAccountTypeModel[], configTypes: string[]): void {
        const existingTypes = fetchedTypesData.map(typeData => typeData.userAccountTypeId);
        const notExistingTypes = configTypes.filter(type => !existingTypes.includes(type));

        notExistingTypes.forEach(type => {
            console.warn(`${type} is not a valid user account type`);
        });
    }
}
