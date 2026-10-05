import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcrypt";

export class SeedAdminUser1791000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Super Admin
    const adminEmail = "admin@aulavirtual.com";
    const existingAdmin = await queryRunner.query(
      `SELECT id FROM users WHERE email = $1`,
      [adminEmail]
    );

    if (existingAdmin.length === 0) {
      const hashedAdminPassword = await bcrypt.hash("Admin123*Password", 10);
      await queryRunner.query(
        `INSERT INTO users (id, full_name, email, password_hash, role, status)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
        ["Super Admin", adminEmail, hashedAdminPassword, "ADMIN", "ACTIVE"]
      );
    }

    const defaultPassword = await bcrypt.hash("Password123!", 10);

    // 2. Docente de Prueba (PENDING_APPROVAL)
    const teacherEmail = "docente1@ejemplo.com";
    const existingTeacher = await queryRunner.query(
      `SELECT id FROM users WHERE email = $1`,
      [teacherEmail]
    );

    if (existingTeacher.length === 0) {
      await queryRunner.query(
        `INSERT INTO users (id, full_name, email, password_hash, role, status)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
        ["Docente de Prueba", teacherEmail, defaultPassword, "TEACHER", "PENDING_APPROVAL"]
      );
    }

    // 3. Estudiante de Prueba (ACTIVE)
    const studentEmail = "estudiante1@ejemplo.com";
    const existingStudent = await queryRunner.query(
      `SELECT id FROM users WHERE email = $1`,
      [studentEmail]
    );

    if (existingStudent.length === 0) {
      await queryRunner.query(
        `INSERT INTO users (id, full_name, email, password_hash, role, status)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
        ["Estudiante de Prueba", studentEmail, defaultPassword, "STUDENT", "ACTIVE"]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM users WHERE email IN ($1, $2, $3)`,
      ["admin@aulavirtual.com", "docente1@ejemplo.com", "estudiante1@ejemplo.com"]
    );
  }
}