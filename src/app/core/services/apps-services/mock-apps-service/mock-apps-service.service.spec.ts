import { TestBed } from '@angular/core/testing';

import { MockAppsService } from './mock-apps-service.service';

describe('MockAppsService', () => {
  let service: MockAppsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockAppsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
