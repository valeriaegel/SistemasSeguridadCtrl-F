import { getSupabaseClient } from '@/infraestructure/database/supabaseClient'
import { getSupabaseAnonClient } from '@/infraestructure/database/supabaseAnonClient'

export interface StudentRow {
    id: number
    name: string
    email: string
    active: boolean
    detail?: string | null
}

export class StudentRepository {
    async findAll(user: { email: string; role: string }): Promise<StudentRow[]> {
        const supabase = getSupabaseAnonClient(user.email, user.role, user.email) // Usamos el email como userId para RLS

        const { data, error } = await supabase
            .from('students')
            .select('id, name, email, active, detail')
            .order('id', { ascending: true })

        if (error) {
            throw new Error(`Error al consultar estudiantes: ${error.message}`)
        }

        return data as StudentRow[]
    }        

    async updateDetail(studentId: number, detail: string): Promise<void> {
       const supabase = getSupabaseClient() // Aquí se asume que el cliente ya tiene el JWT con los claims necesarios para RLS

        //vector de ataque
        //X', "name" = 'Hackeado' WHERE 1=1; --
        const { error } = await supabase.rpc('actualizar_descripcion_segura', {
          p_estudiante_id: studentId,
        p_nueva_descripcion: detail
 });

        if (error) {
            throw new Error(`Error al actualizar detalle del estudiante: ${error.message}`)
       }
  }   
}
