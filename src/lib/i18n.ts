export type AppLocale = "tr" | "en";

type Messages = {
  common: {
    appName: string;
    support: string;
    signOut: string;
    save: string;
    publish: string;
  };
};

const messages: Record<AppLocale, Messages> = {
  tr: {
    common: {
      appName: "Hospita",
      support: "Destek",
      signOut: "Cikis yap",
      save: "Kaydet",
      publish: "Yayinla",
    },
  },
  en: {
    common: {
      appName: "Hospita",
      support: "Support",
      signOut: "Sign out",
      save: "Save",
      publish: "Publish",
    },
  },
};

export function getMessages(locale: AppLocale = "tr") {
  return messages[locale];
}
