import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PuzzleResultComponent } from './puzzle-result.component';

describe('PuzzleResultComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        PuzzleResultComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(PuzzleResultComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
