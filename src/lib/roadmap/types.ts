export type RoadmapSeed = {
  id: string;
  title: string;
  description: string;
  status: "planned" | "pilot" | "exploring";
};

export type RoadmapItem = RoadmapSeed & {
  votes: number;
  hasVoted: boolean;
  source: "team" | "community";
};

export type Suggestion = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: "pending" | "approved" | "declined";
};
