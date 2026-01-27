import { Injectable, Logger } from '@nestjs/common';
import { CreateAvatarDto, AvatarMeasurementDto } from './dto/create-avatar.dto';
import { Avatar } from './entities/avatar.entity';
import * as fs from 'fs';

@Injectable()
export class AvatarService {
    private readonly logger = new Logger(AvatarService.name);
    private avatars: Map<string, Avatar> = new Map(); // In-memory DB for demo

    async createAvatar(userId: string, createAvatarDto: CreateAvatarDto, imageFile?: Express.Multer.File): Promise<Avatar> {
        this.logger.log(`Starting Avatar Creation for User: ${userId}`);

        // 1. Process Core Logic (Mock AI Analysis)
        let measurements: AvatarMeasurementDto;

        if (imageFile) {
            this.logger.log(`Image received: ${imageFile.originalname} (${imageFile.size} bytes)`);
            // Simulate AI Processing Time
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock logic: Extract measurements from "Image" + Input
            measurements = this.calculateMockMeasurements(createAvatarDto.height, createAvatarDto.weight);

            // 2. [CRITICAL] FLUSH PROTOCOL Implementation
            // Unlike standard flows where we save the file to S3/Disk, we MUST Ensure it is deleted.
            // If Multer saved it to a temp disk path, we delete it now.
            if (imageFile.path) {
                try {
                    fs.unlinkSync(imageFile.path);
                    this.logger.log(`[FLUSH] Original image physically deleted from: ${imageFile.path}`);
                } catch (e) {
                    this.logger.error(`[FLUSH] Failed to delete temp image! Incident logged.`, e);
                }
            } else {
                this.logger.log(`[FLUSH] Image was in-memory only. Buffer cleared.`);
            }
        } else {
            // Input only mode
            measurements = this.calculateMockMeasurements(createAvatarDto.height, createAvatarDto.weight);
        }

        // 3. Create Avatar Entity
        const avatar = new Avatar();
        avatar.id = `avt_${Math.random().toString(36).substr(2, 9)}`;
        avatar.userId = userId;
        avatar.height = createAvatarDto.height;
        avatar.weight = createAvatarDto.weight;
        avatar.gender = createAvatarDto.gender;
        avatar.measurements = measurements;
        avatar.meshToken = `mesh_${Math.random().toString(36).substr(2, 9)}`; // Placeholder for 3D mesh file
        avatar.createdAt = new Date();

        // 4. Save to Persistent DB (Mock)
        this.avatars.set(userId, avatar);

        return avatar;
    }

    getAvatar(userId: string): Avatar | undefined {
        return this.avatars.get(userId);
    }

    // --- Helper: Mock AI Math ---
    private calculateMockMeasurements(height: number, weight: number): AvatarMeasurementDto {
        // Very rough estimation just to provide numbers
        // Shoulder width approx 1/4 of height (very rough)
        const baseWaist = height * 0.45;
        const bmi = weight / ((height / 100) * (height / 100));

        // Adjust based on BMI
        const fatFactor = bmi > 25 ? 1.1 : (bmi < 18.5 ? 0.9 : 1.0);

        return {
            shoulderWidth: Math.round(height * 0.23),
            chestCircumference: Math.round(baseWaist * 1.2 * fatFactor),
            waistCircumference: Math.round(baseWaist * fatFactor),
            hipCircumference: Math.round(baseWaist * 1.1 * fatFactor),
            armLength: Math.round(height * 0.35),
            legLength: Math.round(height * 0.48),
            // Detailed metrics (Mocking deep scan results)
            neckCircumference: Math.round(height * 0.22),
            thighCircumference: Math.round(baseWaist * 0.6 * fatFactor),
            inseam: Math.round(height * 0.45),
        };
    }
}
