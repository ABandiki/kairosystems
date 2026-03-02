import { SetMetadata } from '@nestjs/common';

export const TIER_KEY = 'requiredTiers';
export const RequireTier = (...tiers: string[]) => SetMetadata(TIER_KEY, tiers);
