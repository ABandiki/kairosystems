import { PrismaClient, UserRole, Gender, PatientStatus, AppointmentType, AppointmentStatus, AlertType, AlertSeverity } from '@prisma/client';

const prisma = new PrismaClient();

// Simple hash function for demo (in production, use bcrypt)
async function hashPassword(password: string): Promise<string> {
  // For demo purposes, we'll use a simple base64 encoding
  // In production, import bcrypt and use: await bcrypt.hash(password, 10)
  return Buffer.from(password).toString('base64');
}

async function main() {
  console.log('🌱 Starting seed...');

  // Create a practice
  const practice = await prisma.practice.upsert({
    where: { odsCode: 'G82018' },
    update: {},
    create: {
      name: 'Avondale Medical Centre',
      odsCode: 'G82018',
      addressLine1: '15 King George Road',
      city: 'Harare',
      postcode: '',
      phone: '+263 242 302 456',
      email: 'info@avondale-medical.co.zw',
    },
  });

  console.log(`✅ Created practice: Avondale Medical Centre`);

  // Create opening hours
  const days = [
    { dayOfWeek: 0, openTime: '', closeTime: '', isClosed: true }, // Sunday
    { dayOfWeek: 1, openTime: '08:00', closeTime: '18:30', isClosed: false }, // Monday
    { dayOfWeek: 2, openTime: '08:00', closeTime: '18:30', isClosed: false }, // Tuesday
    { dayOfWeek: 3, openTime: '08:00', closeTime: '18:30', isClosed: false }, // Wednesday
    { dayOfWeek: 4, openTime: '08:00', closeTime: '18:30', isClosed: false }, // Thursday
    { dayOfWeek: 5, openTime: '08:00', closeTime: '18:00', isClosed: false }, // Friday
    { dayOfWeek: 6, openTime: '09:00', closeTime: '12:00', isClosed: false }, // Saturday
  ];

  for (const day of days) {
    await prisma.openingHours.upsert({
      where: {
        practiceId_dayOfWeek: {
          practiceId: practice.id,
          dayOfWeek: day.dayOfWeek,
        },
      },
      update: {},
      create: {
        practiceId: practice.id,
        dayOfWeek: day.dayOfWeek,
        openTime: day.openTime,
        closeTime: day.closeTime,
        isClosed: day.isClosed,
      },
    });
  }

  console.log('✅ Created opening hours');

  // Create rooms - get existing or create new
  const existingRooms = await prisma.room.findMany({
    where: { practiceId: practice.id },
    take: 3,
  });

  let rooms = existingRooms;
  if (existingRooms.length < 3) {
    // Only create if rooms don't exist
    await prisma.room.deleteMany({ where: { practiceId: practice.id } });
    rooms = await Promise.all([
      prisma.room.create({
        data: {
          name: 'Consultation Room 1',
          practiceId: practice.id,
        },
      }),
      prisma.room.create({
        data: {
          name: 'Consultation Room 2',
          practiceId: practice.id,
        },
      }),
      prisma.room.create({
        data: {
          name: 'Treatment Room',
          practiceId: practice.id,
        },
      }),
    ]);
  }

  console.log(`✅ Created ${rooms.length} rooms`);

  // Hash password
  const hashedPassword = await hashPassword('Password123!');

  // Create staff members
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@avondale-medical.co.zw' },
    update: {},
    create: {
      email: 'admin@avondale-medical.co.zw',
      password: hashedPassword,
      firstName: 'Tendai',
      lastName: 'Moyo',
      role: UserRole.PRACTICE_ADMIN,
      phone: '+263 77 234 5678',
      practiceId: practice.id,
      isActive: true,
    },
  });

  const gpUser = await prisma.user.upsert({
    where: { email: 'dr.chikwanha@avondale-medical.co.zw' },
    update: {},
    create: {
      email: 'dr.chikwanha@avondale-medical.co.zw',
      password: hashedPassword,
      firstName: 'Tatenda',
      lastName: 'Chikwanha',
      role: UserRole.GP,
      phone: '+263 77 345 6789',
      practiceId: practice.id,
      isActive: true,
      gmcNumber: '7654321',
    },
  });

  // Create working hours for GP - delete existing first
  await prisma.workingHours.deleteMany({ where: { userId: gpUser.id } });
  const gpWorkingDays = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
    { dayOfWeek: 3, startTime: '09:00', endTime: '13:00' }, // Wednesday
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Friday
  ];

  for (const wh of gpWorkingDays) {
    await prisma.workingHours.create({
      data: {
        userId: gpUser.id,
        dayOfWeek: wh.dayOfWeek,
        startTime: wh.startTime,
        endTime: wh.endTime,
        roomId: rooms[0].id,
      },
    });
  }

  const nurseUser = await prisma.user.upsert({
    where: { email: 'nurse.mutasa@avondale-medical.co.zw' },
    update: {},
    create: {
      email: 'nurse.mutasa@avondale-medical.co.zw',
      password: hashedPassword,
      firstName: 'Rudo',
      lastName: 'Mutasa',
      role: UserRole.NURSE,
      phone: '+263 77 456 7890',
      practiceId: practice.id,
      isActive: true,
      nmcNumber: 'NM12345678',
    },
  });

  // Create working hours for Nurse - delete existing first
  await prisma.workingHours.deleteMany({ where: { userId: nurseUser.id } });
  const nurseWorkingDays = [
    { dayOfWeek: 1, startTime: '08:00', endTime: '16:00' }, // Monday
    { dayOfWeek: 2, startTime: '08:00', endTime: '16:00' }, // Tuesday
    { dayOfWeek: 3, startTime: '08:00', endTime: '16:00' }, // Wednesday
    { dayOfWeek: 4, startTime: '08:00', endTime: '16:00' }, // Thursday
    { dayOfWeek: 5, startTime: '08:00', endTime: '14:00' }, // Friday
  ];

  for (const wh of nurseWorkingDays) {
    await prisma.workingHours.create({
      data: {
        userId: nurseUser.id,
        dayOfWeek: wh.dayOfWeek,
        startTime: wh.startTime,
        endTime: wh.endTime,
        roomId: rooms[2].id,
      },
    });
  }

  const receptionistUser = await prisma.user.upsert({
    where: { email: 'reception@avondale-medical.co.zw' },
    update: {},
    create: {
      email: 'reception@avondale-medical.co.zw',
      password: hashedPassword,
      firstName: 'Kudzai',
      lastName: 'Nyathi',
      role: UserRole.RECEPTIONIST,
      phone: '+263 77 567 8901',
      practiceId: practice.id,
      isActive: true,
    },
  });

  console.log('✅ Created 4 staff members');

  // Create patients using upsert to handle existing records
  const patients = await Promise.all([
    prisma.patient.upsert({
      where: { nhsNumber: '9876543210' },
      update: {
        firstName: 'Tapiwa',
        lastName: 'Madziva',
        email: 'tapiwa.madziva@email.co.zw',
        phone: '+263 77 123 4567',
        addressLine1: '23 Samora Machel Avenue',
        city: 'Harare',
        postcode: '',
      },
      create: {
        nhsNumber: '9876543210',
        firstName: 'Tapiwa',
        lastName: 'Madziva',
        dateOfBirth: new Date('1985-03-15'),
        gender: Gender.MALE,
        email: 'tapiwa.madziva@email.co.zw',
        phone: '+263 77 123 4567',
        addressLine1: '23 Samora Machel Avenue',
        city: 'Harare',
        postcode: '',
        status: PatientStatus.ACTIVE,
        practiceId: practice.id,
        registeredGpId: gpUser.id,
      },
    }),
    prisma.patient.upsert({
      where: { nhsNumber: '1234567890' },
      update: {
        firstName: 'Nyasha',
        lastName: 'Chikowore',
        email: 'nyasha.chikowore@email.co.zw',
        phone: '+263 77 234 5678',
        addressLine1: '45 Enterprise Road',
        city: 'Harare',
        postcode: '',
      },
      create: {
        nhsNumber: '1234567890',
        firstName: 'Nyasha',
        lastName: 'Chikowore',
        dateOfBirth: new Date('1992-07-22'),
        gender: Gender.FEMALE,
        email: 'nyasha.chikowore@email.co.zw',
        phone: '+263 77 234 5678',
        addressLine1: '45 Enterprise Road',
        city: 'Harare',
        postcode: '',
        status: PatientStatus.ACTIVE,
        practiceId: practice.id,
        registeredGpId: gpUser.id,
      },
    }),
    prisma.patient.upsert({
      where: { nhsNumber: '5555555555' },
      update: {
        firstName: 'Farai',
        lastName: 'Zvobgo',
        email: 'farai.zvobgo@email.co.zw',
        phone: '+263 77 345 6789',
        addressLine1: '12 Julius Nyerere Way',
        city: 'Harare',
        postcode: '',
      },
      create: {
        nhsNumber: '5555555555',
        firstName: 'Farai',
        lastName: 'Zvobgo',
        dateOfBirth: new Date('1958-11-08'),
        gender: Gender.MALE,
        email: 'farai.zvobgo@email.co.zw',
        phone: '+263 77 345 6789',
        addressLine1: '12 Julius Nyerere Way',
        city: 'Harare',
        postcode: '',
        status: PatientStatus.ACTIVE,
        practiceId: practice.id,
        registeredGpId: gpUser.id,
      },
    }),
    prisma.patient.upsert({
      where: { nhsNumber: '7777777777' },
      update: {
        firstName: 'Chiedza',
        lastName: 'Mangwana',
        phone: '+263 77 456 7890',
        addressLine1: '78 Borrowdale Road',
        city: 'Harare',
        postcode: '',
      },
      create: {
        nhsNumber: '7777777777',
        firstName: 'Chiedza',
        lastName: 'Mangwana',
        dateOfBirth: new Date('2015-04-12'),
        gender: Gender.FEMALE,
        phone: '+263 77 456 7890',
        addressLine1: '78 Borrowdale Road',
        city: 'Harare',
        postcode: '',
        status: PatientStatus.ACTIVE,
        practiceId: practice.id,
        registeredGpId: gpUser.id,
      },
    }),
  ]);

  console.log(`✅ Created ${patients.length} patients`);

  // Add patient alerts - delete existing first to avoid duplicates
  await prisma.patientAlert.deleteMany({
    where: {
      patientId: { in: patients.map(p => p.id) }
    }
  });

  await prisma.patientAlert.create({
    data: {
      patientId: patients[0].id,
      type: AlertType.ALLERGY,
      description: 'Penicillin allergy - causes severe rash',
      severity: AlertSeverity.HIGH,
      isActive: true,
    },
  });

  await prisma.patientAlert.create({
    data: {
      patientId: patients[2].id,
      type: AlertType.MEDICAL,
      description: 'Type 2 Diabetes - on Metformin',
      severity: AlertSeverity.MEDIUM,
      isActive: true,
    },
  });

  console.log('✅ Created patient alerts');

  // Create appointments for today and upcoming days - delete old ones first
  await prisma.appointment.deleteMany({ where: { practiceId: practice.id } });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointmentTypes = [
    AppointmentType.GP_CONSULTATION,
    AppointmentType.GP_TELEPHONE,
    AppointmentType.GP_EXTENDED,
    AppointmentType.NURSE_CHRONIC_DISEASE,
    AppointmentType.GP_CONSULTATION,
  ];

  const statuses = [
    AppointmentStatus.COMPLETED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.ARRIVED,
    AppointmentStatus.BOOKED,
  ];

  // Today's appointments
  for (let i = 0; i < 5; i++) {
    const startTime = new Date(today);
    startTime.setHours(9 + i, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 15);

    await prisma.appointment.create({
      data: {
        practiceId: practice.id,
        patientId: patients[i % patients.length].id,
        clinicianId: gpUser.id,
        roomId: rooms[0].id,
        appointmentType: appointmentTypes[i],
        scheduledStart: startTime,
        scheduledEnd: endTime,
        duration: 15,
        status: statuses[i],
        reason: 'General consultation',
      },
    });
  }

  // Tomorrow's appointments
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (let i = 0; i < 3; i++) {
    const startTime = new Date(tomorrow);
    startTime.setHours(10 + i, 30, 0, 0);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 15);

    await prisma.appointment.create({
      data: {
        practiceId: practice.id,
        patientId: patients[(i + 1) % patients.length].id,
        clinicianId: gpUser.id,
        roomId: rooms[1].id,
        appointmentType: AppointmentType.GP_TELEPHONE,
        scheduledStart: startTime,
        scheduledEnd: endTime,
        duration: 15,
        status: AppointmentStatus.BOOKED,
        reason: 'Follow-up appointment',
      },
    });
  }

  console.log('✅ Created 8 appointments');

  // Create pharmacies - delete existing and recreate
  await prisma.pharmacy.deleteMany({ where: { practiceId: practice.id } });

  await prisma.pharmacy.create({
    data: {
      name: 'QV Pharmacies Avondale',
      odsCode: 'FLM49',
      addressLine1: '12 King George Road',
      city: 'Harare',
      postcode: '',
      phone: '+263 242 335 890',
      email: 'avondale@qvpharmacies.co.zw',
      practiceId: practice.id,
    },
  });

  await prisma.pharmacy.create({
    data: {
      name: 'Greenwood Pharmacy',
      odsCode: 'FQ123',
      addressLine1: '45 Sam Nujoma Street',
      city: 'Harare',
      postcode: '',
      phone: '+263 242 752 345',
      practiceId: practice.id,
    },
  });

  console.log('✅ Created 2 pharmacies');

  // Create appointment type settings
  const appointmentTypeSettings = [
    { type: AppointmentType.GP_CONSULTATION, duration: 10, color: '#3B82F6', label: 'GP Consultation', code: 'GP' },
    { type: AppointmentType.GP_EXTENDED, duration: 20, color: '#8B5CF6', label: 'Extended GP Consultation', code: 'GPX' },
    { type: AppointmentType.GP_TELEPHONE, duration: 10, color: '#F59E0B', label: 'Telephone Consultation', code: 'GPTEL' },
    { type: AppointmentType.GP_VIDEO, duration: 10, color: '#10B981', label: 'Video Consultation', code: 'GPVID' },
    { type: AppointmentType.NURSE_APPOINTMENT, duration: 15, color: '#EC4899', label: 'Nurse Appointment', code: 'NURSE' },
    { type: AppointmentType.NURSE_CHRONIC_DISEASE, duration: 20, color: '#D946EF', label: 'Chronic Disease Review', code: 'CDR' },
    { type: AppointmentType.HCA_BLOOD_TEST, duration: 10, color: '#F97316', label: 'Blood Test', code: 'BLOOD' },
    { type: AppointmentType.HCA_HEALTH_CHECK, duration: 30, color: '#14B8A6', label: 'NHS Health Check', code: 'HEALTH' },
    { type: AppointmentType.VACCINATION, duration: 10, color: '#06B6D4', label: 'Vaccination', code: 'VAC' },
    { type: AppointmentType.SMEAR_TEST, duration: 15, color: '#EF4444', label: 'Cervical Screening', code: 'SMEAR' },
    { type: AppointmentType.MINOR_SURGERY, duration: 30, color: '#6366F1', label: 'Minor Surgery', code: 'SURG' },
    { type: AppointmentType.HOME_VISIT, duration: 30, color: '#84CC16', label: 'Home Visit', code: 'HOME' },
  ];

  for (const setting of appointmentTypeSettings) {
    await prisma.appointmentTypeSetting.upsert({
      where: {
        practiceId_type: {
          practiceId: practice.id,
          type: setting.type,
        },
      },
      update: {},
      create: {
        practiceId: practice.id,
        type: setting.type,
        label: setting.label,
        code: setting.code,
        defaultDuration: setting.duration,
        color: setting.color,
        isActive: true,
        allowedRoles: [UserRole.GP, UserRole.NURSE, UserRole.HCA],
      },
    });
  }

  console.log('✅ Created appointment type settings');

  // Create Super Admin (using base64 for demo, service supports both bcrypt and base64)
  const superAdminPassword = await hashPassword('SuperAdmin123!');

  await prisma.superAdmin.upsert({
    where: { email: 'superadmin@kairo.com' },
    update: {},
    create: {
      email: 'superadmin@kairo.com',
      password: superAdminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true,
    },
  });

  console.log('✅ Created super admin');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('   Admin: admin@avondale-medical.co.zw / Password123!');
  console.log('   GP: dr.chikwanha@avondale-medical.co.zw / Password123!');
  console.log('   Nurse: nurse.mutasa@avondale-medical.co.zw / Password123!');
  console.log('   Reception: reception@avondale-medical.co.zw / Password123!');
  console.log('\n📋 Super Admin credentials:');
  console.log('   Super Admin: superadmin@kairo.com / SuperAdmin123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
