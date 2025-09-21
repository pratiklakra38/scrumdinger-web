/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Scrum domain types
export interface Attendee {
  id: string;
  name: string;
  color: string; // hsl string or hex
}

export interface ScrumConfig {
  durationMinutes: number; // whole meeting
  speakerSeconds: number; // per-attendee cap
  color: string; // scrum color for identification
  recurring?: {
    cron?: string; // future use
    reminderMinutesBefore?: number;
  } | null;
}

export interface Scrum {
  id: string;
  name: string;
  attendees: Attendee[];
  config: ScrumConfig;
  history: MeetingRecord[];
}

export interface TranscriptEntry {
  id: string;
  attendeeId: string | null; // null for system/unknown
  text: string;
  at: number; // epoch ms
}

export interface MeetingRecord {
  id: string;
  scrumId: string;
  startedAt: number;
  endedAt: number | null;
  order: string[]; // attendee ids in order
  transcript: TranscriptEntry[];
  completed: boolean;
}
