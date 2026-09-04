import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHouse extends Document {
  houseNo: string;
  houseName: string;
  ward: string;
  economicStatus: string;
  houseOwnership: string;
  vehicles: Array<{ type: string; count: number }>;
  registeredByVolunteerName?: string;
  registeredByVolunteerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HouseSchema = new Schema<IHouse>(
  {
    houseNo: { type: String, required: true, trim: true },
    houseName: { type: String, required: true, trim: true },
    ward: { type: String, required: true },
    economicStatus: { type: String, required: true },
    houseOwnership: { type: String, required: true },
    vehicles: [
      {
        type: { type: String, required: true },
        count: { type: Number, required: true, default: 0 },
      },
    ],
    registeredByVolunteerName: { type: String },
    registeredByVolunteerId: { type: String },
  },
  { timestamps: true }
);

export const House: Model<IHouse> = mongoose.models.House || mongoose.model<IHouse>('House', HouseSchema);
