import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatistikaComponent } from './statistika.component';

describe('StatistikaComponent', () => {
  let component: StatistikaComponent;
  let fixture: ComponentFixture<StatistikaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatistikaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatistikaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
