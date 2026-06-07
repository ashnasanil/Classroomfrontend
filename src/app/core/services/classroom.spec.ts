import { TestBed } from '@angular/core/testing';

import { Classroom } from './classroom';

describe('Classroom', () => {
  let service: Classroom;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Classroom);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
