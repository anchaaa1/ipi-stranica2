import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisionBoardComponent } from './vision-board.component';

describe('VisionBoardComponent', () => {
  let component: VisionBoardComponent;
  let fixture: ComponentFixture<VisionBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisionBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisionBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
