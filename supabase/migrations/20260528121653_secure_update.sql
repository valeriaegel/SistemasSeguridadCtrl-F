-- Eliminamos la función vulnerable
DROP FUNCTION IF EXISTS actualizar_descripcion_vulnerable(int, text);

CREATE OR REPLACE FUNCTION actualizar_descripcion_segura(
    p_estudiante_id int,
    p_nueva_descripcion text
)
RETURNS boolean AS $$
BEGIN
    UPDATE students
       SET detail     = p_nueva_descripcion,
           updated_at = NOW()
     WHERE id = p_estudiante_id;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

