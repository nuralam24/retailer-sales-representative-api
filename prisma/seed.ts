import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create Admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.salesRep.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        name: 'Admin User',
        phone: '+8801700000000',
        passwordHash: hashedPassword,
        role: 'admin',
      },
    });
    console.log('✅ Admin user created (username: admin, password: admin123)');

    // Create Regions
    const regions = await Promise.all([
      prisma.region.upsert({
        where: { name: 'Dhaka Division' },
        update: {},
        create: { name: 'Dhaka Division' },
      }),
      prisma.region.upsert({
        where: { name: 'Chittagong Division' },
        update: {},
        create: { name: 'Chittagong Division' },
      }),
      prisma.region.upsert({
        where: { name: 'Rajshahi Division' },
        update: {},
        create: { name: 'Rajshahi Division' },
      }),
      prisma.region.upsert({
        where: { name: 'Khulna Division' },
        update: {},
        create: { name: 'Khulna Division' },
      }),
      prisma.region.upsert({
        where: { name: 'Sylhet Division' },
        update: {},
        create: { name: 'Sylhet Division' },
      }),
    ]);
    console.log('✅ Regions created');

    // Create Areas
    const areas = [
      { name: 'Uttara', regionId: regions[0].id },
      { name: 'Gulshan', regionId: regions[0].id },
      { name: 'Dhanmondi', regionId: regions[0].id },
      { name: 'Mirpur', regionId: regions[0].id },
      { name: 'Agrabad', regionId: regions[1].id },
      { name: 'Khulshi', regionId: regions[1].id },
    ];

    for (const area of areas) {
      await prisma.area.upsert({
        where: { id: 0 }, // Use non-existent ID to force create if not exists
        update: {},
        create: area,
      }).catch(() => {}); // Ignore errors if already exists
    }
    const createdAreas = await prisma.area.findMany();
    console.log('✅ Areas created');

    // Create Distributors
    const distributors = await Promise.all([
      prisma.distributor.upsert({
        where: { name: 'ABC Distributors Ltd' },
        update: {},
        create: { name: 'ABC Distributors Ltd' },
      }),
      prisma.distributor.upsert({
        where: { name: 'XYZ Trading Company' },
        update: {},
        create: { name: 'XYZ Trading Company' },
      }),
      prisma.distributor.upsert({
        where: { name: 'Prime Distributors' },
        update: {},
        create: { name: 'Prime Distributors' },
      }),
      prisma.distributor.upsert({
        where: { name: 'National Distributors' },
        update: {},
        create: { name: 'National Distributors' },
      }),
    ]);
    console.log('✅ Distributors created');

    // Create Territories
    const territories = [
      { name: 'Uttara Sector 1-7', areaId: createdAreas[0].id },
      { name: 'Uttara Sector 8-14', areaId: createdAreas[0].id },
      { name: 'Gulshan 1', areaId: createdAreas[1].id },
      { name: 'Gulshan 2', areaId: createdAreas[1].id },
      { name: 'Dhanmondi Residential', areaId: createdAreas[2].id },
      { name: 'Dhanmondi Commercial', areaId: createdAreas[2].id },
    ];

    for (const territory of territories) {
      await prisma.territory.upsert({
        where: { id: 0 },
        update: {},
        create: territory,
      }).catch(() => {});
    }
    const createdTerritories = await prisma.territory.findMany();
    console.log('✅ Territories created');

    // Create Sample Sales Reps
    const salesRepPassword = await bcrypt.hash('salesrep123', 10);
    const salesReps = await Promise.all([
      prisma.salesRep.upsert({
        where: { username: 'karim_ahmed' },
        update: {},
        create: {
          username: 'karim_ahmed',
          name: 'Karim Ahmed',
          phone: '+8801711111111',
          passwordHash: salesRepPassword,
          role: 'sales_rep',
        },
      }),
      prisma.salesRep.upsert({
        where: { username: 'fatema_khatun' },
        update: {},
        create: {
          username: 'fatema_khatun',
          name: 'Fatema Khatun',
          phone: '+8801722222222',
          passwordHash: salesRepPassword,
          role: 'sales_rep',
        },
      }),
      prisma.salesRep.upsert({
        where: { username: 'rafiq_islam' },
        update: {},
        create: {
          username: 'rafiq_islam',
          name: 'Rafiq Islam',
          phone: '+8801733333333',
          passwordHash: salesRepPassword,
          role: 'sales_rep',
        },
      }),
    ]);
    console.log('✅ Sales reps created (password: salesrep123)');

    // Create Sample Retailers
    const retailersData = [];
    for (let i = 1; i <= 100; i++) {
      retailersData.push({
        uid: `RET-${String(i).padStart(6, '0')}`,
        name: `Store ${i}`,
        phone: `+88017${String(i).padStart(8, '0')}`,
        regionId: regions[i % regions.length].id,
        areaId: createdAreas[i % createdAreas.length].id,
        distributorId: distributors[i % distributors.length].id,
        territoryId: createdTerritories[i % createdTerritories.length].id,
        points: Math.floor(Math.random() * 5000),
        routes: `Route ${String.fromCharCode(65 + (i % 26))}`,
        notes: `Sample retailer ${i}`,
      });
    }

    await prisma.retailer.createMany({
      data: retailersData,
      skipDuplicates: true,
    });
    console.log('✅ 100 sample retailers created');

    // Get all retailers
    const allRetailers = await prisma.retailer.findMany({ take: 100 });

    // Assign retailers to sales reps
    const assignments1 = allRetailers.slice(0, 70).map(r => ({
      salesRepId: salesReps[0].id,
      retailerId: r.id,
    }));

    const assignments2 = allRetailers.slice(70, 100).map(r => ({
      salesRepId: salesReps[1].id,
      retailerId: r.id,
    }));

    await prisma.salesRepRetailer.createMany({
      data: [...assignments1, ...assignments2],
      skipDuplicates: true,
    });
    console.log('✅ Retailers assigned to sales reps');

    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('   Admin: username=admin, password=admin123');
    console.log('   Sales Rep 1: username=karim_ahmed, password=salesrep123');
    console.log('   Sales Rep 2: username=fatema_khatun, password=salesrep123');
    console.log('');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
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

