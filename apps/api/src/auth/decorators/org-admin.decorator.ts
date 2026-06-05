import { SetMetadata } from '@nestjs/common';

export const ORG_ADMIN_KEY = 'orgAdmin';
export const OrgAdminOnly = () => SetMetadata(ORG_ADMIN_KEY, true);
