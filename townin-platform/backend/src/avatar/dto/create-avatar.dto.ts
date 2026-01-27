import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAvatarDto {
    @IsNumber()
    @Type(() => Number)
    height: number; // cm

    @IsNumber()
    @Type(() => Number)
    weight: number; // kg

    @IsString()
    @IsEnum(['male', 'female', 'other'])
    gender: 'male' | 'female' | 'other';
    // Image will be handled via Multer (file upload), not in the JSON body
}

export class AvatarMeasurementDto {
    shoulderWidth: number;
    chestCircumference: number;
    waistCircumference: number;
    hipCircumference: number;
    legLength: number;
    armLength: number;
    // Detailed Fit Metrics
    neckCircumference: number;
    thighCircumference: number;
    inseam: number; // Inner leg length
}
