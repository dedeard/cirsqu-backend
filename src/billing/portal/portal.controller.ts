import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PortalService } from './portal.service';
import { AuthGuard } from '../../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Post()
  createPortal(@Req() { user }: { user: IUser }) {
    return this.portalService.createPortal(user.profile.subscription.customerId);
  }
}
