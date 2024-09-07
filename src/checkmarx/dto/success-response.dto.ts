import { ApiProperty } from '@nestjs/swagger';
import { Checkmarx } from '../entities/checkmarx.entity';

class CheckmarxDto {
  @ApiProperty({ example: 'encryptedFileName', description: 'Nombre del archivo cifrado' })
  nom_checkmarx: string;

  @ApiProperty({ example: 'encryptedFilePath', description: 'Ruta del directorio cifrada' })
  nom_directorio: string;

  @ApiProperty({ example: 'applicationId', description: 'ID de la aplicación asociada' })
  application: any; // Define el tipo según tu aplicación
}

export class SuccessResponse {
  @ApiProperty({ example: 'CSV Generado', description: 'Mensaje de éxito' })
  message: string;

  @ApiProperty({ example: true, description: 'Indica si la operación fue válida' })
  isValid: boolean;

  @ApiProperty({ type: CheckmarxDto, description: 'Objeto Checkmarx generado' })
  checkmarx: Checkmarx;
}