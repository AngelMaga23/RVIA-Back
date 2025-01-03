import { Application } from "src/applications/entities/application.entity";
import { User } from "src/auth/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('ctl_usuarios_por_aplicaciones')
export class UsersApplication {

    @PrimaryGeneratedColumn('identity')
    idu: number;

    @Column()
    idu_usuario: number;
  
    @Column()
    idu_aplicacion: number;
  
    @ManyToOne(() => User, usuario => usuario.usuariosXAplicaciones)
    @JoinColumn({ name: 'idu_usuario' })
    usuario: User;
  
    @ManyToOne(() => Application, aplicacion => aplicacion.usuariosXAplicaciones)
    @JoinColumn({ name: 'idu_aplicacion' })
    aplicacion: Application;

}
