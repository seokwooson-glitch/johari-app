# 조하리의 창 — 인사실 내부용

대화에서 확정된 설계를 그대로 구현한 Next.js(App Router) + Prisma + PostgreSQL 앱입니다.

## 핵심 설계 요약

- **개인별 결과만 존재** — 팀/조직 단위 집계 없음.
- **익명성**: 평가 내용(`AdjectiveCount`: 대상자+형용사별 카운트)과 평가자 신원(`SubmissionStatus`: 제출 여부만)을
  서로 다른 테이블에 분리 저장. 평가자 식별자가 응답 테이블에 아예 없어서 구조적으로 역추적이 불가능.
- 한 번 제출한 동료 평가는 **수정 불가**(불변) — 익명성이 나중에 깨지지 않도록.
- 결과 공개 조건: **마감(`closed=true`) AND 최소 응답자 수(`minEvaluators`, k-익명성) 충족** 둘 다.
- 본인 확인: 이름 + 본인이 설정한 비밀번호(자체 인증, 회사 SSO 아님). 비밀번호는 bcrypt로 해시해 저장.

## 1. 로컬 준비물

- Node.js 18+ (이미 설치됨)
- PostgreSQL 연결 문자열 — [Neon](https://neon.tech) 무료 티어 추천 (서버리스 배포와 궁합이 좋음)

## 2. 환경변수

`env.example.txt` 내용을 복사해서 프로젝트 루트에 `.env` 파일로 저장하고 값을 채우세요.

```bash
cp env.example.txt .env
# .env 파일 열어서 DATABASE_URL, SESSION_SECRET, ADMIN_MEMBER_ID 채우기
```

`SESSION_SECRET`은 아래로 생성:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. 명단(조직도)

`src/lib/org.ts` 에 실제 명단이 반영되어 있습니다 (인사실장 1 + R팀 3 / 인사관리팀 11 / 보상팀 6 / 복지팀 5, 총 26명).
인사이동 등으로 명단이 바뀌면 이 파일을 직접 수정한 뒤 `npm run db:seed`를 다시 실행하세요
(기존 구성원은 이름/팀/직책만 갱신되고, 이미 쌓인 자기평가·동료평가 데이터는 유지됩니다).

## 4. 설치 · DB 준비 · 시딩

```bash
npm install
npm run db:push    # Prisma 스키마를 DB에 반영
npm run db:seed     # org.ts 의 명단을 DB에 채워 넣음
```

## 5. 로컬 실행

```bash
npm run dev
```

http://localhost:3000 접속 → 이름 입력 → (최초) 비밀번호 설정 → 홈.

## 6. GitHub + Vercel 배포

1. GitHub에 새 저장소 생성 (개인 계정)
2. 이 폴더를 push:
   ```bash
   git init
   git add .
   git commit -m "init: 조하리의 창"
   git remote add origin <레포 URL>
   git push -u origin main
   ```
3. [vercel.com](https://vercel.com) 에서 "Import Project" → 방금 만든 레포 선택
4. Vercel 프로젝트 설정 → Environment Variables 에 `.env`의 세 값(`DATABASE_URL`, `SESSION_SECRET`, `ADMIN_MEMBER_ID`) 등록
5. Deploy — 이후 `git push` 할 때마다 자동 재배포

## 관리자(진행자) 기능

`.env`의 `ADMIN_MEMBER_ID`로 지정된 member id가 `/admin` 페이지에서 마감 일시 / 최소 응답자 수 / 결과 공개 여부를 설정할 수 있습니다.

## 폴더 구조

```
prisma/schema.prisma   DB 스키마 (익명성 설계의 핵심)
prisma/seed.ts         명단 시딩 스크립트
src/lib/org.ts         조직도(명단) — 실명으로 교체 필요
src/lib/adjectives.ts  56개 형용사
src/lib/johari.ts       4분면 분류(classify)·지표(indices) 로직
src/lib/session.ts      자체 서명 쿠키 세션(본인 확인)
src/app/                페이지 + API 라우트
```

## 알려진 제한 (프로토타입 대비 남은 작업)

- 이메일 인증/비밀번호 재설정 없음 (본인이 비밀번호를 잊으면 관리자가 DB에서 `Credential` 행 삭제 후 재설정하도록 안내해야 함)
- 관리자 화면이 최소 기능만 있음 (구성원별 진행률 대시보드 등은 미구현)
