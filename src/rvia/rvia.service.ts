import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRviaDto } from './dto/create-rvia.dto';
import { UpdateRviaDto } from './dto/update-rvia.dto';
import { ApplicationsService } from 'src/applications/applications.service';
import { CommonService } from 'src/common/common.service';
const addon = require('/sysx/progs/rvia/build/Release/rvia');

@Injectable()
export class RviaService {

  constructor(

    private readonly applicationService: ApplicationsService,
    private readonly encryptionService: CommonService,

  ) {}

  async create(createRviaDto: CreateRviaDto) {

    const aplicacion = await this.applicationService.findOne(createRviaDto.idu_aplicacion);
    // const obj = new addon.CRvia();
    // const lID = obj.createIDProject();

    //  -------------------------------- Parámetros de Entrada --------------------------------
    // const lIdProject = aplicacion.idu_aplicacion;
    // const lEmployee = aplicacion.user.numero_empleado;
    // const ruta_proyecto = this.encryptionService.decrypt(aplicacion.sourcecode.nom_directorio);
    // const tipo_proyecto = aplicacion.num_accion;
    // const iConIA = createRviaDto.conIA;
    // const Bd = 1 = Producion 2 = Desarrollo

    // const initProcessResult = obj.initProcess( lID, lEmployee, ruta_proyecto, tipo_proyecto, iConIA, 2);
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
