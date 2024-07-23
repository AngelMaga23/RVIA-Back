import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Applicationstatus } from '../../applicationstatus/entities/applicationstatus.entity';
import { Sourcecode } from '../../sourcecode/entities/sourcecode.entity';
import { Scan } from '../../scans/entities/scan.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('applications')
export class Application {

    @PrimaryGeneratedColumn('identity')
    id: number;

    @Column({type: 'varchar', length:255})
    name: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @ManyToOne(
        () => Applicationstatus, applicationstatus => applicationstatus.application,
        { eager:true }
    )
    applicationstatus: Applicationstatus

    @ManyToOne(
        () => Sourcecode, sourcecode => sourcecode.application,
        { eager:true }
    )
    sourcecode: Sourcecode

    @ManyToOne(
        () => User, user => user.application,
        { eager:true }
    )
    user: User

    // @ManyToOne(
    //     () => Scan, scan => scan.application,
    //     { eager:true }
    // )
    // scan: Scan

}
