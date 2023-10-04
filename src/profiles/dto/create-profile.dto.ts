import { Transform } from 'class-transformer';
import { IsString, Length, Matches } from 'class-validator';

export class CreateProfileDto {
  @Length(3, 20)
  name: string;

  @IsString()
  @Length(6, 20)
  @Matches(/^[a-zA-Z0-9]*$/)
  @Transform(({ value }) => String(value).toLocaleLowerCase())
  username: string;
}
