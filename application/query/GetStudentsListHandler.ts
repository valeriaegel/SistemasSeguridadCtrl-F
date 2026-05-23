import { StudentRepository } from '@/infraestructure/repositories/StudentRepository'

export class GetStudentsListHandler {
    private readonly repository: StudentRepository

    constructor() {
        this.repository = new StudentRepository()
    }

    async handle(query: GetStudentsListQuery): Promise<GetStudentsListResponse> {
      const students = await this.repository.findAll({ 
    email: query.requesterId, 
    role: query.requesterRole 
})
        return { list: students }
    }
}

export interface GetStudentsListQuery {
    requesterId: string
    requesterRole: string
}

export interface GetStudentsListResponse {
    list: Student[]
}

export interface Student {
    id: number
    name: string
    email: string
    active: boolean
   
}