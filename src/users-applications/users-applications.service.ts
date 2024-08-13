import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUsersApplicationDto } from './dto/create-users-application.dto';
import { UsersApplication } from './entities/users-application.entity';
import { Application } from 'src/applications/entities/application.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UsersApplicationsService {

  private readonly logger = new Logger('PositionsService');

  constructor(
    @InjectRepository(UsersApplication)
    private readonly usersApplicationRepository: Repository<UsersApplication>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ){}

  async create(createUsersApplicationDto: CreateUsersApplicationDto) {

    const iduAplicacionNumber = Number(createUsersApplicationDto.idu_aplicacion);
    const iduUserNumber = Number(createUsersApplicationDto.idu_usuario);

    const application = await this.applicationRepository.findOne({
      where:{ idu_aplicacion:iduAplicacionNumber }
    });

    const user = await this.userRepository.findOne({
      where:{ idu_usuario:createUsersApplicationDto.idu_usuario }
    });

    const existingAssignment = await this.usersApplicationRepository.findOne({
      where: { idu_aplicacion:iduAplicacionNumber, idu_usuario:iduUserNumber },
    });

    if( !application || !user) throw new NotFoundException(`Aplicación o Usuario no encontrado `);

    if( createUsersApplicationDto.idu_usuario == application.user.idu_usuario || existingAssignment ) throw new ConflictException('Application is already assigned to this user');


    const applicationUser = this.usersApplicationRepository.create({
      aplicacion:application,
      usuario: user
    });

    await this.usersApplicationRepository.save(applicationUser);

    return applicationUser;
  }

  findAll() {
    return this.usersApplicationRepository.find();
  }

  async findOne(id: number) {
    const existingAssignment = await this.usersApplicationRepository.findOne({
      where: { idu: id },
      relations:['aplicacion','usuario']
    });
    if( !existingAssignment ) throw new NotFoundException(`Application not found `);

    return existingAssignment;
  }

  async remove(id: number) {

    const application = await this.findOne( id );
    await this.usersApplicationRepository.remove( application );

    return { message: `Application with ID ${id} has been successfully deleted` };
  }
}
