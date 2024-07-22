import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Position } from "../../positions/entities/position.entity";
import { Application } from '../../applications/entities/application.entity';


@Entity('users')
export class User {

    @PrimaryGeneratedColumn('identity')
    id: string;

    @Column({
        type: 'varchar', 
        length:255, 
        unique:true
    })
    employee_number: string;

    @Column({
        type: 'varchar', 
        length:255, 
        unique:true
    })
    email: string;

    @Column('text', {
        select: false
    })
    password: string;

    @Column({
        type: 'varchar', 
        length:255,
    })
    name: string;

    @Column('bool', {
        default: true
    })
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @ManyToOne(
        () => Position, position => position.user,
        { eager:true }
    )
    position: Position

    @OneToMany(
        () => Application, application => application.applicationstatus,
    )
    application:Application[]

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();   
    }

}
