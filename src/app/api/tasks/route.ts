import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const tasks = await prisma.task.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(tasks);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // İlişkisel veriler ve atamalar burada handle edilebilir
        // Şimdilik basit create, ancak assignees logic'i DataContext'te ayrı handle ediliyor
        // veya buraya eklenebilir. 
        // DataContext logic'i: "addTask" içinde assignment'lar da gönderiliyor.
        // O yüzden body içinde assignments bekleyebiliriz veya ayrı endpoint kullanabiliriz.
        // En temiz yöntem: transaction ile hepsini burada yapmak.

        // Tip tanımı yapmıyoruz, gelen veriye güveniyoruz (veya zod ile validate edilebilir)
        const { assignees, subtaskTitles, ...taskData } = body;

        const task = await prisma.task.create({
            data: {
                ...taskData,
                assignments: {
                    create: assignees?.map((a: any) => ({
                        userId: a.userId,
                        isOwner: a.isOwner
                    }))
                },
                subtasks: {
                    create: subtaskTitles?.map((title: string) => ({
                        title
                    }))
                }
            },
            include: {
                assignments: true,
                subtasks: true
            }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
