import { cache } from "react";

import { hasDatabaseUrl } from "@/lib/env";
import { isSameAppDay } from "@/lib/datetime";
import { resolvePublicSlug } from "@/features/forms/publication";
import { buildHotelDefaultSurveyUrl } from "@/features/forms/publication";
import { prisma } from "@/lib/prisma";
import { requireHotelContext } from "@/lib/session";
import {
  mockForms,
  mockHotel,
  mockPublications,
  mockResponses,
  mockSuperAdmin,
  mockTeam,
} from "@/server/mock-data";

const decoratePublicationAccess = <
  T extends {
    endsAt: Date | null;
    isActive: boolean;
  },
>(
  publication: T,
) => ({
  ...publication,
  hasExpired:
    publication.endsAt instanceof Date &&
    publication.endsAt.getTime() < Date.now(),
});

const getMockDashboardData = () => {
  const totalSurveys = mockForms.length;
  const activeSurveys = mockForms.filter(
    (form) => form.status === "published",
  ).length;
  const todayResponses = mockResponses.filter(
    (response) => isSameAppDay(response.createdAt, new Date()),
  ).length;

  return {
    totalSurveys,
    activeSurveys,
    todayResponses,
    responseRate: 68,
    unfinished: 12,
    lowScoreAlerts: mockResponses.filter((response) => response.score <= 3),
    activity: [
      {
        title: "New response received for Post-Stay Survey",
        subtitle:
          "Guest rated overall experience 5/5. Automated thank you email triggered.",
        time: "Just now",
        isCurrent: true,
      },
      {
        title: "Report generated: Weekly Housekeeping Stats",
        subtitle: "Requested by Admin user (j.doe@hospita.com).",
        time: "45 mins ago",
        isCurrent: false,
      },
      {
        title: "Survey Modified: Breakfast Satisfaction",
        subtitle:
          "Added 2 new multiple choice questions regarding vegan options.",
        time: "3 hours ago",
        isCurrent: false,
      },
    ],
  };
};

export const getDashboardData = cache(async () => {
  if (!hasDatabaseUrl) {
    return getMockDashboardData();
  }

  try {
    const [forms, responses] = await Promise.all([
      prisma.surveyForm.findMany(),
      prisma.surveyResponse.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const lowScoreAlerts = responses
      .filter((response) => (response.scoreSummary ?? 5) <= 3)
      .map((response) => ({
        id: response.id,
        guestName: response.respondentName ?? "Guest",
        room: response.roomNumber ?? "-",
        score: response.scoreSummary ?? 0,
        notes:
          typeof response.answers === "object" &&
          response.answers &&
          "notes" in response.answers
            ? String(response.answers.notes)
            : "No additional notes provided.",
      }));

    return {
      totalSurveys: forms.length,
      activeSurveys: forms.filter((form) => form.status === "published").length,
      todayResponses: responses.filter(
        (response) => isSameAppDay(response.createdAt, new Date()),
      ).length,
      responseRate: 68,
      unfinished: responses.filter((response) => response.status !== "completed")
        .length,
      lowScoreAlerts,
      activity: [
        {
          title: "Live PostgreSQL dashboard connected",
          subtitle: "Metrics are now being read from the hospita database.",
          time: "Just now",
          isCurrent: true,
        },
        {
          title: "Forms are being loaded from Prisma",
          subtitle: "Published surveys and response counts were refreshed.",
          time: "45 mins ago",
          isCurrent: false,
        },
        {
          title: "FastAPI integration stub is enabled",
          subtitle: "Guest verification requests are still running in stub mode.",
          time: "3 hours ago",
          isCurrent: false,
        },
      ],
    };
  } catch {
    return getMockDashboardData();
  }
});

export const getForms = cache(async () => {
  if (!hasDatabaseUrl) {
    return mockForms;
  }

  try {
    return await prisma.surveyForm.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        publications: true,
        responses: true,
      },
    });
  } catch {
    return mockForms;
  }
});

export const getFormById = cache(async (formId: string) => {
  if (!hasDatabaseUrl) {
    return mockForms.find((form) => form.id === formId) ?? null;
  }

  try {
    return await prisma.surveyForm.findUnique({
      where: {
        id: formId,
      },
      include: {
        publications: true,
      },
    });
  } catch {
    return mockForms.find((form) => form.id === formId) ?? null;
  }
});

export async function getPublicationBySlug(publicSlug: string) {
  if (!hasDatabaseUrl) {
    const publication =
      mockPublications.find((item) => item.publicSlug === publicSlug) ??
      (publicSlug === mockHotel.slug
        ? mockPublications.find((item) => item.formId === mockHotel.defaultFormId)
        : undefined);

    if (!publication) {
      return null;
    }

    const form = mockForms.find((item) => item.id === publication.formId);

    return form ? decoratePublicationAccess({ ...publication, form }) : null;
  }

  try {
    const directMatch = await prisma.surveyPublication.findUnique({
      where: {
        publicSlug,
      },
      include: {
        form: true,
      },
    });

    if (directMatch) {
      return decoratePublicationAccess(directMatch);
    }

    const hotelAliasMatch = await prisma.hotel.findUnique({
      where: {
        slug: publicSlug,
      },
      select: {
        defaultFormId: true,
      },
    });

    const defaultFormPublication = hotelAliasMatch?.defaultFormId
      ? await prisma.surveyPublication.findFirst({
          where: {
            formId: hotelAliasMatch.defaultFormId,
          },
          include: {
            form: true,
          },
          orderBy: [
            {
              isActive: "desc",
            },
            {
              updatedAt: "desc",
            },
          ],
        })
      : null;

    if (defaultFormPublication) {
      return decoratePublicationAccess(defaultFormPublication);
    }

    const publications = await prisma.surveyPublication.findMany({
      include: {
        form: true,
      },
    });

    const fallbackMatch =
      publications.find((publication) => {
        const resolvedSlug = resolvePublicSlug(
          publication.form.name,
          publication.form.id,
          publication.publicSlug,
        );

        return resolvedSlug === publicSlug;
      }) ?? null;

    return fallbackMatch ? decoratePublicationAccess(fallbackMatch) : null;
  } catch {
    const publication =
      mockPublications.find((item) => item.publicSlug === publicSlug) ??
      (publicSlug === mockHotel.slug
        ? mockPublications.find((item) => item.formId === mockHotel.defaultFormId)
        : undefined);

    if (!publication) {
      return null;
    }

    const form = mockForms.find((item) => item.id === publication.formId);
    return form ? decoratePublicationAccess({ ...publication, form }) : null;
  }
}

export async function getResponses() {
  if (!hasDatabaseUrl) {
    return mockResponses;
  }

  try {
    return await prisma.surveyResponse.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        form: true,
      },
    });
  } catch {
    return mockResponses;
  }
}

export async function getResponseById(responseId: string) {
  if (!hasDatabaseUrl) {
    return mockResponses.find((response) => response.id === responseId) ?? null;
  }

  try {
    return await prisma.surveyResponse.findUnique({
      where: {
        id: responseId,
      },
      include: {
        form: true,
        publication: true,
      },
    });
  } catch {
    return mockResponses.find((response) => response.id === responseId) ?? null;
  }
}

export const getTeamMembers = cache(async () => {
  if (!hasDatabaseUrl) {
    return mockTeam;
  }

  try {
    return await prisma.membership.findMany({
      include: {
        user: true,
      },
    });
  } catch {
    return mockTeam;
  }
});

export const getSettingsSnapshot = cache(async () => {
  if (!hasDatabaseUrl) {
    return {
      hotel: mockHotel,
      integrationMode: "stub",
      apiBaseUrl: "https://api.kreatinmedya.com",
    };
  }

  try {
    const hotel = await prisma.hotel.findFirstOrThrow();
    return {
      hotel,
      integrationMode: "live",
      apiBaseUrl: "https://api.kreatinmedya.com",
    };
  } catch {
    return {
      hotel: mockHotel,
      integrationMode: "stub",
      apiBaseUrl: "https://api.kreatinmedya.com",
    };
  }
});

export async function getSecuritySettingsSnapshot() {
  const context = await requireHotelContext();

  if (!hasDatabaseUrl) {
    return {
      hotel: {
        ...mockHotel,
        requireTwoFactor: mockHotel.requireTwoFactor,
      },
      teamMembers: [
        {
          id: "member-1",
          name: "Eleanor Morrison",
          email: "eleanor@hospita.com",
          role: "Admin",
          status: "Active",
          lastLoginLabel: "Just now",
          initials: "EM",
          isPending: false,
        },
        {
          id: "member-2",
          name: "James Davis",
          email: "james.d@hospita.co",
          role: "Editor",
          status: "Active",
          lastLoginLabel: "2 hours ago",
          initials: "JD",
          isPending: false,
        },
        {
          id: "member-3",
          name: null,
          email: "sarah.j@hospita.co",
          role: "Viewer",
          status: "Pending",
          lastLoginLabel: "-",
          initials: null,
          isPending: true,
        },
      ],
      sessions: [
        {
          id: "session-1",
          label: "Mac OS • Safari",
          location: "San Francisco, USA",
          ipAddress: "192.168.1.1",
          activityLabel: "Active right now",
          isCurrent: true,
        },
        {
          id: "session-2",
          label: "iOS • Safari",
          location: "San Jose, USA",
          ipAddress: "10.0.0.45",
          activityLabel: "Last active: 2 hours ago",
          isCurrent: false,
        },
      ],
    };
  }

  const [hotel, memberships, sessions] = await Promise.all([
    prisma.hotel.findUnique({
      where: {
        id: context.hotel.id,
      },
    }),
    prisma.membership.findMany({
      where: {
        hotelId: context.hotel.id,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.session.findMany({
      where: {
        userId: context.session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
    }),
  ]);

  const activeHotel = hotel ?? context.hotel;
  const teamMembers = memberships.map((membership, index) => {
    const initials = membership.user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return {
      id: membership.id,
      name: membership.user.name,
      email: membership.user.email,
      role: membership.role === "owner" ? "Admin" : membership.role,
      status: "Active",
      lastLoginLabel: index === 0 ? "Just now" : `${index + 1} hours ago`,
      initials,
      isPending: false,
    };
  });

  const mappedSessions = sessions.map((session, index) => {
    const userAgent = session.userAgent?.toLowerCase() ?? "";
    const label = userAgent.includes("iphone") || userAgent.includes("ios")
      ? "iOS • Safari"
      : userAgent.includes("mac")
        ? "Mac OS • Safari"
        : "Web Session";

    return {
      id: session.id,
      label,
      location: session.ipAddress ? "Active location" : "Unknown location",
      ipAddress: session.ipAddress ?? "-",
      activityLabel: index === 0 ? "Active right now" : "Last active recently",
      isCurrent: index === 0,
    };
  });

  return {
    hotel: activeHotel,
    teamMembers,
    sessions: mappedSessions,
  };
}

export async function getManagedHotels() {
  if (!hasDatabaseUrl) {
    return [
      {
        ...mockHotel,
        defaultForm:
          mockForms.find((form) => form.id === mockHotel.defaultFormId) ?? null,
        primaryAdmin: mockTeam[0],
        formsCount: mockForms.length,
        responsesCount: mockResponses.length,
        stableLinkUrl: buildHotelDefaultSurveyUrl(mockHotel.slug),
      },
    ];
  }

  const hotels = await prisma.hotel.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      defaultForm: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      memberships: {
        where: {
          role: "owner",
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 1,
      },
      _count: {
        select: {
          forms: true,
          responses: true,
        },
      },
    },
  });

  return hotels.map((hotel) => ({
    ...hotel,
    primaryAdmin: hotel.memberships[0]?.user ?? null,
    formsCount: hotel._count.forms,
    responsesCount: hotel._count.responses,
    stableLinkUrl: buildHotelDefaultSurveyUrl(hotel.slug),
  }));
}

export async function getManagedHotelById(hotelId: string) {
  if (!hasDatabaseUrl) {
    if (hotelId !== mockHotel.id) {
      return null;
    }

    return {
      ...mockHotel,
      defaultForm: mockForms.find((form) => form.id === mockHotel.defaultFormId) ?? null,
      forms: mockForms,
      primaryAdmin: mockTeam[0],
      stableLinkUrl: buildHotelDefaultSurveyUrl(mockHotel.slug),
      auditLogs: [
        {
          id: "audit-mock-1",
          action: "hotel.created",
          entityType: "hotel",
          createdAt: new Date("2026-05-20T08:00:00Z"),
          user: mockSuperAdmin,
        },
      ],
    };
  }

  return prisma.hotel.findUnique({
    where: {
      id: hotelId,
    },
    include: {
      defaultForm: true,
      forms: {
        orderBy: {
          createdAt: "desc",
        },
      },
      memberships: {
        where: {
          role: "owner",
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 1,
      },
      auditLogs: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
      },
    },
  }).then((hotel) => {
    if (!hotel) {
      return null;
    }

    return {
      ...hotel,
      primaryAdmin: hotel.memberships[0]?.user ?? null,
      stableLinkUrl: buildHotelDefaultSurveyUrl(hotel.slug),
    };
  });
}
