import { Injectable } from '@nestjs/common';
import { QuestionsRepository } from './questions.repository';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class QuestionsService {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  store(user: IUser, data: CreateQuestionDto) {
    return this.questionsRepository.create({
      ...data,
      userId: user.uid,
    });
  }
}
