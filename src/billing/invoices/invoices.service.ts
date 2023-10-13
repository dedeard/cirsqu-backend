import { BadGatewayException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StripeService } from '../../common/services/stripe.service';
import Stripe from 'stripe';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);
  constructor(private readonly stripe: StripeService) {}

  async list(customerId: string, pagination?: Stripe.PaginationParams) {
    try {
      return await this.stripe.invoices.list({ customer: customerId, ...pagination });
    } catch (error: any) {
      this.logger.error(`Failed to list invoices for customer ${customerId}: ${error.message}`);

      throw new BadGatewayException('Unable to fetch invoice list');
    }
  }

  async find(customerId: string, invoiceId: string) {
    try {
      const invoice = await this.stripe.invoices.retrieve(invoiceId);

      if (!invoice || invoice?.customer !== customerId) throw new Error('Invoice not found');
      if ('deleted' in invoice) throw new Error('Invoice has been deleted');

      return invoice;
    } catch (error: any) {
      this.logger.error(`Failed to retrieve Invoice ${invoiceId}: ${error.message}`);

      throw new NotFoundException('Invalid Invoice ID provided');
    }
  }
}
