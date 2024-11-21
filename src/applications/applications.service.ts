import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Application } from './entities/application.entity';
import { CommonService } from 'src/common/common.service';
import { CreateDocumentation } from './dto/create-documentation.dto';
import { ErrorRVIA } from 'src/rvia/helpers/errors-rvia';
import { CreateDocumentationCodigo } from './dto/create-documentation-cod.dto';
import { ConfigService } from '@nestjs/config';

const addon = require(process.env.RVIA_PATH);

@Injectable()
export class ApplicationsService {

  private readonly logger = new Logger('ApplicationsService');
  private readonly crviaEnvironment: number;

  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly encryptionService: CommonService,
    private readonly configService: ConfigService,
  ) {
    this.crviaEnvironment = Number(this.configService.get('RVIA_ENVIRONMENT'));
  }

  async findOne(id: number) {
    const aplicacion = await this.applicationRepository.findOneBy({ idu_aplicacion: id });

    if (!aplicacion)
      throw new NotFoundException(`Aplicación con ${id} no encontrado `);

    return aplicacion;
  }

  async addAppDocumentation(id: number, createDocumentation: CreateDocumentation) {
    try {
      const obj = new addon.CRvia(this.crviaEnvironment);

      // lIdProject           : 12345678
      // lEmployee            : > 90000000 <= 100000000
      // Ruta del proyecto    : /sysx/bito/projects/[carpeta del proyecto]

      const application = await this.applicationRepository.findOne({
        where: { idu_aplicacion: id }
      });

      if (!application) throw new NotFoundException(`Aplicación con ID ${id} no encontrado`);

      // const lID = application.idu_proyecto;
      const lEmployee = application.user.numero_empleado;
      const ruta_proyecto = this.encryptionService.decrypt(application.sourcecode.nom_directorio);

      const iResult = obj.createOverviewDoc( lEmployee, ruta_proyecto);
      // console.log(" Valor de retorno: " + iResult);

      if(iResult >= 600 && iResult <= 699)
        throw new BadRequestException( ErrorRVIA[iResult] );

      application.opc_arquitectura = {
        ...application.opc_arquitectura,
        [createDocumentation.opcArquitectura]: true,
      };

      application.opc_estatus_doc = 2;

      await this.applicationRepository.save(application);

      application.nom_aplicacion = this.encryptionService.decrypt(application.nom_aplicacion);

      return application;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async addAppDocumentationCode(id: number, createDocumentationCodigo: CreateDocumentationCodigo) {
    try {
      const obj = new addon.CRvia(this.crviaEnvironment);

      // lIdProject           : 12345678
      // lEmployee            : > 90000000 <= 100000000
      // Ruta del proyecto    : /sysx/bito/projects/[carpeta del proyecto]

      const application = await this.applicationRepository.findOne({
        where: { idu_aplicacion: id }
      });

      if (!application) throw new NotFoundException(`Aplicación con ID ${id} no encontrado`);

      // const lID = application.idu_proyecto;
      const lEmployee = application.user.numero_empleado;
      const ruta_proyecto = this.encryptionService.decrypt(application.sourcecode.nom_directorio);

      const iResult = obj.createOverviewDoc( lEmployee, ruta_proyecto);
      // console.log(" Valor de retorno: " + iResult);

      if(iResult >= 600 && iResult <= 699)
        throw new BadRequestException( ErrorRVIA[iResult] );

      application.opc_arquitectura = {
        ...application.opc_arquitectura,
        [createDocumentationCodigo.opcArquitectura]: true,
      };

      application.opc_estatus_doc_code = 2;

      await this.applicationRepository.save(application);

      application.nom_aplicacion = this.encryptionService.decrypt(application.nom_aplicacion);

      return application;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    if (error.response) throw new BadRequestException(error.message);

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

}
