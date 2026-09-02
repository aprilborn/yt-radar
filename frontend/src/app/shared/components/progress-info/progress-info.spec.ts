import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressInfo } from './progress-info';

describe('ProgressInfo', () => {
  let component: ProgressInfo;
  let fixture: ComponentFixture<ProgressInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
