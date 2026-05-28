-- Habilitar la extensión oficial de auditoría de PostgreSQL
CREATE EXTENSION IF NOT EXISTS pgaudit;

-- Crear la tabla donde se guardará el historial de modificaciones
CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name text NOT NULL,
    action text NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    record_id text,
    old_data jsonb, -- El estado de la fila ANTES del cambio
    new_data jsonb, -- El estado de la fila DESPUÉS del cambio
    clerk_user_id text, -- El ID del usuario que hizo el cambio
    created_at timestamptz DEFAULT now()
);

-- Proteger la tabla de auditoría con RLS (Solo lectura, y solo para administradores)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo admins pueden ver logs" ON audit_logs;
CREATE POLICY "Solo admins pueden ver logs"
ON audit_logs FOR SELECT TO authenticated
USING ((auth.jwt() ->> 'user_role') = 'admin');

-- Crear la función del Trigger que interceptará los cambios
CREATE OR REPLACE FUNCTION log_table_changes()
RETURNS trigger AS $$
DECLARE
    v_clerk_id text;
BEGIN
    -- Intentar extraer automáticamente el ID de Clerk desde el token de Supabase (sub)
    v_clerk_id := auth.jwt() ->> 'sub';

    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, action, record_id, new_data, clerk_user_id)
        VALUES (TG_TABLE_NAME, TG_OP, NEW.id::text, row_to_json(NEW)::jsonb, v_clerk_id);
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Solo registrar si realmente hubo un cambio en los datos
        IF row_to_json(OLD)::jsonb != row_to_json(NEW)::jsonb THEN
            INSERT INTO audit_logs (table_name, action, record_id, old_data, new_data, clerk_user_id)
            VALUES (TG_TABLE_NAME, TG_OP, NEW.id::text, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, v_clerk_id);
        END IF;
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, action, record_id, old_data, clerk_user_id)
        VALUES (TG_TABLE_NAME, TG_OP, OLD.id::text, row_to_json(OLD)::jsonb, v_clerk_id);
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asociar el Trigger a la tabla 'students'
-- Se ejecutará automáticamente después de cualquier inserción, actualización o borrado
DROP TRIGGER IF EXISTS audit_students_changes ON students;

CREATE TRIGGER audit_students_changes
AFTER INSERT OR UPDATE OR DELETE ON students
FOR EACH ROW EXECUTE FUNCTION log_table_changes();