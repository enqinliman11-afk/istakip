import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const comments = await prisma.comment.findMany({ orderBy: { createdAt: 'asc' } });
        return NextResponse.json(comments);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // userId ve taskId ilişkileri body içinde olmalı
        const comment = await prisma.comment.create({ data: body });
        return NextResponse.json(comment);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
