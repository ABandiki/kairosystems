import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PracticesService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const practice = await this.prisma.practice.findUnique({
      where: { id },
      include: {
        openingHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
        rooms: {
          where: { isActive: true },
        },
        appointmentTypeSettings: {
          where: { isActive: true },
        },
      },
    });

    if (!practice) {
      throw new NotFoundException('Practice not found');
    }

    return practice;
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      logo?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      county?: string;
      postcode?: string;
    },
  ) {
    return this.prisma.practice.update({
      where: { id },
      data,
    });
  }

  async updateOpeningHours(
    id: string,
    openingHours: Array<{
      dayOfWeek: number;
      openTime: string;
      closeTime: string;
      isClosed: boolean;
    }>,
  ) {
    // Delete existing and create new
    await this.prisma.openingHours.deleteMany({ where: { practiceId: id } });

    if (openingHours.length > 0) {
      await this.prisma.openingHours.createMany({
        data: openingHours.map((oh) => ({
          practiceId: id,
          ...oh,
        })),
      });
    }

    return this.findById(id);
  }

  async getPharmacies(practiceId: string) {
    return this.prisma.pharmacy.findMany({
      where: { practiceId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createPharmacy(
    practiceId: string,
    data: {
      name: string;
      odsCode?: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      county?: string;
      postcode: string;
      phone: string;
      email?: string;
      type?: any;
      epsEnabled?: boolean;
    },
  ) {
    return this.prisma.pharmacy.create({
      data: {
        ...data,
        practice: { connect: { id: practiceId } },
      },
    });
  }

  async getRooms(practiceId: string) {
    return this.prisma.room.findMany({
      where: { practiceId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createRoom(
    practiceId: string,
    data: { name: string; description?: string },
  ) {
    return this.prisma.room.create({
      data: {
        ...data,
        practice: { connect: { id: practiceId } },
      },
    });
  }

  async getAppointmentTypes(practiceId: string) {
    return this.prisma.appointmentTypeSetting.findMany({
      where: { practiceId, isActive: true },
      orderBy: { label: 'asc' },
    });
  }

  async updateAppointmentType(
    id: string,
    practiceId: string,
    data: {
      label?: string;
      defaultDuration?: number;
      color?: string;
      isActive?: boolean;
    },
  ) {
    return this.prisma.appointmentTypeSetting.updateMany({
      where: { id, practiceId },
      data,
    });
  }
}
