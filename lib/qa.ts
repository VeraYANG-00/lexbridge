export const QA_CATEGORIES = [
  "合同",
  "劳动",
  "数据合规",
  "知识产权",
  "公司治理",
  "争议解决",
] as const;

export type QuestionCard = {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
  source: string | null;
  created_at: string;
};