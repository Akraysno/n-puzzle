export interface CryptoOptions {
    jwtSecret: string;
    jwtTokenDuration: string;
    hashAlgo: string;
    saltLen: number;
}