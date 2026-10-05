import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1790865379102 implements MigrationInterface {
    name = 'InitialSchema1790865379102'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'TEACHER', 'STUDENT')`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('ACTIVE', 'PENDING_APPROVAL', 'DISABLED')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "full_name" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL, "status" "public"."users_status_enum" NOT NULL DEFAULT 'ACTIVE', "token_version" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subjects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "teacher_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "description" text, "code" character varying(20) NOT NULL, "is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_542cbba74dde3c82ab49c573109" UNIQUE ("code"), CONSTRAINT "PK_1a023685ac2b051b4e557b0b280" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sections_type_enum" AS ENUM('CONTENT', 'LIBRARY', 'ASSIGNMENT')`);
        await queryRunner.query(`CREATE TABLE "sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subject_id" uuid NOT NULL, "title" character varying(255) NOT NULL, "type" "public"."sections_type_enum" NOT NULL, "position" integer NOT NULL DEFAULT '1', "is_published" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f9749dd3bffd880a497d007e450" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "section_id" uuid NOT NULL, "title" character varying(255) NOT NULL, "instructions" text, "due_at" TIMESTAMP NOT NULL, "max_score" numeric(5,2) NOT NULL DEFAULT '5', "allow_late" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c54ca359535e0012b04dcbd80ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."submissions_status_enum" AS ENUM('SUBMITTED', 'RETURNED', 'GRADED')`);
        await queryRunner.query(`CREATE TABLE "submissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "assignment_id" uuid NOT NULL, "student_id" uuid NOT NULL, "text_content" text, "score" numeric(5,2), "feedback" text, "status" "public"."submissions_status_enum" NOT NULL DEFAULT 'SUBMITTED', "is_late" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f043d0d459a667e9396e2a90864" UNIQUE ("assignment_id", "student_id"), CONSTRAINT "PK_10b3be95b8b2fb1e482e07d706b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "resources" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "section_id" uuid NOT NULL, "file_key" character varying(255) NOT NULL, "original_name" character varying(255) NOT NULL, "mime_type" character varying(100) NOT NULL, "file_size" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_632484ab9dff41bba94f9b7c85e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "title" character varying(255) NOT NULL, "message" text NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."enrollments_status_enum" AS ENUM('ACTIVE', 'DROPPED')`);
        await queryRunner.query(`CREATE TABLE "enrollments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "student_id" uuid NOT NULL, "subject_id" uuid NOT NULL, "status" "public"."enrollments_status_enum" NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_15b3730b7488177f7820c111c4a" UNIQUE ("student_id", "subject_id"), CONSTRAINT "PK_7c0f752f9fb68bf6ed7367ab00f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD CONSTRAINT "FK_b0ee519d18901072d85961b2652" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sections" ADD CONSTRAINT "FK_ca80ad25c1f42ba2ada091d61b0" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assignments" ADD CONSTRAINT "FK_87b0fa41748dd5f6e2d86c2ebb8" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "submissions" ADD CONSTRAINT "FK_8723840b9b0464206640c268abc" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "submissions" ADD CONSTRAINT "FK_435def3bbd4b4bbb9de1209cdae" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "resources" ADD CONSTRAINT "FK_0c43a42d32d9ebd0a1ade6fd013" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_307813fe255896d6ebf3e6cd55c" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_931f4e1d2848270a4ec594bda59" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_931f4e1d2848270a4ec594bda59"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_307813fe255896d6ebf3e6cd55c"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`);
        await queryRunner.query(`ALTER TABLE "resources" DROP CONSTRAINT "FK_0c43a42d32d9ebd0a1ade6fd013"`);
        await queryRunner.query(`ALTER TABLE "submissions" DROP CONSTRAINT "FK_435def3bbd4b4bbb9de1209cdae"`);
        await queryRunner.query(`ALTER TABLE "submissions" DROP CONSTRAINT "FK_8723840b9b0464206640c268abc"`);
        await queryRunner.query(`ALTER TABLE "assignments" DROP CONSTRAINT "FK_87b0fa41748dd5f6e2d86c2ebb8"`);
        await queryRunner.query(`ALTER TABLE "sections" DROP CONSTRAINT "FK_ca80ad25c1f42ba2ada091d61b0"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP CONSTRAINT "FK_b0ee519d18901072d85961b2652"`);
        await queryRunner.query(`DROP TABLE "enrollments"`);
        await queryRunner.query(`DROP TYPE "public"."enrollments_status_enum"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TABLE "resources"`);
        await queryRunner.query(`DROP TABLE "submissions"`);
        await queryRunner.query(`DROP TYPE "public"."submissions_status_enum"`);
        await queryRunner.query(`DROP TABLE "assignments"`);
        await queryRunner.query(`DROP TABLE "sections"`);
        await queryRunner.query(`DROP TYPE "public"."sections_type_enum"`);
        await queryRunner.query(`DROP TABLE "subjects"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
