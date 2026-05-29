import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const demoSurveySchema = {
  title: "Check-out Feedback",
  description: "Let us know how your stay went.",
  pages: [
    {
      name: "experience",
      elements: [
        {
          type: "rating",
          name: "overall_experience",
          title: "How would you rate your overall stay?",
          rateMax: 5,
          isRequired: true,
        },
        {
          type: "radiogroup",
          name: "team_support",
          title: "How did our team support your stay?",
          choices: ["Excellent", "Good", "Average", "Poor"],
          isRequired: true,
        },
        {
          type: "comment",
          name: "notes",
          title: "Is there anything we should improve?",
        },
      ],
    },
  ],
};

async function main() {
  const email = "admin@hospita.com";
  const password = "Hospita1234!";
  const superAdminEmail = "superadmin@hospita.com";
  const superAdminPassword = "SuperAdmin1234!";
  const hotelSlug = "hospita-antalya";

  const existingUser = await prisma.user.findUnique({ where: { email } });
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingUser) {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: "Hospita Admin",
      },
    });
  }

  if (!existingSuperAdmin) {
    await auth.api.signUpEmail({
      body: {
        email: superAdminEmail,
        password: superAdminPassword,
        name: "Platform Admin",
      },
    });
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  const superAdmin = await prisma.user.findUniqueOrThrow({
    where: { email: superAdminEmail },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      platformRole: "hotel_admin",
    },
  });

  await prisma.user.update({
    where: { id: superAdmin.id },
    data: {
      platformRole: "super_admin",
    },
  });

  const hotel = await prisma.hotel.upsert({
    where: { slug: hotelSlug },
    update: {
      name: "Hospita Antalya",
      brandColor: "#a85a08",
      isActive: true,
      timezone: "Europe/Istanbul",
      baseCurrency: "USD",
      dateFormat: "DD/MM/YYYY",
        timeFormat: "24h",
        systemLanguage: "en-US",
        numberFormat: "1,234,567.89",
        defaultView: "list",
        requireTwoFactor: true,
      },
      create: {
      slug: hotelSlug,
      name: "Hospita Antalya",
      brandColor: "#a85a08",
      defaultLocale: "tr",
      isActive: true,
      timezone: "Europe/Istanbul",
      baseCurrency: "USD",
      dateFormat: "DD/MM/YYYY",
        timeFormat: "24h",
        systemLanguage: "en-US",
        numberFormat: "1,234,567.89",
        defaultView: "list",
        requireTwoFactor: true,
      },
  });

  await prisma.membership.upsert({
    where: {
      userId_hotelId: {
        userId: user.id,
        hotelId: hotel.id,
      },
    },
    update: {
      role: "owner",
    },
    create: {
      userId: user.id,
      hotelId: hotel.id,
      role: "owner",
    },
  });

  const form = await prisma.surveyForm.upsert({
    where: { id: "seed-checkout-form" },
    update: {
      name: "Check-out Feedback",
      status: "published",
      surveySchema: demoSurveySchema,
    },
    create: {
      id: "seed-checkout-form",
      hotelId: hotel.id,
      name: "Check-out Feedback",
      description: "Post-stay satisfaction survey",
      status: "published",
      defaultLocale: "tr",
      surveySchema: demoSurveySchema,
      thankYouContent: {
        title: "Tesekkurler",
        description: "Geri bildiriminiz bizim icin cok degerli.",
      },
    },
  });

  const publication = await prisma.surveyPublication.upsert({
    where: { publicSlug: "check-out-feedback" },
    update: {
      isActive: true,
      mode: "direct_link",
    },
    create: {
      formId: form.id,
      publicSlug: "check-out-feedback",
      mode: "direct_link",
      isActive: true,
    },
  });

  const existingResponse = await prisma.surveyResponse.findFirst({
    where: {
      publicationId: publication.id,
      roomNumber: "412",
    },
  });

  if (!existingResponse) {
    await prisma.surveyResponse.create({
      data: {
        hotelId: hotel.id,
        formId: form.id,
        publicationId: publication.id,
        source: "direct_link",
        status: "completed",
        respondentName: "Sarah",
        respondentSurname: "Jenkins",
        roomNumber: "412",
        submittedAt: new Date(),
        scoreSummary: 2.0,
        answers: {
          overall_experience: 2,
          team_support: "Poor",
          notes: "The room was noisy at night.",
        },
      },
    });
  }

  console.info("Seed completed.");
  console.info(`Demo login: ${email} / ${password}`);
  console.info(`Super admin login: ${superAdminEmail} / ${superAdminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
