import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../auth/entities/user.entity";


@Entity('cat_roles')
export class Position {

    @ApiProperty({ 
        example: 1,
        description: "Rol ID",
        uniqueItems:true
    })
    @PrimaryGeneratedColumn('identity')
    idu_rol: number;

    @ApiProperty({ 
        example: "Administrador",
        description: "Nombre del rol"
    })
    @Column({type: 'varchar', length:255})
    nom_rol: string;

    // @CreateDateColumn({ type: 'timestamp' })
    // created_at: Date;
  
    // @UpdateDateColumn({ type: 'timestamp' })
    // updated_at: Date;

    @OneToMany(
        () => User, user => user.position,
    )

    user:User[]

}
