import { Operation } from "src/operations/entities/operation.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('tbl_acciones')
export class Action {

    @PrimaryGeneratedColumn('identity')
    idu_accion: number;

    @Column({type: 'varchar', length:255})
    nom_accion: string;

    // @ManyToOne(() => Application, application => application.scans, { nullable: false })
    // @JoinColumn({ name: 'idu_aplicacion' })
    // application: Application;
    // @OneToMany(() => Operation, operation => operation.accion)
    // Aplicacion: Operation[];
    @OneToMany(() => Operation, operation => operation.action)
    Operation: Operation[];
}
