export const QA_CATEGORIES = ["出海", "劳动", "合规"] as const;

export const QA_JURISDICTIONS = ["美国法", "香港法"] as const;

export type QuestionCard = {
  id: string;
  category: string;
  jurisdiction: string;
  topic: string;
  question: string;
  answer: string | null;
  tags: string[];
  source: string | null;
  created_at: string;
};
