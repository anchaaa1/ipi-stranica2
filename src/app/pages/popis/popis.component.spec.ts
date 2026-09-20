import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopisComponent } from './popis.component';

describe('PopisComponent', () => {
  let component: PopisComponent;
  let fixture: ComponentFixture<PopisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
