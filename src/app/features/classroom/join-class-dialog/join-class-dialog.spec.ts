import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinClassDialog } from './join-class-dialog';

describe('JoinClassDialog', () => {
  let component: JoinClassDialog;
  let fixture: ComponentFixture<JoinClassDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinClassDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(JoinClassDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
