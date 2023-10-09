import { Controller, Post, Put, Req, Body, UseGuards, UseInterceptors, UploadedFile, Get } from '@nestjs/common';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidateImagePipe } from '../common/pipes/validate-image.pipe';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthProfileGuard } from '../auth/guards/auth-profile.guard';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @UseGuards(AuthProfileGuard)
  @Get()
  find(@Req() { user }: { user: IUser }) {
    return user.profile;
  }

  @UseGuards(AuthGuard)
  @Post()
  create(@Req() { user }: { user: UserRecord }, @Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(user, createProfileDto);
  }

  @UseGuards(AuthProfileGuard)
  @Put()
  @UseInterceptors(FileInterceptor('avatar'))
  update(
    @Req() { user }: { user: IUser },
    @UploadedFile(new ValidateImagePipe({ required: false })) file,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.update(user, updateProfileDto, file?.buffer);
  }
}
