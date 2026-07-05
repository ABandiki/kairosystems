import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Verifies that records referenced in a create/update payload actually belong
 * to the caller's practice. Prevents cross-tenant foreign-key injection where a
 * user connects another practice's patient/appointment/etc. to their own record
 * (which would leak that record back on the include, or corrupt the other tenant).
 *
 * Pass only the IDs present in the request; undefined/null are ignored.
 */
export async function assertRefsInPractice(
  prisma: PrismaService,
  practiceId: string,
  refs: {
    patientId?: string | null;
    clinicianId?: string | null;
    prescriberId?: string | null;
    consultationId?: string | null;
    appointmentId?: string | null;
    roomId?: string | null;
    pharmacyId?: string | null;
    registeredGpId?: string | null;
    nominatedPharmacyId?: string | null;
    userId?: string | null;
  },
): Promise<void> {
  const checks: Promise<void>[] = [];

  const check = async (
    id: string | null | undefined,
    finder: (id: string) => Promise<{ id: string } | null>,
    label: string,
  ) => {
    if (!id) return;
    const found = await finder(id);
    if (!found) {
      throw new BadRequestException(`Invalid ${label} for this practice`);
    }
  };

  if (refs.patientId)
    checks.push(check(refs.patientId, (id) =>
      prisma.patient.findFirst({ where: { id, practiceId }, select: { id: true } }), 'patient'));

  const clinicianId = refs.clinicianId || refs.prescriberId || refs.registeredGpId || refs.userId;
  if (clinicianId)
    checks.push(check(clinicianId, (id) =>
      prisma.user.findFirst({ where: { id, practiceId }, select: { id: true } }), 'staff member'));

  if (refs.consultationId)
    checks.push(check(refs.consultationId, (id) =>
      prisma.consultation.findFirst({ where: { id, practiceId }, select: { id: true } }), 'consultation'));

  if (refs.appointmentId)
    checks.push(check(refs.appointmentId, (id) =>
      prisma.appointment.findFirst({ where: { id, practiceId }, select: { id: true } }), 'appointment'));

  if (refs.roomId)
    checks.push(check(refs.roomId, (id) =>
      prisma.room.findFirst({ where: { id, practiceId }, select: { id: true } }), 'room'));

  const pharmacyId = refs.pharmacyId || refs.nominatedPharmacyId;
  if (pharmacyId)
    checks.push(check(pharmacyId, (id) =>
      prisma.pharmacy.findFirst({ where: { id, practiceId }, select: { id: true } }), 'pharmacy'));

  await Promise.all(checks);
}
