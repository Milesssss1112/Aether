-- Aether · Supabase 初始化（论坛 + 新闻 + 用户资料）
-- 在 Supabase Dashboard → SQL Editor 中整段执行

-- 资料表（与 auth.users 1:1）
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are readable by everyone"
  on public.profiles for select using (true);

create policy "Users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

-- 新用户自动建 profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, 'user'), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 论坛帖子（user_id → profiles，便于 PostgREST 嵌套查询 display_name）
create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists forum_posts_created_at_idx on public.forum_posts (created_at desc);

alter table public.forum_posts enable row level security;

create policy "Anyone can read posts"
  on public.forum_posts for select using (true);

create policy "Authenticated users create posts"
  on public.forum_posts for insert
  with check (auth.uid() = user_id);

create policy "Authors update own posts"
  on public.forum_posts for update
  using (auth.uid() = user_id);

create policy "Authors delete own posts"
  on public.forum_posts for delete
  using (auth.uid() = user_id);

-- 评论
create table if not exists public.forum_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists forum_comments_post_id_idx on public.forum_comments (post_id);

alter table public.forum_comments enable row level security;

create policy "Anyone can read comments"
  on public.forum_comments for select using (true);

create policy "Authenticated users create comments"
  on public.forum_comments for insert
  with check (auth.uid() = user_id);

create policy "Authors delete own comments"
  on public.forum_comments for delete
  using (auth.uid() = user_id);

-- 新闻（后台或 SQL 维护；前台只读）
create table if not exists public.news_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  image_url text,
  source_label text,
  article_url text,
  layout_index smallint not null default 0,
  badge text,
  sort_order int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists news_items_sort_idx on public.news_items (sort_order desc, created_at desc);

alter table public.news_items enable row level security;

create policy "Anyone can read news"
  on public.news_items for select using (true);

-- 仅 service_role 可写；若需 Dashboard 手工插入，用 SQL 或关闭 RLS 写入一次
-- 也可添加 authenticated + 检查 is_admin（此处保持简单：禁止匿名写入）
create policy "No public insert on news"
  on public.news_items for insert
  with check (false);

create policy "No public update on news"
  on public.news_items for update
  using (false);

-- Realtime（若已添加会报错，可忽略后一条）
alter publication supabase_realtime add table public.news_items;
alter publication supabase_realtime add table public.forum_posts;
alter publication supabase_realtime add table public.forum_comments;

-- 示例新闻种子（仅表为空时插入）
do $$
begin
  if exists (select 1 from public.news_items limit 1) then
    return;
  end if;
  insert into public.news_items (title, summary, image_url, source_label, article_url, layout_index, badge, sort_order, published_at)
  values
  (
    'OpenAI raises $40B at $300B post-money valuation',
    'SoftBank-led round; part of the capital targets U.S. Stargate data-center build-out (reported March 2025).',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop&auto=format',
    'TechCrunch · Mar 2025',
    'https://techcrunch.com',
    0,
    'Funding',
    100,
    now()
  ),
  (
    'Google unveils Gemini 2.5 “thinking” model family',
    'Gemini 2.5 Pro Experimental emphasizes reasoning across logic, STEM, and coding workloads.',
    'https://images.unsplash.com/photo-1485827404703-e89b11e8d0f0?w=900&h=400&fit=crop&auto=format',
    'TechCrunch · Mar 2025',
    'https://techcrunch.com',
    1,
    null,
    99,
    now()
  ),
  (
    'OpenAI ships Responses API tools for enterprise agents',
    'New API surfaces help developers wire search, files, and web navigation into agent flows.',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&h=400&fit=crop&auto=format',
    'TechCrunch · Mar 2025',
    'https://techcrunch.com',
    2,
    null,
    98,
    now()
  ),
  (
    'ChatGPT native image generation sees massive demand',
    'OpenAI cited GPU capacity pressure as usage spiked after the GPT-4o image rollout.',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=380&fit=crop&auto=format',
    'Business Insider · 2025',
    'https://www.businessinsider.com',
    3,
    null,
    97,
    now()
  ),
  (
    'Google’s Anthropic stake in filings draws attention',
    'Court filings renewed focus on Google’s cumulative investment in Anthropic.',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=380&fit=crop&auto=format',
    'TechCrunch · Mar 2025',
    'https://techcrunch.com',
    4,
    null,
    96,
    now()
  ),
  (
    'AI agents move from demos to production roadmaps',
    'Enterprises evaluate tool APIs, retrieval, and policy guardrails at scale.',
    'https://images.unsplash.com/photo-1531746797555-798f2d0d6f53?w=600&h=380&fit=crop&auto=format',
    'Industry',
    null,
    5,
    null,
    95,
    now()
  ),
  (
    'Regulators eye AI watermarking & metadata',
    'Industry groups push interoperable provenance standards for synthetic media.',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=640&h=400&fit=crop&auto=format',
    'Policy',
    null,
    6,
    null,
    94,
    now()
  ),
  (
    'Open-weight models keep downloads climbing',
    'Hugging Face community traffic reflects sustained interest in local & fine-tuned stacks.',
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=640&h=400&fit=crop&auto=format',
    'Industry trend · 2025',
    'https://huggingface.co',
    7,
    null,
    93,
    now()
  ),
  (
    'Developers split time between frontier APIs and on-device inference',
    'Latency, cost, and privacy trade-offs reshape hybrid AI architectures.',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=320&fit=crop&auto=format',
    'Analysis',
    null,
    8,
    null,
    92,
    now()
  );
end $$;
