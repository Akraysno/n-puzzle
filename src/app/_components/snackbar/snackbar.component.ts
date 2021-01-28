import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'snackbar-component',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent {
    message: string = ''
    closeButtonLabel: string = 'Fermer'

    constructor(
        @Inject(MAT_SNACK_BAR_DATA) public data: any,
        public ref: MatSnackBarRef<SnackbarComponent>
    ) {
        this.message = this.uppercaseFirstLetter(data.message.replace(/(\n)/g, '<br>'))
        this.closeButtonLabel = this.uppercaseFirstLetter(data.closeButtonLabel || 'Fermer')
    }

    close(){
        this.ref.dismiss()
    }

    uppercaseFirstLetter(message: string) {
      return message[0].toUpperCase() + message.substring(1)
    }

}
