-- =============================================================================
-- SECCIÓN 1: TIPOS DE DATOS PERSONALIZADOS (ENUMS)
-- Definimos las opciones fijas para asegurar la integridad de los datos.
-- =============================================================================
DO $$ BEGIN
    -- Para diferenciar materias técnicas de teoría
    CREATE TYPE tipo_materia AS ENUM ('TEORIA', 'TALLER', 'EDUCACION_FISICA');
    
    -- Para el "Classroom": Qué tipo de publicación hace el docente
    CREATE TYPE tipo_contenido AS ENUM ('TAREA', 'MATERIAL_ESTUDIO', 'ANUNCIO');
    
    -- Para el registro de presencialidad
    CREATE TYPE estado_asistencia AS ENUM ('PRESENTE', 'AUSENTE', 'TARDE', 'JUSTIFICADO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- SECCIÓN 2: ESTRUCTURA DOCENTE Y MATERIAS
-- Vinculamos a los profesores con sus especialidades y creamos el catálogo de materias.
-- =============================================================================

-- Tabla: docente_perfil
-- Extiende los datos de 'persona' para el personal que dicta clases.
CREATE TABLE IF NOT EXISTS docente_perfil (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID REFERENCES persona(id) ON DELETE CASCADE,
    legajo_docente VARCHAR(50) UNIQUE NOT NULL,
    titulo_profesional VARCHAR(150),
    es_titular BOOLEAN DEFAULT TRUE,
    estado estado_laboral DEFAULT 'ACTIVO'
);

-- Tabla: materia
-- El catálogo de todas las asignaturas de la escuela técnica.
CREATE TABLE IF NOT EXISTS materia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    tipo tipo_materia DEFAULT 'TEORIA',
    especialidad_tecnica ciclo_estudiante DEFAULT 'TRONCO_COMUN',
    descripcion TEXT
);

-- =============================================================================
-- SECCIÓN 3: ORGANIZACIÓN DE CURSOS (COMISIONES)
-- Aquí definimos los grupos de alumnos (Ej: 4to 3ra Informática).
-- =============================================================================

-- Tabla: comision_curso
-- Representa el aula física y el grupo de alumnos.
CREATE TABLE IF NOT EXISTS comision_curso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    anio SMALLINT NOT NULL,          -- 1 a 6
    division VARCHAR(10) NOT NULL,    -- 1ra, 2da
    turno turno_escolar NOT NULL,
    ciclo_lectivo INT DEFAULT 2026,
    cupo_maximo INT DEFAULT 35,
    UNIQUE (anio, division, turno, ciclo_lectivo) -- Evita duplicar cursos
);

-- =============================================================================
-- SECCIÓN 4: ASIGNACIONES Y VÍNCULOS (EL CORAZÓN DEL SISTEMA)
-- Aquí conectamos docentes con materias, y preceptores con sus cursos.
-- =============================================================================

-- Tabla: clase_asignacion
-- Es el puente: Une un DOCENTE, con una MATERIA en un CURSO específico.
-- Sin esta tabla, el Aula Virtual no sabría qué mostrar.
CREATE TABLE IF NOT EXISTS clase_asignacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    docente_id UUID REFERENCES docente_perfil(id) ON DELETE CASCADE,
    materia_id UUID REFERENCES materia(id) ON DELETE CASCADE,
    curso_id UUID REFERENCES comision_curso(id) ON DELETE CASCADE,
    aula_virtual_activa BOOLEAN DEFAULT TRUE,
    UNIQUE (docente_id, materia_id, curso_id) -- Un docente no puede tener la misma materia dos veces en el mismo curso
);

-- Tabla: asignacion_preceptor
-- Vincula al preceptor (creado en Mod 2) con el curso que debe supervisar.
CREATE TABLE IF NOT EXISTS asignacion_preceptor (
    preceptor_id UUID REFERENCES preceptor_perfil(id) ON DELETE CASCADE,
    curso_id UUID REFERENCES comision_curso(id) ON DELETE CASCADE,
    fecha_inicio DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (preceptor_id, curso_id)
);

-- =============================================================================
-- SECCIÓN 5: REGISTROS ACADÉMICOS (ASISTENCIA Y NOTAS)
-- Datos administrativos diarios y trimestrales.
-- =============================================================================

-- Tabla: asistencia_diaria
CREATE TABLE IF NOT EXISTS asistencia_diaria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID REFERENCES estudiante_perfil(id) ON DELETE CASCADE,
    curso_id UUID REFERENCES comision_curso(id) ON DELETE CASCADE,
    preceptor_id UUID REFERENCES preceptor_perfil(id),
    fecha DATE DEFAULT CURRENT_DATE,
    estado estado_asistencia NOT NULL,
    observacion TEXT
);

-- Tabla: calificacion_trimestral
-- El registro formal para los boletines.
CREATE TABLE IF NOT EXISTS calificacion_trimestral (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID REFERENCES estudiante_perfil(id) ON DELETE CASCADE,
    materia_id UUID REFERENCES materia(id) ON DELETE CASCADE,
    nota_t1 DECIMAL(4,2),
    nota_t2 DECIMAL(4,2),
    nota_t3 DECIMAL(4,2),
    promedio_anual DECIMAL(4,2),
    condicion_final VARCHAR(50) -- Aprobado, Diciembre, Marzo
);

-- =============================================================================
-- SECCIÓN 6: AULA VIRTUAL 
-- Intercambio de materiales y tareas entre docentes y alumnos.
-- =============================================================================

-- Tabla: actividad_material
-- Lo que el profesor publica (PDFs, Videos, Tareas).
CREATE TABLE IF NOT EXISTS actividad_material (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clase_id UUID REFERENCES clase_asignacion(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo tipo_contenido DEFAULT 'MATERIAL_ESTUDIO',
    recursos_urls JSONB, -- Almacena un array de links a archivos en Supabase Storage
    fecha_limite TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: entrega_alumno
-- Lo que el alumno responde o sube como tarea.
CREATE TABLE IF NOT EXISTS entrega_alumno (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actividad_id UUID REFERENCES actividad_material(id) ON DELETE CASCADE,
    estudiante_id UUID REFERENCES estudiante_perfil(id) ON DELETE CASCADE,
    archivo_url TEXT,
    comentario_estudiante TEXT,
    nota_tp DECIMAL(4,2),
    comentario_docente TEXT,
    entregado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (actividad_id, estudiante_id) -- Un alumno solo puede entregar una vez por tarea
);