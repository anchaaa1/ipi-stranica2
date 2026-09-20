import { Component } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CelijaBinga {
    tekst: string;
    slobodna: boolean;
    izabrana: boolean;
}

@Component({
    selector: 'app-bingo',
    standalone: true,
    imports: [],
    templateUrl: './bingo.component.html',
    styleUrl: './bingo.component.css'
})
export class BingoComponent {
    redovi: CelijaBinga[][] = [
        [
            { tekst: 'Omiljena boja je narančasta.', slobodna: false, izabrana: false },
            { tekst: 'Voli pjevati.', slobodna: false, izabrana: false },
            { tekst: 'Voli HTML.', slobodna: false, izabrana: false },
            { tekst: 'Ima kućnog ljubimca.', slobodna: false, izabrana: false },
            { tekst: 'Govori više od dva jezika.', slobodna: false, izabrana: false },
        ],
        [
            { tekst: 'Voli planinariti.', slobodna: false, izabrana: false },
            { tekst: 'Nikad nije bio/la u inostranstvu.', slobodna: false, izabrana: false },
            { tekst: 'Svira neki instrument.', slobodna: false, izabrana: false },
            { tekst: 'Voli čitati knjige.', slobodna: false, izabrana: false },
            { tekst: 'Rođen/a je u istom mjesecu kao ti.', slobodna: false, izabrana: false },
        ],
        [
            { tekst: 'Voli igrati video igrice.', slobodna: false, izabrana: false },
            { tekst: 'Zna kuhati omiljeno jelo.', slobodna: false, izabrana: false },
            { tekst: 'SLOBODAN PROSTOR', slobodna: true, izabrana: false },
            { tekst: 'Ima više od jednog brata/sestre.', slobodna: false, izabrana: false },
            { tekst: 'Voli gledati horor filmove.', slobodna: false, izabrana: false },
        ],
        [
            { tekst: 'Bavi se nekim sportom.', slobodna: false, izabrana: false },
            { tekst: 'Voli slatkiše više od slanog.', slobodna: false, izabrana: false },
            { tekst: 'Ima vozačku dozvolu.', slobodna: false, izabrana: false },
            { tekst: 'Voli putovati.', slobodna: false, izabrana: false },
            { tekst: 'Zna plesati.', slobodna: false, izabrana: false },
        ],
        [
            { tekst: 'Voli crtati ili slikati.', slobodna: false, izabrana: false },
            { tekst: 'Ima više od tri kućna ljubimca.', slobodna: false, izabrana: false },
            { tekst: 'Voli CSS.', slobodna: false, izabrana: false },
            { tekst: 'Rano ustaje ujutro.', slobodna: false, izabrana: false },
            { tekst: 'Voli jesti pizzu.', slobodna: false, izabrana: false },
        ],
    ];

    prekidacCelija(celija: CelijaBinga): void {
        celija.izabrana = !celija.izabrana;
    }

    async preuzmiKaoPDF(): Promise<void> {
        const element = document.getElementById('bingo-tabela');
        if (!element) {
            return;
        }

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/jpeg', 0.98);

        const pxToMm = 0.264583 / 2;
        const margin = 10;
        const sirinaMm = canvas.width * pxToMm;
        const visinaMm = canvas.height * pxToMm;

        const pdf = new jsPDF({
            unit: 'mm',
            format: [sirinaMm + margin * 2, visinaMm + margin * 2],
            orientation: sirinaMm > visinaMm ? 'landscape' : 'portrait'
        });

        pdf.addImage(imgData, 'JPEG', margin, margin, sirinaMm, visinaMm);
        pdf.save('bingo-tablica.pdf');
    }
}