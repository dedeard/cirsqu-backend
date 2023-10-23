import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  @Length(20, 1500)
  body: string;
}
