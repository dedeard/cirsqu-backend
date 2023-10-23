import { IsNotEmpty, IsString, Max } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  @Max(1500)
  body: string;
}
