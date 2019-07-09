import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';

export class ValidationPipe implements PipeTransform<any> {
    async transform(value, metadata: ArgumentMetadata) {
        const { metatype } = metadata;
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }

        Object.keys(value).forEach((key) => {
            if (typeof value[key] === 'string') {
                value[key] = value[key].trim();
                if (key !== 'phoneNumber' && key !== 'birthdate' && key !== 'familyComposition') {
                    value[key] = value[key].replace(/[&\\#+()$~%'"*?<>{}]/g, '');
                }
            }
        });
        const object = plainToClass(metatype, value);
        const errors = await validate(object);
        if (errors.length > 0) {
            throw new BadRequestException(this.formatValidationErrors(errors));
        }
        return value;
      }
      private toValidate(metatype): boolean {
        const types = [String, Boolean, Number, Array, Object];
        return !types.find((type) => metatype === type);
      }

      private formatValidationErrors = (errors: Array<ValidationError>) =>
        errors.reduce((prev, curr) => {
            prev[curr.property] = curr.constraints;
            return prev;
        }, {})
}
