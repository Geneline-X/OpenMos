/**
 * Central configuration for supported languages in OpenMOS.
 *
 * To add a new language:
 * 1. Add it to the LANGUAGES array below
 * 2. Upload audio samples tagged with the new language code
 * 3. That's it! All UI components will automatically update.
 */

export interface Language {
  code: string; // Unique identifier (lowercase, no spaces)
  name: string; // Display name
  flag: string; // Country flag emoji
  region: string; // Geographic region
  speakers?: string; // Estimated speaker count (optional)
}

/**
 * Add new languages here!
 * The system will automatically include them in:
 * - Onboarding flow (native speaker selection)
 * - Audio upload forms
 * - Admin settings
 * - Landing page
 * - Reports and exports
 */
export const LANGUAGES: Language[] = [
  {
    code: "luganda",
    name: "Luganda",
    flag: "🇺🇬",
    region: "Uganda",
    speakers: "10M+",
  },
  {
    code: "krio",
    name: "Krio",
    flag: "🇸🇱",
    region: "Sierra Leone",
    speakers: "6M+",
  },
  // Add more languages below:
  // {
  //   code: "swahili",
  //   name: "Swahili",
  //   flag: "🇰🇪",
  //   region: "East Africa",
  //   speakers: "100M+",
  // },
  // {
  //   code: "yoruba",
  //   name: "Yorùbá",
  //   flag: "🇳🇬",
  //   region: "Nigeria",
  //   speakers: "45M+",
  // },
  // {
  //   code: "amharic",
  //   name: "Amharic",
  //   flag: "🇪🇹",
  //   region: "Ethiopia",
  //   speakers: "32M+",
  // },
  // {
  //   code: "zulu",
  //   name: "Zulu",
  //   flag: "🇿🇦",
  //   region: "South Africa",
  //   speakers: "12M+",
  // },
  // {
  //   code: "hausa",
  //   name: "Hausa",
  //   flag: "🇳🇬",
  //   region: "West Africa",
  //   speakers: "80M+",
  // },
  // {
  //   code: "igbo",
  //   name: "Igbo",
  //   flag: "🇳🇬",
  //   region: "Nigeria",
  //   speakers: "45M+",
  // },
];

// Helper functions
export const getLanguageCodes = () => LANGUAGES.map((l) => l.code);

export const getLanguageByCode = (code: string) =>
  LANGUAGES.find((l) => l.code === code);

export const isValidLanguage = (code: string) =>
  LANGUAGES.some((l) => l.code === code);

// For select dropdowns
export const getLanguageOptions = () =>
  LANGUAGES.map((l) => ({
    key: l.code,
    label: l.name,
    flag: l.flag,
  }));

// Type for TypeScript validation
export type LanguageCode = (typeof LANGUAGES)[number]["code"];
