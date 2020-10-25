import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NPuzzleComponent } from './n-puzzle.component';

describe('NPuzzleComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        NPuzzleComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(NPuzzleComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
