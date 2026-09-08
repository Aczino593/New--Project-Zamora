import { Injectable, signal } from '@angular/core';
import { Course, ClassNotice } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  // Cursos asignados al Estudiante
  readonly studentCourses = signal<Course[]>([
    {
      id: 1,
      nombre: '4° 3° CS',
      year: '4',
      divisionNumber: '3',
      cycle: 'superior',
      specialty: 'Informática',
      professor: 'Prof. Carlos Fernández',
      shift: 'Turno Mañana',
      linkStudents: 'https://institucion.edu/join/43cs-info',
      linkProfessor: 'https://institucion.edu/prof/43cs-info-admin',
      room: 'Aula 12 - Taller Informática'
    },
    {
      id: 2,
      nombre: 'Autogestión Aplicada',
      year: '5',
      divisionNumber: '1',
      cycle: 'superior',
      specialty: 'Automotor',
      professor: 'Prof. Leonardo Salas',
      shift: 'Turno Tarde',
      linkStudents: 'https://institucion.edu/join/autogestion-auto',
      linkProfessor: 'https://institucion.edu/prof/autogestion-admin',
      room: 'Laboratorio de Autogestión'
    },
    {
      id: 3,
      nombre: 'AAT 26',
      year: '4',
      divisionNumber: '2',
      cycle: 'superior',
      specialty: 'Informática',
      professor: 'Prof. Roberto Díaz',
      shift: 'Turno Mañana',
      linkStudents: 'https://institucion.edu/join/aat-26',
      linkProfessor: 'https://institucion.edu/prof/aat-26-admin',
      room: 'Aula 8'
    },
    {
      id: 4,
      nombre: 'Mantenimiento de Software',
      year: '5',
      divisionNumber: '2',
      cycle: 'superior',
      specialty: 'Informática',
      professor: 'Prof. Laura Torres',
      shift: 'Turno Tarde',
      linkStudents: 'https://institucion.edu/join/mant-soft-2026',
      linkProfessor: 'https://institucion.edu/prof/mant-soft-admin',
      room: 'Gabinete 3'
    },
    {
      id: 5,
      nombre: '1ro 1ra CB',
      year: '1',
      divisionNumber: '1',
      cycle: 'basico',
      specialty: '-',
      professor: 'Prof. Silvia Gómez',
      shift: 'Turno Mañana',
      linkStudents: 'https://institucion.edu/join/1ro1ra-cb',
      linkProfessor: 'https://institucion.edu/prof/1ro1ra-admin',
      room: 'Aula 2'
    }
  ]);

  // Materias a cargo del Docente
  readonly teacherCourses = signal<Course[]>([
    {
      id: 1,
      nombre: '4° 3° CS - Programación Web',
      year: '4',
      divisionNumber: '3',
      cycle: 'superior',
      specialty: 'Informática',
      professor: 'Prof. Carlos Fernández',
      shift: 'Turno Mañana',
      linkStudents: 'https://institucion.edu/join/43cs-info',
      linkProfessor: 'https://institucion.edu/prof/43cs-info-admin',
      room: 'Aula 12'
    },
    {
      id: 6,
      nombre: '5° 2° CS - Mantenimiento de Software',
      year: '5',
      divisionNumber: '2',
      cycle: 'superior',
      specialty: 'Informática',
      professor: 'Prof. Carlos Fernández',
      shift: 'Turno Tarde',
      linkStudents: 'https://institucion.edu/join/52cs-mant',
      linkProfessor: 'https://institucion.edu/prof/52cs-mant-admin',
      room: 'Gabinete 2'
    },
    {
      id: 7,
      nombre: '3ro 3ra CS_TM - Informática Aplicada',
      year: '3',
      divisionNumber: '3',
      cycle: 'superior',
      specialty: 'Automotor',
      professor: 'Prof. Carlos Fernández',
      shift: 'Turno Mañana',
      linkStudents: 'https://institucion.edu/join/33cs-info',
      linkProfessor: 'https://institucion.edu/prof/33cs-info-admin',
      room: 'Aula 5'
    }
  ]);

  // Avisos de clases generados por docentes
  readonly classNotices = signal<ClassNotice[]>([
    {
      id: 1,
      courseId: 1,
      title: 'Fecha para la prueba: Algoritmos y Estructuras',
      content: 'Estimados alumnos, el examen del primer trimestre será el viernes 20 de septiembre a las 10:00 hs. Temas: Vectores y Funciones.',
      author: 'Prof. Carlos Fernández',
      date: 'Hace 2 horas',
      type: 'Examen'
    },
    {
      id: 2,
      courseId: 1,
      title: 'Entrega de Trabajo Práctico N° 2',
      content: 'Subir el proyecto comprimido antes del próximo lunes al repositorio institucional.',
      author: 'Prof. Carlos Fernández',
      date: 'Ayer',
      type: 'Tarea'
    },
    {
      id: 3,
      courseId: 2,
      title: 'Material de lectura complementario',
      content: 'Ya se encuentra disponible en secretaría el apunte de mantenimiento de motores paso a paso.',
      author: 'Prof. Leonardo Salas',
      date: 'Hace 3 días',
      type: 'Aviso General'
    }
  ]);

  getCourseById(id: number): Course | undefined {
    return this.studentCourses().find(c => c.id === id) || 
           this.teacherCourses().find(c => c.id === id);
  }

  joinCourseByLinkOrCode(linkOrCode: string, role: 'estudiante' | 'docente'): { success: boolean; message: string; course?: Course } {
    const clean = linkOrCode.trim().toLowerCase();
    if (!clean) {
      return { success: false, message: 'Por favor, introduce un código o enlace válido.' };
    }

    // Comprobar si ya está inscrito
    const currentList = role === 'estudiante' ? this.studentCourses() : this.teacherCourses();
    const alreadyExists = currentList.some(c => 
      c.linkStudents?.toLowerCase().includes(clean) || 
      c.linkProfessor?.toLowerCase().includes(clean) ||
      c.nombre.toLowerCase().includes(clean)
    );

    if (alreadyExists) {
      return { success: false, message: 'Ya te encuentras registrado en esta clase.' };
    }

    // Generar nuevo curso registrado con enlace de preceptoría
    const newId = Date.now();
    const newCourse: Course = {
      id: newId,
      nombre: clean.includes('auto') ? '5° 1° CS Automotor' : '3° 1° CS - Telecomunicaciones',
      year: '3',
      divisionNumber: '1',
      cycle: 'superior',
      specialty: clean.includes('auto') ? 'Automotor' : 'Informática',
      professor: role === 'docente' ? 'Prof. Carlos Fernández' : 'Prof. Juan Carlos López',
      shift: 'Turno Mañana',
      linkStudents: `https://institucion.edu/join/${newId}`,
      linkProfessor: `https://institucion.edu/prof/${newId}`,
      room: 'Aula Taller'
    };

    if (role === 'estudiante') {
      this.studentCourses.update(list => [newCourse, ...list]);
    } else {
      this.teacherCourses.update(list => [newCourse, ...list]);
    }

    return { 
      success: true, 
      message: role === 'estudiante' 
        ? '¡Te has unido a la clase exitosamente!' 
        : '¡Materia vinculada con permisos completos de docente!', 
      course: newCourse 
    };
  }

  addNotice(notice: Omit<ClassNotice, 'id' | 'date'>): void {
    const newNotice: ClassNotice = {
      ...notice,
      id: Date.now(),
      date: 'Recién'
    };
    this.classNotices.update(list => [newNotice, ...list]);
  }
}
