import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", unique: true })
  email!: string;

  @Column({ type: "varchar", name: "password_hash" })
  passwordHash!: string;

  @Column({ type: "varchar", name: "full_name" })
  fullName!: string;

  @Column({ type: "varchar", default: "STUDENT" })
  role!: "ADMIN" | "TEACHER" | "STUDENT";

  @Column({ type: "varchar", default: "ACTIVE" })
  status!: "ACTIVE" | "PENDING_APPROVAL" | "DISABLED";
}
