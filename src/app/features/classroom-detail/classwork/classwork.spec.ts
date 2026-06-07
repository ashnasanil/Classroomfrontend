import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Classwork } from './classwork';

describe('Classwork', () => {
  let component: Classwork;
  let fixture: ComponentFixture<Classwork>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Classwork],
    }).compileComponents();

    fixture = TestBed.createComponent(Classwork);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
