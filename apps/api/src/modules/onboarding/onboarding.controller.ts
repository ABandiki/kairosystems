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
import { OnboardingService } from './onboarding.service';

@ApiTags('onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private onboardingService: OnboardingService) {}

  @Post('register-practice')
  @ApiOperation({ summary: 'Register a new practice with initial admin and device' })
  async registerPractice(
    @Body() data: {
      practiceName: string;
      practiceEmail: string;
      practicePhone: string;
      odsCode: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      county?: string;
      postcode: string;
      adminEmail: string;
      adminPassword: string;
      adminFirstName: string;
      adminLastName: string;
      deviceFingerprint: string;
      deviceName: string;
      deviceType: string;
    },
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
  @ApiOperation({ summary: 'Request device registration for an existing practice' })
  async requestDeviceRegistration(
    @Body() data: {
      practiceId: string;
      deviceFingerprint: string;
      deviceName: string;
      deviceType: string;
    },
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
  @ApiOperation({ summary: 'Check if a device is registered and approved' })
  async checkDeviceStatus(
    @Query('practiceId') practiceId: string,
    @Query('deviceFingerprint') deviceFingerprint: string,
  ) {
    return this.onboardingService.checkDeviceStatus(practiceId, deviceFingerprint);
  }

  @Get('practice-lookup')
  @ApiOperation({ summary: 'Look up practice by email for device registration' })
  async getPracticeByEmail(@Query('email') email: string) {
    return this.onboardingService.getPracticeByEmail(email);
  }
}
