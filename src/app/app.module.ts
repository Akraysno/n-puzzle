import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
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
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { PopoverModule } from 'ngx-smart-popover';
import { NPuzzleService } from './n-puzzle/n-puzzle.service';

registerLocaleData(localeFr);

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
    PopoverModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR'},
    ErrorsService,
    SnackbarService,
    NPuzzleService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
