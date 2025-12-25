import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Flyer } from '../flyer.entity';

@Entity('flyer_target_areas')
@Index(['flyerId'])
export class FlyerTargetArea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'flyer_id' })
  flyerId: string;

  @ManyToOne(() => Flyer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flyer_id' })
  flyer: Flyer;

  @Column({ name: 'h3_cell_id' })
  @Index()
  h3CellId: string; // H3 hexagon ID

  @Column({ name: 'h3_resolution', type: 'int', default: 9 })
  h3Resolution: number; // ~174m hexagons

  @Column({ name: 'estimated_reach', type: 'int', default: 0 })
  estimatedReach: number; // Estimated number of users in this cell

  @Column({ name: 'cost_per_cell', type: 'decimal', precision: 10, scale: 2, default: 0 })
  costPerCell: number; // Cost to target this cell

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
