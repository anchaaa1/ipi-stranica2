import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';

@Component({
    selector: 'app-whiteboard',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './whiteboard.component.html',
    styleUrl: './whiteboard.component.css'
})
export class WhiteboardComponent implements AfterViewInit {
    @ViewChild('tabla') tablaRef!: ElementRef<HTMLCanvasElement>;

    private ctx!: CanvasRenderingContext2D;
    private crta = false;

    boja = '#000000';
    velicinaCetke = 3;
    brise = false;

    emailModalOtvoren = false;
    emailUnos = '';

    ngAfterViewInit(): void {
        const canvas = this.tablaRef.nativeElement;
        this.ctx = canvas.getContext('2d')!;

        canvas.addEventListener('touchstart', (e) => this.pocniCrtanje(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => {
            this.crtaj(e);
            e.preventDefault();
        }, { passive: false });
        canvas.addEventListener('touchend', () => this.zavrsiCrtanje());
    }

    pocniCrtanje(e: MouseEvent | TouchEvent): void {
        this.crta = true;
        this.crtaj(e);
    }

    zavrsiCrtanje(): void {
        this.crta = false;
        this.ctx.beginPath();
    }

    crtaj(e: MouseEvent | TouchEvent): void {
        if (!this.crta) {
            return;
        }

        const canvas = this.tablaRef.nativeElement;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let clientX: number;
        let clientY: number;

        if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            clientX = e.touches[0]?.clientX ?? 0;
            clientY = e.touches[0]?.clientY ?? 0;
        }

        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        this.ctx.lineWidth = this.velicinaCetke;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = this.brise ? '#FEFFFE' : this.boja;

        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    prekidacBrisac(): void {
        this.brise = !this.brise;
    }

    ocistiPlocu(): void {
        const canvas = this.tablaRef.nativeElement;
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    snimiKaoPNG(): void {
        const canvas = this.tablaRef.nativeElement;
        const slika = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = slika;
        link.download = 'moj-crtez.png';
        link.click();
    }

    snimiKaoPDF(): void {
        const canvas = this.tablaRef.nativeElement;
        const pdf = new jsPDF('l', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const sirinaSlike = 297;
        const visinaSlike = (canvas.height * sirinaSlike) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, sirinaSlike, visinaSlike);
        pdf.save('moj-crtez.pdf');
    }

    otvoriEmailModal(): void {
        this.emailModalOtvoren = true;
        this.emailUnos = '';
    }

    zatvoriEmailModal(): void {
        this.emailModalOtvoren = false;
    }

    posaljiEmail(): void {
        const email = this.emailUnos.trim();
        if (email === '') {
            return;
        }

        const subjekt = encodeURIComponent('Moj crtež');
        const tijelo = encodeURIComponent('U prilogu se nalazi moj crtež sa Whiteboard-a.');
        window.location.href = `mailto:${email}?subject=${subjekt}&body=${tijelo}`;

        this.emailModalOtvoren = false;
    }
}