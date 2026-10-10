import { addDays, startOfDay } from '@/lib/dates';

export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export type ParseMatch = {
  kind: 'date' | 'project' | 'priority' | 'assignee';
  text: string;
  start: number;
  end: number;
};

export type ParsedTask = {
  title: string;
  dueAt: Date | null;
  priority: Priority | null;
  projectId: string | null;
  assigneeId: string | null;
  matches: ParseMatch[];
};

export type ParseContext = {
  projects: { id: string; name: string }[];
  members: { id: string; name: string }[];
  now?: Date;
};

const PRIORITY_WORDS: Record<string, Priority> = {
  urgent: 'urgent',
  p1: 'urgent',
  '1': 'urgent',
  high: 'high',
  p2: 'high',
  '2': 'high',
  medium: 'medium',
  med: 'medium',
  p3: 'medium',
  '3': 'medium',
  low: 'low',
  p4: 'low',
  '4': 'low',
};

const WEEKDAYS: Record<string, number> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thur: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

const MONTHS: Record<string, number> = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3, may: 4,
  jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, sept: 8, september: 8,
  oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
};

function findByName<T extends { id: string; name: string }>(list: T[], query: string): T | undefined {
  const q = query.toLowerCase();
  return (
    list.find((x) => x.name.toLowerCase() === q) ??
    list.find((x) => x.name.toLowerCase().startsWith(q)) ??
    list.find((x) => x.name.toLowerCase().split(/\s+/).some((w) => w.startsWith(q))) ??
    list.find((x) => x.name.toLowerCase().includes(q))
  );
}

type TimeMatch = { hours: number; minutes: number };

function parseTime(h: string, m: string | undefined, ampm: string | undefined): TimeMatch | null {
  let hours = parseInt(h, 10);
  const minutes = m ? parseInt(m, 10) : 0;
  if (Number.isNaN(hours) || hours > 23 || minutes > 59) return null;
  if (ampm) {
    const pm = ampm.toLowerCase().startsWith('p');
    if (hours === 12) hours = pm ? 12 : 0;
    else if (pm) hours += 12;
  }
  return { hours, minutes };
}

/**
 * Pulls dates, #project, !priority and @person out of free text.
 * "Call Nile tomorrow 3pm #client !high @sara"
 */
export function parseTask(input: string, ctx: ParseContext): ParsedTask {
  const now = ctx.now ?? new Date();
  const matches: ParseMatch[] = [];
  let priority: Priority | null = null;
  let projectId: string | null = null;
  let assigneeId: string | null = null;
  let dueDay: Date | null = null;
  let time: TimeMatch | null = null;

  const consume = (re: RegExp, handler: (m: RegExpExecArray) => ParseMatch['kind'] | null) => {
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(input)) !== null) {
      const kind = handler(m);
      if (kind) matches.push({ kind, text: m[0], start: m.index, end: m.index + m[0].length });
    }
  };

  // !priority
  consume(/(^|\s)!(\w+)/g, (m) => {
    const p = PRIORITY_WORDS[m[2].toLowerCase()];
    if (!p || priority) return null;
    priority = p;
    return 'priority';
  });

  // #project
  consume(/(^|\s)#([\w-]+)/g, (m) => {
    if (projectId) return null;
    const p = findByName(ctx.projects, m[2]);
    if (!p) return null;
    projectId = p.id;
    return 'project';
  });

  // @person
  consume(/(^|\s)@([\w-]+)/g, (m) => {
    if (assigneeId) return null;
    const q = m[2].toLowerCase();
    const person = q === 'me' ? ctx.members.find((x) => x.id === '__me__') : findByName(ctx.members, m[2]);
    if (!person) return null;
    assigneeId = person.id;
    return 'assignee';
  });

  // Relative days
  consume(/(^|\s)(today|tonight|tomorrow|tmrw|tmr|next week|in (\d+) days?)(?=\s|$)/gi, (m) => {
    if (dueDay) return null;
    const word = m[2].toLowerCase();
    if (word === 'today' || word === 'tonight') dueDay = startOfDay(now);
    else if (word.startsWith('tm') || word === 'tomorrow') dueDay = startOfDay(addDays(now, 1));
    else if (word === 'next week') {
      const d = startOfDay(now);
      const delta = ((8 - d.getDay()) % 7) || 7;
      dueDay = addDays(d, delta);
    } else if (m[3]) dueDay = startOfDay(addDays(now, parseInt(m[3], 10)));
    if (word === 'tonight') time = { hours: 19, minutes: 0 };
    return 'date';
  });

  // Weekday names, optional "next"
  consume(/(^|\s)(next\s+)?(sunday|sun|monday|mon|tuesday|tues|tue|wednesday|wed|thursday|thurs|thur|thu|friday|fri|saturday|sat)(?=\s|$)/gi, (m) => {
    if (dueDay) return null;
    const target = WEEKDAYS[m[3].toLowerCase()];
    const d = startOfDay(now);
    let delta = (target - d.getDay() + 7) % 7;
    if (delta === 0) delta = 7;
    if (m[2]) delta += 7;
    dueDay = addDays(d, delta);
    return 'date';
  });

  // "12 oct", "oct 12", "12 october 2026"
  consume(/(^|\s)(?:(\d{1,2})\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)|(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+(\d{1,2}))(?:\s+(\d{4}))?(?=\s|$|,)/gi, (m) => {
    if (dueDay) return null;
    const day = parseInt(m[2] ?? m[5], 10);
    const month = MONTHS[(m[3] ?? m[4]).toLowerCase()];
    const year = m[6] ? parseInt(m[6], 10) : now.getFullYear();
    const d = new Date(year, month, day);
    if (d.getMonth() !== month) return null;
    if (!m[6] && d < startOfDay(now)) d.setFullYear(year + 1);
    dueDay = d;
    return 'date';
  });

  // "12/10" or "12/10/2026" (day/month)
  consume(/(^|\s)(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?(?=\s|$)/g, (m) => {
    if (dueDay) return null;
    const day = parseInt(m[2], 10);
    const month = parseInt(m[3], 10) - 1;
    let year = m[4] ? parseInt(m[4], 10) : now.getFullYear();
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    if (d.getMonth() !== month) return null;
    if (!m[4] && d < startOfDay(now)) d.setFullYear(year + 1);
    dueDay = d;
    return 'date';
  });

  // Times: "3pm", "3:30pm", "15:00", "at 3"
  consume(/(^|\s)(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)(?=\s|$)/gi, (m) => {
    if (time) return null;
    time = parseTime(m[2], m[3], m[4]);
    return time ? 'date' : null;
  });
  consume(/(^|\s)(?:at\s+)?(\d{1,2}):(\d{2})(?=\s|$)/g, (m) => {
    if (time) return null;
    time = parseTime(m[2], m[3], undefined);
    return time ? 'date' : null;
  });
  consume(/(^|\s)at\s+(\d{1,2})(?=\s|$)/gi, (m) => {
    if (time) return null;
    const h = parseInt(m[2], 10);
    time = parseTime(String(h <= 7 ? h + 12 : h), undefined, undefined);
    return time ? 'date' : null;
  });

  let dueAt: Date | null = null;
  if (dueDay || time) {
    const base: Date = dueDay ?? startOfDay(now);
    dueAt = new Date(base);
    if (time) {
      const t: TimeMatch = time;
      dueAt.setHours(t.hours, t.minutes, 0, 0);
      if (!dueDay && dueAt.getTime() < now.getTime()) dueAt = addDays(dueAt, 1);
    }
  }

  // Build the clean title by removing matched spans.
  const sorted = [...matches].sort((a, b) => a.start - b.start);
  let title = '';
  let cursor = 0;
  for (const m of sorted) {
    if (m.start < cursor) continue;
    title += input.slice(cursor, m.start);
    cursor = m.end;
  }
  title += input.slice(cursor);
  title = title.replace(/\s{2,}/g, ' ').trim();

  return { title, dueAt, priority, projectId, assigneeId, matches: sorted };
}
