import { PrismaClient, RoleName } from '@prisma/client';
const prisma = new PrismaClient();
for (const name of Object.values(RoleName)) await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
const user = await prisma.user.upsert({ where: { email: 'operator@kenneldao.local' }, update: {}, create: { email: 'operator@kenneldao.local', displayName: 'Local Operator' } });
const operatorRole = await prisma.role.findUniqueOrThrow({ where: { name: 'OPERATOR' } });
await prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: operatorRole.id } }, update: {}, create: { userId: user.id, roleId: operatorRole.id } });
await prisma.memberProfile.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });
console.log('Seeded local KDAOcore roles and operator identity.');
await prisma.$disconnect();
