export interface VehicleCount {
  type: string;
  count: number;
}

export interface Citizen {
  _id?: string;
  houseId: string;
  isHead: boolean;
  relationToHead: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  maritalStatus: string;
  phone: string;
  educationStage: string;
  classOrYear: string;
  islamicEducation: string;
  isPravasi: boolean;
  pravasiCountry?: string;
  jobCategory: string;
  specificJob?: string;
  healthCondition: string;
  healthConditionOther?: string;
  specialSkills: string;
  specialSkillsOther?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface House {
  _id?: string;
  houseNo: string;
  houseName: string;
  ward: string;
  economicStatus: string;
  houseOwnership: string;
  vehicles: VehicleCount[];
  registeredByVolunteerName?: string;
  registeredByVolunteerId?: string;
  createdAt?: string;
  updatedAt?: string;
  members?: Citizen[];
}

export interface UserSession {
  id: string;
  name: string;
  username: string;
  role: "SUPERADMIN" | "VOLUNTEER";
  phone?: string;
}
