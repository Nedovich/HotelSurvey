import type {
  ResponseSource,
  ResponseStatus,
} from "@/features/public-survey/types";

export const defaultSurveySchema = {
  title: "Check-out Feedback",
  description: "Please help us improve your next stay.",
  pages: [
    {
      name: "guest-feedback",
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
          name: "breakfast_quality",
          title: "How was the breakfast experience?",
          choices: ["Excellent", "Good", "Average", "Poor"],
          isRequired: true,
        },
        {
          type: "comment",
          name: "staff_note",
          title: "Anything we can do better next time?",
        },
      ],
    },
  ],
};

export const mockHotel = {
  id: "mock-hotel",
  name: "Hospita Antalya",
  slug: "hospita-antalya",
  brandColor: "#a85a08",
  defaultLocale: "en",
  timezone: "Europe/Istanbul",
  baseCurrency: "USD",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "24h",
  systemLanguage: "en-US",
  numberFormat: "1,234,567.89",
  defaultView: "list",
  requireTwoFactor: true,
  defaultFormId: "form-checkout",
  isActive: true,
};

export const mockForms = [
  {
    id: "form-checkout",
    hotelId: mockHotel.id,
    name: "Check-out Feedback",
    description: "Standard end-of-stay survey",
    status: "published",
    defaultLocale: "en",
    surveySchema: defaultSurveySchema,
    thankYouContent: {
      title: "Tesekkurler",
      description: "Geri bildiriminiz bizim icin cok degerli.",
    },
    createdAt: new Date("2026-05-20T08:00:00Z"),
    updatedAt: new Date("2026-05-27T09:00:00Z"),
  },
  {
    id: "form-restaurant",
    hotelId: mockHotel.id,
    name: "Restaurant Experience",
    description: "Dining satisfaction metrics",
    status: "draft",
    defaultLocale: "en",
    surveySchema: defaultSurveySchema,
    thankYouContent: {
      title: "Thank you",
      description: "Your feedback has been shared with our team.",
    },
    createdAt: new Date("2026-05-18T08:00:00Z"),
    updatedAt: new Date("2026-05-25T11:30:00Z"),
  },
  {
    id: "form-spa",
    hotelId: mockHotel.id,
    name: "Spa Services 2022",
    description: "Legacy wellness survey",
    status: "archived",
    defaultLocale: "en",
    surveySchema: defaultSurveySchema,
    thankYouContent: {
      title: "Tesekkurler",
      description: "Yanitiniz kaydedildi.",
    },
    createdAt: new Date("2024-02-10T08:00:00Z"),
    updatedAt: new Date("2025-02-15T11:30:00Z"),
  },
] as const;

export const mockPublications = [
  {
    id: "pub-checkout",
    formId: "form-checkout",
    publicSlug: "check-out-feedback",
    mode: "direct_link",
    isActive: true,
    startsAt: null,
    endsAt: null,
  },
  {
    id: "pub-portal",
    formId: "form-checkout",
    publicSlug: "portal-feedback",
    mode: "captive_portal",
    isActive: true,
    startsAt: null,
    endsAt: null,
  },
] as const;

export type MockResponseRecord = {
  id: string;
  createdAt: Date;
  guestName: string;
  room: string;
  surveyName: string;
  score: number;
  status: ResponseStatus;
  source: ResponseSource;
  notes: string;
  reviewPriority: "low" | "medium" | "high";
  internalNote: string;
};

export const mockResponses: MockResponseRecord[] = [
  {
    id: "resp-1",
    createdAt: new Date("2026-05-27T10:00:00Z"),
    guestName: "Sarah Jenkins",
    room: "412",
    surveyName: "Check-out Feedback",
    score: 2,
    status: "completed",
    source: "direct_link",
    notes: "AC was making a loud noise all night.",
    reviewPriority: "high",
    internalNote: "Guest asked for maintenance follow-up after checkout.",
  },
  {
    id: "resp-2",
    createdAt: new Date("2026-05-27T08:15:00Z"),
    guestName: "Mark Thompson",
    room: "205",
    surveyName: "Check-out Feedback",
    score: 3,
    status: "completed",
    source: "captive_portal",
    notes: "Breakfast buffet was empty by 8:30 AM.",
    reviewPriority: "medium",
    internalNote: "",
  },
  {
    id: "resp-3",
    createdAt: new Date("2026-05-26T17:45:00Z"),
    guestName: "Anonymous",
    room: "710",
    surveyName: "Restaurant Experience",
    score: 1,
    status: "rejected",
    source: "direct_link",
    notes: "Valet took 45 minutes to retrieve my car.",
    reviewPriority: "high",
    internalNote: "Front office should review service recovery response.",
  },
];

export const mockTeam = [
  {
    id: "team-1",
    name: "Hospita Admin",
    email: "admin@hospita.com",
    role: "Owner",
    status: "Active",
  },
  {
    id: "team-2",
    name: "Ayse Yilmaz",
    email: "ops@hospita.com",
    role: "Manager",
    status: "Invited",
  },
];

export const mockSuperAdmin = {
  id: "mock-super-admin",
  name: "Platform Admin",
  email: "superadmin@hospita.com",
  platformRole: "super_admin" as const,
};
