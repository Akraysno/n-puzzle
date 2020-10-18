import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConnectionOptions } from 'typeorm';
import * as morgan from 'morgan';
import { CryptoModule } from './modules/crypto/crypto.module';
import { CryptoOptions } from './modules/crypto/crypto-options.interface';
import { NPuzzleModule } from 'modules/n-puzzle/n-puzzle.module';
import { TestModule } from './modules/test/test.module'

const {
  ENV,
  DB_NAME,
  JWT_SECRET,
  JWT_TOKEN_DURATION,
} = process.env;

const CRYPTO_CONFIG: CryptoOptions = {
  jwtSecret: JWT_SECRET,
  jwtTokenDuration: JWT_TOKEN_DURATION,
  hashAlgo: 'whirlpool',
  saltLen: 10,
};

@Module({
  imports: [
    CryptoModule.forRoot(CRYPTO_CONFIG),
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
  }
}
