import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWork } from './create-work';

describe('CreateWork', () => {
  let component: CreateWork;
  let fixture: ComponentFixture<CreateWork>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateWork],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateWork);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
