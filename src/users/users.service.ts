import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { PositionsService } from 'src/positions/positions.service';
import { Position } from 'src/positions/entities/position.entity';

@Injectable()
export class UsersService {

  private readonly logger = new Logger('PositionsService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User> ,

    private readonly positionService: PositionsService
  ){}

  async create(createUserDto: CreateUserDto) {
      try {
          
        
        const position = await this.positionService.findOne( createUserDto.positionId );

        const user = this.userRepository.create({...createUserDto,position: position});
        await this.userRepository.save(user);

        return user;

    } catch (error) {

        this.handleDBExceptions( error );
    }
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if( !user )
      throw new NotFoundException(`User with ${id} not found `);

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    
      const user = await this.userRepository.preload({
        id:id,
        ...updateUserDto
      });

      if( !user ) throw new NotFoundException(`User with ${id} not found `);

      try {
        await this.userRepository.save( user );
        return user;
      } catch (error) {
        this.handleDBExceptions(error);
      }

  }

  async remove(id: number) {
    const user = await this.findOne( id );
    await this.userRepository.remove( user );
  }

  private handleDBExceptions( error:any ){
    if( error.code === '23505' )
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException("Unexpected error, check server logs");
  }

}
