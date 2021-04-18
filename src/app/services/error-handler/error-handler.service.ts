import {HttpErrorResponse} from '@angular/common/http';
import {throwError} from 'rxjs';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function handleError(error: HttpErrorResponse) {
  let message = '';
  if (error.error instanceof ErrorEvent) {

    message = 'An error occurred:' + error.error.message;

  } else {


    message = `Backend returned code ${error.status}, ` + `body was: ${error.error}`;
    if (error.status === 404) {

      message = error.error || 'Not Found Error';
    } else if (error.status === 400) {

      message = error.error || 'Bad Request Error';
    } else if (error.status === 401) {

      message = error.error || 'Un Authenticated';
    } else if (error.status === 409) {

      message = error.error || 'Conflict / Precondition Failed';
    } else if (error.status === 412) {

      message = error.error || 'Conflict / Precondition Failed';
    } else if (error.status === 500) {

      message = 'Internal Server';
    } else if (error.status === 503) {

      message = error.error || 'Service Unavailable';
    } else {

      message = `Backend returned code ${error.status}, ` + `body was: ${error.error}`;
    }
  }

  return throwError(message);
  // showAlert
}

export class ErrorHandlerService {

  constructor() {
  }

}
