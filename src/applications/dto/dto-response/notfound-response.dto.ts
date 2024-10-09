import { ApiProperty } from "@nestjs/swagger";

export class NotFoundExceptionResponse {
    @ApiProperty({ example: 'Archivo/Dato no encontrado' })
    message: string;

    @ApiProperty({ example: 'Not Found' })
    error: string;
  
    @ApiProperty({ example: 404 })
    statusCode: number;
}