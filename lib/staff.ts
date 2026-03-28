export type Staff = {
  id: string;
  name: string;
  workStart: string; // "09:00"
  workEnd: string;   // "18:00"
};

export const STAFF: Staff[] = [
  { id: "p1", name: "Ali", workStart: "09:00", workEnd: "18:00" },
  { id: "p2", name: "Mehmet", workStart: "10:00", workEnd: "19:00" },
];