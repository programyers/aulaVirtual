import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcrypt";

export class SeedAdminUser1791000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const adminEmail = "admin@aulavirtual.com";
    const existingAdmin = await queryRunner.query(
      `SELECT id FROM users WHERE email = $1`,
      [adminEmail],
    );

    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash("Admin123*Password", 10);
      await queryRunner.query(
        `INSERT INTO users (id, full_name, email, password_hash, role, status)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
        ["Super Admin", adminEmail, hashedPassword, "ADMIN", "ACTIVE"],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM users WHERE email = $1`, [
      "admin@aulavirtual.com",
    ]);
  }
}
