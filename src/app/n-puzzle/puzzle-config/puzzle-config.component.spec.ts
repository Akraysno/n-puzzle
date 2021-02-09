import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PuzzleConfigComponent } from './puzzle-config.component';

describe('PuzzleConfigComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        PuzzleConfigComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(PuzzleConfigComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
