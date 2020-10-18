import { ExceptionFilter, Catch, HttpException, ArgumentsHost, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as HttpStatusCode from 'http-status-codes';

@Injectable()
@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  logger: Logger

  constructor() { 
    this.logger = new Logger("ExceptionFilter", false);
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    let response = host.switchToHttp().getResponse();
    let request = host.switchToHttp().getRequest();
    let status = exception instanceof HttpException ? exception.getStatus(): HttpStatus.INTERNAL_SERVER_ERROR;
    
    let exceptionMessage: any
    if (typeof(exception.message) !== 'object') {
      exceptionMessage = {
        statusCode: status,
        error: HttpStatusCode.getStatusText(status),
        message: exception instanceof HttpException ? exception.message : 'Internal Server Error',
      }
    } else {
      exceptionMessage = exception.message
    }

    if (
      status !== HttpStatus.BAD_REQUEST
      && status !== HttpStatus.CONFLICT
      && status !== HttpStatus.UNAUTHORIZED
      && status !== HttpStatus.NOT_FOUND
      && status !== HttpStatus.FORBIDDEN
    ) {
      this.logger.error(exception.toString())
      console.error(exception)
      // send message to slack (exceptionMessage.statusCode, exception.stack || exception.message)
    }
    return response.status(status).json(exceptionMessage);
  }
}