import { ApiProperty } from "@nestjs/swagger";

export class InternalServerErrorResponse {
    @ApiProperty({ example: 'Internal server error' })
    message: string;
  
    @ApiProperty({ example: 500 })
    statusCode: number;
}