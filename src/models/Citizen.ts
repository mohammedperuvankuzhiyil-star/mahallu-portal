import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICitizen extends Document {
  houseId: string;
  isHead: boolean;
  relationToHead: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  maritalStatus: string;
  phone?: string;
  educationStage: string;
  classOrYear: string;
  islamicEducation?: string;
  isPravasi: boolean;
  pravasiCountry?: string;
  jobCategory: string;
  specificJob?: string;
  healthCondition: string;
  healthConditionOther?: string;
  specialSkills: string;
  specialSkillsOther?: string;
  academicYearRecorded?: string;
  academicStatus?: 'CURRENT' | 'NEEDS_UPDATE' | 'TRANSITION_REVIEW';
  academicTransitionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CitizenSchema = new Schema<ICitizen>(
  {
    houseId: { type: String, required: true, index: true },
    isHead: { type: Boolean, default: false },
    relationToHead: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    bloodGroup: { type: String, default: 'Unknown / Not Tested' },
    maritalStatus: { type: String, default: 'Single / Unmarried' },
    phone: { type: String, default: '' },
    educationStage: { type: String, default: '' },
    classOrYear: { type: String, default: '' },
    islamicEducation: { type: String, default: '' },
    isPravasi: { type: Boolean, default: false },
    pravasiCountry: { type: String, default: '' },
    jobCategory: { type: String, default: '' },
    specificJob: { type: String, default: '' },
    healthCondition: { type: String, default: 'None (Healthy)' },
    healthConditionOther: { type: String, default: '' },
    specialSkills: { type: String, default: 'None' },
    specialSkillsOther: { type: String, default: '' },
    academicYearRecorded: { type: String, default: '' },
    academicStatus: { type: String, default: 'CURRENT' },
    academicTransitionNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Citizen: Model<ICitizen> =
  mongoose.models.Citizen || mongoose.model<ICitizen>('Citizen', CitizenSchema);
