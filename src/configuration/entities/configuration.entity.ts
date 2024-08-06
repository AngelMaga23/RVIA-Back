import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('configuraciones')
export class Configuration {

    @PrimaryGeneratedColumn('identity')
    idu_configuracion: number;

    @Column({type: 'varchar', length:255})
    nom_key: string;

    @Column({type: 'varchar', length:255})
    nom_value: string;
}
