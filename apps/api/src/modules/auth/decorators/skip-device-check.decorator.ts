import { SetMetadata } from '@nestjs/common';
import { SKIP_DEVICE_CHECK_KEY } from '../guards/device.guard';

export const SkipDeviceCheck = () => SetMetadata(SKIP_DEVICE_CHECK_KEY, true);
