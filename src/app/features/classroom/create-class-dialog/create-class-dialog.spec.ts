import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateClassDialog } from './create-class-dialog';

describe('CreateClassDialog', () => {
  let component: CreateClassDialog;
  let fixture: ComponentFixture<CreateClassDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateClassDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateClassDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
