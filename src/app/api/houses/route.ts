import { NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const houses = await Storage.getHouses();
    const citizens = await Storage.getAllCitizens();

    return NextResponse.json({
      houses,
      totalHouses: houses.length,
      totalCitizens: citizens.length,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch houses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { house, head, members } = body;

    if (!house?.houseNo || !house?.houseName || !head?.name) {
      return NextResponse.json(
        { error: 'Please provide House Number, House Name, and Head of House Name.' },
        { status: 400 }
      );
    }

    const newHouse = await Storage.createHouseWithMembers(
      {
        ...house,
        registeredByVolunteerName: user.name,
        registeredByVolunteerId: user.id,
      },
      head,
      members || []
    );

    return NextResponse.json({ success: true, house: newHouse });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create house entry' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Only Admin can delete house entries' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (action === 'clear_all') {
      await Storage.deleteAllHouses();
      return NextResponse.json({ success: true, message: 'All house records deleted successfully' });
    }

    if (!id) {
      return NextResponse.json({ error: 'House ID is required' }, { status: 400 });
    }

    await Storage.deleteHouse(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete house' }, { status: 500 });
  }
}
