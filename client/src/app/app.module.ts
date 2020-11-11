import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NPuzzleComponent } from './n-puzzle/n-puzzle.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { HttpClientModule } from '@angular/common/http';
import { NPuzzleService } from './_services/n-puzzle.service';
import { SnackbarComponent } from './_components/snackbar/snackbar.component';
import { ButtonComponent } from './_components/button/button.component';
import { ErrorsService } from './_services/errors.service';
import { SnackbarService } from './_services/snackbar.service';

@NgModule({
  declarations: [
    AppComponent,
    NPuzzleComponent,
    SnackbarComponent,
    ButtonComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
  ],
  providers: [
    NPuzzleService,
    ErrorsService,
    SnackbarService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
