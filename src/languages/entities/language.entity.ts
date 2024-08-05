import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('lenguajes')
export class Language {
    @PrimaryGeneratedColumn('identity')
    idu_lenguaje: number;

    @Column({type: 'varchar', length:255})
    nom_lenguaje: string; 
}
