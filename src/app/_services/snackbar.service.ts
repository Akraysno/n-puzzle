import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../_components/snackbar/snackbar.component';

@Injectable()
export class SnackbarService {

	constructor(public snackBar: MatSnackBar) {}

  openSuccess(message: string): void {
    this.snackBar.openFromComponent(SnackbarComponent, {
      duration: 3000,
      panelClass: ['snackbar-success'],
      data: {
        message,
        closeButtonLabel: 'Fermer'
      }
    });
  }

  openError(message: string): void {
    this.snackBar.openFromComponent(SnackbarComponent, {
      duration: 3000,
      panelClass: ['snackbar-error'],
      data: {
        message,
        closeButtonLabel: 'Fermer'
      }
    });
  }

}
