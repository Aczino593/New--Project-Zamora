-- 1. Extensiones necesarias (para generar UUIDs automáticos)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Creación de tipos ENUM (Listas fijas de opciones)
DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('ADMIN', 'DIRECTIVO', 'PRECEPTOR', 'DOCENTE', 'TUTOR', 'ALUMNO');
    CREATE TYPE ciclo_estudiante AS ENUM ('TRONCO_COMUN', 'INFORMATICA', 'AUTOMOTOR');
    CREATE TYPE estado_estudiante AS ENUM ('ACTIVO', 'EGRESADO', 'REPITENTE', 'BAJA');
    CREATE TYPE tipo_sancion AS ENUM ('LLAMADO_ATENCION', 'AMONESTACION', 'SUSPENSION', 'EXPULSION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Tabla: persona
CREATE TABLE IF NOT EXISTS persona (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dni INT UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    genero VARCHAR(50),
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(150) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla: cuenta_usuario
CREATE TABLE IF NOT EXISTS cuenta_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID REFERENCES persona(id) ON DELETE CASCADE,
    username VARCHAR(20) UNIQUE NOT NULL, -- Aquí irá el DNI
    password_temp VARCHAR(255),
    rol rol_usuario NOT NULL,
    autorizacion_reseteo BOOLEAN DEFAULT FALSE,
    requiere_cambio_clave BOOLEAN DEFAULT TRUE,
    ultima_conexion TIMESTAMP WITH TIME ZONE
);

-- 5. Tabla: estudiante_perfil
CREATE TABLE IF NOT EXISTS estudiante_perfil (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID REFERENCES persona(id) ON DELETE CASCADE,
    legajo VARCHAR(50) UNIQUE NOT NULL,
    anio_cursada SMALLINT CHECK (anio_cursada BETWEEN 1 AND 6),
    especialidad ciclo_estudiante DEFAULT 'TRONCO_COMUN',
    estado estado_estudiante DEFAULT 'ACTIVO',
    apto_fisico_vence DATE,
    archivado_en TIMESTAMP WITH TIME ZONE -- Para borrado lógico
);

-- 6. Tabla: tutor_perfil
CREATE TABLE IF NOT EXISTS tutor_perfil (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID REFERENCES persona(id) ON DELETE CASCADE,
    info_laboral TEXT
);

-- 7. Tabla intermedia: vinculo_estudiante_tutor (N:M)
CREATE TABLE IF NOT EXISTS vinculo_estudiante_tutor (
    estudiante_id UUID REFERENCES estudiante_perfil(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutor_perfil(id) ON DELETE CASCADE,
    parentesco VARCHAR(50),
    es_responsable_legal BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (estudiante_id, tutor_id)
);

-- 8. Tabla: sancion_disciplinaria
CREATE TABLE IF NOT EXISTS sancion_disciplinaria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID REFERENCES estudiante_perfil(id) ON DELETE CASCADE,
    tipo tipo_sancion NOT NULL,
    descripcion TEXT,
    fecha_sancion DATE DEFAULT CURRENT_DATE,
    cantidad_puntos SMALLINT DEFAULT 1
);