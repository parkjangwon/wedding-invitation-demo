# 모바일 청첩장 (데모)

Vercel + Supabase 자동 개발 플로우 체험용 데모 프로젝트.
정적 페이지 + Supabase 방명록. 사진·일시·장소·계좌는 모두 샘플 데이터입니다.

🔗 **데모 페이지**: https://wedding-invitation-demo-parkjangwons-projects.vercel.app/

## 기능

- 히어로: 신랑신부 사진, 예식 일시·장소, D-day 카운터
- 갤러리: 사진 6장 (모바일 청첩장 관례에 따라 확대 기능 없음)
- 오시는 길: 예식장 주소, 지도 앱(네이버/카카오/T) 연결
- 마음 전하실 곳: 신랑·신부 측 계좌번호 (복사 버튼)
- 방명록: Supabase 기반 작성·조회 (익명 읽기/쓰기)
- 공유하기: 카카오톡 공유, 링크 복사
- 모바일 청첩장 관례: 페이지 전체 핀치줌 차단

## 개발 스택

| 영역 | 스택 |
| --- | --- |
| 프론트엔드 | HTML / CSS / Vanilla JS (빌드 과정 없음) |
| 백엔드 (방명록) | Supabase (PostgREST, `guestbook` 테이블, RLS: anon SELECT·INSERT) |
| 호스팅 | Vercel (정적 배포) |
| 배포 | Vercel REST API 직접 호출 (`vr deploy-files`, GitHub 자동 배포 연동 중) |

## 프로젝트 구조

```
├── index.html      # 마크업 (섹션 구조, 이미지 캐시버스터 포함)
├── styles.css      # 스타일 (모바일 480px 기준, 핀치줌 차단 포함)
├── app.js          # D-day, 갤러리, 방명록, 공유하기 등 인터랙션
├── config.js       # Supabase 접속 정보 (gitignore, 로컬에만 존재)
└── assets/         # main.jpg + 갤러리 g1~g6.jpg
```

## 로컬 실행

```bash
# config.js 생성 (Supabase 프로젝트 URL + anon 키)
cp config.js.example config.js  # 예시 파일이 있다면
# 또는 직접 작성:
# window.APP_CONFIG = { SUPABASE_URL: '...', SUPABASE_ANON_KEY: '...' };

# 정적 서버로 실행
npx serve .
```

`config.js`가 없어도 페이지는 동작하며, 방명록만 비활성화됩니다.

## 배포

```bash
# Vercel REST API로 정적 파일 직접 배포
vr deploy-files --project wedding-invitation-demo \
  --project-id <PROJECT_ID> \
  --dir .
```

GitHub 레포와 Vercel Connect 연동이 되어 있어, push 시 자동 배포를 목표로 하고 있습니다.

## 참고

- `config.js`는 `.gitignore` 처리되어 레포에 포함되지 않습니다.
- 이미지는 AI 생성 샘플(귀여운 3D 카피바라 그림체)이며, 실사용 시 교체가 필요합니다.
- 신랑신부 이름은 데모용 마스킹(박신랑/김신부) 처리되어 있습니다.
