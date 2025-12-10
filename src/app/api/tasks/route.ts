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
        console.log('Task Create Body:', body);

        const { assignees, subtaskTitles, ...taskData } = body;

        // Clean up undefined/NaN values that might cause issues
        if (Number.isNaN(taskData.periodMonth)) taskData.periodMonth = null;
        if (Number.isNaN(taskData.periodYear)) taskData.periodYear = null;

        // Prisma requires full ISO-8601 DateTime
        if (taskData.dueDate) {
            taskData.dueDate = new Date(taskData.dueDate).toISOString();
        }

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
    } catch (error: any) {
        console.error('Task Creation Error:', error);
        return NextResponse.json(
            { error: 'Failed to create task', details: error.message },
            { status: 500 }
        );
    }
}
