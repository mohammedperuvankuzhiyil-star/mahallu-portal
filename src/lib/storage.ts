import fs from 'fs';
import path from 'path';
import { House, Citizen, UserSession } from '@/types';

// Pre-seeded default SuperAdmin
export const DEFAULT_SUPERADMIN = {
  id: 'admin-1',
  name: 'Mahallu President / Secretary',
  username: 'SUPERADMIN',
  passwordHash: 'admin@123', // In simple prototype comparison or bcrypt
  phone: '9876543210',
  role: 'SUPERADMIN' as const,
  createdAt: new Date().toISOString()
};

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'mahallu_store.json');

interface LocalStore {
  users: any[];
  houses: House[];
  citizens: Citizen[];
}

// Initial sample mock data so the portal starts populated and looks alive
const initialData: LocalStore = {
  users: [
    DEFAULT_SUPERADMIN,
    {
      id: 'vol-1',
      name: 'Mohammed Shafi',
      username: 'shafi',
      passwordHash: 'vol@123',
      phone: '9847123456',
      role: 'VOLUNTEER',
      createdAt: new Date().toISOString()
    },
    {
      id: 'vol-2',
      name: 'Abdul Rahman',
      username: 'rahman',
      passwordHash: 'vol@123',
      phone: '9847654321',
      role: 'VOLUNTEER',
      createdAt: new Date().toISOString()
    }
  ],
  houses: [
    {
      _id: 'house-101',
      houseNo: '12/450',
      houseName: 'Baitul Noor (Veliyil House)',
      ward: 'Ward 3',
      economicStatus: 'BPL (Below Poverty Line)',
      houseOwnership: 'Own House',
      vehicles: [
        { type: 'Two Wheeler (Scooter / Motorcycle)', count: 2 },
        { type: 'Four Wheeler / Car', count: 1 }
      ],
      registeredByVolunteerName: 'Mohammed Shafi',
      registeredByVolunteerId: 'vol-1',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      _id: 'house-102',
      houseNo: '12/451',
      houseName: 'Al-Huda Villa',
      ward: 'Ward 3',
      economicStatus: 'APL (Above Poverty Line)',
      houseOwnership: 'Own House',
      vehicles: [
        { type: 'Two Wheeler (Scooter / Motorcycle)', count: 1 },
        { type: 'Four Wheeler / Car', count: 1 },
        { type: 'Auto Rickshaw', count: 1 }
      ],
      registeredByVolunteerName: 'Mohammed Shafi',
      registeredByVolunteerId: 'vol-1',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      _id: 'house-103',
      houseNo: '08/112',
      houseName: 'Darussalam (Kunnathu House)',
      ward: 'Ward 2',
      economicStatus: 'AAY (Antyodaya Anna Yojana - Yellow)',
      houseOwnership: 'Temporary Shelter / Shed',
      vehicles: [
        { type: 'Bicycle', count: 1 }
      ],
      registeredByVolunteerName: 'Abdul Rahman',
      registeredByVolunteerId: 'vol-2',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ],
  citizens: [
    // House 101 Members
    {
      _id: 'cit-1',
      houseId: 'house-101',
      isHead: true,
      relationToHead: 'Self (Head)',
      name: 'Ibrahim Kutty V.P.',
      age: 56,
      gender: 'Male',
      bloodGroup: 'O+',
      maritalStatus: 'Married',
      phone: '9847112233',
      educationStage: 'High School (Class 8-10 / SSLC)',
      classOrYear: 'Course Completed / Graduated',
      islamicEducation: 'Madrassa High School (Class 5-10)',
      isPravasi: true,
      pravasiCountry: 'United Arab Emirates (UAE)',
      jobCategory: 'Gulf / Pravasi Worker',
      specificJob: 'Retail Store Supervisor, Dubai',
      healthCondition: 'Diabetes / Hypertension (BP)',
      specialSkills: 'Social Work / Volunteer Leadership',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      _id: 'cit-2',
      houseId: 'house-101',
      isHead: false,
      relationToHead: 'Spouse (Wife/Husband)',
      name: 'Fathima Suhra',
      age: 50,
      gender: 'Female',
      bloodGroup: 'B+',
      maritalStatus: 'Married',
      phone: '9847112234',
      educationStage: 'High School (Class 8-10 / SSLC)',
      classOrYear: 'Course Completed / Graduated',
      islamicEducation: 'Madrassa Primary (Class 1-4)',
      isPravasi: false,
      jobCategory: 'Homemaker',
      healthCondition: 'None (Healthy)',
      specialSkills: 'Cooking / Catering / Baking',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      _id: 'cit-3',
      houseId: 'house-101',
      isHead: false,
      relationToHead: 'Son',
      name: 'Muhammed Nabeel',
      age: 21,
      gender: 'Male',
      bloodGroup: 'O+',
      maritalStatus: 'Single / Unmarried',
      phone: '9847112235',
      educationStage: 'Undergraduate (BA, BSc, BCom, BTech, etc.)',
      classOrYear: 'Final Year Degree / UG',
      islamicEducation: 'Hifz (Quran Memorizer / Hafiz)',
      isPravasi: false,
      jobCategory: 'Student',
      specificJob: 'B.Com Final Year Student',
      healthCondition: 'None (Healthy)',
      specialSkills: 'IT / Computer / Graphic Design / Typing',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      _id: 'cit-4',
      houseId: 'house-101',
      isHead: false,
      relationToHead: 'Daughter',
      name: 'Aisha Rifa',
      age: 16,
      gender: 'Female',
      bloodGroup: 'AB+',
      maritalStatus: 'Single / Unmarried',
      phone: '9847112236',
      educationStage: 'Higher Secondary (+1 / +2 / VHSE)',
      classOrYear: '+2 (Plus Two - 12th)',
      islamicEducation: 'Madrassa Higher Secondary (11-12 Completed)',
      isPravasi: false,
      jobCategory: 'Student',
      specificJob: 'Plus Two Science Student',
      healthCondition: 'None (Healthy)',
      specialSkills: 'Arts / Calligraphy / Tailoring',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    // House 102 Members
    {
      _id: 'cit-5',
      houseId: 'house-102',
      isHead: true,
      relationToHead: 'Self (Head)',
      name: 'Usman Haji K.',
      age: 62,
      gender: 'Male',
      bloodGroup: 'A+',
      maritalStatus: 'Married',
      phone: '9447334455',
      educationStage: 'Primary School (Class 1-4)',
      classOrYear: 'Course Completed / Graduated',
      islamicEducation: 'Madrassa High School (Class 5-10)',
      isPravasi: false,
      jobCategory: 'Business / Self-Employed / Shop',
      specificJob: 'Hardware Store Owner',
      healthCondition: 'Heart Disease / Cardiac Issue',
      specialSkills: 'Social Work / Volunteer Leadership',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      _id: 'cit-6',
      houseId: 'house-102',
      isHead: false,
      relationToHead: 'Son',
      name: 'Ameen Usman',
      age: 28,
      gender: 'Male',
      bloodGroup: 'A+',
      maritalStatus: 'Married',
      phone: '9447334456',
      educationStage: 'Undergraduate (BA, BSc, BCom, BTech, etc.)',
      classOrYear: 'Course Completed / Graduated',
      islamicEducation: 'Madrassa Higher Secondary (11-12 Completed)',
      isPravasi: true,
      pravasiCountry: 'Qatar',
      jobCategory: 'Gulf / Pravasi Worker',
      specificJob: 'Mechanical Engineer, Doha',
      healthCondition: 'None (Healthy)',
      specialSkills: 'Driving (Heavy / Light)',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    // House 103 Members (Welfare target / BPL)
    {
      _id: 'cit-7',
      houseId: 'house-103',
      isHead: true,
      relationToHead: 'Self (Head)',
      name: 'Zainaba Beevi',
      age: 64,
      gender: 'Female',
      bloodGroup: 'O-',
      maritalStatus: 'Widowed',
      phone: '9656778899',
      educationStage: 'Illiterate / No Formal Schooling',
      classOrYear: 'Not Applicable',
      islamicEducation: 'Basic Home Islamic Study',
      isPravasi: false,
      jobCategory: 'Unable to Work (Due to Health or Age)',
      healthCondition: 'Kidney Disease / Dialysis Patient',
      healthConditionOther: 'Undergoing weekly dialysis at Govt Hospital',
      specialSkills: 'None',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      _id: 'cit-8',
      houseId: 'house-103',
      isHead: false,
      relationToHead: 'Son',
      name: 'Rashid K.',
      age: 19,
      gender: 'Male',
      bloodGroup: 'B-',
      maritalStatus: 'Single / Unmarried',
      phone: '9656778800',
      educationStage: 'Diploma / ITI / Polytechnic',
      classOrYear: '2nd Year Diploma / ITI',
      islamicEducation: 'Madrassa High School (Class 5-10)',
      isPravasi: false,
      jobCategory: 'Student',
      specificJob: 'ITI Electrical Student',
      healthCondition: 'None (Healthy)',
      specialSkills: 'Electrical / Plumbing / Wiring',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ]
};

function ensureDb(): LocalStore {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Storage read error:', e);
    return initialData;
  }
}

function saveDb(data: LocalStore) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

export const Storage = {
  getUsers: () => ensureDb().users,
  
  getUserByUsername: (username: string) => {
    const db = ensureDb();
    return db.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  },
  
  addUser: (userData: any) => {
    const db = ensureDb();
    const newUser = {
      id: 'vol-' + Date.now(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDb(db);
    return newUser;
  },

  deleteUser: (id: string) => {
    const db = ensureDb();
    db.users = db.users.filter(u => u.id !== id && u.role !== 'SUPERADMIN');
    saveDb(db);
    return true;
  },

  getHouses: () => {
    const db = ensureDb();
    return db.houses.map(h => ({
      ...h,
      members: db.citizens.filter(c => c.houseId === h._id)
    }));
  },

  getHouseById: (id: string) => {
    const db = ensureDb();
    const house = db.houses.find(h => h._id === id);
    if (!house) return null;
    return {
      ...house,
      members: db.citizens.filter(c => c.houseId === house._id)
    };
  },

  createHouseWithMembers: (houseData: Omit<House, '_id'>, headData: any, membersData: any[]) => {
    const db = ensureDb();
    const houseId = 'house-' + Date.now();
    const now = new Date().toISOString();

    const newHouse: House = {
      ...houseData,
      _id: houseId,
      createdAt: now,
      updatedAt: now
    };

    const newHead: Citizen = {
      ...headData,
      _id: 'cit-' + Date.now() + '-0',
      houseId,
      isHead: true,
      relationToHead: 'Self (Head)',
      createdAt: now,
      updatedAt: now
    };

    const newMembers: Citizen[] = membersData.map((m, idx) => ({
      ...m,
      _id: 'cit-' + Date.now() + '-' + (idx + 1),
      houseId,
      isHead: false,
      createdAt: now,
      updatedAt: now
    }));

    db.houses.unshift(newHouse);
    db.citizens.push(newHead, ...newMembers);
    saveDb(db);

    return {
      ...newHouse,
      members: [newHead, ...newMembers]
    };
  },

  updateHouseWithMembers: (houseId: string, houseData: any, headData: any, membersData: any[], userSession?: UserSession) => {
    const db = ensureDb();
    const idx = db.houses.findIndex(h => h._id === houseId);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    db.houses[idx] = {
      ...db.houses[idx],
      ...houseData,
      _id: houseId,
      updatedAt: now
    };

    // Remove old citizens for this house and insert updated ones
    db.citizens = db.citizens.filter(c => c.houseId !== houseId);

    const updatedHead: Citizen = {
      ...headData,
      _id: headData._id || ('cit-' + Date.now() + '-0'),
      houseId,
      isHead: true,
      relationToHead: 'Self (Head)',
      updatedAt: now
    };

    const updatedMembers: Citizen[] = membersData.map((m, i) => ({
      ...m,
      _id: m._id || ('cit-' + Date.now() + '-' + (i + 1)),
      houseId,
      isHead: false,
      updatedAt: now
    }));

    db.citizens.push(updatedHead, ...updatedMembers);
    saveDb(db);

    return {
      ...db.houses[idx],
      members: [updatedHead, ...updatedMembers]
    };
  },

  deleteHouse: (houseId: string) => {
    const db = ensureDb();
    db.houses = db.houses.filter(h => h._id !== houseId);
    db.citizens = db.citizens.filter(c => c.houseId !== houseId);
    saveDb(db);
    return true;
  },

  getAllCitizens: () => {
    const db = ensureDb();
    return db.citizens.map(c => {
      const house = db.houses.find(h => h._id === c.houseId);
      return {
        ...c,
        houseNo: house?.houseNo || '',
        houseName: house?.houseName || '',
        ward: house?.ward || '',
        economicStatus: house?.economicStatus || ''
      };
    });
  }
};
