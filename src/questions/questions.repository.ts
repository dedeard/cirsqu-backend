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

  async findOrFail(questionId: string) {
    const snapshot = await this.find(questionId);
    if (!snapshot) {
      throw new NotFoundException('Question not found.');
    }
    return snapshot;
  }

  private async generateSlug(title: string) {
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
        tags: undefined,
        _tags: data.tags,
        likeCount: 0,
        createdAt: createdAt.toDate(),
        updatedAt: null,
        validAnswerId: null,
      });
    });
  }

  async update(
    slug: string,
    data: { title?: string; content?: string; tags?: string[]; validAnswerId?: string; likes?: string[] },
    oldData: IQuestion,
    promise?: () => Promise<any>,
  ) {
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

  destroy(slug: string, promise?: <T = any>() => Promise<T>) {
    return this.admin.db.runTransaction(async (t) => {
      t.delete(this.collection.doc(slug));
      await this.index.deleteObject(slug);
      await promise?.();
    });
  }
}
