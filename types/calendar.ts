export type CalendarEventType = "task" | "project" | "milestone" | "event";

export interface CalendarItem {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date; // Task ise startDate = endDate olabilir
  type: CalendarEventType;
  status?: string; // Task veya Project status
  priority?: string;
  metadata?: {
    description?: string;
    teamId?: string | null;
    projectId?: string; // Milestone ise hangi proje
    ownerAvatar?: string | null; // Görev kime atandı?
  };
}
