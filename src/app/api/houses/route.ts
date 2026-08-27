import { NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const houses = Storage.getHouses();
    const citizens = Storage.getAllCitizens();

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

    const newHouse = Storage.createHouseWithMembers(
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
