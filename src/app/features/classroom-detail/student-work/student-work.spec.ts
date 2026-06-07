import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentWork } from './student-work';

describe('StudentWork', () => {
  let component: StudentWork;
  let fixture: ComponentFixture<StudentWork>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentWork],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentWork);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
