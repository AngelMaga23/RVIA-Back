import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../auth/entities/user.entity";

@Entity('puestos')
export class Position {
    @PrimaryGeneratedColumn('identity')
    idu_puesto: number;

    @Column({type: 'varchar', length:255})
    nom_puesto: string;

    // @CreateDateColumn({ type: 'timestamp' })
    // created_at: Date;
  
    // @UpdateDateColumn({ type: 'timestamp' })
    // updated_at: Date;

    @OneToMany(
        () => User, user => user.position,
    )

    user:User[]

}
