import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';
import { PositionsService } from '../positions/positions.service';
import { JwtPayload } from './interfaces';
import { CommonService } from 'src/common/common.service';



@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly positionService: PositionsService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: CommonService
  ) {}

  async findAll() {
    
    const usuarios = await this.userRepository.find();

    usuarios.map(usuario => {
      usuario.nom_correo = this.encryptionService.decrypt(usuario.nom_correo);
      usuario.nom_usuario = this.encryptionService.decrypt(usuario.nom_usuario);
      usuario.position.nom_rol = this.encryptionService.decrypt(usuario.position.nom_rol);
      return usuarios;
    });

    return usuarios;
  }

  async findAllActiveUsers(){

    const usuarios = await this.userRepository.find({ where: { esactivo: true }});

    const usuariosDesencriptados = usuarios.map(usuario => ({
      ...usuario,
      nom_correo: this.encryptionService.decrypt(usuario.nom_correo),
      nom_usuario: this.encryptionService.decrypt(usuario.nom_usuario),
      position: {
        ...usuario.position,
        nom_rol: this.encryptionService.decrypt(usuario.position.nom_rol),
      }
    }));

    return usuariosDesencriptados;
  }

  async findUserById(id: string) {
    const user = await this.userRepository.findOneBy({ idu_usuario:id });
    if( !user )
      throw new NotFoundException(`Usuario con ${id} no encontrado `);

    user.nom_usuario = this.encryptionService.decrypt(user.nom_usuario);
    user.nom_correo = this.encryptionService.decrypt(user.nom_correo);
    user.position.nom_rol = this.encryptionService.decrypt(user.position.nom_rol);
    
    return user;
  }

  async create( createUserDto: CreateUserDto) {
    
    try {

      const { nom_contrasena,nom_correo, nom_usuario, ...userData } = createUserDto;
      
      const position = await this.positionService.findOne( createUserDto.idu_rol );

      if( await this.checkEmailExist( nom_correo ) )
        throw new BadRequestException('El correo ya existe');

      const user = this.userRepository.create({
        ...userData,
        nom_correo: this.encryptionService.encrypt(createUserDto.nom_correo),
        nom_usuario: this.encryptionService.encrypt(createUserDto.nom_usuario),
        nom_contrasena: bcrypt.hashSync( nom_contrasena, 10 ),
        position: position
      });

      await this.userRepository.save( user )
      delete user.nom_contrasena;

      user.nom_correo = this.encryptionService.decrypt(user.nom_correo);
      user.nom_usuario = this.encryptionService.decrypt(user.nom_usuario);

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
      select: { numero_empleado:true, nom_correo: true, nom_contrasena: true, idu_usuario: true, nom_usuario:true },
      relations: ['position']
    });

    if ( !user ) 
      throw new UnauthorizedException('Número de empleado no válido');
      
    if ( !bcrypt.compareSync( nom_contrasena, user.nom_contrasena ) )
      throw new UnauthorizedException('Contraseña no válida');


    const { nom_contrasena: _, ...userWithoutPassword } = user;
    userWithoutPassword.nom_correo = this.encryptionService.decrypt(userWithoutPassword.nom_correo);
    userWithoutPassword.nom_usuario = this.encryptionService.decrypt(userWithoutPassword.nom_usuario);
    
    return {
      ...userWithoutPassword,
      token: this.getJwtToken({ id: user.idu_usuario }) 
    };
  }

  async checkAuthStatus( user: User ){
    const token = await this.getJwtToken({ id: user.idu_usuario });
    return {
      ...user,
      token: token
    };

  }
  
  private getJwtToken( payload: JwtPayload ) {

    const token = this.jwtService.sign( payload );
    return token;

  }

  private async checkEmailExist(correo: string): Promise<boolean> {
    try {

      const users = await this.userRepository.find();

      const emailExists = users.some(user => 
        this.encryptionService.decrypt(user.nom_correo) === correo
      );

      return emailExists;
  
    } catch (error) {

      this.handleDBErrors(error);
      return false;
    }
  }
  

  private handleDBErrors( error: any ): never {

    if ( error.code === '23505' || error.code === '42703' ){
      if(error.detail.includes('numero_empleado')){
        throw new BadRequestException( "El número de empleado ya existe" );
      }
      throw new BadRequestException( error.detail );
    }

    if ( error instanceof NotFoundException )
      throw error;

    if( error.status && error.status == 400)
      throw new BadRequestException( error.response );

    throw new InternalServerErrorException('Please check server logs');

  }

}
