import { Injectable, NotFoundException } from '@nestjs/common';
import { CollectionReference, DocumentData } from 'firebase-admin/firestore';
import { AdminService } from '../common/services/admin.service';

@Injectable()
export class EpisodesRepository {
  public readonly collection: CollectionReference<DocumentData>;

  constructor(private readonly admin: AdminService) {
    this.collection = this.admin.db.collection('episodes');
  }

  async find(episodeId: string): Promise<{ id: string; data: IEpisode } | null> {
    const doc = await this.collection.doc(episodeId).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data() as IEpisode;
    return { id: episodeId, data };
  }

  async findOrFail(episodeId: string) {
    const snapshot = await this.find(episodeId);
    if (!snapshot) {
      throw new NotFoundException('Episode not found.');
    }
    return snapshot;
  }
}
