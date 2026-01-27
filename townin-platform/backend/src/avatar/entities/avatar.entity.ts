export class Avatar {
    id: string; // UUID
    userId: string;

    // Input Metrics
    height: number;
    weight: number;
    gender: string;

    // AI Extracted Metrics (The "Fit" Data)
    measurements: {
        shoulderWidth: number;
        chestCircumference: number;
        waistCircumference: number;
        hipCircumference: number;
        legLength: number;
        armLength: number;
        neckCircumference: number;
        thighCircumference: number;
        inseam: number;
    };

    // 3D Model Params (Mock SMPL params)
    meshToken: string; // Token to retrieve non-PII mesh if needed

    // Future-Proofing: Shopping Preferences ('Buy for me' support)
    fitPreferences: {
        topFit: 'tight' | 'regular' | 'loose' | 'oversized';
        bottomFit: 'tight' | 'regular' | 'loose' | 'relaxed';
    };

    createdAt: Date;
    updatedAt: Date;
}
