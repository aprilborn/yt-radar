import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadInfo } from './download-info';

describe('DownloadInfo', () => {
  let component: DownloadInfo;
  let fixture: ComponentFixture<DownloadInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
