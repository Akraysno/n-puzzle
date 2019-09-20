import { Component, Inject } from '@nestjs/common';
import { createHash } from 'crypto';
import * as jwt from 'jsonwebtoken';

@Component()
export class CryptoService {
    constructor(@Inject('CRYPTO_CONFIG')private readonly cryptoConfig) {}

    genSalt(len: number) {
        const set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
        const setLen = set.length;
        let salt = '';
        for (let i = 0; i < len; i++) {
            const p = Math.floor(Math.random() * setLen);
            salt += set[p];
        }
        return salt;
    }

    genNumbers(len: number) {
        const set = '0123456789';
        const setLen = set.length;
        let salt = '';
        for (let i = 0; i < len; i++) {
            const p = Math.floor(Math.random() * setLen);
            salt += set[p];
        }
        return salt;
    }

    hashPassword(password: string) {
        const salt = this.genSalt(this.cryptoConfig.saltLen);
        const hash = this.hash(password + salt);
        return salt + hash;
    }

    hash(string: string, algo: string = this.cryptoConfig.hashAlgo) {
        return createHash(algo)
                .update(string)
                .digest('hex');
    }

    checkPassword(hashedPassword: string, password: string) {
        const salt = hashedPassword.substr(0, this.cryptoConfig.saltLen);
        return (salt + this.hash(password + salt)) === hashedPassword;
    }

    createJwtToken(payload: any, expiresIn = this.cryptoConfig.jwtTokenDuration, jwtSecret = this.cryptoConfig.jwtSecret) {
        return jwt.sign(payload, jwtSecret, { expiresIn });
    }
}