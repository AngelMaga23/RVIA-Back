import { Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Application } from "src/applications/entities/application.entity";
import { Action } from "src/actions/entities/action.entity";
import { Applicationstatus } from "src/applicationstatus/entities/applicationstatus.entity";


export class Operation {

    @PrimaryGeneratedColumn()
    idu_operacion: number;

    @ManyToOne(() => Application, application => application.Operation, { nullable: false })
    @JoinColumn({ name: 'idu_aplicacion' })
    application: Application;

    @ManyToOne(() => Action, action => action.Operation, { nullable: false })
    @JoinColumn({ name: 'idu_accion' })
    action: Action;

    @ManyToOne(() => Applicationstatus, applicationstatus => applicationstatus.Operation, { nullable: false })
    @JoinColumn({ name: 'clv_estatus' })
    applicationstatus: Applicationstatus;
  
    @Column('numeric', { precision: 15, scale: 2 })
    costo: number;


}
