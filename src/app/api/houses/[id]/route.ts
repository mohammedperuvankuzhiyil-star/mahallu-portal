import { NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { getSession } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const house = Storage.getHouseById(params.id);
    if (!house) {
      return NextResponse.json({ error: 'House not found' }, { status: 404 });
    }

    return NextResponse.json({ house });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch house' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { house, head, members } = body;

    const updated = Storage.updateHouseWithMembers(
      params.id,
      house,
      head,
      members || [],
      user
    );

    if (!updated) {
      return NextResponse.json({ error: 'House not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, house: updated });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update house' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Only Admin can delete house entries' },
        { status: 403 }
      );
    }

    Storage.deleteHouse(params.id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete house' }, { status: 500 });
  }
}
