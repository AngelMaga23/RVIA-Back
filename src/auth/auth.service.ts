import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
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

  findAll() {
    return this.userRepository.find();
  }

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

  async update(id:string, updateUserDto: UpdateUserDto){

    try {
      const user = await this.userRepository.findOneBy({ idu_usuario:id });
     
      if( !user || user === null || user === undefined) 
        throw new NotFoundException(`User with ${id} not found `);
      

      if (updateUserDto.nom_contrasena) {
        
        user.nom_contrasena = bcrypt.hashSync(updateUserDto.nom_contrasena, 10);
        
      }
  
      if (updateUserDto.idu_puesto) {
        const position = await this.positionService.findOne( updateUserDto.idu_puesto );
        if( !position ) throw new NotFoundException(`Position with ${updateUserDto.idu_puesto} not found `);
        user.position = position;
      }
      const { nom_contrasena, idu_puesto, ...otherUpdates } = updateUserDto;
      Object.assign(user, otherUpdates);

      await this.userRepository.save(user);

      return user;

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private getJwtToken( payload: JwtPayload ) {

    const token = this.jwtService.sign( payload );
    return token;

  }

  private handleDBErrors( error: any ): never {

    console.log(error)
    if ( error.code === '23505' ) 
      throw new BadRequestException( error.detail );
    if ( error.status == '404' ) 
      throw new BadRequestException( error.response.message );


    throw new InternalServerErrorException('Please check server logs');

  }

}
