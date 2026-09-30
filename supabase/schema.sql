-- 방명록 테이블 스키마 (Supabase)
-- 적용 방법: Supabase 대시보드 > SQL Editor에 붙여넣고 실행
-- 데모 프로젝트: mobile-invitation-demo (ap-northeast-2)

create table if not exists guestbook (
  id bigint generated always as identity primary key,
  name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table guestbook enable row level security;

-- 익명 사용자는 읽기/쓰기만 가능 (수정·삭제 불가)
drop policy if exists "anon select" on guestbook;
create policy "anon select" on guestbook
  for select to anon using (true);

drop policy if exists "anon insert" on guestbook;
create policy "anon insert" on guestbook
  for insert to anon with check (true);
