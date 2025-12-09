import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const clients = await prisma.client.findMany();
        return NextResponse.json(clients);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const client = await prisma.client.create({
            data: body
        });
        return NextResponse.json(client);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
    }
}
