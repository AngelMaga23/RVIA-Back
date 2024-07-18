import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Position } from "src/positions/entities/position.entity";


@Entity()
export class User {

    @PrimaryGeneratedColumn('identity')
    id: number;

    @Column({ type: 'varchar', unique: true })
    employee_number: string;

    @Column({type: 'varchar', length:255})
    name: string;

    @Column({type: 'varchar', length:255})
    email: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @ManyToOne(
        () => Position, position => position.user,
        { eager:true }
    )
    position: Position

    // @ManyToOne(() => Puesto, puesto => puesto.empleados)
    // puesto: Puesto;
}
