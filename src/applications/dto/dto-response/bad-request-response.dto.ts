import { ApiProperty } from "@nestjs/swagger";

export class BadRequestResponse {
    @ApiProperty({ 
        example: 'El mensaje de error, que puede ser un solo string o un array de strings',
    })
    message: string | string[];
    
    @ApiProperty({ example: 'Bad Request' })
    error: string;

    @ApiProperty({ example: 400 })
    statusCode: number;
}