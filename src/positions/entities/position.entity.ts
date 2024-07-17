import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Position {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({type: 'varchar', length:255})
    name: string;
}
