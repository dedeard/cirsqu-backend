import { SetMetadata } from '@nestjs/common';

export type AllowedMetaData = 'skip' | 'skip-profile';

export const AuthMetaData = (...metadata: AllowedMetaData[]) => SetMetadata('auth', metadata);
