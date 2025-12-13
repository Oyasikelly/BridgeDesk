
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = '8f4b2fdb-78eb-422d-9a27-2a4e72e7fbaf'; 
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true }
  });

  if (!user || !user.organizationId) {
    console.log('User or Org not found');
    return;
  }

  console.log(`User Org: ${user.organization?.name} (${user.organizationId})`);

  const categories = await prisma.category.findMany({
      where: { organizationId: user.organizationId }
  });

  console.log(`Found ${categories.length} categories.`);

  if (categories.length === 0) {
      console.log('Seeding default categories...');
      const defaultCats = [
          { name: 'Academic', description: 'Issues related to lectures, grades, etc.' },
          { name: 'Facilities', description: 'Hostel, classroom, or infrastructure issues.' },
          { name: 'Administrative', description: 'Registration, fees, and paperwork.' },
          { name: 'Security', description: 'Safety concerns and reports.' }
      ];

      for (const cat of defaultCats) {
          await prisma.category.create({
              data: {
                  ...cat,
                  organizationId: user.organizationId!
              }
          });
      }
      console.log('Seeding complete.');
  } else {
      console.log('Categories:', categories);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
