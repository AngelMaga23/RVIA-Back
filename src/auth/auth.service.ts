import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { PositionsService } from '../positions/positions.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces';



@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly positionService: PositionsService,
    private readonly jwtService: JwtService,
  ) {}


  async create( createUserDto: CreateUserDto) {
    
    try {

      const { nom_contrasena, ...userData } = createUserDto;
      
      const position = await this.positionService.findOne( createUserDto.idu_puesto );

      const user = this.userRepository.create({
        ...userData,
        nom_contrasena: bcrypt.hashSync( nom_contrasena, 10 ),
        position: position
      });

      await this.userRepository.save( user )
      delete user.nom_contrasena;

      return {
        ...user,
        token: this.getJwtToken({ id: user.idu_usuario })
      };


    } catch (error) {
      this.handleDBErrors(error);
    }

  }

  async login( loginUserDto: LoginUserDto ) {

    const { nom_contrasena, numero_empleado } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { numero_empleado },
      select: { numero_empleado:true, nom_correo: true, nom_contrasena: true, idu_usuario: true },
      relations: ['position']
    });

    if ( !user ) 
      throw new UnauthorizedException('Credentials are not valid (employee_number)');
      
    if ( !bcrypt.compareSync( nom_contrasena, user.nom_contrasena ) )
      throw new UnauthorizedException('Credentials are not valid (password)');


    const { nom_contrasena: _, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      token: this.getJwtToken({ id: user.idu_usuario }) 
    };
  }

  async checkAuthStatus( user: User ){

    return {
      ...user,
      token: this.getJwtToken({ id: user.idu_usuario })
    };

  }

  async delete( id: string ){

    const user = await this.userRepository.findOneBy({ idu_usuario:id });
    if( !user )
      throw new NotFoundException(`application with ${id} not found `);


    user.esActivo = !user.esActivo;

    const appDelete =  await this.userRepository.save(user);

    return appDelete;

  }

  private getJwtToken( payload: JwtPayload ) {

    const token = this.jwtService.sign( payload );
    return token;

  }

  private handleDBErrors( error: any ): never {


    if ( error.code === '23505' ) 
      throw new BadRequestException( error.detail );

    console.log(error)

    throw new InternalServerErrorException('Please check server logs');

  }

}
