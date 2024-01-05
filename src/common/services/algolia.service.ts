import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch';

@Injectable()
export class AlgoliaService {
  readonly client: SearchClient;
  readonly lessonsIndex: SearchIndex;
  readonly subjectsIndex: SearchIndex;
  readonly profilesIndex: SearchIndex;
  readonly questionsIndex: SearchIndex;

  constructor(private readonly config: ConfigService) {
    this.client = this.initSearchClient();
    this.lessonsIndex = this.client.initIndex('lessons');
    this.subjectsIndex = this.client.initIndex('subjects');
    this.profilesIndex = this.client.initIndex('profiles');
    this.questionsIndex = this.client.initIndex('questions');
  }

  private initSearchClient() {
    const appId = this.config.getOrThrow<string>('ALGOLIA_APP_ID');
    const apiKey = this.config.getOrThrow<string>('ALGOLIA_ADMIN_API_KEY');
    if (this.client) return this.client;
    return algoliasearch(appId, apiKey);
  }
}
