import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export default class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({ name: 'password_reset_token' })
    passwordResetToken: string;

    @Column({ name: 'password_reset_expires' })
    passwordResetExpires: Date;

}