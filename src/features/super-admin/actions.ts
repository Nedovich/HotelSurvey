"use server";

import { hashPassword } from "better-auth/crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { writeAuditLog } from "@/lib/audit";
import { hasDatabaseUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import {
  requireSuperAdmin,
  SUPER_ADMIN_IMPERSONATION_COOKIE,
} from "@/lib/session";

const createHotelSchema = z.object({
  hotelName: z.string().trim().min(2),
  hotelSlug: z
    .string()
    .trim()
    .min(3)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  adminName: z.string().trim().min(2),
  adminEmail: z.email(),
  initialPassword: z.string().min(8),
  brandColor: z.string().trim().optional(),
  defaultLocale: z.string().trim().optional(),
});

const updateHotelSchema = z.object({
  hotelId: z.string(),
  hotelName: z.string().trim().min(2),
  brandColor: z.string().trim().optional(),
  defaultLocale: z.string().trim().min(2),
});

const updateHotelStableLinkSchema = z.object({
  hotelId: z.string(),
  stableLinkSlug: z
    .string()
    .trim()
    .min(3)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

const toggleHotelSchema = z.object({
  hotelId: z.string(),
  nextStatus: z.enum(["active", "inactive"]),
});

const passwordSchema = z.object({
  hotelId: z.string(),
  newPassword: z.string().min(8),
});

const defaultFormSchema = z.object({
  hotelId: z.string(),
  defaultFormId: z.string().optional(),
});

const impersonationSchema = z.object({
  hotelId: z.string(),
});

function redirectWithStatus(
  path: string,
  key: "error" | "notice",
  value: string,
): never {
  redirect(`${path}?${key}=${value}`);
}

function normalizeLocale(value: string | undefined) {
  return value?.trim().toLowerCase() || "en";
}

function normalizeColor(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createHotelAccountAction(formData: FormData) {
  const { session } = await requireSuperAdmin();
  const parsed = createHotelSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectWithStatus("/super-admin/hotels/new", "error", "invalid_hotel_payload");
  }

  if (!hasDatabaseUrl) {
    redirectWithStatus("/super-admin/hotels", "notice", "demo_mode_only");
  }

  const duplicateHotel = await prisma.hotel.findUnique({
    where: {
      slug: parsed.data.hotelSlug,
    },
    select: {
      id: true,
    },
  });

  if (duplicateHotel) {
    redirectWithStatus("/super-admin/hotels/new", "error", "hotel_slug_exists");
  }

  const duplicateUser = await prisma.user.findUnique({
    where: {
      email: parsed.data.adminEmail.toLowerCase(),
    },
    select: {
      id: true,
    },
  });

  if (duplicateUser) {
    redirectWithStatus("/super-admin/hotels/new", "error", "admin_email_exists");
  }

  const passwordHash = await hashPassword(parsed.data.initialPassword);

  const result = await prisma.$transaction(async (tx) => {
    const hotel = await tx.hotel.create({
      data: {
        name: parsed.data.hotelName,
        slug: parsed.data.hotelSlug,
        brandColor: normalizeColor(parsed.data.brandColor),
        defaultLocale: normalizeLocale(parsed.data.defaultLocale),
        isActive: true,
      },
    });

    const user = await tx.user.create({
      data: {
        name: parsed.data.adminName,
        email: parsed.data.adminEmail.toLowerCase(),
        platformRole: "hotel_admin",
      },
    });

    await tx.account.create({
      data: {
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password: passwordHash,
      },
    });

    await tx.membership.create({
      data: {
        hotelId: hotel.id,
        userId: user.id,
        role: "owner",
      },
    });

    return { hotel, user };
  });

  await writeAuditLog({
    action: "hotel.created",
    entityType: "hotel",
    entityId: result.hotel.id,
    hotelId: result.hotel.id,
    userId: session.user.id,
    payload: {
      hotelName: result.hotel.name,
      adminEmail: result.user.email,
    },
  });

  revalidatePath("/super-admin/hotels");
  redirectWithStatus(
    `/super-admin/hotels/${result.hotel.id}`,
    "notice",
    "hotel_created",
  );
}

export async function updateHotelProfileAction(formData: FormData) {
  const { session } = await requireSuperAdmin();
  const parsed = updateHotelSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectWithStatus(
      `/super-admin/hotels/${formData.get("hotelId")}`,
      "error",
      "invalid_hotel_payload",
    );
  }

  await prisma.hotel.update({
    where: {
      id: parsed.data.hotelId,
    },
    data: {
      name: parsed.data.hotelName,
      brandColor: normalizeColor(parsed.data.brandColor),
      defaultLocale: normalizeLocale(parsed.data.defaultLocale),
    },
  });

  await writeAuditLog({
    action: "hotel.updated",
    entityType: "hotel",
    entityId: parsed.data.hotelId,
    hotelId: parsed.data.hotelId,
    userId: session.user.id,
    payload: {
      hotelName: parsed.data.hotelName,
    },
  });

  revalidatePath("/super-admin/hotels");
  revalidatePath(`/super-admin/hotels/${parsed.data.hotelId}`);
  redirectWithStatus(
    `/super-admin/hotels/${parsed.data.hotelId}`,
    "notice",
    "hotel_updated",
  );
}

export async function updateHotelStableLinkAction(formData: FormData) {
  const { session } = await requireSuperAdmin();
  const parsed = updateHotelStableLinkSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectWithStatus(
      `/super-admin/hotels/${formData.get("hotelId")}`,
      "error",
      "invalid_stable_link_slug",
    );
  }

  const duplicateSlug = await prisma.hotel.findFirst({
    where: {
      slug: parsed.data.stableLinkSlug,
      NOT: {
        id: parsed.data.hotelId,
      },
    },
    select: {
      id: true,
    },
  });

  if (duplicateSlug) {
    redirectWithStatus(
      `/super-admin/hotels/${parsed.data.hotelId}`,
      "error",
      "hotel_slug_exists",
    );
  }

  const hotel = await prisma.hotel.findUnique({
    where: {
      id: parsed.data.hotelId,
    },
    select: {
      slug: true,
    },
  });

  if (!hotel) {
    redirectWithStatus(
      `/super-admin/hotels/${parsed.data.hotelId}`,
      "error",
      "hotel_not_found",
    );
  }

  if (hotel.slug === parsed.data.stableLinkSlug) {
    redirectWithStatus(
      `/super-admin/hotels/${parsed.data.hotelId}`,
      "notice",
      "stable_link_unchanged",
    );
  }

  await prisma.hotel.update({
    where: {
      id: parsed.data.hotelId,
    },
    data: {
      slug: parsed.data.stableLinkSlug,
    },
  });

  await writeAuditLog({
    action: "hotel.stable_link_slug_updated",
    entityType: "hotel",
    entityId: parsed.data.hotelId,
    hotelId: parsed.data.hotelId,
    userId: session.user.id,
    payload: {
      stableLinkSlug: parsed.data.stableLinkSlug,
    },
  });

  revalidatePath("/super-admin/hotels");
  revalidatePath(`/super-admin/hotels/${parsed.data.hotelId}`);
  redirectWithStatus(
    `/super-admin/hotels/${parsed.data.hotelId}`,
    "notice",
    "stable_link_updated",
  );
}

export async function toggleHotelStatusAction(formData: FormData) {
  const { session } = await requireSuperAdmin();
  const parsed = toggleHotelSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectWithStatus("/super-admin/hotels", "error", "invalid_status_change");
  }

  const isActive = parsed.data.nextStatus === "active";

  await prisma.hotel.update({
    where: {
      id: parsed.data.hotelId,
    },
    data: {
      isActive,
    },
  });

  await writeAuditLog({
    action: isActive ? "hotel.activated" : "hotel.deactivated",
    entityType: "hotel",
    entityId: parsed.data.hotelId,
    hotelId: parsed.data.hotelId,
    userId: session.user.id,
  });

  revalidatePath("/super-admin/hotels");
  revalidatePath(`/super-admin/hotels/${parsed.data.hotelId}`);
  redirectWithStatus(
    `/super-admin/hotels/${parsed.data.hotelId}`,
    "notice",
    isActive ? "hotel_activated" : "hotel_deactivated",
  );
}

export async function setHotelAdminPasswordAction(formData: FormData) {
  const { session } = await requireSuperAdmin();
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectWithStatus(
      `/super-admin/hotels/${formData.get("hotelId")}`,
      "error",
      "invalid_password",
    );
  }

  const membership = await prisma.membership.findFirst({
    where: {
      hotelId: parsed.data.hotelId,
      role: "owner",
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!membership) {
    redirectWithStatus(
      `/super-admin/hotels/${parsed.data.hotelId}`,
      "error",
      "owner_not_found",
    );
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);

  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: membership.user.id,
      },
    },
    update: {
      password: passwordHash,
      userId: membership.user.id,
    },
    create: {
      providerId: "credential",
      accountId: membership.user.id,
      userId: membership.user.id,
      password: passwordHash,
    },
  });

  await writeAuditLog({
    action: "hotel_admin.password_updated",
    entityType: "user",
    entityId: membership.user.id,
    hotelId: parsed.data.hotelId,
    userId: session.user.id,
    payload: {
      email: membership.user.email,
    },
  });

  revalidatePath(`/super-admin/hotels/${parsed.data.hotelId}`);
  redirectWithStatus(
    `/super-admin/hotels/${parsed.data.hotelId}`,
    "notice",
    "password_updated",
  );
}

export async function setHotelDefaultFormAction(formData: FormData) {
  const { session } = await requireSuperAdmin();
  const parsed = defaultFormSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectWithStatus(
      `/super-admin/hotels/${formData.get("hotelId")}`,
      "error",
      "invalid_default_form",
    );
  }

  const nextFormId = parsed.data.defaultFormId?.trim() || null;
  const hotel = await prisma.hotel.findUnique({
    where: {
      id: parsed.data.hotelId,
    },
    select: {
      defaultFormId: true,
    },
  });

  if (!hotel) {
    redirectWithStatus(
      `/super-admin/hotels/${parsed.data.hotelId}`,
      "error",
      "hotel_not_found",
    );
  }

  if (hotel.defaultFormId === nextFormId) {
    redirectWithStatus(
      `/super-admin/hotels/${parsed.data.hotelId}`,
      "notice",
      "default_link_unchanged",
    );
  }

  if (nextFormId) {
    const form = await prisma.surveyForm.findFirst({
      where: {
        id: nextFormId,
        hotelId: parsed.data.hotelId,
        status: "published",
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!form) {
      redirectWithStatus(
        `/super-admin/hotels/${parsed.data.hotelId}`,
        "error",
        "default_form_must_be_published",
      );
    }
  }

  await prisma.hotel.update({
    where: {
      id: parsed.data.hotelId,
    },
    data: {
      defaultForm: nextFormId
        ? {
            connect: {
              id: nextFormId,
            },
          }
        : {
            disconnect: true,
          },
    },
  });

  await writeAuditLog({
    action: "hotel.default_form_updated",
    entityType: "hotel",
    entityId: parsed.data.hotelId,
    hotelId: parsed.data.hotelId,
    userId: session.user.id,
    payload: {
      defaultFormId: nextFormId,
    },
  });

  revalidatePath("/super-admin/hotels");
  revalidatePath(`/super-admin/hotels/${parsed.data.hotelId}`);
  redirectWithStatus(
    `/super-admin/hotels/${parsed.data.hotelId}`,
    "notice",
    "default_link_updated",
  );
}

export async function startHotelImpersonationAction(formData: FormData) {
  const { session } = await requireSuperAdmin();
  const parsed = impersonationSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectWithStatus("/super-admin/hotels", "error", "invalid_impersonation");
  }

  const hotel = await prisma.hotel.findUnique({
    where: {
      id: parsed.data.hotelId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!hotel) {
    redirectWithStatus("/super-admin/hotels", "error", "hotel_not_found");
  }

  const cookieStore = await cookies();
  cookieStore.set(SUPER_ADMIN_IMPERSONATION_COOKIE, hotel.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  await writeAuditLog({
    action: "impersonation.started",
    entityType: "hotel",
    entityId: hotel.id,
    hotelId: hotel.id,
    userId: session.user.id,
    payload: {
      hotelName: hotel.name,
    },
  });

  redirect("/dashboard");
}

export async function stopHotelImpersonationAction() {
  const { session } = await requireSuperAdmin();
  const cookieStore = await cookies();
  const hotelId = cookieStore.get(SUPER_ADMIN_IMPERSONATION_COOKIE)?.value ?? null;

  cookieStore.delete(SUPER_ADMIN_IMPERSONATION_COOKIE);

  if (hotelId) {
    await writeAuditLog({
      action: "impersonation.stopped",
      entityType: "hotel",
      entityId: hotelId,
      hotelId,
      userId: session.user.id,
    });
  }

  redirect("/super-admin/hotels");
}
