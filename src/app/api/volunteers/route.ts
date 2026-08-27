import { NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSession();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const allUsers = Storage.getUsers();
    const volunteers = allUsers
      .filter((u) => u.role === 'VOLUNTEER')
      .map(({ passwordHash, ...safe }) => safe);

    return NextResponse.json({ volunteers });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch volunteers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, phone, username, password } = await req.json();

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: 'Name, Username, and Password are required.' },
        { status: 400 }
      );
    }

    // Check if username is taken
    const existing = Storage.getUserByUsername(username);
    if (existing) {
      return NextResponse.json(
        { error: 'This username is already taken. Please choose another.' },
        { status: 400 }
      );
    }

    const newVol = Storage.addUser({
      name: name.trim(),
      phone: (phone || '').trim(),
      username: username.trim(),
      passwordHash: password.trim(),
      role: 'VOLUNTEER',
    });

    const { passwordHash, ...safeVol } = newVol;
    return NextResponse.json({ success: true, volunteer: safeVol });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create volunteer' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Volunteer ID required' }, { status: 400 });
    }

    Storage.deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to remove volunteer' }, { status: 500 });
  }
}
