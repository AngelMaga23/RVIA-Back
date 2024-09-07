import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { Language } from './entities/language.entity';
import { CommonService } from 'src/common/common.service';


@Injectable()
export class LanguagesService {

  private readonly logger = new Logger('LanguagesService');

  constructor(
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    private readonly encryptionService: CommonService
  ){}

  async create(createLanguageDto: CreateLanguageDto) {
    try {
        
      createLanguageDto.nom_lenguaje = this.encryptionService.encrypt(createLanguageDto.nom_lenguaje);
      const language = this.languageRepository.create(createLanguageDto);
      await this.languageRepository.save(language);

      language.nom_lenguaje = this.encryptionService.decrypt(language.nom_lenguaje);
      return language;

   } catch (error) {

      this.handleDBExceptions( error );
   }
  }

  async findAll() {
    try {
      const languages = await this.languageRepository.find();

      languages.map(language => {
        language.nom_lenguaje = this.encryptionService.decrypt(language.nom_lenguaje);
        // return decryptedLanguages;
      });
  
      return languages ;
    } catch (error) {
      this.handleDBExceptions( error ); 
    }

  }

  async findOne(id: number) {

    const language = await this.languageRepository.findOneBy({ idu_lenguaje:id });

    if( !language )
      throw new NotFoundException(`Lenguaje con ${id} no encontrado `);
    language.nom_lenguaje = this.encryptionService.decrypt(language.nom_lenguaje);
    
    return language; 
  }

  async update(id: number, updateLanguageDto: UpdateLanguageDto) {
    const language = await this.languageRepository.preload({
      idu_lenguaje: id,
      ...updateLanguageDto
    });

    if( !language ) throw new NotFoundException(`Lenguaje con ${id} no encontrado `);

    try {

      language.nom_lenguaje = this.encryptionService.encrypt(language.nom_lenguaje);
      await this.languageRepository.save( language );

      language.nom_lenguaje = this.encryptionService.decrypt(language.nom_lenguaje);
      return language;

    } catch (error) {
      this.handleDBExceptions(error);
    }

    return language;
  }

  async remove(id: number) {
    const language = await this.findOne( id );

    if (!language) {
      throw new NotFoundException(`Lenguaje con ID ${id} no encontrado`);
    }

    const nom_lenguaje = language.nom_lenguaje;

    await this.languageRepository.remove( language );

    return { message: `Lenguaje ${nom_lenguaje} eliminado correctamente` };
  }

  private handleDBExceptions( error:any ){
    if( error.code === '23505' )
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException("Unexpected error, check server logs");
  }
}
