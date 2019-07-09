import { ReflectMetadata } from '@nestjs/common';
import { Roles } from 'n-puzzle-entity/dist/server/user/enums/roles.enum';

export const ForRoles = (...roles: Roles[]) => ReflectMetadata('roles', roles);