import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {

    constructor(
        @InjectRepository( User )
        private readonly userRepository: Repository<User>,

        configService: ConfigService,
        private readonly encryptionService: CommonService
    ) {

        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }


    async validate( payload: JwtPayload ): Promise<User> {
        
        const { id } = payload;

        const user = await this.userRepository.findOneBy({ idu_usuario:id });

        // const user = await this.userRepository.findOne({
        //     where: { id },
        //     select: { email: true, password: true, id: true, isActive:true },
        //     relations: ['position']
        // });
        user.position.nom_puesto = this.encryptionService.decrypt(user.position.nom_puesto);

        if ( !user ) 
            throw new UnauthorizedException('Token not valid')
            
        if ( !user.esActivo ) 
            throw new UnauthorizedException('User is inactive, talk with an admin');
        
        // console.log({user})

        return user;
    }

}