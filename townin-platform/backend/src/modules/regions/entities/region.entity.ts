import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

export enum RegionLevel {
  CITY = 'city',
  DISTRICT = 'district',
  NEIGHBORHOOD = 'neighborhood',
}

@Entity('regions')
@Index('idx_regions_code', ['code'], { unique: true })
@Index('idx_regions_parent_id', ['parentId'])
@Index('idx_regions_level', ['level'])
export class Region {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'code', type: 'varchar', length: 10, unique: true })
  code: string; // 행정구역코드 (예: 1111000000)

  @Column({ name: 'name_ko', type: 'varchar', length: 100 })
  nameKo: string; // 한글명 (예: 종로구)

  @Column({ name: 'name_en', type: 'varchar', length: 100, nullable: true })
  nameEn: string; // 영문명 (Jongno-gu)

  @Column({
    name: 'level',
    type: 'varchar',
    length: 20,
    enum: RegionLevel,
  })
  level: RegionLevel;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string;

  @ManyToOne(() => Region, region => region.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Region;

  @OneToMany(() => Region, region => region.parent)
  children: Region[];

  // Geospatial columns (stored as WKT or GeoJSON text for now)
  @Column({
    name: 'boundary',
    type: 'text',
    nullable: true,
  })
  boundary: string; // WKT or GeoJSON Polygon

  @Column({
    name: 'center_point_lat',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  centerPointLat: number;

  @Column({
    name: 'center_point_lng',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  centerPointLng: number;

  // Metadata
  @Column({ name: 'population', type: 'int', nullable: true })
  population: number; // 인구수

  @Column({ name: 'area_sqm', type: 'decimal', precision: 12, scale: 2, nullable: true })
  areaSqm: number; // 면적 (제곱미터)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // GraphRAG preparation fields
  @Column({ name: 'entity_type', type: 'varchar', length: 50, default: 'Region' })
  entityType: string;

  @Column({ name: 'tags', type: 'jsonb', nullable: true })
  tags: Record<string, any>;
}
