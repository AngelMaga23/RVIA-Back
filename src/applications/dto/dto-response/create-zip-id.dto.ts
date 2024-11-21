import { ApiProperty } from '@nestjs/swagger';

export class CreateZipIdDto {
    @ApiProperty({ example: ["localhost"] })
    host: string[];

    @ApiProperty({ example: "3000" })
    port: string;

    @ApiProperty({ example: ["applications", "7z", "1"] })
    path: string[];
}