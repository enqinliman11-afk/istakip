
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const category = await prisma.category.update({
            where: { id },
            data: { name: body.name }
        });
        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        console.log('API DELETE received ID:', id);
        // Temporary debug: return the ID to the client
        // await prisma.category.delete({ where: { id } });
        // return NextResponse.json({ success: true });

        // Actually perform delete, but capture error detail
        await prisma.category.delete({ where: { id } });
        return NextResponse.json({ success: true, deletedId: id });

    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to delete category: ' + error.message, stack: error.stack }, { status: 500 });
    }
}
