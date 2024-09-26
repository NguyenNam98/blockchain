import { SetMetadata } from '@nestjs/common'
import {Role} from "../utils/constants";

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles)
