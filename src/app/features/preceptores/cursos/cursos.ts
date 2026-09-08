import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

type TabType = 'asistencia' | 'materias';
type AttendanceState = 'presente' | 'ausente' | 'justificado' | 'no_marcado';

interface Student {
  id: number;
  name: string;
  avatar: string;
}

interface AttendanceRecord {
  studentId: number;
  state: AttendanceState;
  justificationText?: string;
  justificationFile?: string;
}

interface Subject {
  id: number;
  name: string;
  division: string;
  specialty: string;
  shift: string;
  schedule: string;
  professorName: string;
  linkProfessor: string;
  linkStudents: string;
}

@Component({
  selector: 'app-curso-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cursos.html',
  styleUrls: ['./cursos.css']
})
export class CursoDetalleComponent {
  private route = inject(ActivatedRoute);

  courseId = this.route.snapshot.paramMap.get('id');
  currentTab = signal<TabType>('asistencia');
  
  // Hero Info
  courseInfo = {
    name: '4° 3°',
    cycle: 'Ciclo Superior',
    specialty: 'Informática',
    shift: 'Turno Mañana'
  };

  // --- MÓDULO DE ASISTENCIA ---
  attendanceDate = signal<string>(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  isAttendanceSaved = signal<boolean>(false);
  
  students = signal<Student[]>(Array.from({length: 30}, (_, i) => ({
    id: i + 1,
    name: `Estudiante Apellido ${i + 1}`,
    avatar: `https://i.pravatar.cc/150?u=${i + 1}`
  })));

  // Record actual de asistencia que se está editando en la tabla
  attendanceList = signal<AttendanceRecord[]>(this.students().map(s => ({
    studentId: s.id,
    state: 'no_marcado'
  })));

  // Modal de justificación
  isJustifyModalOpen = signal(false);
  justifyingStudent = signal<AttendanceRecord | null>(null);
  justifyText = signal('');
  justifyFileName = signal<string | null>(null);

  // --- MÓDULO DE MATERIAS ---
  subjects = signal<Subject[]>([]);
  isSubjectModalOpen = signal(false);
  
  newSubject = signal({
    name: '',
    division: 'Ciclo Superior',
    specialty: 'Informática',
    shift: 'Mañana',
    scheduleStart: '07:30',
    scheduleEnd: '09:30',
    professorSearch: ''
  });

  // Generación de links de éxito
  newLinks = signal<{prof: string, student: string} | null>(null);

  // Funciones de Pestañas
  setTab(tab: TabType) {
    this.currentTab.set(tab);
  }

  // --- FUNCIONES DE ASISTENCIA ---
  setAttendance(studentId: number, state: AttendanceState) {
    if (this.isAttendanceSaved()) {
      // Si ya está guardada y es ausente/justificado, permitir edición abriendo modal
      const record = this.attendanceList().find(r => r.studentId === studentId);
      if (record && (record.state === 'ausente' || record.state === 'justificado') && (state === 'justificado' || state === 'presente')) {
        this.openJustifyModal(record, state);
      }
      return;
    }

    // Modo normal antes de guardar
    const newList = this.attendanceList().map(r => 
      r.studentId === studentId ? { ...r, state } : r
    );
    this.attendanceList.set(newList);
  }

  saveAttendance() {
    // Validar que todos estén marcados
    const unMarked = this.attendanceList().some(r => r.state === 'no_marcado');
    if (unMarked) {
      alert("Faltan alumnos por marcar.");
      return;
    }
    this.isAttendanceSaved.set(true);
    alert("Asistencia guardada exitosamente. Ya no se puede modificar a menos que sea justificar una falta.");
  }

  // Modal Justificar
  openJustifyModal(record: AttendanceRecord, targetState: AttendanceState) {
    this.justifyingStudent.set({...record, targetState} as any);
    this.justifyText.set(record.justificationText || '');
    this.justifyFileName.set(record.justificationFile || null);
    this.isJustifyModalOpen.set(true);
  }

  closeJustifyModal() {
    this.isJustifyModalOpen.set(false);
    this.justifyingStudent.set(null);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.justifyFileName.set(file.name);
    }
  }

  confirmJustification() {
    const student = this.justifyingStudent() as any;
    if (!student) return;

    const newList = this.attendanceList().map(r => {
      if (r.studentId === student.studentId) {
        return { 
          ...r, 
          state: student.targetState, // Pasa a Justificado o Presente
          justificationText: this.justifyText(),
          justificationFile: this.justifyFileName() || undefined
        };
      }
      return r;
    });

    this.attendanceList.set(newList);
    this.closeJustifyModal();
  }

  // --- FUNCIONES DE MATERIAS ---
  openSubjectModal() {
    this.newLinks.set(null);
    this.isSubjectModalOpen.set(true);
  }

  closeSubjectModal() {
    this.isSubjectModalOpen.set(false);
  }

  createSubject() {
    const s = this.newSubject();
    if (!s.name || !s.professorSearch) {
      alert("Llena los campos requeridos (Nombre y Profesor)");
      return;
    }

    const created: Subject = {
      id: Date.now(),
      name: s.name,
      division: s.division,
      specialty: s.specialty,
      shift: s.shift,
      schedule: `${s.scheduleStart} - ${s.scheduleEnd}`,
      professorName: s.professorSearch, // simulado
      linkProfessor: `https://institucion.edu/prof/${Date.now()}`,
      linkStudents: `https://institucion.edu/join/${Date.now()}`
    };

    this.subjects.set([...this.subjects(), created]);
    this.newLinks.set({ prof: created.linkProfessor, student: created.linkStudents });
    
    // Limpiar formulario para el próximo
    this.newSubject.set({
      name: '',
      division: 'Ciclo Superior',
      specialty: 'Informática',
      shift: 'Mañana',
      scheduleStart: '07:30',
      scheduleEnd: '09:30',
      professorSearch: ''
    });
  }

  deleteSubject(id: number) {
    if(confirm("¿Estás seguro de eliminar esta materia?")) {
      this.subjects.set(this.subjects().filter(s => s.id !== id));
    }
  }
}
