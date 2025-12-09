
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get('taskId');
        const userId = searchParams.get('userId');

        const whereClause: any = {};
        if (taskId) whereClause.taskId = taskId;
        if (userId) whereClause.userId = userId;

        const assignments = await prisma.taskAssignment.findMany({
            where: whereClause
        });
        return NextResponse.json(assignments);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const assignment = await prisma.taskAssignment.create({
            data: body
        });
        return NextResponse.json(assignment);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get('taskId');
        const userId = searchParams.get('userId');

        if (!taskId || !userId) {
            return NextResponse.json({ error: 'Missing taskId or userId' }, { status: 400 });
        }

        // Delete unique using composite key not directly supported easily in delete without unique constraint name or using deleteMany
        // But schema has @@unique([taskId, userId])

        await prisma.taskAssignment.deleteMany({
            where: {
                taskId,
                userId
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
    }
}
