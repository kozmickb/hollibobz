export type ChecklistDoc = {
  tripTitle: string;
  sections: {
    title: string;
    items: string[]; // simple MVP list of labels
  }[];
};

export type ChecklistState = {
  // key is itemId generated as `${sectionIndex}:${itemIndex}`
  ticks: Record<string, boolean>;
};
