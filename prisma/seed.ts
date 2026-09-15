// 최초 1회 실행: 조직도(명단)와 기본 설정을 DB에 심는다.
//   npx tsx prisma/seed.ts
// (배포 전 반드시 src/lib/org.ts 의 placeholder 이름을 실제 이름으로 바꾼 뒤 실행하세요.)
import { PrismaClient } from "@prisma/client";
import { ORG_MEMBERS } from "../src/lib/org";

const prisma = new PrismaClient();

async function main() {
  for (const m of ORG_MEMBERS) {
    await prisma.member.upsert({
      where: { id: m.id },
      update: { name: m.name, team: m.team, role: m.role },
      create: { id: m.id, name: m.name, team: m.team, role: m.role },
    });
  }

  await prisma.config.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, closed: false, minEvaluators: 3 },
  });

  console.log(`시딩 완료: 구성원 ${ORG_MEMBERS.length}명`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
