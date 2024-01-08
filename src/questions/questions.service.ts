import { BadRequestException, Injectable } from '@nestjs/common';
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

  async update(slug: string, user: IUser, data: CreateQuestionDto) {
    const question = await this.questionsRepository.findOrFail(slug);
    if (question.data.userId !== user.uid) {
      throw new BadRequestException('This question is not yours.');
    }
    return this.questionsRepository.update(question.id, data);
  }

  async destroy(slug: string, user: IUser) {
    const question = await this.questionsRepository.findOrFail(slug);
    if (question.data.userId !== user.uid) {
      throw new BadRequestException('This question is not yours.');
    }
    return this.questionsRepository.destroy(slug);
  }
}
