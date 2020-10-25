import { NgModule } from '@angular/core';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
    imports: [
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatRadioModule,
        MatSelectModule,
        MatDatepickerModule,
        MatListModule,
        MatMenuModule,
        MatSidenavModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatGridListModule,
        MatTooltipModule,
        MatCheckboxModule,
    ],
    exports: [
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatRadioModule,
        MatSelectModule,
        MatDatepickerModule,
        MatListModule,
        MatMenuModule,
        MatSidenavModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatGridListModule,
        MatTooltipModule,
        MatCheckboxModule,
    ]
})
export class MaterialModule { }
