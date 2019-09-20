import { JSONContentTypeMiddleware } from './modules/auth/middlewares/json-content-type.middleware';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionOptions } from 'typeorm';
import * as morgan from 'morgan';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { JWTAuthMiddleware } from './modules/auth/middlewares/jwt-auth.middleware';
import { AuthOptions } from './modules/auth/auth-options.interface';
import { CryptoModule } from './modules/crypto/crypto.module';
import { CryptoOptions } from './modules/crypto/crypto-options.interface';
import { BindRolesFuncsMiddleware } from './modules/user/middlewares/bind-roles-funcs.middleware';
import { NPuzzleModule } from 'modules/n-puzzle/n-puzzle.module';
import { TestModule } from './modules/test/test.module'

const {
  ENV,
  DB_NAME,
  JWT_SECRET,
  JWT_TOKEN_DURATION,
} = process.env;

const DB_CONFIG: ConnectionOptions = {
    type: 'mongodb',
    host: 'localhost',
    port: 27017,
    database: DB_NAME,
    entities: [__dirname + '/../node_modules/n-puzzle-entity/dist/server/**/*.entity{.ts,.js}'],
};

const AUTH_CONFIG: AuthOptions = {
  jwtSecret: JWT_SECRET,
  tokenDuration: JWT_TOKEN_DURATION
};

const CRYPTO_CONFIG: CryptoOptions = {
  jwtSecret: JWT_SECRET,
  jwtTokenDuration: JWT_TOKEN_DURATION,
  hashAlgo: 'whirlpool',
  saltLen: 10,
};

@Module({
  imports: [
    TypeOrmModule.forRoot(DB_CONFIG),
    CryptoModule.forRoot(CRYPTO_CONFIG),
    AuthModule.forRoot(AUTH_CONFIG),
    UserModule,
    NPuzzleModule,
    TestModule,
  ],
  controllers: [],
  components: [],
  exports: []
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    const logMiddleware = morgan(ENV === 'dev' ? 'dev' : 'combined');
    consumer.apply(logMiddleware).forRoutes('/**');
    consumer.apply(JSONContentTypeMiddleware).forRoutes('/**');
    consumer.apply(JWTAuthMiddleware).forRoutes('/**');
    consumer.apply(BindRolesFuncsMiddleware).forRoutes('/**');
  }
}
