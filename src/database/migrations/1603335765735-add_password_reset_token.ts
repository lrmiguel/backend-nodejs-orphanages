import { Column, MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class addPasswordResetToken1603335765735 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE 'users' ADD COLUMN 'password_reset_token' varchar`);
        await queryRunner.query(`ALTER TABLE 'users' ADD COLUMN 'password_reset_expires' timestamp`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'password_reset_token');
    }

}
