import { MiddlewareFunction, Middleware, NestMiddleware, UnauthorizedException, Inject } from '@nestjs/common';
 
@Middleware()
export class JSONContentTypeMiddleware implements NestMiddleware {
  constructor(
  ){}

  resolve(...args: any[]): MiddlewareFunction {
    return async (req, res, next) => {
      if (req.headers['x-amz-sns-message-type']) {
        req.headers['content-type'] = 'application/json;charset=UTF-8';
      }
      next();
    }
  }
}