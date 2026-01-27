import { Controller, Post, Body, UseInterceptors, UploadedFile, Get, Param, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarService } from './avatar.service';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { Avatar } from './entities/avatar.entity';

@Controller('avatar')
export class AvatarController {
    private readonly logger = new Logger(AvatarController.name);

    constructor(private readonly avatarService: AvatarService) { }

    @Post(':userId')
    @UseInterceptors(FileInterceptor('file', { dest: './uploads/temp_avatar' })) // Temp storage for processing
    async create(
        @Param('userId') userId: string,
        @Body() createAvatarDto: CreateAvatarDto,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<Avatar> {
        this.logger.log(`Received avatar creation request for user: ${userId}`);

        // Note: 'file' might be undefined if user chooses manual input only
        // The Service handles the FLUSH protocol (deleting the file after processing)
        return this.avatarService.createAvatar(userId, createAvatarDto, file);
    }

    @Get(':userId')
    async findOne(@Param('userId') userId: string): Promise<Avatar> {
        return this.avatarService.getAvatar(userId);
    }

    // Future Endpoint: "Buy clothes that fit me"
    @Post(':userId/recommend-size')
    async recommendSize(@Param('userId') userId: string, @Body() productDimensions: any) {
        // Placeholder for the "Buy for me" logic logic
        this.logger.log(`Calculating fit for User ${userId} against product...`);
        return {
            recommendedSize: 'L',
            fitDescription: 'Regular Fit (based on your shoulder width preference)',
            matchScore: 92
        };
    }
}
