import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackbarService } from './snackbar.service';

@Injectable()
export class ErrorsService {

	constructor(
		public snackbarService: SnackbarService
	) {}

	public getMessagesFromError(error: HttpErrorResponse): string {
		let errorMessage: any
		if (error.error) {
			errorMessage = error.error.message;
		}
		if (!errorMessage) {
			errorMessage = error.message;
		}
		if (!errorMessage && error) {
			errorMessage = "Error: "+error.error;
		}
		let result = "";
		if(typeof errorMessage === 'object') {
			for (var field in errorMessage) {
				if(typeof errorMessage[field] === 'object') {
					for (var err in errorMessage[field]) {
						result += this.uppercaseFirstLetter(field) + " : " + this.uppercaseFirstLetter(errorMessage[field][err]) + "\n";
					}
				} else if (errorMessage.statusCode && errorMessage.message) {
					result = errorMessage.statusCode + ' : ' + this.uppercaseFirstLetter(errorMessage.message)
				} else {
					result += errorMessage[field] + ' ';
				}
			}
			return result;
		} else {
			return errorMessage;
		}
	}

	public displayError(error: HttpErrorResponse | string):void {
		let message: string;
		if (typeof(error) === 'string') {
			message = error
		} else {
			message = this.getMessagesFromError(error)
		}
		this.snackbarService.openError(message)
	}

	public uppercaseFirstLetter(message: string) {
		return message[0].toUpperCase() + message.substring(1)
	}
}
