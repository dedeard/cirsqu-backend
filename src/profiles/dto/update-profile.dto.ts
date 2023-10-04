import { CreateProfileDto } from './create-profile.dto';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateProfileDto extends CreateProfileDto {
  @IsOptional()
  @IsString()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;
}
