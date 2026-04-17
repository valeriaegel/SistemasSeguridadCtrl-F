
export interface Student {
  id: string | number
  name: string
  email: string
  imageUrl?: string
  active: boolean
}

export interface StudentsStore {
  students: Student[]

  setStudents: (students: Student[]) => void
}