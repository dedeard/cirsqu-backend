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
    return this.questionsRepository.update(question.id, data, question.data);
  }

  async destroy(slug: string, user: IUser) {
    const question = await this.questionsRepository.findOrFail(slug);
    if (question.data.userId !== user.uid) {
      throw new BadRequestException('This question is not yours.');
    }
    return this.questionsRepository.destroy(slug);
  }

  async likeToggle(slug: string, user: IUser) {
    const question = await this.questionsRepository.findOrFail(slug);
    if (question.data.userId === user.uid) {
      throw new BadRequestException("Oops! You can't give a 'like' to your own question.");
    }

    let { likes } = question.data;

    if (likes.includes(user.uid)) {
      likes = likes.filter((el) => el !== user.uid);
    } else {
      likes.push(user.uid);
    }

    this.questionsRepository.update(slug, { likes }, question.data);
  }
}
