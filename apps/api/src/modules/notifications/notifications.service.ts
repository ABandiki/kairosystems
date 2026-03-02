import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    practiceId: string,
    userId: string,
    data: { type: string; title: string; message: string; data?: any },
  ) {
    return this.prisma.notification.create({
      data: {
        practiceId,
        userId,
        type: data.type as NotificationType,
        title: data.title,
        message: data.message,
        data: data.data ?? undefined,
      },
    });
  }

  async getForUser(
    userId: string,
    params?: { unreadOnly?: boolean; page?: number; pageSize?: number },
  ) {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: any = { userId };
    if (params?.unreadOnly) {
      where.isRead = false;
    }

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(id: string, userId: string) {
    // Verify ownership first
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) return null;

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async dismiss(id: string, userId: string) {
    // Verify ownership first
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) return null;

    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async notifyPracticeAdmins(
    practiceId: string,
    data: { type: string; title: string; message: string; data?: any },
  ) {
    const admins = await this.prisma.user.findMany({
      where: {
        practiceId,
        role: 'PRACTICE_ADMIN',
      },
      select: { id: true },
    });

    const notifications = await Promise.all(
      admins.map((admin) => this.create(practiceId, admin.id, data)),
    );

    return notifications;
  }
}
