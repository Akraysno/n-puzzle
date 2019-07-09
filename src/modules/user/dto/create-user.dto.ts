import { IsEmail, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Roles } from 'n-puzzle-entity/dist/server/user/enums/roles.enum';

export class CreateUserDto {
    @IsEmail({}, { message: 'Not a valid email address' })
    @IsNotEmpty({ message: 'Field cannot be empty' })
    email: string;

    @IsNotEmpty({ message: 'Field cannot be empty' })
    firstName: string;

    @IsNotEmpty({ message: 'Field cannot be empty' })
    lastName: string;

    @IsNotEmpty({ message: 'Field cannot be empty' })
    phoneNumber: string;

    @IsNotEmpty({ message: 'Field cannot be empty' })
    birthdate: Date;

    @IsOptional()
    password: string;

    @IsNotEmpty({ message: 'Field cannot be empty' })
    gender: boolean;

    @IsEnum(Roles, { message: 'Not a valid user role' })
    role: Roles;

    @IsOptional()
    address: string;

    @IsOptional()
    addressPostalCode: string;

    @IsOptional()
    addressCity: string;

    @IsOptional()
    geoPosition: any = [];

}