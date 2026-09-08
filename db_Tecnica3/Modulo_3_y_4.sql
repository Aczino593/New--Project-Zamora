
-- CONFIGURACIÓN DE TIPOS Y ENUMS

DO $$ BEGIN
    -- Diferencia materias de aula, de taller o físicas
    CREATE TYPE tipo_materia AS ENUM ('TEORIA', 'TALLER', 'EDUCACION_FISICA');
    -- Clasifica lo que el profesor publica en el Aula Virtual
    CREATE TYPE tipo_contenido AS ENUM ('TAREA', 'MATERIAL_ESTUDIO', 'ANUNCIO');
    -- Estados posibles para el pase de lista del preceptor
    CREATE TYPE estado_asistencia AS ENUM ('PRESENTE', 'AUSENTE', 'TARDE', 'JUSTIFICADO');
    -- Días hábiles para la agenda escolar
    CREATE TYPE turno_escolar_dias AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO');
    -- Estado final del alumno en la materia al cerrar el año
    CREATE TYPE condicion_materia AS ENUM ('APROBADO', 'REGULAR', 'DICIEMBRE', 'MARZO', 'RECURSA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- MÓDULO 3: ACADÉMICO Y AULA VIRTUAL (IDs controlados por Java)


-- 1. PERFIL DOCENTE
-- Extensión de la tabla persona para quienes dictan clases.
CREATE TABLE IF NOT EXISTS docente_perfil (
    id UUID PRIMARY KEY, -- Generado por Java
    persona_id UUID UNIQUE REFERENCES persona(id) ON DELETE RESTRICT,
    legajo_docente VARCHAR(50) UNIQUE NOT NULL,
    titulo_profesional VARCHAR(150),
    es_titular BOOLEAN DEFAULT TRUE,
    estado estado_laboral DEFAULT 'ACTIVO',
    archivado_en TIMESTAMP WITH TIME ZONE
);

-- 2. CATÁLOGO DE MATERIAS
-- Define las asignaturas que se dictan en la institución.
CREATE TABLE IF NOT EXISTS materia (
    id UUID PRIMARY KEY, -- Generado por Java
    nombre VARCHAR(100) NOT NULL,
    tipo tipo_materia DEFAULT 'TEORIA',
    especialidad_tecnica ciclo_estudiante DEFAULT 'TRONCO_COMUN',
    descripcion TEXT,
    archivado_en TIMESTAMP WITH TIME ZONE
);

-- 3. COMISIONES Y CURSOS
-- Representa el aula física y el grupo (Ej: 4to 1ra Informática 2026).
CREATE TABLE IF NOT EXISTS comision_curso (
    id UUID PRIMARY KEY, -- Generado por Java
    anio SMALLINT NOT NULL,          
    division VARCHAR(10) NOT NULL,    
    turno turno_escolar NOT NULL,
    ciclo_lectivo INT NOT NULL,
    cupo_maximo INT DEFAULT 35,
    archivado_en TIMESTAMP WITH TIME ZONE,
    UNIQUE (anio, division, turno, ciclo_lectivo) -- Evita duplicar el mismo curso en el mismo año
);

-- 4. INSCRIPCIÓN DE ALUMNOS (VITAL)
-- Relaciona a los alumnos con su curso actual.
CREATE TABLE IF NOT EXISTS inscripcion_alumno (
    id UUID PRIMARY KEY, -- Generado por Java
    estudiante_id UUID REFERENCES estudiante_perfil(id) ON DELETE RESTRICT,
    curso_id UUID REFERENCES comision_curso(id) ON DELETE RESTRICT,
    fecha_inscripcion DATE DEFAULT CURRENT_DATE,
    estado VARCHAR(20) DEFAULT 'REGULAR',
    UNIQUE (estudiante_id, curso_id) -- Un alumno no puede estar inscrito dos veces en el mismo curso
);

-- 5. ASIGNACIÓN DE PRECEPTORES
-- Define qué preceptor controla las asistencias de qué curso.
CREATE TABLE IF NOT EXISTS asignacion_preceptor (
    preceptor_id UUID REFERENCES preceptor_perfil(id) ON DELETE RESTRICT,
    curso_id UUID REFERENCES comision_curso(id) ON DELETE RESTRICT,
    fecha_inicio DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (preceptor_id, curso_id)
);

-- 6. ASIGNACIÓN DE CLASES (EL PUENTE DEL SISTEMA)
-- Define qué Docente dicta qué Materia en qué Curso. Habilita el Aula Virtual.
CREATE TABLE IF NOT EXISTS clase_asignacion (
    id UUID PRIMARY KEY, -- Generado por Java
    docente_id UUID REFERENCES docente_perfil(id) ON DELETE RESTRICT,
    materia_id UUID REFERENCES materia(id) ON DELETE RESTRICT,
    curso_id UUID REFERENCES comision_curso(id) ON DELETE RESTRICT,
    aula_virtual_activa BOOLEAN DEFAULT TRUE,
    archivado_en TIMESTAMP WITH TIME ZONE,
    UNIQUE (docente_id, materia_id, curso_id)
);

-- 7. ASISTENCIA DIARIA
-- Registro cargado por los preceptores diariamente.
CREATE TABLE IF NOT EXISTS asistencia_diaria (
    id UUID PRIMARY KEY, -- Generado por Java
    estudiante_id UUID REFERENCES estudiante_perfil(id) ON DELETE RESTRICT,
    curso_id UUID REFERENCES comision_curso(id) ON DELETE RESTRICT,
    preceptor_id UUID REFERENCES preceptor_perfil(id) ON DELETE RESTRICT,
    fecha DATE DEFAULT CURRENT_DATE,
    estado estado_asistencia NOT NULL,
    observacion TEXT
);

-- 8. CALIFICACIONES TRIMESTRALES
-- Registro formal de notas para el boletín oficial.
CREATE TABLE IF NOT EXISTS calificacion_trimestral (
    id UUID PRIMARY KEY, -- Generado por Java
    estudiante_id UUID REFERENCES estudiante_perfil(id) ON DELETE RESTRICT,
    materia_id UUID REFERENCES materia(id) ON DELETE RESTRICT,
    nota_t1 DECIMAL(4,2),
    nota_t2 DECIMAL(4,2),
    nota_t3 DECIMAL(4,2),
    promedio_anual DECIMAL(4,2),
    condicion_final condicion_materia
);

-- 9. AULA VIRTUAL: MATERIALES Y TAREAS
-- Publicaciones del docente para sus alumnos.
CREATE TABLE IF NOT EXISTS actividad_material (
    id UUID PRIMARY KEY, -- Generado por Java
    clase_id UUID REFERENCES clase_asignacion(id) ON DELETE RESTRICT,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo tipo_contenido DEFAULT 'MATERIAL_ESTUDIO',
    recursos_urls JSONB, -- Almacena array de links del Storage. Java debe gestionar su borrado físico.
    fecha_limite TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    archivado_en TIMESTAMP WITH TIME ZONE
);

-- 10. AULA VIRTUAL: ENTREGAS DE ALUMNOS
-- Respuestas y archivos subidos por los estudiantes.
CREATE TABLE IF NOT EXISTS entrega_alumno (
    id UUID PRIMARY KEY, -- Generado por Java
    actividad_id UUID REFERENCES actividad_material(id) ON DELETE RESTRICT,
    estudiante_id UUID REFERENCES estudiante_perfil(id) ON DELETE RESTRICT,
    archivo_url TEXT, -- Link al archivo subido.
    comentario_estudiante TEXT,
    nota_tp DECIMAL(4,2),
    comentario_docente TEXT,
    entregado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (actividad_id, estudiante_id) -- Impide que un alumno entregue dos veces el mismo TP
);


-- MÓDULO 4: HORARIOS E INFRAESTRUCTURA


-- 11. ESPACIOS FÍSICOS
-- Registro de aulas, laboratorios y talleres para evitar choques logísticos.
CREATE TABLE IF NOT EXISTS espacio_fisico (
    id UUID PRIMARY KEY, -- Generado por Java
    nombre VARCHAR(100) UNIQUE NOT NULL, 
    tipo_espacio tipo_materia NOT NULL,  
    capacidad_estimada INT,              
    ubicacion_sector VARCHAR(100),       
    esta_disponible BOOLEAN DEFAULT TRUE,
    archivado_en TIMESTAMP WITH TIME ZONE
);

-- 12. HORARIOS DE CLASES
-- La agenda escolar semanal.
CREATE TABLE IF NOT EXISTS horario_clase (
    id UUID PRIMARY KEY, -- Generado por Java
    clase_id UUID REFERENCES clase_asignacion(id) ON DELETE RESTRICT,
    espacio_id UUID REFERENCES espacio_fisico(id) ON DELETE RESTRICT,
    dia_semana turno_escolar_dias, 
    hora_inicio TIME NOT NULL,      
    hora_fin TIME NOT NULL,         
    UNIQUE (espacio_id, dia_semana, hora_inicio) -- Un espacio físico no puede ser ocupado por 2 clases a la misma hora
);


-- PROCEDIMIENTO MAESTRO DE PURGA DE 10 AÑOS (MÓDULOS 1 AL 4)
-- IMPORTANTE PARA JAVA: Este procedimiento SOLO borra filas. Java debe eliminar 
-- los archivos físicos del Storage ANTES de llamar a este procedimiento.


CREATE OR REPLACE PROCEDURE purgar_datos_obsoletos_10_anios() AS $$
BEGIN
    -- FASE 1: BORRADO DE REGISTROS ACADÉMICOS (MÓDULOS 3 Y 4)
    DELETE FROM entrega_alumno WHERE entregado_at < NOW() - INTERVAL '10 years';
    DELETE FROM actividad_material WHERE created_at < NOW() - INTERVAL '10 years';
    DELETE FROM horario_clase WHERE clase_id IN (SELECT id FROM clase_asignacion WHERE archivado_en < NOW() - INTERVAL '10 years');
    DELETE FROM asistencia_diaria WHERE fecha < NOW() - INTERVAL '10 years';
    DELETE FROM calificacion_trimestral WHERE estudiante_id IN (SELECT id FROM estudiante_perfil WHERE archivado_en < NOW() - INTERVAL '10 years');
    DELETE FROM clase_asignacion WHERE archivado_en < NOW() - INTERVAL '10 years';
    DELETE FROM asignacion_preceptor WHERE curso_id IN (SELECT id FROM comision_curso WHERE archivado_en < NOW() - INTERVAL '10 years');
    DELETE FROM inscripcion_alumno WHERE fecha_inscripcion < NOW() - INTERVAL '10 years';
    DELETE FROM comision_curso WHERE archivado_en < NOW() - INTERVAL '10 years';
    DELETE FROM materia WHERE archivado_en < NOW() - INTERVAL '10 years';
    DELETE FROM espacio_fisico WHERE archivado_en < NOW() - INTERVAL '10 years';

    -- FASE 2: BORRADO DE PERFILES E IDENTIDAD (MÓDULOS 1 Y 2)
    DELETE FROM vinculo_estudiante_tutor WHERE estudiante_id IN (SELECT id FROM estudiante_perfil WHERE archivado_en < NOW() - INTERVAL '10 years');
    DELETE FROM sancion_disciplinaria WHERE archivado_en < NOW() - INTERVAL '10 years';
    DELETE FROM estudiante_perfil WHERE archivado_en < NOW() - INTERVAL '10 years';
    DELETE FROM tutor_perfil WHERE archivado_en < NOW() - INTERVAL '10 years';
    DELETE FROM docente_perfil WHERE archivado_en < NOW() - INTERVAL '10 years';
    DELETE FROM personal_perfil WHERE archivado_en < NOW() - INTERVAL '10 years';
    DELETE FROM preceptor_perfil WHERE archivado_en < NOW() - INTERVAL '10 years';
    DELETE FROM usuario_rol WHERE persona_id IN (SELECT id FROM persona WHERE archivado_en < NOW() - INTERVAL '10 years');
    DELETE FROM persona WHERE archivado_en < NOW() - INTERVAL '10 years';
END;
$$ LANGUAGE plpgsql;


-- SEGURIDAD ZERO-TRUST: ROW LEVEL SECURITY (RLS)
-- Al no crear políticas de acceso, bloqueamos cualquier petición pública.
-- Solo Java puede acceder utilizando su credencial privilegiada (service_role).


ALTER TABLE docente_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE materia ENABLE ROW LEVEL SECURITY;
ALTER TABLE comision_curso ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripcion_alumno ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignacion_preceptor ENABLE ROW LEVEL SECURITY;
ALTER TABLE clase_asignacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencia_diaria ENABLE ROW LEVEL SECURITY;
ALTER TABLE calificacion_trimestral ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividad_material ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrega_alumno ENABLE ROW LEVEL SECURITY;
ALTER TABLE espacio_fisico ENABLE ROW LEVEL SECURITY;
ALTER TABLE horario_clase ENABLE ROW LEVEL SECURITY;