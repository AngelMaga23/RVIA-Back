import { ApiProperty } from "@nestjs/swagger";

class ErrorDetailPDFFile {
    @ApiProperty({ example: 1 })
    code: number;
  
    @ApiProperty({ example: false })
    killed: boolean;
  
    @ApiProperty({ example: null })
    signal: string | null;
  
    @ApiProperty({ example: 'python3 /home/angel/RVIA-Back/src/python-scripts/recovery.py "sistemaintegraldeexhibicion" "checkmarx_437202409_sistemaintegraldeexhibicion.pdf" 437202409' })
    cmd: string;
  
    @ApiProperty({ example: "Error crítico: ERROR - 'Scan Results Details' not found" })
    stdout: string;
  
    @ApiProperty({ example: '' })
    stderr: string;
  
}

export class ErrorPDFFile {
    @ApiProperty({ example: 'Error al ejecutar el script.' })
    message: string;
  
    @ApiProperty({ type: ErrorDetailPDFFile })
    error: ErrorDetailPDFFile;
  
    @ApiProperty({ example: false })
    isValid: boolean;
  }