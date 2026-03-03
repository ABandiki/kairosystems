import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { StaffModule } from './modules/staff/staff.module';
import { PracticesModule } from './modules/practices/practices.module';
import { NotesModule } from './modules/notes/notes.module';
import { FormTemplatesModule } from './modules/form-templates/form-templates.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { DevicesModule } from './modules/devices/devices.module';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { FormSubmissionsModule } from './modules/form-submissions/form-submissions.module';
import { DemoRequestsModule } from './modules/demo-requests/demo-requests.module';
import { PrismaModule } from './prisma/prisma.module';
import { TrialGuard } from './modules/auth/guards/trial.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    PatientsModule,
    AppointmentsModule,
    StaffModule,
    PracticesModule,
    NotesModule,
    FormTemplatesModule,
    InvoicesModule,
    DevicesModule,
    SuperAdminModule,
    OnboardingModule,
    MessagingModule,
    NotificationsModule,
    PrescriptionsModule,
    DocumentsModule,
    DashboardModule,
    FormSubmissionsModule,
    DemoRequestsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TrialGuard,
    },
  ],
})
export class AppModule {}
