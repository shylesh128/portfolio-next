import { Experience } from "@/types";

export interface DurationBreakdown {
  totalMonths: number;
  years: number;
  months: number;
  formatted: string; // e.g. "3 yrs 6 mos"
  longFormatted: string; // e.g. "3 Years, 6 Months"
  shortFormatted: string; // e.g. "3.5+ Years"
  preciseYears: number; // e.g. 3.5
}

export interface ExperienceStats {
  fullTime: DurationBreakdown;
  totalWithInternship: DurationBreakdown;
  internship: DurationBreakdown;
  currentRoleDuration?: DurationBreakdown;
  currentRoleTitle?: string;
  currentCompany?: string;
}

const MONTH_MAP: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may_: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

function parseDate(dateStr?: string | null, isEnd = false): Date {
  if (!dateStr) return new Date();
  const normalized = dateStr.trim().toLowerCase();
  if (
    normalized === "present" ||
    normalized === "current" ||
    normalized === "now"
  ) {
    return new Date();
  }

  // Check YYYY-MM-DD or YYYY-MM
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = isoMatch[3] ? parseInt(isoMatch[3], 10) : isEnd ? 28 : 1;
    return new Date(year, month, day);
  }

  // Check Month YYYY (e.g., "Jan 2026")
  const parts = dateStr.replace(/[–—]/g, "-").split(/[\s-]+/);
  for (let i = 0; i < parts.length; i++) {
    const word = parts[i].toLowerCase().slice(0, 3);
    if (
      MONTH_MAP[word] !== undefined &&
      parts[i + 1] &&
      /^\d{4}$/.test(parts[i + 1])
    ) {
      const year = parseInt(parts[i + 1], 10);
      return new Date(year, MONTH_MAP[word], isEnd ? 28 : 1);
    }
  }

  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function formatDuration(totalMonths: number): DurationBreakdown {
  const safeMonths = Math.max(0, totalMonths);
  const years = Math.floor(safeMonths / 12);
  const months = safeMonths % 12;

  let formatted = "";
  let longFormatted = "";

  if (years > 0 && months > 0) {
    formatted = `${years} yr${years > 1 ? "s" : ""} ${months} mo${months > 1 ? "s" : ""}`;
    longFormatted = `${years} Year${years > 1 ? "s" : ""}, ${months} Month${months > 1 ? "s" : ""}`;
  } else if (years > 0) {
    formatted = `${years} yr${years > 1 ? "s" : ""}`;
    longFormatted = `${years} Year${years > 1 ? "s" : ""}`;
  } else {
    formatted = `${months} mo${months > 1 ? "s" : ""}`;
    longFormatted = `${months} Month${months > 1 ? "s" : ""}`;
  }

  const preciseYears = Number((safeMonths / 12).toFixed(1));
  const shortFormatted = `${preciseYears}+ Years`;

  return {
    totalMonths: safeMonths,
    years,
    months,
    formatted,
    longFormatted,
    shortFormatted,
    preciseYears,
  };
}

/**
 * Calculates months between start and end date inclusive of boundary months
 */
export function getRoleDuration(
  exp: Experience,
  referenceDate: Date = new Date(),
): DurationBreakdown {
  let start: Date;
  let end: Date;

  if (exp.startDate) {
    start = parseDate(exp.startDate, false);
    end =
      exp.isCurrent || !exp.endDate
        ? referenceDate
        : parseDate(exp.endDate, true);
  } else {
    const dateParts = exp.dates.split(/[–—\-]\s*/);
    start = parseDate(dateParts[0], false);
    end = dateParts[1] ? parseDate(dateParts[1], true) : referenceDate;
  }

  if (end < start) end = start;

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1;
  return formatDuration(Math.max(1, months));
}

/**
 * Calculates aggregated experience stats:
 * 1. Full-time experience (excluding internship)
 * 2. Total experience (including internship)
 * 3. Internship duration
 */
export function calculateExperienceStats(
  experiences: Experience[],
  referenceDate: Date = new Date(),
): ExperienceStats {
  const fullTimeMonthSet = new Set<string>();
  const totalMonthSet = new Set<string>();
  const internshipMonthSet = new Set<string>();

  let currentRoleDuration: DurationBreakdown | undefined;
  let currentRoleTitle: string | undefined;
  let currentCompany: string | undefined;

  experiences.forEach((exp) => {
    let start: Date;
    let end: Date;

    if (exp.startDate) {
      start = parseDate(exp.startDate, false);
      end =
        exp.isCurrent || !exp.endDate
          ? referenceDate
          : parseDate(exp.endDate, true);
    } else {
      const dateParts = exp.dates.split(/[–—\-]\s*/);
      start = parseDate(dateParts[0], false);
      end = dateParts[1] ? parseDate(dateParts[1], true) : referenceDate;
    }

    if (end < start) end = start;

    const isIntern = Boolean(
      exp.isInternship ||
      exp.type?.toLowerCase() === "internship" ||
      exp.title.toLowerCase().includes("intern"),
    );

    const isCurrent = Boolean(
      exp.isCurrent || exp.dates.toLowerCase().includes("present"),
    );

    if (isCurrent && !currentRoleDuration) {
      currentRoleDuration = getRoleDuration(exp, referenceDate);
      currentRoleTitle = exp.title;
      currentCompany = exp.company;
    }

    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);

    while (cur <= last) {
      const key = `${cur.getFullYear()}-${cur.getMonth()}`;
      totalMonthSet.add(key);

      if (isIntern) {
        internshipMonthSet.add(key);
      } else {
        fullTimeMonthSet.add(key);
      }

      cur.setMonth(cur.getMonth() + 1);
    }
  });

  return {
    fullTime: formatDuration(fullTimeMonthSet.size),
    totalWithInternship: formatDuration(totalMonthSet.size),
    internship: formatDuration(internshipMonthSet.size),
    currentRoleDuration,
    currentRoleTitle,
    currentCompany,
  };
}
