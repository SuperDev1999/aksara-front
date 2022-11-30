import { SetStateAction } from "react";
import { OptionType } from "@components/types";
import { TFunction } from "next-i18next";
import uniqueId from "lodash/uniqueId";
import { DateTime } from "luxon";
import { CountryAndStates } from "./constants";
import { AnalyticsEvent } from "./types";

export const isObjEqual = (obj1: any, obj2: any) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

export const isObjInArr = (arr: any[], obj: any) => {
  return arr.some((item: any) => isObjEqual(item, obj));
};

/**
 * Returns the object of max value by a given key in the array.
 * @param array Object array
 * @param key Comparing key
 * @returns Object
 */
export const maxBy = (array: Array<any>, key: string) => {
  return array.reduce((prev, current) => {
    return prev[key] > current[key] ? prev : current;
  });
};

/**
 * Find max or limit to 100 if above.
 * @param e number
 * @returns max || 100
 */
export const minMax = (e: number, max: number = 100) => {
  if (!e) return 0;
  return Math.min(Math.max(e, 0), max);
};

/**
 * Genearate a uuid.
 * @returns uuid string
 */
export const uuid = () => uniqueId();

/**
 * Format a number to the given type.
 * @param value number
 * @param type Intl format type
 * @returns string
 */
export const numFormat = (value: number, type?: any, precision: number = 0): string => {
  const formatter = Intl.NumberFormat("en", {
    notation: type ? type : "compact",
    maximumFractionDigits: 1,
    minimumFractionDigits: precision,
  });
  return formatter.format(value);
};

/**
 * Returns a formatted date string from epoch millis or SQL date
 * @param {number | string} timestamp epoch millis | sql date
 * @param {string} locale en-GB | ms-MY
 * @param {string} format dd MMM yyyy
 * @returns {string} Formatted date
 */
export const toDate = (
  timestamp: number | string,
  locale: string = "en-GB",
  format: string = "dd MMM yyyy"
): string => {
  const date =
    typeof timestamp === "number" ? DateTime.fromMillis(timestamp) : DateTime.fromSQL(timestamp);
  return date.setLocale(locale).toFormat(format);
};

/**
 * Sorts array of states alphabetically in a dataset, with Malaysia as first entry.
 * @param array Array of objects with state field
 * @param key Key containing state code (sgr, mlk etc)
 * @returns Sorted array of states
 */
export const sortMsiaFirst = (array: Array<any>, key: string): Array<any> => {
  return array.sort((a: any, b: any) => {
    if (a[key] === "mys") {
      return -1;
    }
    return (CountryAndStates[a[key]] as string).localeCompare(CountryAndStates[b[key]]);
  });
};

/**
 * Sorts array of items alphabetically in a dataset, with Malaysia as first entry.
 * @param array Array of objects
 * @param key Comparator key
 * @returns Sorted array of objects
 */
export const sortAlpha = (array: Array<Record<string, any>>, key: string): Array<any> => {
  return array.sort((a: any, b: any) => a[key].localeCompare(b[key]));
};

/**
 * Copies text to OS clipboard
 * @param text Text to copy
 */
export const copyClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};

/**
 * Generic download helper function
 * @param url URL or URLData
 * @param event Analytics event
 */
export const download = (url: string, event: Omit<AnalyticsEvent, "action">) => {
  let v_anchor = document.createElement("a");
  v_anchor.href = url;
  v_anchor.download = event.label;
  v_anchor.click();
  eventTrack({
    action: "file_download",
    category: event.category,
    label: event.label,
    value: event.value,
  });
};

/**
 * Flips { key: value } -> { value: key }.
 * @param data Object
 * @returns Object
 */
export const flip = (data: Record<string, string>) =>
  Object.fromEntries(Object.entries(data).map(([key, value]) => [value, key]));

/**
 * Tracks page views - https://developers.google.com/analytics/devguides/collection/gtagjs/pages
 * @param url URL path
 */
export const pageTrack = (url: string) => {
  window.gtag("config", process.env.NEXT_PUBLIC_GA_TAG as string, {
    page_path: url,
  });
};

/**
 * Tracks user event (eg. clicks, hover etc.) - https://developers.google.com/analytics/devguides/collection/gtagjs/events
 * @param {AnalyticsEvent} prop action, category, label, value
 */
export const eventTrack = ({ action, category, label, value }: AnalyticsEvent) => {
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

export const handleSelectMultipleDropdown = (
  selectedOption: OptionType,
  options: OptionType[],
  useStateHookFunction: React.Dispatch<SetStateAction<OptionType[]>>
) => {
  if (options.some(o => isObjEqual(o, selectedOption))) {
    useStateHookFunction(options.filter(o => !isObjEqual(o, selectedOption)));
  } else {
    useStateHookFunction([...options, selectedOption]);
  }
};

export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

export const formatNumberPrefix = (n: number) => {
  if (n > 999999) return `${(n / 1000000).toFixed(1)}M`;
  else return n > 999 ? `${(n / 1000).toFixed(0)}k` : n;
};

export const replaceChartIdWithTranslation = (t: TFunction, prefix: string, data: any[]) => {
  return data.map((item: any) => {
    return {
      ...item,
      id: t(`${prefix}${prefix ? "." : ""}${item.id}`),
    };
  });
};
