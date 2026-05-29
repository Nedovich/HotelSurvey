import {
  surveyLocaleLabels,
  type SurveyLocale,
} from "@/features/surveys/locales";

export const guestEntryCopy: Record<
  SurveyLocale,
  {
    title: string;
    description: string;
    roomLabel: string;
    roomPlaceholder: string;
    birthDateLabel: string;
    submit: string;
    verifyingUnavailable: string;
    notFound: string;
    alreadyCompleted: string;
    expired: string;
    footer: string;
    languageLabel: string;
  }
> = {
  tr: {
    title: "Hos Geldiniz",
    description: "Lutfen deneyiminizi paylasmak icin bilgilerinizi dogrulayin.",
    roomLabel: "Oda Numarasi",
    roomPlaceholder: "Orn: 402",
    birthDateLabel: "Dogum Tarihi",
    submit: "Ankete Basla",
    verifyingUnavailable:
      "Dogrulama servisine su anda erisilemiyor. Bu cihaz ile otel sunucusu ayni agda degil ya da servis disariya acik degil.",
    notFound: "Bilgileriniz bulunamadi, ankete giris yapamazsiniz.",
    alreadyCompleted: "Bu anket daha once doldurulmus.",
    expired: "Bu anket oturumu artik aktif degil.",
    footer: "anketine guvenli giris",
    languageLabel: "Dil",
  },
  en: {
    title: "Welcome",
    description: "Please verify your details to share your experience.",
    roomLabel: "Room Number",
    roomPlaceholder: "Example: 402",
    birthDateLabel: "Birth Date",
    submit: "Start Survey",
    verifyingUnavailable:
      "The verification service is currently unavailable. This device may not be on the same network as the hotel server, or the service is not reachable.",
    notFound: "We could not match your details to an active stay.",
    alreadyCompleted: "This survey has already been completed.",
    expired: "This survey session is no longer active.",
    footer: "secure survey access",
    languageLabel: "Language",
  },
  de: {
    title: "Willkommen",
    description:
      "Bitte bestaetigen Sie Ihre Angaben, um Ihre Erfahrung zu teilen.",
    roomLabel: "Zimmernummer",
    roomPlaceholder: "Beispiel: 402",
    birthDateLabel: "Geburtsdatum",
    submit: "Umfrage starten",
    verifyingUnavailable:
      "Der Verifizierungsdienst ist derzeit nicht erreichbar. Dieses Geraet befindet sich moeglicherweise nicht im selben Netzwerk wie der Hotelserver.",
    notFound:
      "Ihre Angaben konnten keinem aktiven Aufenthalt zugeordnet werden.",
    alreadyCompleted: "Diese Umfrage wurde bereits ausgefuellt.",
    expired: "Diese Umfragesitzung ist nicht mehr aktiv.",
    footer: "sicherer Umfragezugang",
    languageLabel: "Sprache",
  },
  ru: {
    title: "Dobro pozhalovat",
    description:
      "Pozhaluysta, podtverdite svoi dannye, chtoby podelitsya vpechatleniyami.",
    roomLabel: "Nomer komnaty",
    roomPlaceholder: "Primer: 402",
    birthDateLabel: "Data rozhdeniya",
    submit: "Nachat opros",
    verifyingUnavailable:
      "Servis proverki vremenno nedostupen. Vozmozhno, eto ustroystvo ne nakhoditsya v toy zhe seti, chto i server otelya.",
    notFound: "Ne udalos nayti aktivnoe prozhivanie po ukazannym dannym.",
    alreadyCompleted: "Etot opros uzhe byl zapolnen.",
    expired: "Srok deystviya etoy sessii oprosa istek.",
    footer: "bezopasnyy dostup k oprosu",
    languageLabel: "Yazyk",
  },
};

export const guestEntryLanguageOptions = (
  Object.entries(surveyLocaleLabels) as Array<
    [SurveyLocale, (typeof surveyLocaleLabels)[SurveyLocale]]
  >
).map(([locale, value]) => ({
  value: locale,
  label: `${value.nativeLabel} (${value.code})`,
}));
