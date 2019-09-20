import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import * as compression from 'compression';
import './initEnv';
import { AppModule } from './app.module';
import { ValidationPipe } from './shared/pipes/validation.pipe';
import * as contextService from 'request-context';
import { readFileSync } from 'fs';
import * as https from 'https';
import { CustomExceptionFilter } from 'shared/filters/custom-exception.filter';
import * as rateLimit from 'express-rate-limit';
import * as bodyParser from 'body-parser'

async function bootstrap() {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, expressApp, { cors: true });
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    handler: (req, res) => {
      // send to slack (req.statusCode, `To many requests from ${req.ip} (Method: ${req.method}, URL: ${req.url})`)
      res.status(429).send('Too many requests');
      console.log(`${req.method} ${req.url}\x1b[31m 429\x1b[0m - - ${res._contentLength}`)
    }
  })
  app.use(compression());
  app.use(contextService.middleware('request'));
  app.useGlobalPipes(new ValidationPipe());
  app.use((req, res, next) => {
    if (req.headers['x-amz-sns-message-type']) { // Allow SNS to be parsed from bodyparser
      req.headers['content-type'] = 'application/json;charset=UTF-8';
      res.setHeader('WWW-Authenticate', `Basic realm=${process.env.AWS_SNS_USER}`)
    }
    next();
  })
  app.useGlobalFilters(new CustomExceptionFilter())
  app.use(limiter);
  app.use(bodyParser.json({ limit: '2mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '2mb' }));

  if(process.env.ENV !== 'dev'){
    let options = {
      key: readFileSync(process.env.SSL_KEY_PATH),
      cert: readFileSync(process.env.SSL_CERT_PATH)
    };

    let httpsServer = https.createServer(options, expressApp);

    app.init();

    httpsServer.listen(3000);
  } else {
    await app.listen(3000);
  }
}
bootstrap().catch((err) => process.stderr.write(err + '\n'));
