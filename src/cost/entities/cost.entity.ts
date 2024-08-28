import { Application } from "src/applications/entities/application.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('tbl_costos')
export class Cost {

    @PrimaryGeneratedColumn('identity')
    idu_costo: number;

    @Column({type: 'varchar', length:255})
    des_costo: string;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    imp_costo: string;

    @ManyToOne(() => Application, application => application.cost, { nullable: false })
    @JoinColumn({ name: 'idu_aplicacion' })
    application: Application;

}
