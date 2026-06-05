import { SetMetadata } from '@nestjs/common';
import { PROJECT_SCOPED_KEY } from '../constants/metadata';

export const ProjectScoped = () => SetMetadata(PROJECT_SCOPED_KEY, true);
