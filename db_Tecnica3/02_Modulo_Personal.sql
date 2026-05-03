-- 1. Tipos ENUM para el Personal
DO $$ BEGIN
    CREATE TYPE cargo_directivo AS ENUM ('DIRECTOR', 'VICEDIRECTOR', 'JEFE_TALLER');
    CREATE TYPE turno_escolar AS ENUM ('MAÑANA', 'TARDE', 'VESPERTINO');
    CREATE TYPE estado_laboral AS ENUM ('ACTIVO', 'LICENCIA', 'BAJA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tabla: personal_perfil (Para Directivos)
CREATE TABLE IF NOT EXISTS personal_perfil (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID REFERENCES persona(id) ON DELETE CASCADE,
    legajo_personal VARCHAR(50) UNIQUE NOT NULL,
    cargo cargo_directivo NOT NULL,
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    estado estado_laboral DEFAULT 'ACTIVO'
);

-- 3. Tabla: preceptor_perfil
CREATE TABLE IF NOT EXISTS preceptor_perfil (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID REFERENCES persona(id) ON DELETE CASCADE,
    legajo_preceptor VARCHAR(50) UNIQUE NOT NULL,
    turno_asignado turno_escolar NOT NULL,
    estado estado_laboral DEFAULT 'ACTIVO'
);

