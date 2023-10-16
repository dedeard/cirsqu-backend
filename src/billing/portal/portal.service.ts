import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CollectionReference, DocumentData } from 'firebase-admin/firestore';
import { AdminService } from '../../common/services/admin.service';
import { StripeService } from '../../common/services/stripe.service';

@Injectable()
export class PortalService {
  public IDENTIFIER = 'cirsqu-portal';

  public readonly collection: CollectionReference<DocumentData>;
  constructor(
    private readonly stripe: StripeService,
    private readonly admin: AdminService,
  ) {
    this.collection = this.admin.db.collection('portals');
  }

  async getConfiguration() {
    const { data } = await this.stripe.portalConfigurations.list({ limit: 100 });
    const configuration = data.find((configuration) => configuration.metadata.identifier === this.IDENTIFIER);
    if (!configuration) {
      throw new InternalServerErrorException(`No configuration found with identifier: ${this.IDENTIFIER}`);
    }
    return configuration?.id;
  }

  async createPortal(customer: string) {
    const configuration = await this.getConfiguration();

    return this.stripe.portalSessions.create({
      customer,
      configuration,
    });
  }
}
