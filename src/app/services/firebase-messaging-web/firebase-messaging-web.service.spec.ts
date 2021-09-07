import { TestBed } from '@angular/core/testing';

import { FirebaseMessagingWebService } from './firebase-messaging-web.service';

describe('FirebaseMessagingWebService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FirebaseMessagingWebService = TestBed.get(FirebaseMessagingWebService);
    expect(service).toBeTruthy();
  });
});
