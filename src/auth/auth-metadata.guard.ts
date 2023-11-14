import { SetMetadata } from '@nestjs/common';

export type AllowedMetaData = 'skip' | 'skip-profile' | 'optional';

export const AuthMetaData = (...metadata: AllowedMetaData[]) => SetMetadata('auth', metadata);
