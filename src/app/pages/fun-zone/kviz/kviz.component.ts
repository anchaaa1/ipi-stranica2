import { Component } from '@angular/core';

interface OpcijaPitanja {
    vrijednost: string;
    tekst: string;
}

interface Pitanje {
    id: string;
    tekst: string;
    tip: 'radio' | 'checkbox';
    opcije: OpcijaPitanja[];
    tacniOdgovori: string[];
}

@Component({
    selector: 'app-kviz',
    standalone: true,
    imports: [],
    templateUrl: './kviz.component.html',
    styleUrl: './kviz.component.css'
})
export class KvizComponent {
    pitanja: Pitanje[] = [
        {
            id: 'p1',
            tekst: '1. Šta znači skraćenica HTML?',
            tip: 'radio',
            opcije: [
                { vrijednost: 'a', tekst: 'HyperText Markup Language' },
                { vrijednost: 'b', tekst: 'HighText Machine Language' },
                { vrijednost: 'c', tekst: 'HyperTransfer Markup Language' },
            ],
            tacniOdgovori: ['a'],
        },
        {
            id: 'p2',
            tekst: '2. Koji tag se koristi za najveći naslov?',
            tip: 'radio',
            opcije: [
                { vrijednost: 'a', tekst: '<h6>' },
                { vrijednost: 'b', tekst: '<heading>' },
                { vrijednost: 'c', tekst: '<h1>' },
            ],
            tacniOdgovori: ['c'],
        },
        {
            id: 'p3',
            tekst: '3. Kojim tagom se povezuje CSS fajl sa HTML dokumentom?',
            tip: 'radio',
            opcije: [
                { vrijednost: 'a', tekst: '<style>' },
                { vrijednost: 'b', tekst: '<link>' },
                { vrijednost: 'c', tekst: '<css>' },
            ],
            tacniOdgovori: ['b'],
        },
        {
            id: 'p4',
            tekst: '4. Koji od sljedećih su validni HTML tagovi? (zaokruži sve tačne)',
            tip: 'checkbox',
            opcije: [
                { vrijednost: 'div', tekst: '<div>' },
                { vrijednost: 'section', tekst: '<section>' },
                { vrijednost: 'paragraph', tekst: '<paragraph>' },
                { vrijednost: 'footer', tekst: '<footer>' },
            ],
            tacniOdgovori: ['div', 'section', 'footer'],
        },
        {
            id: 'p5',
            tekst: '5. Koje od ovoga spada u CSS jedinice mjere?',
            tip: 'checkbox',
            opcije: [
                { vrijednost: 'px', tekst: 'px' },
                { vrijednost: 'em', tekst: 'em' },
                { vrijednost: 'kg', tekst: 'kg' },
                { vrijednost: 'rem', tekst: 'rem' },
            ],
            tacniOdgovori: ['px', 'em', 'rem'],
        },
    ];

    odabraniOdgovori: { [id: string]: string[] } = {};
    rezultat: string | null = null;

    jeOznaceno(pitanjeId: string, vrijednost: string): boolean {
        return this.odabraniOdgovori[pitanjeId]?.includes(vrijednost) ?? false;
    }

    oznaciRadio(pitanjeId: string, vrijednost: string): void {
        this.odabraniOdgovori[pitanjeId] = [vrijednost];
    }

    oznaciCheckbox(pitanjeId: string, vrijednost: string): void {
        const trenutni = this.odabraniOdgovori[pitanjeId] ?? [];
        if (trenutni.includes(vrijednost)) {
            this.odabraniOdgovori[pitanjeId] = trenutni.filter(v => v !== vrijednost);
        } else {
            this.odabraniOdgovori[pitanjeId] = [...trenutni, vrijednost];
        }
    }

    provjeriOdgovore(): void {
        let poeni = 0;
        const ukupno = this.pitanja.length;

        for (const pitanje of this.pitanja) {
            const odabrano = this.odabraniOdgovori[pitanje.id] ?? [];
            const tacno =
                odabrano.length === pitanje.tacniOdgovori.length &&
                odabrano.every(v => pitanje.tacniOdgovori.includes(v));
            if (tacno) {
                poeni++;
            }
        }

        this.rezultat = `Osvojili ste ${poeni} od ${ukupno} poena!`;
    }

    pokusajPonovo(): void {
        this.odabraniOdgovori = {};
        this.rezultat = null;
    }
}