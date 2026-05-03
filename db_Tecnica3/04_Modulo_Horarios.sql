-- =============================================================================
-- 1. PRIMERO CREAMOS EL TIPO DE DATO (ENUM)
-- Debemos definir los días antes de usarlos en cualquier tabla.
-- =============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'turno_escolar_dias') THEN
        CREATE TYPE turno_escolar_dias AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO');
    END IF;
END $$;
-- =============================================================================
-- SECCIÓN 1: INFRAESTRUCTURA (EL ESPACIO)
-- Definimos los lugares físicos donde se dictan las clases.
-- =============================================================================

-- Tabla: espacio_fisico
-- Registro de aulas, laboratorios y talleres.
CREATE TABLE IF NOT EXISTS espacio_fisico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) UNIQUE NOT NULL, -- Ej: 'Taller de Ajuste', 'Aula 5'
    tipo_espacio tipo_materia NOT NULL,  -- Usamos el ENUM del Mod 3 (Teoría/Taller)
    capacidad_estimada INT,              -- Útil para no sobrecargar aulas
    ubicacion_sector VARCHAR(100),       -- Ej: 'Planta Alta', 'Sector Talleres'
    esta_disponible BOOLEAN DEFAULT TRUE
);

-- =============================================================================
-- SECCIÓN 2: CRONOGRAMA (EL TIEMPO)
-- Aquí es donde los preceptores definen la agenda semanal.
-- =============================================================================

-- Tabla: horario_clase
-- Vincula la clase (profe/materia/curso) con un lugar y un horario específico.
CREATE TABLE IF NOT EXISTS horario_clase (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clase_id UUID REFERENCES clase_asignacion(id) ON DELETE CASCADE,
    espacio_id UUID REFERENCES espacio_fisico(id) ON DELETE CASCADE,
    dia_semana turno_escolar_dias, -- Ver nota abajo sobre este nuevo ENUM
    hora_inicio TIME NOT NULL,      -- Formato HH:MM
    hora_fin TIME NOT NULL,         -- Formato HH:MM
    
    -- REGLA DE INTEGRIDAD: Evita que un curso tenga dos materias al mismo tiempo
    -- y que un profesor sea asignado a dos lugares distintos a la misma hora.
    -- Nota: La lógica de superposición compleja se maneja mejor en el Backend,
    -- pero este índice evita duplicados exactos.
    UNIQUE (espacio_id, dia_semana, hora_inicio)
);