import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradingViewer } from './grading-viewer';

describe('GradingViewer', () => {
  let component: GradingViewer;
  let fixture: ComponentFixture<GradingViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradingViewer],
    }).compileComponents();

    fixture = TestBed.createComponent(GradingViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
