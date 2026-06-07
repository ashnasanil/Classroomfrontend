import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassroomLayout } from './classroom-layout';

describe('ClassroomLayout', () => {
  let component: ClassroomLayout;
  let fixture: ComponentFixture<ClassroomLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassroomLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassroomLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
