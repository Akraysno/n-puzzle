import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NPuzzleComponent } from './n-puzzle/n-puzzle.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { HttpClientModule } from '@angular/common/http';
import { NPuzzleService } from './n-puzzle/n-puzzle.service';

@NgModule({
  declarations: [
    AppComponent,
    NPuzzleComponent,
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
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
