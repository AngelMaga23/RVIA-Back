import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRviaDto } from './dto/create-rvia.dto';
import { UpdateRviaDto } from './dto/update-rvia.dto';
import { ApplicationsService } from 'src/applications/applications.service';
import { CommonService } from 'src/common/common.service';
const addon = require(process.env.RVIA_PATH);

@Injectable()
export class RviaService {

  constructor(

    private readonly applicationService: ApplicationsService,
    private readonly encryptionService: CommonService,

  ) {}

  async create(createRviaDto: CreateRviaDto) {

    const aplicacion = await this.applicationService.findOne(createRviaDto.idu_aplicacion);
    // Base de datos: 1 = Producción 2 = Desarrollo
    // const obj = new addon.CRvia(2);
    const lID = aplicacion.idu_proyecto;
    //  -------------------------------- Parámetros de Entrada --------------------------------
    const lIdProject = aplicacion.idu_aplicacion;
    const lEmployee = aplicacion.user.numero_empleado;
    const ruta_proyecto = this.encryptionService.decrypt(aplicacion.sourcecode.nom_directorio);
    const tipo_proyecto = aplicacion.num_accion;
    const iConIA = createRviaDto.conIA;
    // const Bd = 1 = Producion 2 = Desarrollo
    const bConDoc   = aplicacion.opc_arquitectura ? aplicacion.opc_arquitectura[1] : false;
    const bConCod   = false;
    const bConTest  = aplicacion.opc_arquitectura ? aplicacion.opc_arquitectura[2] : false;
    const bCalifica = aplicacion.opc_arquitectura ? aplicacion.opc_arquitectura[3] : false;

    // const initProcessResult = obj.initProcess( lID, lEmployee, ruta_proyecto, tipo_proyecto, iConIA, bConDoc, bConCod, bConTest, bCalifica);
    // console.log(" Valor de retorno: " + initProcessResult);


    return aplicacion;
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
