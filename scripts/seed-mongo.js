const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');

const uri = 'mongodb+srv://mohammedperuvankuzhiyil_db_user:hnRSsZcoDUW3rpVQ@cluster0.nllacqo.mongodb.net/mahallu?retryWrites=true&w=majority';

async function seed() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log('Connected to MongoDB Atlas!');

  const db = mongoose.connection.db;

  // 1. Users
  const usersCol = db.collection('users');
  await usersCol.deleteMany({});
  await usersCol.insertMany([
    {
      name: 'Mahallu President / Secretary',
      username: 'superadmin',
      passwordHash: 'admin@123',
      phone: '9876543210',
      role: 'SUPERADMIN',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Mohammed Shafi',
      username: 'shafi',
      passwordHash: 'vol@123',
      phone: '9847123456',
      role: 'VOLUNTEER',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Abdul Rahman',
      username: 'rahman',
      passwordHash: 'vol@123',
      phone: '9847654321',
      role: 'VOLUNTEER',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  console.log('Seeded Users.');

  // 2. Houses
  const housesCol = db.collection('houses');
  await housesCol.deleteMany({});
  const house1 = await housesCol.insertOne({
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
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const house2 = await housesCol.insertOne({
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
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const house3 = await housesCol.insertOne({
    houseNo: '08/112',
    houseName: 'Darussalam (Kunnathu House)',
    ward: 'Ward 2',
    economicStatus: 'AAY (Antyodaya Anna Yojana - Yellow)',
    houseOwnership: 'Temporary Shelter / Shed',
    vehicles: [{ type: 'Bicycle', count: 1 }],
    registeredByVolunteerName: 'Abdul Rahman',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  console.log('Seeded Houses.');

  // 3. Citizens
  const citizensCol = db.collection('citizens');
  await citizensCol.deleteMany({});
  await citizensCol.insertMany([
    {
      houseId: house1.insertedId.toString(),
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
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      houseId: house1.insertedId.toString(),
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
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      houseId: house1.insertedId.toString(),
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
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      houseId: house2.insertedId.toString(),
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
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      houseId: house3.insertedId.toString(),
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
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  console.log('Seeded Citizens.');

  await mongoose.disconnect();
  console.log('Seed completed successfully!');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
