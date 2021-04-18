import { TestBed } from '@angular/core/testing';

import { GlobalServiceService } from './global-service.service';

describe('GlobalServiceService', () => {
  let service: GlobalServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
