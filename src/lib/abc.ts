import { TUNE_TYPES, type TuneType } from '@/types';

function matchHeader(abc: string, field: string): string | null {
  const re = new RegExp(`^\\s*${field}:(.*)$`, 'm');
  const match = abc.match(re);
  return match ? match[1].trim() : null;
}

function normalizeType(raw: string | null): TuneType | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  return TUNE_TYPES.find((type) => lower.includes(type.toLowerCase())) ?? null;
}

const MOJIBAKE_PATTERNS: [RegExp, string][] = [
  [/Ã¤/g, 'ä'], [/Ã¶/g, 'ö'], [/Ã¼/g, 'ü'], [/Ã„/g, 'Ä'], [/Ã–/g, 'Ö'], [/Ãœ/g, 'Ü'],
  [/Ã¥/g, 'å'], [/Ã…/g, 'Å'], [/Ã©/g, 'é'], [/Ã¨/g, 'è'], [/Ãª/g, 'ê'], [/Ã«/g, 'ë'],
  [/Ã¡/g, 'á'], [/Ã /g, 'à'], [/Ã¢/g, 'â'], [/Ã£/g, 'ã'], [/Ã§/g, 'ç'], [/Ã±/g, 'ñ'],
  [/Ã³/g, 'ó'], [/Ã²/g, 'ò'], [/Ã´/g, 'ô'], [/Ãµ/g, 'õ'], [/Ãº/g, 'ú'], [/Ã¹/g, 'ù'],
  [/Ã»/g, 'û'], [/Ã­/g, 'í'], [/Ã¬/g, 'ì'], [/Ã®/g, 'î'], [/Ã¯/g, 'ï'], [/Ã½/g, 'ý'],
  [/â€™/g, '\u2019'], [/â€œ/g, '\u201C'], [/â€\u009D/g, '\u201D'],
  [/â€"/g, '\u2013'], [/â€"/g, '\u2014'], [/Â°/g, '°'], [/Â§/g, '§'],
];

export function sanitizeText(input: string): string {
  let result = input;
  for (const [pattern, replacement] of MOJIBAKE_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export interface ParsedAbc {
  title: string | null;
  key: string | null;
  type: TuneType | null;
}

export function parseAbcMetadata(abc: string): ParsedAbc {
  return {
    title: matchHeader(abc, 'T'),
    key: matchHeader(abc, 'K'),
    type: normalizeType(matchHeader(abc, 'R')),
  };
}

export function splitAbcFile(input: string): string[] {
  const normalized = sanitizeText(input)
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .trim();
  if (!normalized) return [];

  const starts: number[] = [];
  let match: RegExpExecArray | null;
  const re = /^\s*X:\s*\d+/gm;
  while ((match = re.exec(normalized)) !== null) {
    starts.push(match.index);
  }

  if (starts.length === 0) return [normalized];

  return starts
    .map((start, index) => normalized.slice(start, starts[index + 1] ?? normalized.length).trim())
    .filter((block) => block.length > 0);
}

export interface ParsedSetting {
  author: string | null;
  key: string;
  abc: string;
}

export interface ParsedTune {
  title: string;
  type: TuneType;
  key: string;
  region: string;
  notes: string;
  composer: string;
  group: string | null;
  settings: ParsedSetting[];
}

const SHARED_FIELDS = ['X', 'T', 'S', 'R', 'M', 'L'] as const;

function extractSharedHeaders(lines: string[]): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const line of lines) {
    if (line.startsWith('%')) continue;
    const match = line.match(/^\s*([A-Za-z]):\s*(.*)$/);
    if (match) {
      const field = match[1].toUpperCase();
      if (SHARED_FIELDS.includes(field as typeof SHARED_FIELDS[number]) && !(field in headers)) {
        headers[field] = match[2].trim();
      }
    }
  }
  return headers;
}

function extractAllHeaders(lines: string[]): Record<string, string[]> {
  const headers: Record<string, string[]> = {};
  for (const line of lines) {
    if (line.startsWith('%')) continue;
    const match = line.match(/^\s*([A-Za-z]):\s*(.*)$/);
    if (match) {
      const field = match[1].toUpperCase();
      if (!headers[field]) headers[field] = [];
      headers[field].push(match[2].trim());
    }
  }
  return headers;
}

function buildSettingAbc(headers: Record<string, string>, key: string, body: string, author: string | null, group: string | null = null): string {
  const lines: string[] = [];
  lines.push('X:1');
  if (headers.T) lines.push(`T:${headers.T}`);
  if (headers.R) lines.push(`R:${headers.R}`);
  if (headers.M) lines.push(`M:${headers.M}`);
  if (headers.L) lines.push(`L:${headers.L}`);
  if (headers.S) lines.push(`S:${headers.S}`);
  if (group) lines.push(`G:${group}`);
  if (author) lines.push(`Z:${author}`);
  lines.push(`K:${key}`);
  const trimmedBody = body.trim();
  if (trimmedBody) lines.push(trimmedBody);
  return lines.join('\n');
}

interface SettingBoundary {
  index: number;
  author: string | null;
}

function findSettingBoundaries(lines: string[]): SettingBoundary[] {
  const boundaries: SettingBoundary[] = [];
  for (let i = 0; i < lines.length; i++) {
    const commentMatch = lines[i].match(/^%\s*(.+)/);
    if (commentMatch) {
      boundaries.push({ index: i, author: commentMatch[1].trim() });
    }
  }
  return boundaries;
}

function extractKeyFromBody(lines: string[], startIndex: number, endIndex: number): { key: string | null; bodyStart: number } {
  for (let i = startIndex; i < endIndex; i++) {
    const keyMatch = lines[i].match(/^\s*K:\s*(.+)/i);
    if (keyMatch) {
      return { key: keyMatch[1].trim(), bodyStart: i + 1 };
    }
  }
  return { key: null, bodyStart: startIndex };
}

function isMultiSettingBlock(lines: string[]): boolean {
  let commentCount = 0;
  let keyCount = 0;
  for (const line of lines) {
    if (line.match(/^%\s*\S/)) commentCount++;
    if (line.match(/^\s*K:\s*\S/i)) keyCount++;
  }
  return commentCount >= 1 && keyCount >= 2;
}

function parseMultiSettingBlock(lines: string[], block: string): ParsedTune | null {
  const headers = extractSharedHeaders(lines);
  if (!headers.T) return null;

  const title = headers.T;
  const type = normalizeType(headers.R) ?? 'Other';
  const region = headers.S || '';
  const notes = '';
  const composer = '';
  const group = matchHeader(block, 'G');

  const boundaries = findSettingBoundaries(lines);
  const settings: ParsedSetting[] = [];

  for (let s = 0; s < boundaries.length; s++) {
    const boundary = boundaries[s];
    const nextBoundaryIndex = s + 1 < boundaries.length ? boundaries[s + 1].index : lines.length;

    const { key, bodyStart } = extractKeyFromBody(lines, boundary.index + 1, nextBoundaryIndex);
    if (!key) continue;

    const body = lines.slice(bodyStart, nextBoundaryIndex).join('\n');
    settings.push({
      author: boundary.author,
      key,
      abc: buildSettingAbc(headers, key, body, boundary.author, group),
    });
  }

  if (settings.length === 0) {
    const key = matchHeader(block, 'K') || '';
    return { title, type, key, region, notes, composer, group, settings: [{ author: null, key, abc: block.trim() }] };
  }

  return { title, type, key: settings[0].key, region, notes, composer, group, settings };
}

function parseStandardBlock(lines: string[], block: string): ParsedTune | null {
  const allHeaders = extractAllHeaders(lines);

  const title = (allHeaders.T?.[0] ?? '').trim();
  if (!title) return null;

  const type = normalizeType(allHeaders.R?.[0] ?? null) ?? 'Other';
  const key = (allHeaders.K?.[0] ?? '').trim();
  const region = (allHeaders.S?.[0] ?? '').trim();
  const composer = (allHeaders.C?.[0] ?? '').trim();
  const notes = (allHeaders.N?.[0] ?? '').trim();
  const author = (allHeaders.Z?.[0] ?? null);
  const group = (allHeaders.G?.[0] ?? null)?.trim() || null;

  const abc = block.trim();

  return {
    title,
    type,
    key,
    region,
    notes,
    composer,
    group,
    settings: [{ author, key, abc }],
  };
}

export function parseTuneBlock(block: string): ParsedTune | null {
  const lines = block.split('\n');

  if (isMultiSettingBlock(lines)) {
    return parseMultiSettingBlock(lines, block);
  }

  return parseStandardBlock(lines, block);
}

export function injectGroupHeader(abc: string, group: string): string {
  const trimmedGroup = group.trim();
  if (!trimmedGroup) return abc;
  const lines = abc.split('\n');
  const gIndex = lines.findIndex((line) => /^\s*G:/i.test(line));
  if (gIndex >= 0) {
    lines[gIndex] = `G:${trimmedGroup}`;
    return lines.join('\n');
  }
  const keyIndex = lines.findIndex((line) => /^\s*K:/i.test(line));
  if (keyIndex >= 0) {
    lines.splice(keyIndex, 0, `G:${trimmedGroup}`);
    return lines.join('\n');
  }
  return `${abc}\nG:${trimmedGroup}`;
}

export function extractGroupFromAbc(abc: string): string | null {
  return matchHeader(abc, 'G');
}

export function injectComposerHeader(abc: string, composer: string): string {
  const trimmed = composer.trim();
  if (!trimmed) return abc;
  const lines = abc.split('\n');
  const cIndex = lines.findIndex((line) => /^\s*C:/i.test(line));
  if (cIndex >= 0) {
    lines[cIndex] = `C:${trimmed}`;
    return lines.join('\n');
  }
  const keyIndex = lines.findIndex((line) => /^\s*K:/i.test(line));
  if (keyIndex >= 0) {
    lines.splice(keyIndex, 0, `C:${trimmed}`);
    return lines.join('\n');
  }
  return `${abc}\nC:${trimmed}`;
}

export function tuneSignature(parsed: ParsedTune): string {
  return `${parsed.title.trim().toLowerCase()}|${parsed.key.trim().toLowerCase()}`;
}
