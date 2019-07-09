import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsEmail({}, { message: 'Not a valid email address' })
    @IsOptional()
    email: string;

    @IsNotEmpty({ message: 'Field cannot be empty' })
    firstName: string;

    @IsNotEmpty({ message: 'Field cannot be empty' })
    lastName: string;

    @IsOptional()
    phoneNumber: string;

    @IsOptional()
    birthdate: Date;

    @IsOptional()
    gender: boolean;

    @IsOptional()
    address: string;

    @IsOptional()
    addressPostalCode: string;

    @IsOptional()
    addressCity: string;

    @IsOptional()
    geoPosition: any = [];

}