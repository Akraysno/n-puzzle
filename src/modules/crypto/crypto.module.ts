import { DynamicModule, Global, Module } from '@nestjs/common';
import { CustomValue } from '@nestjs/core/injector/module';
import { CryptoOptions } from './crypto-options.interface';
import { CryptoService } from './crypto.service';

@Global()
@Module({})
export class CryptoModule {
    static forRoot(options: CryptoOptions): DynamicModule {
        const CryptoConfig: CustomValue = {
            name: 'CRYPTO_CONFIG',
            provide: 'CRYPTO_CONFIG',
            useValue: { ...options },
        };

        return {
            module: CryptoModule,
            imports: [],
            components: [CryptoConfig, CryptoService],
            exports: [CryptoService],
        };
    }
}