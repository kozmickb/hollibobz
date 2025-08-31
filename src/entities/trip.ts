export type ChecklistDoc = {
  tripTitle: string;
  sections: { title: string; items: string[] }[];
};

export type Trip = {
  id: string;
  title: string;
  createdAt: string;
  checklist?: ChecklistDoc | null;
  archived?: boolean;
  archivedAt?: string;
  timerContext?: {
    destination?: string;
    date?: string;
    duration?: number;
    adults?: number;
    children?: number;
  };
};
