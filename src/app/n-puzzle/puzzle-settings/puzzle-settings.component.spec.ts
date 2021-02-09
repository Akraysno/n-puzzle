import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PuzzleSettingsComponent } from './puzzle-settings.component';

describe('PuzzleSettingsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        PuzzleSettingsComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(PuzzleSettingsComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
