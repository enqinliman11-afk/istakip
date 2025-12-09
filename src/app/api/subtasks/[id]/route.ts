
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Handle explicit fields only
        const updateData: any = {};
        if (body.hasOwnProperty('isCompleted')) {
            updateData.isCompleted = body.isCompleted;
            updateData.completedAt = body.isCompleted ? new Date().toISOString() : null;
            updateData.completedById = body.completedById;
        }
        if (body.title) updateData.title = body.title;

        const subtask = await prisma.subtask.update({
            where: { id },
            data: updateData
        });
        return NextResponse.json(subtask);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update subtask' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.subtask.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete subtask' }, { status: 500 });
    }
}
