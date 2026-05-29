"use client";

import {
  registerSurveyTheme,
} from "survey-creator-core";
import {
  DefaultDark,
  DefaultDarkPanelless,
  DefaultLight,
  DefaultLightPanelless,
} from "survey-core/themes";

type ThemeConfig = Record<string, unknown>;

function cloneTheme<T extends ThemeConfig>(theme: T): T {
  return JSON.parse(JSON.stringify(theme)) as T;
}

function buildTheme(
  baseTheme: ThemeConfig,
  themeName: string,
  cssVariables: Record<string, string>,
): ThemeConfig {
  const nextTheme = cloneTheme(baseTheme);
  const existingVariables =
    nextTheme.cssVariables &&
    typeof nextTheme.cssVariables === "object" &&
    !Array.isArray(nextTheme.cssVariables)
      ? (nextTheme.cssVariables as Record<string, string>)
      : {};

  return {
    ...nextTheme,
    themeName,
    cssVariables: {
      ...existingVariables,
      ...cssVariables,
    },
  };
}

const hospitaWarmLight = buildTheme(DefaultLight as ThemeConfig, "Warm", {
  "--sjs-general-backcolor": "#FFF8F5",
  "--sjs-general-backcolor-dim": "#FFF1EA",
  "--sjs-primary-backcolor": "#A85A08",
  "--sjs-primary-backcolor-light": "#FBE4D7",
  "--sjs-primary-forecolor": "#FFFFFF",
  "--sjs-secondary-backcolor": "#FFF1EA",
  "--sjs-secondary-forecolor": "#584235",
  "--sjs-base-unit": "8px",
  "--sjs-corner-radius": "16px",
  "--sjs-font-family": "'Inter', sans-serif",
  "--sjs2-color-bg-brand-primary": "#A85A08",
  "--sjs2-color-bg-brand-primary-dim": "#8F4D06",
  "--sjs2-color-bg-brand-secondary": "#FBE4D7",
  "--sjs2-color-bg-brand-tertiary": "#FFF1EA",
  "--sjs2-color-bg-accent-primary": "#E67817",
  "--sjs2-color-bg-basic-primary": "#FFFFFF",
  "--sjs2-color-bg-basic-secondary": "#FFF8F5",
  "--sjs2-color-fg-brand-primary": "#A85A08",
  "--sjs2-color-fg-brand-on-primary": "#FFFFFF",
  "--sjs2-color-fg-basic-primary": "#251912",
  "--sjs2-color-fg-basic-secondary": "#584235",
  "--sjs2-color-border-default": "#F5DED2",
  "--sjs2-color-border-basic-primary": "#DFC0AF",
  "--sjs2-shadow-small": "0 1px 2px rgba(0, 0, 0, 0.05)",
});

const hospitaWarmDark = buildTheme(DefaultDark as ThemeConfig, "Warm", {
  "--sjs-primary-backcolor": "#D98A33",
  "--sjs-primary-backcolor-light": "#6F3E0B",
  "--sjs-primary-forecolor": "#FFF8F5",
  "--sjs-general-backcolor": "#241811",
  "--sjs-general-backcolor-dim": "#34231A",
  "--sjs-secondary-backcolor": "#3F2A1E",
  "--sjs-secondary-forecolor": "#F9E5D8",
  "--sjs2-color-bg-brand-primary": "#D98A33",
  "--sjs2-color-bg-brand-primary-dim": "#B66E1E",
  "--sjs2-color-bg-brand-secondary": "#3F2A1E",
  "--sjs2-color-bg-brand-tertiary": "#34231A",
  "--sjs2-color-bg-basic-primary": "#241811",
  "--sjs2-color-bg-basic-secondary": "#2F2018",
  "--sjs2-color-fg-brand-primary": "#FFB67A",
  "--sjs2-color-fg-brand-on-primary": "#1A120D",
  "--sjs2-color-fg-basic-primary": "#FFF8F5",
  "--sjs2-color-fg-basic-secondary": "#E8C9B2",
  "--sjs2-color-border-default": "#5B3E2C",
  "--sjs2-color-border-basic-primary": "#7A563D",
});

const hospitaWarmLightPanelless = buildTheme(
  DefaultLightPanelless as ThemeConfig,
  "Warm",
  hospitaWarmLight.cssVariables as Record<string, string>,
);

const hospitaWarmDarkPanelless = buildTheme(
  DefaultDarkPanelless as ThemeConfig,
  "Warm",
  hospitaWarmDark.cssVariables as Record<string, string>,
);

const coastalLight = buildTheme(DefaultLight as ThemeConfig, "Coastal", {
  "--sjs-primary-backcolor": "#178A9F",
  "--sjs-primary-backcolor-light": "#DDF5F8",
  "--sjs-primary-forecolor": "#FFFFFF",
  "--sjs-general-backcolor": "#F7FCFC",
  "--sjs-general-backcolor-dim": "#EEF8F8",
  "--sjs-secondary-backcolor": "#EAF6F7",
  "--sjs-secondary-forecolor": "#28464D",
  "--sjs2-color-bg-brand-primary": "#178A9F",
  "--sjs2-color-bg-brand-primary-dim": "#116E80",
  "--sjs2-color-bg-brand-secondary": "#DDF5F8",
  "--sjs2-color-bg-brand-tertiary": "#EEF8F8",
  "--sjs2-color-bg-basic-primary": "#FFFFFF",
  "--sjs2-color-bg-basic-secondary": "#F7FCFC",
  "--sjs2-color-fg-brand-primary": "#178A9F",
  "--sjs2-color-fg-brand-on-primary": "#FFFFFF",
  "--sjs2-color-fg-basic-primary": "#163238",
  "--sjs2-color-fg-basic-secondary": "#48676E",
  "--sjs2-color-border-default": "#D8EDEF",
  "--sjs2-color-border-basic-primary": "#B8DDE2",
});

const coastalDark = buildTheme(DefaultDark as ThemeConfig, "Coastal", {
  "--sjs-primary-backcolor": "#4AB8CA",
  "--sjs-primary-backcolor-light": "#1E4750",
  "--sjs-primary-forecolor": "#0D1B1F",
  "--sjs-general-backcolor": "#102126",
  "--sjs-general-backcolor-dim": "#173039",
  "--sjs-secondary-backcolor": "#1A3840",
  "--sjs-secondary-forecolor": "#DAF2F6",
  "--sjs2-color-bg-brand-primary": "#4AB8CA",
  "--sjs2-color-bg-brand-primary-dim": "#2F98A9",
  "--sjs2-color-bg-brand-secondary": "#1A3840",
  "--sjs2-color-bg-brand-tertiary": "#173039",
  "--sjs2-color-bg-basic-primary": "#102126",
  "--sjs2-color-bg-basic-secondary": "#132A31",
  "--sjs2-color-fg-brand-primary": "#91E2EE",
  "--sjs2-color-fg-brand-on-primary": "#0D1B1F",
  "--sjs2-color-fg-basic-primary": "#F0FCFE",
  "--sjs2-color-fg-basic-secondary": "#C2E4E8",
  "--sjs2-color-border-default": "#2A5660",
  "--sjs2-color-border-basic-primary": "#39737E",
});

const coastalLightPanelless = buildTheme(
  DefaultLightPanelless as ThemeConfig,
  "Coastal",
  coastalLight.cssVariables as Record<string, string>,
);

const coastalDarkPanelless = buildTheme(
  DefaultDarkPanelless as ThemeConfig,
  "Coastal",
  coastalDark.cssVariables as Record<string, string>,
);

const midnightLight = buildTheme(DefaultLight as ThemeConfig, "Midnight", {
  "--sjs-primary-backcolor": "#2B4A8C",
  "--sjs-primary-backcolor-light": "#E8EEFC",
  "--sjs-primary-forecolor": "#FFFFFF",
  "--sjs-general-backcolor": "#FAFBFF",
  "--sjs-general-backcolor-dim": "#F1F4FC",
  "--sjs-secondary-backcolor": "#EEF2FF",
  "--sjs-secondary-forecolor": "#394963",
  "--sjs2-color-bg-brand-primary": "#2B4A8C",
  "--sjs2-color-bg-brand-primary-dim": "#20396C",
  "--sjs2-color-bg-brand-secondary": "#E8EEFC",
  "--sjs2-color-bg-brand-tertiary": "#F1F4FC",
  "--sjs2-color-bg-basic-primary": "#FFFFFF",
  "--sjs2-color-bg-basic-secondary": "#FAFBFF",
  "--sjs2-color-fg-brand-primary": "#2B4A8C",
  "--sjs2-color-fg-brand-on-primary": "#FFFFFF",
  "--sjs2-color-fg-basic-primary": "#1D2740",
  "--sjs2-color-fg-basic-secondary": "#5A6783",
  "--sjs2-color-border-default": "#DFE6F6",
  "--sjs2-color-border-basic-primary": "#C4D0EB",
});

const midnightDark = buildTheme(DefaultDark as ThemeConfig, "Midnight", {
  "--sjs-primary-backcolor": "#84A5F4",
  "--sjs-primary-backcolor-light": "#24335B",
  "--sjs-primary-forecolor": "#09111F",
  "--sjs-general-backcolor": "#0F1524",
  "--sjs-general-backcolor-dim": "#182038",
  "--sjs-secondary-backcolor": "#1D2947",
  "--sjs-secondary-forecolor": "#E5EBFB",
  "--sjs2-color-bg-brand-primary": "#84A5F4",
  "--sjs2-color-bg-brand-primary-dim": "#6888D6",
  "--sjs2-color-bg-brand-secondary": "#1D2947",
  "--sjs2-color-bg-brand-tertiary": "#182038",
  "--sjs2-color-bg-basic-primary": "#0F1524",
  "--sjs2-color-bg-basic-secondary": "#131B2E",
  "--sjs2-color-fg-brand-primary": "#BCD0FF",
  "--sjs2-color-fg-brand-on-primary": "#09111F",
  "--sjs2-color-fg-basic-primary": "#F2F5FE",
  "--sjs2-color-fg-basic-secondary": "#C6D2F1",
  "--sjs2-color-border-default": "#27365E",
  "--sjs2-color-border-basic-primary": "#38508D",
});

const midnightLightPanelless = buildTheme(
  DefaultLightPanelless as ThemeConfig,
  "Midnight",
  midnightLight.cssVariables as Record<string, string>,
);

const midnightDarkPanelless = buildTheme(
  DefaultDarkPanelless as ThemeConfig,
  "Midnight",
  midnightDark.cssVariables as Record<string, string>,
);

let areThemesRegistered = false;

export function ensureHospitaSurveyThemesRegistered() {
  if (areThemesRegistered) {
    return;
  }

  registerSurveyTheme(
    hospitaWarmLight,
    hospitaWarmDark,
    hospitaWarmLightPanelless,
    hospitaWarmDarkPanelless,
    coastalLight,
    coastalDark,
    coastalLightPanelless,
    coastalDarkPanelless,
    midnightLight,
    midnightDark,
    midnightLightPanelless,
    midnightDarkPanelless,
  );

  areThemesRegistered = true;
}
