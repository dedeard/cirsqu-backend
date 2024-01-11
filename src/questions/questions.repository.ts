import slugify from 'slugify';
import { SearchIndex } from 'algoliasearch';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CollectionReference, DocumentData, Timestamp } from 'firebase-admin/firestore';
import { AdminService } from '../common/services/admin.service';
import { AlgoliaService } from '../common/services/algolia.service';

@Injectable()
export class QuestionsRepository {
  public readonly collection: CollectionReference<DocumentData>;
  public readonly index: SearchIndex;

  constructor(
    private readonly admin: AdminService,
    private readonly algolia: AlgoliaService,
  ) {
    this.collection = this.admin.db.collection('questions');
    this.index = this.algolia.questionsIndex;
  }

  async find(questionId: string): Promise<{ id: string; data: IQuestion } | null> {
    const doc = await this.collection.doc(questionId).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data() as IQuestion;
    return { id: questionId, data };
  }

  async findOrFail(questionId: string): Promise<{ id: string; data: IQuestion }> {
    const snapshot = await this.find(questionId);
    if (!snapshot) {
      throw new NotFoundException('Question not found.');
    }
    return snapshot;
  }

  private async isSlugExists(slug: string): Promise<boolean> {
    return !!(await this.find(slug));
  }

  private async generateSlugWithCounter(title: string, counter: number): Promise<string> {
    const slug = `${slugify(title)}-${counter}`;
    return this.isSlugExists(slug) ? this.generateSlugWithCounter(title, counter + 1) : slug;
  }

  private async generateSlug(title: string): Promise<string> {
    const slug = slugify(title);
    return this.isSlugExists(slug) ? this.generateSlugWithCounter(title, 1) : slug;
  }

  async create(data: { userId: string; title: string; content: string; tags: string[] }): Promise<void> {
    await this.admin.db.runTransaction(async (t) => {
      const slug = await this.generateSlug(data.title);
      const ref = this.collection.doc(slug);
      const createdAt = Timestamp.now();

      const rawData: IQuestion = {
        ...data,
        likes: [],
        createdAt,
        updatedAt: null,
        validAnswerId: null,
      };
      t.set(ref, rawData);

      const indexData = {
        objectID: slug,
        ...data,
        tags: undefined,
        _tags: data.tags,
        likeCount: 0,
        createdAt: createdAt.toDate(),
        updatedAt: null,
        validAnswerId: null,
      };

      await this.index.saveObject(indexData);
    });
  }

  async update(slug: string, data: Partial<IQuestion>, oldData: IQuestion, promise?: () => Promise<any>): Promise<void> {
    const { title, content, tags, validAnswerId, likes } = data;
    const { createdAt } = oldData;
    const updatedAt = Timestamp.now();

    await this.admin.db.runTransaction(async (t) => {
      const newData = {
        ...oldData,
        title,
        content,
        tags,
        validAnswerId,
        likes,
        updatedAt,
        createdAt,
      };

      const indexData = {
        objectID: slug,
        ...newData,
        tags: undefined,
        likes: undefined,
        likeCount: likes.length,
        _tags: tags,
        createdAt: createdAt.toDate(),
        updatedAt: updatedAt.toDate(),
      };

      t.update(this.collection.doc(slug), newData);
      await this.index.partialUpdateObject(indexData, { createIfNotExists: true });

      await promise?.();
    });
  }

  async destroy(slug: string, promise?: <T = any>() => Promise<T>): Promise<void> {
    await this.admin.db.runTransaction(async (t) => {
      t.delete(this.collection.doc(slug));
      await this.index.deleteObject(slug);
      await promise?.();
    });
  }
}
