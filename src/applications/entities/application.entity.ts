import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Applicationstatus } from '../../applicationstatus/entities/applicationstatus.entity';
import { Sourcecode } from '../../sourcecode/entities/sourcecode.entity';
import { Scan } from '../../scans/entities/scan.entity';
import { User } from '../../auth/entities/user.entity';
import { UsersApplication } from "src/users-applications/entities/users-application.entity";

@Entity('aplicaciones')
export class Application {

    @PrimaryGeneratedColumn('identity')
    idu_aplicacion: number;

    @Column({type: 'varchar', length:255})
    nom_aplicacion: string;

    // @CreateDateColumn({ type: 'timestamp' })
    // created_at: Date;
  
    // @UpdateDateColumn({ type: 'timestamp' })
    // updated_at: Date;

    @ManyToOne(
        () => Applicationstatus, applicationstatus => applicationstatus.application,
        { eager:true }
    )
    @JoinColumn({ name: 'clv_estatus' })
    applicationstatus: Applicationstatus

    @ManyToOne(
        () => Sourcecode, sourcecode => sourcecode.application,
        { eager:true }
    )
    @JoinColumn({ name: 'idu_codigo_fuente' })
    sourcecode: Sourcecode

    @ManyToOne(
        () => User, user => user.application,
        { eager:true }
    )
    @JoinColumn({ name: 'idu_usuario' })
    user: User

    @OneToMany(() => UsersApplication, usuariosAplicaciones => usuariosAplicaciones.aplicacion)
    usuariosXAplicaciones: UsersApplication[];

    // @ManyToOne(
    //     () => Scan, scan => scan.application,
    //     { eager:true }
    // )
    // scan: Scan

}
