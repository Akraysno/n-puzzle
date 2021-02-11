import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NPuzzleComponent } from './n-puzzle/n-puzzle.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { HttpClientModule } from '@angular/common/http';
import { SnackbarComponent } from './_components/snackbar/snackbar.component';
import { ButtonComponent } from './_components/button/button.component';
import { ErrorsService } from './_services/errors.service';
import { SnackbarService } from './_services/snackbar.service';
import { PuzzleConfigComponent } from './n-puzzle/puzzle-config/puzzle-config.component';
import { PuzzleSettingsComponent } from './n-puzzle/puzzle-settings/puzzle-settings.component';
import { PuzzleResultComponent } from './n-puzzle/puzzle-result/puzzle-result.component';
import { ColorPickerModule } from 'ngx-color-picker'

@NgModule({
  declarations: [
    AppComponent,
    NPuzzleComponent,
    SnackbarComponent,
    ButtonComponent,
    PuzzleConfigComponent,
    PuzzleSettingsComponent,
    PuzzleResultComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    ColorPickerModule,
  ],
  providers: [
    ErrorsService,
    SnackbarService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
