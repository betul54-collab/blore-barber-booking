type Service = {
  name: string
  price: number
  duration: number
}

type Personel = {
  id: string
  name: string
}

type WorkingHours = {
  day: string
  open: string
  close: string
  closed: boolean
}

type BreakTime = {
  start: string
  end: string
}

type Holiday = {
  start: string
  end: string
}

let services: Service[] = [
  { name: "Saç", price: 500, duration: 30 },
  { name: "Sakal", price: 300, duration: 15 },
]

let personel: Personel[] = []

let workingHours: WorkingHours[] = []

let breaks: BreakTime[] = []
let holidays: Holiday[] = []

export const store = {
  // SERVICES
  getServices: () => services,
  setServices: (data: Service[]) => {
    services = data
  },

  // PERSONEL
  getPersonel: () => personel,
  addPersonel: (p: Personel) => {
    personel.push(p)
  },

  // WORKING HOURS
  getHours: () => workingHours,
  setHours: (data: WorkingHours[]) => {
    workingHours = data
  },

  // BREAK
  getBreaks: () => breaks,
  setBreaks: (data: BreakTime[]) => {
    breaks = data
  },

  // HOLIDAY
  getHolidays: () => holidays,
  setHolidays: (data: Holiday[]) => {
    holidays = data
  },
}