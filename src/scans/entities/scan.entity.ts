import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Application } from '../../applications/entities/application.entity';

@Entity('scans')
export class Scan {
    @PrimaryGeneratedColumn('identity')
    id: number;

    @Column({type: 'varchar', length:255})
    name: string;

    @Column({type: 'varchar', length:20})
    directory: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    // @OneToMany(
    //     () => Application, application => application.applicationstatus,
    // )
    // application:Application[]

}
