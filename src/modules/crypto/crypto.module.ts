import { DynamicModule, Global, Module } from '@nestjs/common';
import { CustomValue } from '@nestjs/core/injector/module';
import { CryptoOptions } from './crypto-options.interface';
import { CryptoProvider } from './crypto.provider';

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
            components: [CryptoConfig, CryptoProvider],
            exports: [CryptoProvider],
        };
    }
}