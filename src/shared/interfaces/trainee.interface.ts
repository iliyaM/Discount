export interface ITrainee {
  id: number;
  name: string;
  username: string;
  email: string;
  address: IAddress;
  phone: string;
  website: string;
  company: ICompany;
  grade: number;
  subject: string;
  date: string;
}

export interface IGeo {
  lat: string;
  lng: string;
}

export interface IAddress {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: IGeo;
}

export interface ICompany {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface IPosts {
  userId: number,
  id: number,
  title: string;
  body: string;
  subject: string;
  date: string;
  name: string;
  grade: number;
}

export interface TraineeSlot {
  id: number;
  data: ITrainee | null;
  loading: boolean;
}
