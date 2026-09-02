import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusIndicator } from './status-indicator';

describe('StatusIndicator', () => {
  let component: StatusIndicator;
  let fixture: ComponentFixture<StatusIndicator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusIndicator],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusIndicator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
