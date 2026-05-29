import type { Prisma } from "@/generated/prisma";

import { hasDatabaseUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";

type AuditPayload = {
  action: string;
  entityType: string;
  entityId?: string | null;
  hotelId?: string | null;
  userId?: string | null;
  payload?: Prisma.InputJsonValue | null;
};

export async function writeAuditLog({
  action,
  entityType,
  entityId,
  hotelId,
  userId,
  payload,
}: AuditPayload) {
  if (!hasDatabaseUrl) {
    return;
  }

  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId: entityId ?? null,
      hotelId: hotelId ?? null,
      userId: userId ?? null,
      payload: payload ?? undefined,
    },
  });
}
