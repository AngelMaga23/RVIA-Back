import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Application } from '../../applications/entities/application.entity';

@Entity('escaneos')
export class Scan {
    @PrimaryGeneratedColumn('identity')
    idu_escaneo: number;

    @Column({type: 'varchar', length:255})
    nom_escaneo: string;

    @Column({type: 'varchar', length:20})
    nom_directorio: string;

    // @CreateDateColumn({ type: 'timestamp' })
    // created_at: Date;
  
    // @UpdateDateColumn({ type: 'timestamp' })
    // updated_at: Date;

    // @OneToMany(
    //     () => Application, application => application.applicationstatus,
    // )
    // application:Application[]

}
