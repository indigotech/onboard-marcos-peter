import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from 'typeorm';
import { Address } from './Address';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  birthdate: string;

  @OneToMany(() => Address, (address) => address.user, { cascade: true, onDelete: 'CASCADE' })
  addresses: Address[];
}
