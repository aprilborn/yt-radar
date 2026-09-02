import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadRecord } from './download-record';

describe('DownloadRecord', () => {
  let component: DownloadRecord;
  let fixture: ComponentFixture<DownloadRecord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadRecord],
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadRecord);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
