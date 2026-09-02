import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Poster } from './poster';

describe('Poster', () => {
  let component: Poster;
  let fixture: ComponentFixture<Poster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Poster],
    }).compileComponents();

    fixture = TestBed.createComponent(Poster);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
