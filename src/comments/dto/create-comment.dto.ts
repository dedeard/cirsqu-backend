import { IsNotEmpty, IsString, Max, IsEnum } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @Max(1500)
  body: string;

  @IsString()
  @IsNotEmpty()
  targetId: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['episode', 'reply'])
  targetType: 'episode' | 'reply';
}
