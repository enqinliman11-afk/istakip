
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const task = await prisma.recurringTask.update({
            where: { id },
            data: body
        });
        return NextResponse.json(task);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update recurring task' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.recurringTask.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete recurring task' }, { status: 500 });
    }
}
