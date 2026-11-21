const SUPERSCRIPT_DIGITS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

const compactFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "long",
  maximumSignificantDigits: 3,
});

export const superscript = (value: number | string): string =>
  String(value)
    .replace(/\d/g, (digit) => SUPERSCRIPT_DIGITS[Number(digit)])
    .replace("-", "⁻")
    .replace(".", "·");

export const powerOfTen = (exponent: number): string => `10${superscript(exponent)}`;

export const integer = (value: number): string => Math.round(value).toLocaleString("en-US");

export const fixed = (value: number, digits = 2): string => value.toFixed(digits);

export const oneDecimal = (value: number): string =>
  value.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const inWords = (value: number): string => compactFormat.format(value);

export const scientific = (value: number): string =>
  value
    .toExponential(2)
    .replace(/e-(\d+)/, (_, exponent: string) => ` × 10⁻${superscript(exponent)}`);
