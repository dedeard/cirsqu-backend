import slugify from 'slugify';
import { SearchIndex } from 'algoliasearch';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CollectionReference, DocumentData, FieldValue, Timestamp } from 'firebase-admin/firestore';
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

  async findOrFail(questionId: string) {
    const snapshot = await this.find(questionId);
    if (!snapshot) {
      throw new NotFoundException('Question not found.');
    }
    return snapshot;
  }

  async generateSlug(title: string) {
    let slug = slugify(title);
    let exists = !!(await this.find(slug));
    let i = 1;

    while (exists) {
      slug = `${slugify(title)}-${i}`;
      exists = !!(await this.find(slug));
      i++;
    }

    return slug;
  }

  create(data: { userId: string; title: string; content: string; tags: string[] }) {
    return this.admin.db.runTransaction(async (t) => {
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

      await this.index.saveObject({
        objectID: slug,
        ...data,
        likeCount: 0,
        createdAt: createdAt.toDate(),
        updatedAt: null,
        validAnswerId: null,
      });
    });
  }

  update(
    slug: string,
    data: { title: string; content: string; tags: string[]; validAnswerId?: string; likeCount?: number },
    promise?: () => Promise<any>,
  ) {
    return this.admin.db.runTransaction(async (t) => {
      const updatedAt = Timestamp.now();
      t.update(this.collection.doc(slug), { ...data, updatedAt });

      await this.index.partialUpdateObject(
        {
          objectID: slug,
          ...data,
          updatedAt: updatedAt.toDate(),
        },
        { createIfNotExists: true },
      );

      await promise?.();
    });
  }
}
