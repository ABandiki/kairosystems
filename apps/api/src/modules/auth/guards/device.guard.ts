import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DevicesService } from '../../devices/devices.service';

export const SKIP_DEVICE_CHECK_KEY = 'skipDeviceCheck';

@Injectable()
export class DeviceGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(DevicesService) private devicesService: DevicesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if device check should be skipped for this route
    const skipDeviceCheck = this.reflector.getAllAndOverride<boolean>(
      SKIP_DEVICE_CHECK_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipDeviceCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super admins bypass device check
    if (user?.isSuperAdmin || user?.role === 'SUPER_ADMIN') {
      return true;
    }

    // Get device fingerprint from header
    const deviceFingerprint = request.headers['x-device-fingerprint'];

    if (!deviceFingerprint) {
      throw new ForbiddenException(
        'Device not registered. Please access from an approved practice device.',
      );
    }

    // Verify device is approved for this practice
    const isApproved = await this.devicesService.verifyDevice(
      user.practiceId,
      deviceFingerprint,
    );

    if (!isApproved) {
      // Check if device exists but is pending
      const device = await this.devicesService.getDeviceByFingerprint(deviceFingerprint);

      if (device && device.status === 'PENDING') {
        throw new ForbiddenException(
          'Device registration pending approval. Please contact your practice administrator.',
        );
      }

      if (device && device.status === 'REVOKED') {
        throw new ForbiddenException(
          'Device access has been revoked. Please contact your practice administrator.',
        );
      }

      throw new ForbiddenException(
        'Unauthorized device. Please access from an approved practice device.',
      );
    }

    // Update last used info
    await this.devicesService.updateLastUsed(
      deviceFingerprint,
      user.sub,
      request.ip,
    );

    return true;
  }
}
