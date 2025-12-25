import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Flyer } from './flyer.entity';

@Entity('flyer_products')
export class FlyerProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'flyer_id' })
  flyerId: string;

  @ManyToOne(() => Flyer)
  @JoinColumn({ name: 'flyer_id' })
  flyer: Flyer;

  @Column({ name: 'product_name' })
  productName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ name: 'original_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @Column({ nullable: true })
  promotion: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
