# LexBridge · 出海判例智搜平台

面向出海企业的法务信息与合规风险工具：社区问题库、美国判例检索、法规库、风险场景检查清单与报告中心。

技术栈：[Next.js 16](https://nextjs.org)（App Router + TypeScript + Turbopack）、[Tailwind CSS v4](https://tailwindcss.com)、Supabase、CourtListener API。

## 功能模块

| 模块 | 路由 | 说明 |
| --- | --- | --- |
| 首页 | `/` | 搜索入口页：居中标题 + 大搜索框 + 快捷提问标签（搜索逻辑为占位） |
| 问题库 | `/qa` | 社区问答卡片：关键词搜索、分类筛选、展开查看答案、来源与时间；数据存 Supabase，`/qa/upload` 支持他人自助上传卡片 |
| 判例检索 | `/cases` | 通过 CourtListener API 检索美国判例库，支持法院与年份筛选 |
| 法规库 | `/regulations` | 按法域（中国/美国/欧盟）与主题浏览示例法规，中英对照详情 |
| 风险场景 | `/risks` | 合同、劳动、数据合规、知识产权、公司治理、争议解决 6 大场景：检查清单 + FAQ |
| 报告中心 | `/reports` | 风险报告浏览：收藏与历史记录（localStorage）、导出 PDF（浏览器打印） |

## 本地运行

需要 Node.js 18+。

```bash
npm install

# 按下方"环境变量"创建 .env.local

npm run dev
```

打开 http://localhost:3000。

## 环境变量

配置在 `.env.local`（不要提交到仓库，`.gitignore` 已忽略 `.env*`）：

| 变量 | 必需 | 说明 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 是 | Supabase 项目 URL，问题库使用（前端可公开） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 是 | Supabase anon key，问题库使用（前端可公开） |
| `COURTLISTENER_API_TOKEN` | 否（建议） | CourtListener API token，仅服务端读取，提高判例检索的限流额度与稳定性；不配置时基础检索也可用 |

问题库依赖 Supabase 表 `questions`（字段：`id`、`category`、`question`、`answer`、`tags`、`source`、`created_at`）。全新项目初始化时，在 Supabase 的 SQL Editor 执行以下建表语句并开启 RLS（允许匿名读取与写入）：

```sql
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  question text not null,
  answer text not null,
  tags text[] not null default '{}',
  source text,
  created_at timestamptz not null default now()
);
alter table public.questions enable row level security;
create policy "questions_select_all" on public.questions for select using (true);
create policy "questions_insert_all" on public.questions for insert with check (true);
```

## 部署到 Vercel

1. 将仓库推送到 GitHub / GitLab
2. 在 Vercel Dashboard 导入项目（自动识别 Next.js）
3. 在 Project → Settings → Environment Variables 配置上表中的变量（两个 `NEXT_PUBLIC_*` 变量需在首次构建前配好，构建时会内联到前端产物）

注意：`COURTLISTENER_API_TOKEN` 只在服务端 Route Handler 中读取，**不要**加 `NEXT_PUBLIC_` 前缀，避免暴露到前端产物。