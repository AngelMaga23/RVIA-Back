import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('cat_lenguajes')
export class Language {
    @ApiProperty({ 
        example: "1",
        description: "Language ID",
        uniqueItems:true
     })
    @PrimaryGeneratedColumn('identity')
    idu_lenguaje: number;

    @ApiProperty({ 
        example: "PHP",
        description: "Nombre del lenguaje"
     })
    @Column({type: 'varchar', length:255})
    nom_lenguaje: string; 
}
