import { SetMetadata } from '@nestjs/common';
import { SKIP_TRIAL_CHECK_KEY } from '../guards/trial.guard';

export const SkipTrialCheck = () => SetMetadata(SKIP_TRIAL_CHECK_KEY, true);
