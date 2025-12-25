import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateFilesTable1701357100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'files',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'original_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'key',
            type: 'varchar',
            length: '500',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'url',
            type: 'text',
            isNullable: false,
          },
          // File Info
          {
            name: 'size_bytes',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'extension',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          // Variants
          {
            name: 'has_thumbnail',
            type: 'boolean',
            default: false,
          },
          {
            name: 'has_medium',
            type: 'boolean',
            default: false,
          },
          {
            name: 'has_large',
            type: 'boolean',
            default: false,
          },
          {
            name: 'has_webp',
            type: 'boolean',
            default: false,
          },
          // Metadata
          {
            name: 'uploaded_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'entity_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'entity_id',
            type: 'uuid',
            isNullable: true,
          },
          // Status
          {
            name: 'is_deleted',
            type: 'boolean',
            default: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
          // Timestamps
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.createIndex(
      'files',
      new TableIndex({
        name: 'idx_files_uploaded_by',
        columnNames: ['uploaded_by'],
      }),
    );

    await queryRunner.createIndex(
      'files',
      new TableIndex({
        name: 'idx_files_entity_type_id',
        columnNames: ['entity_type', 'entity_id'],
      }),
    );

    await queryRunner.createIndex(
      'files',
      new TableIndex({
        name: 'idx_files_key',
        columnNames: ['key'],
      }),
    );

    await queryRunner.createIndex(
      'files',
      new TableIndex({
        name: 'idx_files_is_deleted',
        columnNames: ['is_deleted'],
      }),
    );

    // Foreign Key
    await queryRunner.createForeignKey(
      'files',
      new TableForeignKey({
        name: 'fk_files_uploaded_by',
        columnNames: ['uploaded_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('files', 'fk_files_uploaded_by');
    await queryRunner.dropIndex('files', 'idx_files_is_deleted');
    await queryRunner.dropIndex('files', 'idx_files_key');
    await queryRunner.dropIndex('files', 'idx_files_entity_type_id');
    await queryRunner.dropIndex('files', 'idx_files_uploaded_by');
    await queryRunner.dropTable('files');
  }
}
