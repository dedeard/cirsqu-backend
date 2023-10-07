import { AuthGuard } from '@nestjs/passport';
import { Controller, Post, Put, Req, Body, UseGuards, UseInterceptors, UploadedFile, Get, Res, HttpStatus } from '@nestjs/common';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidateImagePipe } from '../common/pipes/validate-image.pipe';
import { Response } from 'express';

@UseGuards(AuthGuard('cookie-or-bearer'))
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  async findOne(@Res() res: Response, @Req() { user }: { user: UserRecord }) {
    const profile = await this.profilesService.findOne(user.uid);
    if (!profile) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'Profile not found' });
    } else {
      res.json(profile);
    }
  }

  @Post()
  create(@Req() { user }: { user: UserRecord }, @Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(user, createProfileDto);
  }

  @Put()
  @UseInterceptors(FileInterceptor('avatar'))
  update(
    @Req() { user }: { user: UserRecord },
    @UploadedFile(new ValidateImagePipe({ required: false })) file,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.update(user, updateProfileDto, file?.buffer);
  }
}
