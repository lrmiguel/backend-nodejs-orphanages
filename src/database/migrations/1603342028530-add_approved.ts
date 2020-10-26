import { MigrationInterface, QueryRunner } from "typeorm";

export class addApproved1603342028530 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE orphanages ADD COLUMN approved boolean");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('orphanages', 'approved');
    }

}
