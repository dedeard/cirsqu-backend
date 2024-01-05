import { ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, ArrayUnique, IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { RAW_TAGS } from '../../common/constants/raw-tags';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(156)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  content: string;

  @IsNotEmpty({ each: true })
  @ArrayNotEmpty()
  @ArrayUnique()
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  @IsIn(RAW_TAGS, { each: true })
  tags: string[];
}
