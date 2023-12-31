import {
  crypto,
  toHashString,
} from "https://deno.land/std@0.201.0/crypto/mod.ts";
import { format as dateTimeFormat } from "https://deno.land/std@0.201.0/datetime/format.ts";

type HashMethod = "MD5" | "SHA-1";
type HashFormat = "hex" | "base64";
type HashDataType = string | object | Uint8Array;

/**
 * hash
 *
 * @param {String} method hash method, e.g.: 'md5', 'sha1'
 * @param {HashDataType} val
 * @param {HashFormat} [format] output string format, could be 'hex' or 'base64'. default is 'hex'.
 * @return {String} md5 hash string
 * @public
 */
export function hash(
  method: HashMethod,
  val: string | object | Uint8Array,
  format: HashFormat = "hex"
): string {
  let data: Uint8Array;

  switch (typeof val) {
    case "string":
      data = new TextEncoder().encode(val);
      break;
    case "object":
      if (val instanceof Uint8Array) {
        data = val;
      } else {
        data = new TextEncoder().encode(JSON.stringify(val));
      }
      break;
    default:
      throw new Error("Unsupported type");
  }

  const _hash = crypto.subtle.digestSync(method, data);
  return toHashString(_hash, format);
}

export function md5(val: HashDataType, format?: HashFormat): string {
  return hash("MD5", val, format);
}

export function sha1(val: HashDataType, format?: HashFormat): string {
  return hash("SHA-1", val, format);
}

export function formatDateTime(
  date: Date,
  options?: { dateSep?: string; timeSep?: string }
): string {
  const { dateSep = "-", timeSep = ":" } = options || {};
  const formatString = `yyyy${dateSep}MM${dateSep}dd HH${timeSep}mm${timeSep}ss`;
  return dateTimeFormat(date, formatString);
}

export function checkRequired(
  params: Record<string, unknown>,
  keys: string | string[]
) {
  if (!Array.isArray(keys)) {
    keys = [keys];
  }

  for (const key of keys) {
    if (!Object.hasOwn(params, key)) {
      const err = new Error("`" + key + "` required");
      err.name = "ParameterMissingError";
      return err;
    }
  }
}

export function pickKeys<T extends object>(obj: T, keys: Array<keyof T>): Partial<T> {
  return keys.reduce(
    (acc, key) => (Object.hasOwn(obj, key) ? { ...acc, [key]: obj[key] } : acc),
    {}
  );
}
