import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Kolona {
    status: string;
    naslov: string;
    zadaci: string[];
}

@Component({
    selector: 'app-kanban',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './kanban.component.html',
    styleUrl: './kanban.component.css'
})
export class KanbanComponent {
    kolone: Kolona[] = [
        { status: 'todo', naslov: 'To do', zadaci: [] },
        { status: 'progress', naslov: 'In Progress', zadaci: [] },
        { status: 'done', naslov: 'Done', zadaci: [] },
    ];

    private prevuceniZadatak: { status: string; indeks: number } | null = null;

    taskModalOtvoren = false;
    noviZadatak = '';

    clearModalOtvoren = false;

    emailModalOtvoren = false;
    emailUnos = '';

    otvoriTaskModal(): void {
        this.taskModalOtvoren = true;
        this.noviZadatak = '';
    }

    zatvoriTaskModal(): void {
        this.taskModalOtvoren = false;
    }

    dodajZadatak(): void {
        const tekst = this.noviZadatak.trim();
        if (tekst === '') {
            return;
        }
        this.kolone[0].zadaci.push(tekst);
        this.taskModalOtvoren = false;
    }

    pocniPrevlacenje(status: string, indeks: number): void {
        this.prevuceniZadatak = { status, indeks };
    }

    dozvoliIspustanje(event: DragEvent): void {
        event.preventDefault();
    }

    ispusti(ciljniStatus: string): void {
        if (!this.prevuceniZadatak) {
            return;
        }
        const izvorKolona = this.kolone.find(k => k.status === this.prevuceniZadatak!.status)!;
        const [zadatak] = izvorKolona.zadaci.splice(this.prevuceniZadatak.indeks, 1);

        const ciljnaKolona = this.kolone.find(k => k.status === ciljniStatus)!;
        ciljnaKolona.zadaci.push(zadatak);

        this.prevuceniZadatak = null;
    }

    otvoriClearModal(): void {
        this.clearModalOtvoren = true;
    }

    potvrdiOcisti(): void {
        this.kolone.forEach(k => k.zadaci = []);
        this.clearModalOtvoren = false;
    }

    otkaziOcisti(): void {
        this.clearModalOtvoren = false;
    }

    async snimiKaoPNG(): Promise<void> {
        const element = document.getElementById('kanban-sadrzaj');
        if (!element) {
            return;
        }
        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.download = 'kanban-board.png';
        link.href = canvas.toDataURL();
        link.click();
    }

    async snimiKaoPDF(): Promise<void> {
        const element = document.getElementById('kanban-sadrzaj');
        if (!element) {
            return;
        }
        const canvas = await html2canvas(element);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const sirinaSlike = 210;
        const visinaSlike = (canvas.height * sirinaSlike) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, sirinaSlike, visinaSlike);
        pdf.save('kanban-board.pdf');
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

        let tijeloTeksta = '';
        for (const kolona of this.kolone) {
            tijeloTeksta += kolona.naslov + ':\n';
            for (const zadatak of kolona.zadaci) {
                tijeloTeksta += '- ' + zadatak + '\n';
            }
            tijeloTeksta += '\n';
        }

        const subjekt = encodeURIComponent('Kanban ploča');
        const mailTijelo = encodeURIComponent(tijeloTeksta);
        window.location.href = `mailto:${email}?subject=${subjekt}&body=${mailTijelo}`;

        this.emailModalOtvoren = false;
    }
}