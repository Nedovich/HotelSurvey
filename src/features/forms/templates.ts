import type { SurveySchemaValue } from "@/features/forms/schema";

export type SurveyTemplate = {
  id: string;
  title: string;
  summary: string;
  category: string;
  createLabel: string;
  baseFormName: string;
  description: string;
  thankYouTitle: string;
  thankYouDescription: string;
  surveySchema: SurveySchemaValue;
};

const blankSurveySchema: SurveySchemaValue = {
  title: "Untitled Survey",
  description: "Start building your survey.",
  pages: [
    {
      name: "page-1",
      elements: [],
    },
  ],
};

const checkoutSurveySchema: SurveySchemaValue = {
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

const inStayRecoverySchema: SurveySchemaValue = {
  title: "In-Stay Service Recovery",
  description: "Catch service issues before check-out.",
  pages: [
    {
      name: "service-recovery",
      elements: [
        {
          type: "rating",
          name: "current_stay_score",
          title: "How is your stay going so far?",
          rateMax: 5,
          isRequired: true,
        },
        {
          type: "checkbox",
          name: "issue_areas",
          title: "Which areas need attention?",
          choices: [
            "Room cleanliness",
            "Air conditioning",
            "Noise",
            "Wi-Fi",
            "Housekeeping response time",
          ],
          hasOther: true,
        },
        {
          type: "comment",
          name: "service_recovery_details",
          title: "Please share any details so our team can help quickly.",
        },
      ],
    },
  ],
};

const restaurantSurveySchema: SurveySchemaValue = {
  title: "Restaurant Experience",
  description: "Understand dining satisfaction and service consistency.",
  pages: [
    {
      name: "restaurant-experience",
      elements: [
        {
          type: "rating",
          name: "food_quality",
          title: "How would you rate the food quality?",
          rateMax: 5,
          isRequired: true,
        },
        {
          type: "rating",
          name: "service_speed",
          title: "How was the service speed?",
          rateMax: 5,
          isRequired: true,
        },
        {
          type: "radiogroup",
          name: "visit_reason",
          title: "Which meal did you join us for?",
          choices: ["Breakfast", "Lunch", "Dinner", "Snack / Bar"],
        },
        {
          type: "comment",
          name: "restaurant_comment",
          title: "Anything our restaurant team should know?",
        },
      ],
    },
  ],
};

const spaSurveySchema: SurveySchemaValue = {
  title: "Spa & Wellness Feedback",
  description: "Measure treatment quality and wellness experience.",
  pages: [
    {
      name: "spa-feedback",
      elements: [
        {
          type: "rating",
          name: "treatment_satisfaction",
          title: "How satisfied were you with your treatment?",
          rateMax: 5,
          isRequired: true,
        },
        {
          type: "rating",
          name: "facility_cleanliness",
          title: "How would you rate the spa facilities?",
          rateMax: 5,
          isRequired: true,
        },
        {
          type: "checkbox",
          name: "services_used",
          title: "Which services did you use?",
          choices: ["Massage", "Steam room", "Sauna", "Hammam", "Pool"],
        },
        {
          type: "comment",
          name: "wellness_feedback",
          title: "How can we improve your next wellness visit?",
        },
      ],
    },
  ],
};

const quickNpsSchema: SurveySchemaValue = {
  title: "Quick NPS Check",
  description: "A short recommendation pulse for high-volume touchpoints.",
  pages: [
    {
      name: "nps",
      elements: [
        {
          type: "rating",
          name: "nps_score",
          title: "How likely are you to recommend our hotel to a friend?",
          rateMin: 0,
          rateMax: 10,
          minRateDescription: "Not likely",
          maxRateDescription: "Very likely",
          isRequired: true,
        },
        {
          type: "comment",
          name: "nps_reason",
          title: "What is the main reason for your score?",
        },
      ],
    },
  ],
};

export const surveyTemplates: SurveyTemplate[] = [
  {
    id: "blank",
    title: "Blank survey",
    summary: "Start from scratch with an empty page and build your own flow.",
    category: "Custom",
    createLabel: "Start blank",
    baseFormName: "Untitled Survey",
    description: "New guest feedback form",
    thankYouTitle: "Thank you",
    thankYouDescription: "Your feedback has been recorded.",
    surveySchema: blankSurveySchema,
  },
  {
    id: "checkout",
    title: "Check-out feedback",
    summary: "A classic post-stay survey covering overall stay, breakfast, and comments.",
    category: "Guest Journey",
    createLabel: "Use template",
    baseFormName: "Check-out Feedback",
    description: "Standard end-of-stay survey",
    thankYouTitle: "Thank you",
    thankYouDescription: "Your feedback has been recorded.",
    surveySchema: checkoutSurveySchema,
  },
  {
    id: "in-stay-recovery",
    title: "In-stay recovery",
    summary: "Collect issues during the stay so teams can resolve problems before departure.",
    category: "Operations",
    createLabel: "Use template",
    baseFormName: "In-Stay Recovery",
    description: "Mid-stay service recovery survey",
    thankYouTitle: "Thank you",
    thankYouDescription: "Our team will review your feedback promptly.",
    surveySchema: inStayRecoverySchema,
  },
  {
    id: "restaurant",
    title: "Restaurant experience",
    summary: "Measure food quality, service speed, and meal-specific satisfaction.",
    category: "F&B",
    createLabel: "Use template",
    baseFormName: "Restaurant Experience",
    description: "Dining satisfaction survey",
    thankYouTitle: "Thank you",
    thankYouDescription: "Your dining feedback has been shared with our team.",
    surveySchema: restaurantSurveySchema,
  },
  {
    id: "spa",
    title: "Spa & wellness",
    summary: "Gather treatment, facility, and service feedback from wellness guests.",
    category: "Wellness",
    createLabel: "Use template",
    baseFormName: "Spa & Wellness Feedback",
    description: "Wellness and treatment satisfaction survey",
    thankYouTitle: "Thank you",
    thankYouDescription: "We appreciate your wellness feedback.",
    surveySchema: spaSurveySchema,
  },
  {
    id: "quick-nps",
    title: "Quick NPS",
    summary: "A lightweight recommendation survey for QR touchpoints and quick follow-ups.",
    category: "Pulse",
    createLabel: "Use template",
    baseFormName: "Quick NPS",
    description: "Short recommendation survey",
    thankYouTitle: "Thank you",
    thankYouDescription: "Thanks for sharing your score.",
    surveySchema: quickNpsSchema,
  },
];

export function getSurveyTemplate(templateId: string) {
  return (
    surveyTemplates.find((template) => template.id === templateId) ??
    surveyTemplates[0]
  );
}

export function cloneSurveyTemplateSchema(schema: SurveySchemaValue) {
  return JSON.parse(JSON.stringify(schema)) as SurveySchemaValue;
}
