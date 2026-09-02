import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadControls } from './download-controls';

describe('DownloadControls', () => {
  let component: DownloadControls;
  let fixture: ComponentFixture<DownloadControls>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadControls],
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadControls);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
