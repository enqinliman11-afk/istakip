const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    const adminExists = await prisma.user.findUnique({
        where: { username: 'enginliman' },
    });

    if (!adminExists) {
        await prisma.user.create({
            data: {
                username: 'enginliman',
                // In a real app we hash passwords, but for parity with old localStorage logic:
                password: '123456789*Qwe',
                name: 'Engin Liman',
                role: 'ADMIN',
            },
        });
        console.log('Admin user created');
    } else {
        console.log('Admin user already exists');
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
