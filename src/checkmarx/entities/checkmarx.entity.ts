import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { Application } from "src/applications/entities/application.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('ctl_checkmarx')
export class Checkmarx {

    @ApiProperty({ 
        example: "1",
        description: "Checkmarx ID",
        uniqueItems:true
     })
    @PrimaryGeneratedColumn('identity')
    idu_checkmarx: number;

    @ApiProperty({ 
        example: "checkmarx_IDPROYECTO_NOMBRE-APLICACIÓN.csv",
        description: "Nombre del archivo"
     })
    @Column({type: 'varchar', length:255})
    nom_checkmarx: string;

    @ApiProperty({ 
        example: "/sysx/bito/projects/NOMBRE-APLICACIÓN/checkmarx_IDPROYECTO_NOMBRE-APLICACIÓN.csv",
        description: "Directorio del archivo"
     })
    @ApiProperty()
    @Column({type: 'varchar', length:255})
    nom_directorio: string;

    // @ApiProperty()
    @ManyToOne(() => Application, application => application.scans, { nullable: false })
    @ApiHideProperty()
    @JoinColumn({ name: 'idu_aplicacion' })
    application: Application;

}
