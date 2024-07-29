import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Application } from '../../applications/entities/application.entity';

@Entity('seguimiento_modificaciones')
export class Seguimiento {
    @PrimaryGeneratedColumn('identity')
    idu_seguimiento: number;

    @Column({type: 'varchar', length:255})
    nom_tabla: string;

    @Column({type: 'varchar', length:255})
    nom_accion: string;

    @Column({type: 'varchar', length:255})
    idu_usuario: string;

    @CreateDateColumn({ type: 'timestamp' })
    fec_evento: Date;

    @Column({ type: 'jsonb', nullable: true })
    identificador_registro: any;

    @Column({ type: 'jsonb', nullable: true })
    valores_anteriores: any;

    @Column({ type: 'jsonb', nullable: true })
    valores_nuevos: any;

}
