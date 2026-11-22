import { locale } from "./i18n";

const SUPERSCRIPT_DIGITS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

const formatters = new Map<string, Intl.NumberFormat>();

function format(value: number, options: Intl.NumberFormatOptions): string {
  const key = `${locale()} ${JSON.stringify(options)}`;
  let formatter = formatters.get(key);
  if (!formatter) formatters.set(key, (formatter = new Intl.NumberFormat(locale(), options)));
  return formatter.format(value);
}

const decimals = (digits: number, useGrouping: boolean): Intl.NumberFormatOptions => ({
  minimumFractionDigits: digits,
  maximumFractionDigits: digits,
  useGrouping,
});

export const superscript = (value: number | string): string =>
  String(value)
    .replace(/\d/g, (digit) => SUPERSCRIPT_DIGITS[Number(digit)])
    .replace("-", "⁻")
    .replace(".", "·");

export const powerOfTen = (exponent: number): string => `10${superscript(exponent)}`;

export const integer = (value: number): string => format(Math.round(value), decimals(0, true));

export const fixed = (value: number, digits = 2): string => format(value, decimals(digits, false));

export const oneDecimal = (value: number): string => format(value, decimals(1, true));

export const inWords = (value: number): string =>
  format(value, { notation: "compact", compactDisplay: "long", maximumSignificantDigits: 3 });

export function scientific(value: number): string {
  const [mantissa, exponent] = value.toExponential(2).split("e");
  return `${fixed(Number(mantissa), 2)} × ${powerOfTen(Number(exponent))}`;
}
