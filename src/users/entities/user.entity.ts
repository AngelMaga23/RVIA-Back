import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn('identity')
    id: number;

    @Column({ type: 'integer', unique: true })
    employee_number: number;

    @Column({type: 'varchar', length:255})
    name: string;

    @Column({type: 'varchar', length:255})
    email: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

}
