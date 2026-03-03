import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Headers,
  Ip,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { OnboardingService } from './onboarding.service';
import { RegisterPracticeDto } from './dto/register-practice.dto';
import { RequestDeviceDto } from './dto/request-device.dto';

@ApiTags('onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private onboardingService: OnboardingService) {}

  @Post('register-practice')
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @ApiOperation({ summary: 'Register a new practice with initial admin and device' })
  async registerPractice(
    @Body() data: RegisterPracticeDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.onboardingService.registerPractice({
      ...data,
      ipAddress: ip,
      userAgent,
    });
  }

  @Post('request-device')
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @ApiOperation({ summary: 'Request device registration for an existing practice' })
  async requestDeviceRegistration(
    @Body() data: RequestDeviceDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.onboardingService.requestDeviceRegistration({
      ...data,
      ipAddress: ip,
      userAgent,
    });
  }

  @Get('check-device')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Check if a device is registered and approved' })
  async checkDeviceStatus(
    @Query('practiceId') practiceId: string,
    @Query('deviceFingerprint') deviceFingerprint: string,
  ) {
    return this.onboardingService.checkDeviceStatus(practiceId, deviceFingerprint);
  }

  @Get('practice-lookup')
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @ApiOperation({ summary: 'Look up practice by email for device registration' })
  async getPracticeByEmail(@Query('email') email: string) {
    return this.onboardingService.getPracticeByEmail(email);
  }
}
