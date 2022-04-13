import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ButtonActionComponent } from './button-action.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
    MockAppFormService,
    MockAuthHolderService,
    MockLoadingBarService,
    MockOwnershipService,
    MockNgbModal,
    MockToastrService,
    MockFileUploadDownloadService,
    MockStatisticService,
} from '../../../mock/mock';
import { ToastrService } from 'ngx-toastr';
import {
    AppFormService,
    AuthHolderService,
    FileUploadDownloadService,
    OwnershipService,
    StatisticService,
} from '@openchannel/angular-common-services';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('ButtonActionComponent', () => {
    let component: ButtonActionComponent;
    let fixture: ComponentFixture<ButtonActionComponent>;
    let router: Router;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ButtonActionComponent],
                imports: [RouterTestingModule.withRoutes([])],
                providers: [
                    { provide: NgbModal, useClass: MockNgbModal },
                    { provide: ToastrService, useClass: MockToastrService },
                    { provide: LoadingBarService, useClass: MockLoadingBarService },
                    { provide: AppFormService, useClass: MockAppFormService },
                    { provide: AuthHolderService, useClass: MockAuthHolderService },
                    { provide: OwnershipService, useClass: MockOwnershipService },
                    { provide: FileUploadDownloadService, useClass: MockFileUploadDownloadService },
                    { provide: StatisticService, useClass: MockStatisticService },
                ],
            }).compileComponents();
            router = TestBed.inject(Router);
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ButtonActionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
