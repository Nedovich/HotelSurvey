import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { hasDatabaseUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const SUPER_ADMIN_IMPERSONATION_COOKIE = "hotelsurvey-impersonation-hotel";

type PlatformRole = "hotel_admin" | "super_admin";

export async function getSession() {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

async function getPlatformRole(userId: string): Promise<PlatformRole> {
  if (!hasDatabaseUrl) {
    return "hotel_admin";
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      platformRole: true,
    },
  });

  return user?.platformRole ?? "hotel_admin";
}

export async function getPostLoginRedirectPath() {
  const session = await requireSession();
  const platformRole = await getPlatformRole(session.user.id);

  return platformRole === "super_admin" ? "/super-admin/hotels" : "/dashboard";
}

export async function requireSuperAdmin() {
  const session = await requireSession();
  const platformRole = await getPlatformRole(session.user.id);

  if (platformRole !== "super_admin") {
    redirect("/dashboard");
  }

  return {
    session,
    platformRole,
  };
}

export async function requireHotelContext() {
  const session = await requireSession();

  if (!hasDatabaseUrl) {
    const cookieStore = await cookies();
    const impersonatedHotelId =
      cookieStore.get(SUPER_ADMIN_IMPERSONATION_COOKIE)?.value ?? null;

    return {
      session,
      hotel: {
        id: "mock-hotel",
        name: "Hospita Antalya",
        slug: "hospita-antalya",
        defaultLocale: "en",
        timezone: "Europe/Istanbul",
        baseCurrency: "USD",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "24h",
        systemLanguage: "en-US",
        numberFormat: "1,234,567.89",
        defaultView: "list",
        requireTwoFactor: true,
        brandColor: "#a85a08",
        defaultFormId: "form-checkout",
        isActive: true,
      },
      membership: {
        role: "owner",
      },
      isImpersonating: Boolean(impersonatedHotelId),
      impersonatedByUserId: impersonatedHotelId ? session.user.id : null,
      platformRole: "hotel_admin" as PlatformRole,
    };
  }

  const platformRole = await getPlatformRole(session.user.id);

  if (platformRole === "super_admin") {
    const cookieStore = await cookies();
    const impersonatedHotelId =
      cookieStore.get(SUPER_ADMIN_IMPERSONATION_COOKIE)?.value ?? null;

    if (!impersonatedHotelId) {
      redirect("/super-admin/hotels");
    }

    const hotel = await prisma.hotel.findUnique({
      where: {
        id: impersonatedHotelId,
      },
    });

    if (!hotel) {
      redirect("/super-admin/hotels");
    }

    return {
      session,
      hotel,
      membership: null,
      isImpersonating: true,
      impersonatedByUserId: session.user.id,
      platformRole,
    };
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      hotel: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!membership) {
    redirect("/login");
  }

  return {
    session,
    hotel: membership.hotel,
    membership,
    isImpersonating: false,
    impersonatedByUserId: null,
    platformRole,
  };
}
