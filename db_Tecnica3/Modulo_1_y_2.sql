
-- CONFIGURACIÓN INICIAL Y ENUMS

DO $$ BEGIN
    -- Roles del sistema y categorías escolares
    CREATE TYPE rol_usuario AS ENUM ('ADMIN', 'DIRECTIVO', 'PRECEPTOR', 'DOCENTE', 'TUTOR', 'ALUMNO');
    CREATE TYPE ciclo_estudiante AS ENUM ('TRONCO_COMUN', 'INFORMATICA', 'AUTOMOTOR');
    CREATE TYPE estado_academico AS ENUM ('ACTIVO', 'EGRESADO', 'REPITENTE', 'BAJA_TEMPORAL', 'EXPULSADO');
    CREATE TYPE tipo_sancion AS ENUM ('LLAMADO_ATENCION', 'AMONESTACION', 'SUSPENSION', 'EXPULSION');
    CREATE TYPE cargo_directivo AS ENUM ('DIRECTOR', 'VICEDIRECTOR', 'JEFE_TALLER', 'SECRETARIO');
    CREATE TYPE turno_escolar AS ENUM ('MAÑANA', 'TARDE', 'VESPERTINO');
    CREATE TYPE estado_laboral AS ENUM ('ACTIVO', 'LICENCIA_MEDICA', 'BAJA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- MÓDULO 1: IDENTIDAD Y ALUMNOS


-- Tabla base para cualquier humano en el sistema.
-- NOTA: El ID no tiene DEFAULT porque lo debe generar e inyectar el backend en Java.
CREATE TABLE IF NOT EXISTS persona (
    id UUID PRIMARY KEY, 
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE RESTRICT, -- Vincula con la credencial de login
    dni INT UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero VARCHAR(50),
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    archivado_en TIMESTAMP WITH TIME ZONE -- Campo para "Borrado Lógico" (Soft Delete)
);

-- Permite que una persona tenga varios roles (Ej: Ser Docente y también Tutor).
CREATE TABLE IF NOT EXISTS usuario_rol (
    persona_id UUID REFERENCES persona(id) ON DELETE RESTRICT,
    rol rol_usuario NOT NULL,
    asignado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (persona_id, rol)
);

-- Datos puramente académicos del alumno.
CREATE TABLE IF NOT EXISTS estudiante_perfil (
    id UUID PRIMARY KEY, 
    persona_id UUID UNIQUE REFERENCES persona(id) ON DELETE RESTRICT,
    legajo VARCHAR(50) UNIQUE NOT NULL,
    anio_cursada SMALLINT CHECK (anio_cursada BETWEEN 1 AND 6),
    especialidad ciclo_estudiante DEFAULT 'TRONCO_COMUN',
    estado estado_academico DEFAULT 'ACTIVO',
    apto_fisico_vence DATE,
    archivado_en TIMESTAMP WITH TIME ZONE
);

-- Datos administrativos del responsable legal.
CREATE TABLE IF NOT EXISTS tutor_perfil (
    id UUID PRIMARY KEY, 
    persona_id UUID UNIQUE REFERENCES persona(id) ON DELETE RESTRICT,
    info_laboral TEXT,
    telefono_emergencia VARCHAR(20),
    archivado_en TIMESTAMP WITH TIME ZONE
);

-- Tabla intermedia: Conecta N alumnos con M tutores.
CREATE TABLE IF NOT EXISTS vinculo_estudiante_tutor (
    estudiante_id UUID REFERENCES estudiante_perfil(id) ON DELETE RESTRICT,
    tutor_id UUID REFERENCES tutor_perfil(id) ON DELETE RESTRICT,
    parentesco VARCHAR(50) NOT NULL,
    es_responsable_legal BOOLEAN DEFAULT FALSE,
    orden_emergencia SMALLINT DEFAULT 1,
    PRIMARY KEY (estudiante_id, tutor_id)
);

-- Registro de disciplina.
CREATE TABLE IF NOT EXISTS sancion_disciplinaria (
    id UUID PRIMARY KEY, 
    estudiante_id UUID REFERENCES estudiante_perfil(id) ON DELETE RESTRICT,
    autoridad_id UUID REFERENCES persona(id) ON DELETE RESTRICT,
    tipo tipo_sancion NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_sancion DATE DEFAULT CURRENT_DATE,
    cantidad_puntos SMALLINT DEFAULT 1,
    activa BOOLEAN DEFAULT TRUE,
    archivado_en TIMESTAMP WITH TIME ZONE
);


-- MÓDULO 2: PERSONAL (DIRECTIVOS Y PRECEPTORES)


-- Perfil para el equipo directivo.
CREATE TABLE IF NOT EXISTS personal_perfil (
    id UUID PRIMARY KEY,
    persona_id UUID UNIQUE REFERENCES persona(id) ON DELETE RESTRICT,
    legajo_personal VARCHAR(50) UNIQUE NOT NULL,
    cargo cargo_directivo NOT NULL,
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    estado estado_laboral DEFAULT 'ACTIVO',
    archivado_en TIMESTAMP WITH TIME ZONE
);

-- Perfil operativo para gestión de aulas.
CREATE TABLE IF NOT EXISTS preceptor_perfil (
    id UUID PRIMARY KEY,
    persona_id UUID UNIQUE REFERENCES persona(id) ON DELETE RESTRICT,
    legajo_preceptor VARCHAR(50) UNIQUE NOT NULL,
    turno_asignado turno_escolar NOT NULL,
    estado estado_laboral DEFAULT 'ACTIVO',
    archivado_en TIMESTAMP WITH TIME ZONE
);


-- AUTOMATIZACIÓN: TRIGGER DE AUTENTICACIÓN

-- Esta función se ejecuta sola cuando Java crea una credencial en auth.users.
-- Extrae los datos del JSON enviado por Java y crea la persona automáticamente.

CREATE OR REPLACE FUNCTION public.procesar_nuevo_usuario_auth()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.persona (id, auth_user_id, dni, nombre, apellido, fecha_nacimiento, genero, direccion, telefono, email)
    VALUES (
        (NEW.raw_user_meta_data->>'java_persona_id')::uuid, 
        NEW.id,
        (NEW.raw_user_meta_data->>'dni')::int,
        NEW.raw_user_meta_data->>'nombre',
        NEW.raw_user_meta_data->>'apellido',
        (NEW.raw_user_meta_data->>'fecha_nacimiento')::date,
        NEW.raw_user_meta_data->>'genero',
        NEW.raw_user_meta_data->>'direccion',
        NEW.raw_user_meta_data->>'telefono',
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enlazar la función al evento INSERT de Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.procesar_nuevo_usuario_auth();


-- MANTENIMIENTO: PURGA DE DATOS OBSOLETOS (10 AÑOS)

-- El backend en Java puede llamar a 'CALL purgar_datos_obsoletos_10_anios();' 
-- una vez al año para limpiar registros archivados.

CREATE OR REPLACE PROCEDURE purgar_datos_obsoletos_10_anios() AS $$
BEGIN
    DELETE FROM vinculo_estudiante_tutor WHERE estudiante_id IN (SELECT id FROM estudiante_perfil WHERE archivado_en < NOW() - INTERVAL '10 years');
    DELETE FROM sancion_disciplinaria WHERE archivado_en < NOW() - INTERVAL '10 years';
    DELETE FROM estudiante_perfil WHERE archivado_en < NOW() - INTERVAL '10 years';
    DELETE FROM tutor_perfil WHERE archivado_en < NOW() - INTERVAL '10 years';
    DELETE FROM personal_perfil WHERE archivado_en < NOW() - INTERVAL '10 years';
    DELETE FROM preceptor_perfil WHERE archivado_en < NOW() - INTERVAL '10 years';
    DELETE FROM usuario_rol WHERE persona_id IN (SELECT id FROM persona WHERE archivado_en < NOW() - INTERVAL '10 years');
    DELETE FROM persona WHERE archivado_en < NOW() - INTERVAL '10 years';
END;
$$ LANGUAGE plpgsql;


-- SEGURIDAD: ROW LEVEL SECURITY (BLOQUEO TOTAL POR DEFECTO)

-- Al activar esto sin crear políticas (Policies), la base de datos devuelve 
-- "403 Forbidden" a cualquier petición pública. Solo el Backend en Java entra.

ALTER TABLE persona ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_rol ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiante_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE vinculo_estudiante_tutor ENABLE ROW LEVEL SECURITY;
ALTER TABLE sancion_disciplinaria ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE preceptor_perfil ENABLE ROW LEVEL SECURITY;