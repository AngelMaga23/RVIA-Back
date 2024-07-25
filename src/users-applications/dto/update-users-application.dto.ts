import { PartialType } from '@nestjs/mapped-types';
import { CreateUsersApplicationDto } from './create-users-application.dto';

export class UpdateUsersApplicationDto extends PartialType(CreateUsersApplicationDto) {}
