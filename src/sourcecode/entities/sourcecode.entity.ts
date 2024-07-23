import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Application } from '../../applications/entities/application.entity';

@Entity('codigo_fuentes')
export class Sourcecode {
    @PrimaryGeneratedColumn('identity')
    idu_codigo_fuente: number;

    @Column({type: 'varchar', length:255})
    nom_codigo_fuente: string;

    @Column({type: 'varchar', length:20})
    nom_directorio: string;

    // @CreateDateColumn({ type: 'timestamp' })
    // created_at: Date;
  
    // @UpdateDateColumn({ type: 'timestamp' })
    // updated_at: Date;

    @OneToMany(
        () => Application, application => application.applicationstatus,
    )
    application:Application[]

}
