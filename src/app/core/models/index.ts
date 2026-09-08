export type UserRole = 'estudiante' | 'docente' | 'tutor' | 'preceptor' | 'admin';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  dni: string;
  role: UserRole;
  avatar: string;
  isDelegado?: boolean;
  delegadoRole?: 'Delegado' | 'Subdelegado' | 'Ninguno';
  gender?: string;
  birthYear?: string;
  location?: string;
  address?: string;
  specialty?: string;
  phone?: string;
  // Campos para estudiantes/tutores
  course?: string;
  turno?: string;
  tutorName?: string;
  studentUnderCare?: string;
}

export interface Course {
  id: number;
  nombre: string;
  year: string;
  divisionNumber: string;
  cycle: 'basico' | 'superior';
  specialty: string;
  professor?: string;
  shift?: string;
  linkStudents?: string;
  linkProfessor?: string;
  color?: string;
  room?: string;
}

export interface ClassNotice {
  id: number;
  courseId: number;
  title: string;
  content: string;
  author: string;
  date: string;
  type: 'Examen' | 'Tarea' | 'Aviso General';
}

export interface NewsCarouselItem {
  id: number;
  tag: string;
  title: string;
  description: string;
  bgClass: string;
  imageUrl: string | null;
  type?: 'INSTITUCIONAL' | 'EVENTO';
}
