import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface StavkaBoard {
    id: number;
    tip: 'note' | 'quote' | 'image';
    klasaBoje?: string;
    tekst?: string;
    slika?: string;
    left: number;
    top: number;
}

@Component({
    selector: 'app-vision-board',
    standalone: true,
    imports: [NgClass, FormsModule],
    templateUrl: './vision-board.component.html',
    styleUrl: './vision-board.component.css'
})
export class VisionBoardComponent implements OnInit {
    stavke: StavkaBoard[] = [];
    private sljedeciId = 1;

    private boje = ['color1', 'color2', 'color3', 'color4', 'color5', 'color6'];

    private primjeriSlika = ['slike/slika1.png', 'slike/slika2.png', 'slike/slika3.png', 'slike/slika4.png'];

    private primjeriCitata = [
        '"Svaka dovoljno napredna tehnologija jednaka je magiji." – Arthur C. Clarke',
        '"Tehnologija je riječ koja opisuje nešto što još ne funkcioniše." – Douglas Adams',
        '"Ne osnivate zajednice. Zajednice već postoje. Pitanje koje treba postaviti je kako im možete pomoći da budu bolje." – Mark Zuckerberg',
    ];

    private aktivnaStavka: StavkaBoard | null = null;
    private offsetX = 0;
    private offsetY = 0;

    emailModalOtvoren = false;
    emailUnos = '';

    ngOnInit(): void {
        this.ucitajPlocu();
    }

    dodajPostIt(): void {
        this.stavke.push({
            id: this.sljedeciId++,
            tip: 'note',
            klasaBoje: this.boje[Math.floor(Math.random() * this.boje.length)],
            tekst: 'Napiši nešto...',
            left: Math.random() * 500,
            top: Math.random() * 300,
        });
    }

    dodajSliku(): void {
        this.stavke.push({
            id: this.sljedeciId++,
            tip: 'image',
            slika: this.primjeriSlika[Math.floor(Math.random() * this.primjeriSlika.length)],
            left: Math.random() * 400,
            top: Math.random() * 250,
        });
    }

    dodajCitat(): void {
        this.stavke.push({
            id: this.sljedeciId++,
            tip: 'quote',
            tekst: this.primjeriCitata[Math.floor(Math.random() * this.primjeriCitata.length)],
            left: Math.random() * 400,
            top: Math.random() * 250,
        });
    }

    azurirajTekst(event: Event, stavka: StavkaBoard): void {
        stavka.tekst = (event.target as HTMLElement).innerText;
    }

    obrisiStavku(event: MouseEvent, stavka: StavkaBoard): void {
        event.stopPropagation();
        this.stavke = this.stavke.filter(s => s.id !== stavka.id);
    }

    pocniPrevlacenje = (event: MouseEvent, stavka: StavkaBoard): void => {
        this.aktivnaStavka = stavka;
        this.offsetX = event.clientX - stavka.left;
        this.offsetY = event.clientY - stavka.top;
        document.addEventListener('mousemove', this.naPomjeranje);
        document.addEventListener('mouseup', this.naKrajPomjeranja);
    };

    private naPomjeranje = (event: MouseEvent): void => {
        if (!this.aktivnaStavka) {
            return;
        }
        event.preventDefault();
        this.aktivnaStavka.left = event.clientX - this.offsetX;
        this.aktivnaStavka.top = event.clientY - this.offsetY;
    };

    private naKrajPomjeranja = (): void => {
        this.aktivnaStavka = null;
        document.removeEventListener('mousemove', this.naPomjeranje);
        document.removeEventListener('mouseup', this.naKrajPomjeranja);
    };

    snimiPlocu(): void {
        localStorage.setItem('visionBoardItems', JSON.stringify(this.stavke));
        alert('Ploča sačuvana!');
    }

    private ucitajPlocu(): void {
        const podaci = localStorage.getItem('visionBoardItems');
        if (!podaci) {
            return;
        }
        this.stavke = JSON.parse(podaci);
        this.sljedeciId = Math.max(0, ...this.stavke.map(s => s.id)) + 1;
    }

    ocistiPlocu(): void {
        if (confirm('Očistiti ploču?')) {
            this.stavke = [];
            localStorage.removeItem('visionBoardItems');
        }
    }

    async snimiKaoPDF(): Promise<void> {
        const element = document.getElementById('vision-sadrzaj');
        if (!element) {
            return;
        }
        const canvas = await html2canvas(element);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const sirinaSlike = 210;
        const visinaSlike = (canvas.height * sirinaSlike) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, sirinaSlike, visinaSlike);
        pdf.save('vision-board.pdf');
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

        let tijelo = '';
        for (const stavka of this.stavke) {
            if (stavka.tip === 'note') {
                tijelo += 'Post it: ' + stavka.tekst + '\n';
            } else if (stavka.tip === 'quote') {
                tijelo += 'Citat: ' + stavka.tekst + '\n';
            } else {
                tijelo += 'Slika dodana na ploču\n';
            }
        }

        const subjekt = encodeURIComponent('Vision Board');
        const mailTijelo = encodeURIComponent(tijelo);
        window.location.href = `mailto:${email}?subject=${subjekt}&body=${mailTijelo}`;

        this.emailModalOtvoren = false;
    }
}