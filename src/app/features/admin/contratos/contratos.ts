import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contratos.html',
  styleUrls: ['./contratos.css']
})
export class ContratosComponent {
  // Estado para verificar si es móvil
  isDesktop = true;

  // Estado para la ventanita de ayuda
  showHelpPopover = false;

  // Estado para la pestaña de información seleccionada
  selectedTab = signal<number>(1);

  // Mock data de contratos para la lista
  contratos = signal<any[]>([]);

  constructor() {
    this.checkScreenSize();
    this.generarMockData();
  }

  generarMockData() {
    const bases = [
      {
        nombre: 'Luciano Ruete C.',
        direccion: 'Sobremonte 561, Quinta Sección, Ciudad. - Capital...',
        tel: '26168414865',
        tel2: '+54261694988989898989',
        email: 'luciano.ruete@gmail.com',
        server: 'server',
        fact_numero: '12312312312',
        fact_tipo: 'Responsable Inscripto',
        fact_region: 'Argentina (A)'
      },
      {
        nombre: 'Leonardo Pablo Salas',
        direccion: 'Unnamed Road 477 - Capital - Mendoza',
        tel: '+54 261 612-5187',
        tel2: '',
        email: 'lsalas@sequre.com.ar',
        server: 'Webex X',
        fact_numero: '33333333333',
        fact_tipo: 'Fantasia',
        fact_region: 'Comprobante'
      },
      {
        nombre: 'Sebastian Saieg',
        direccion: 'Avenida Bartolomé Mitre 617 - Capital - Mendoza',
        tel: '1234556',
        tel2: '',
        email: 'ssaieg@wispro.co',
        server: 'DORREGO',
        fact_numero: '',
        fact_tipo: 'Fantasia',
        fact_region: 'Comprobante'
      }
    ];

    const generados = [];
    for (let i = 1; i <= 20; i++) {
      const base = bases[i % bases.length];
      generados.push({
        id: i,
        nombre: `${base.nombre} ${i > 3 ? i : ''}`,
        direccion: base.direccion,
        fecha: `${i < 10 ? '0'+i : i}/11/2026`,
        tel: base.tel,
        tel2: base.tel2,
        email: base.email,
        server: base.server,
        fact_numero: base.fact_numero,
        fact_tipo: base.fact_tipo,
        fact_region: base.fact_region,
        selected: i === 1 // Solo el primero seleccionado
      });
    }
    this.contratos.set(generados);
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    // Si la pantalla es menor a 1024px (tablets verticales/móviles), no mostramos la app compleja
    this.isDesktop = window.innerWidth >= 1024;
  }

  toggleHelp() {
    this.showHelpPopover = !this.showHelpPopover;
  }

  selectContrato(id: number) {
    this.contratos.update(list => list.map(c => ({
      ...c,
      selected: c.id === id
    })));
  }

  setTab(tabIndex: number) {
    this.selectedTab.set(tabIndex);
  }
}
