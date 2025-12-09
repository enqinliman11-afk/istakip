
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const tasks = await prisma.recurringTask.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(tasks);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch recurring tasks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const task = await prisma.recurringTask.create({
            data: {
                title: body.title,
                description: body.description,
                categoryId: body.categoryId,
                clientId: body.clientId,
                priority: body.priority,
                frequency: body.frequency,
                dayOfMonth: body.dayOfMonth,
                dayOfWeek: body.dayOfWeek,
                nextRunDate: body.nextRunDate,
                isActive: body.isActive ?? true,
                assigneeIds: body.assigneeIds || [],
                createdById: body.createdById
            }
        });
        return NextResponse.json(task);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create recurring task' }, { status: 500 });
    }
}
