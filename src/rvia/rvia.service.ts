import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateRviaDto } from './dto/create-rvia.dto';
import { UpdateRviaDto } from './dto/update-rvia.dto';
import { ApplicationsService } from 'src/applications/applications.service';
import { CommonService } from 'src/common/common.service';
import { ErrorRVIA } from './helpers/errors-rvia';
import { CheckmarxService } from 'src/checkmarx/checkmarx.service';
import { ApplicationstatusService } from 'src/applicationstatus/applicationstatus.service';

const addon = require(process.env.RVIA_PATH);

@Injectable()
export class RviaService {

  constructor(

    private readonly applicationService: ApplicationsService,
    private readonly encryptionService: CommonService,
    private readonly checkmarxService: CheckmarxService
  ) {}

  async create(createRviaDto: CreateRviaDto) {

    const { idu_aplicacion, conIA, opc_arquitectura } = createRviaDto;

    const obj = new addon.CRvia(2);
    const aplicacion = await this.applicationService.findOne(idu_aplicacion);
    const fileCheckmarx = await this.checkmarxService.findOneByApplication(aplicacion.idu_aplicacion);
    let message;
    let isProccessValid = false;

    // Base de datos: 1 = Producción 2 = Desarrollo
    // const obj = new addon.CRvia(2);
    const lID = aplicacion.idu_proyecto;
    //  -------------------------------- Parámetros de Entrada --------------------------------
    const lIdProject = aplicacion.idu_aplicacion;
    const lEmployee = aplicacion.user.numero_empleado;
    const ruta_proyecto = this.encryptionService.decrypt(aplicacion.sourcecode.nom_directorio);
    const tipo_proyecto = aplicacion.num_accion;
    const iConIA = conIA;
    // const Bd = 1 = Producion 2 = Desarrollo
  
    const bConDoc   = Array.isArray(aplicacion.opc_arquitectura) && aplicacion.opc_arquitectura.length > 1 ? aplicacion.opc_arquitectura[1] : false;
    const bConCod   = Array.isArray(aplicacion.opc_arquitectura) && aplicacion.opc_arquitectura.length > 2 ? aplicacion.opc_arquitectura[2] : false;
    const bConTest  = Array.isArray(aplicacion.opc_arquitectura) && aplicacion.opc_arquitectura.length > 3 ? aplicacion.opc_arquitectura[3] : false;
    const bCalifica = Array.isArray(aplicacion.opc_arquitectura) && aplicacion.opc_arquitectura.length > 4 ? aplicacion.opc_arquitectura[4] : false;
    

    if (Array.isArray(fileCheckmarx) && fileCheckmarx.length === 0 && aplicacion.num_accion == 2) {

      throw new BadRequestException("Es necesario subir un archivo CSV.");

    } else if (fileCheckmarx && typeof fileCheckmarx === 'object') {

      // const initProcessResult = obj.initProcess( lID, lEmployee, ruta_proyecto, tipo_proyecto, iConIA, bConDoc, bConCod, bConTest, bCalifica);

      const actionsMap = {
        1: () => obj.createOverviewDoc(lEmployee, ruta_proyecto),
        2: () => obj.createCodeDoc(lEmployee, ruta_proyecto),
        3: () => obj.createTestCases(lEmployee, ruta_proyecto),
        4: () => obj.createRateProject(lEmployee, ruta_proyecto),
      };

      const initProcessResult = actionsMap[opc_arquitectura]();



      if(initProcessResult == 1){
        isProccessValid = true;
        message = "Proceso IA iniciado correctamente";
      }else{
        // throw new BadRequestException( ErrorRVIA[initProcessResult] );
        message = ErrorRVIA[initProcessResult];
      }

    } else {
      throw new InternalServerErrorException('Unexpected error, check server logs');
    }

    aplicacion.nom_aplicacion = this.encryptionService.decrypt(aplicacion.nom_aplicacion);

    const responseConvert = { ...aplicacion, ...{ isProccessValid,  message} };

    return responseConvert;
  }

  getVersion() {

    const obj = new addon.CRvia();
    return obj.getVersionAddons();

  }

  findAll() {
    return `This action returns all rvia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rvia`;
  }

  update(id: number, updateRviaDto: UpdateRviaDto) {
    return `This action updates a #${id} rvia`;
  }

  remove(id: number) {
    return `This action removes a #${id} rvia`;
  }
}
