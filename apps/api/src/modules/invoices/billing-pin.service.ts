import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BillingPinService {
  constructor(private prisma: PrismaService) {}

  async setPin(practiceId: string, userId: string, pin: string): Promise<void> {
    if (!/^\d{4,6}$/.test(pin)) {
      throw new BadRequestException('PIN must be 4-6 digits');
    }
    const hashedPin = await bcrypt.hash(pin, 10);
    await this.prisma.practice.update({
      where: { id: practiceId },
      data: {
        billingPin: hashedPin,
        billingPinSetAt: new Date(),
        billingPinSetById: userId,
      },
    });
  }

  async verifyPin(practiceId: string, pin: string): Promise<boolean> {
    const practice = await this.prisma.practice.findUnique({
      where: { id: practiceId },
      select: { billingPin: true },
    });
    if (!practice?.billingPin) {
      return true;
    }
    return bcrypt.compare(pin, practice.billingPin);
  }

  async removePin(practiceId: string): Promise<void> {
    await this.prisma.practice.update({
      where: { id: practiceId },
      data: {
        billingPin: null,
        billingPinSetAt: null,
        billingPinSetById: null,
      },
    });
  }

  async hasPinSet(practiceId: string): Promise<boolean> {
    const practice = await this.prisma.practice.findUnique({
      where: { id: practiceId },
      select: { billingPin: true },
    });
    return !!practice?.billingPin;
  }
}
