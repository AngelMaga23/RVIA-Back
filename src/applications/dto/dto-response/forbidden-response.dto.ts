import { ApiProperty } from "@nestjs/swagger";

export class ForbiddenResponse {
    @ApiProperty({ example: 'Forbidden' })
    message: string;
  
    @ApiProperty({ example: 403 })
    statusCode: number;
}