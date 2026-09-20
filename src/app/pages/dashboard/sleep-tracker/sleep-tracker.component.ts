import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, collection, doc, getDoc, getDocs, setDoc } from '@angular/fire/firestore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface DanSna {
    datum: string;
    dan: number;
    satiSna: number;
}

@Component({
    selector: 'app-sleep-tracker',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './sleep-tracker.component.html',
    styleUrl: './sleep-tracker.component.css'
})
export class SleepTrackerComponent implements OnInit {
    private uid = '';

    odabraniDatum = this.danasnjiDatum();
    vrijemeSpavanja = '';
    vrijemeBudjenja = '';
    biljeske = '';
    zakljucano = false;
    editMode = false;

    dani: DanSna[] = [];

    constructor(private auth: Auth, private firestore: Firestore) {}

    ngOnInit(): void {
        authState(this.auth).subscribe(async korisnik => {
            if (!korisnik) {
                return;
            }
            this.uid = korisnik.uid;
            await this.ucitajUnosZaDatum();
            await this.ucitajSveDane();
        });
    }

    private danasnjiDatum(): string {
        return new Date().toISOString().split('T')[0];
    }

    izracunajSateSna(): number {
        if (!this.vrijemeSpavanja || !this.vrijemeBudjenja) {
            return 0;
        }
        const [satSpav, minSpav] = this.vrijemeSpavanja.split(':').map(Number);
        const [satBud, minBud] = this.vrijemeBudjenja.split(':').map(Number);

        let minuteSpav = satSpav * 60 + minSpav;
        let minuteBud = satBud * 60 + minBud;

        if (minuteBud <= minuteSpav) {
            minuteBud += 24 * 60;
        }

        return Math.round(((minuteBud - minuteSpav) / 60) * 10) / 10;
    }

    async promjenaDatuma(): Promise<void> {
        await this.ucitajUnosZaDatum();
    }

    private async ucitajUnosZaDatum(): Promise<void> {
        const snap = await getDoc(doc(this.firestore, 'korisnici', this.uid, 'sleep', this.odabraniDatum));
        if (snap.exists()) {
            const podaci = snap.data();
            this.vrijemeSpavanja = podaci['vrijemeSpavanja'] ?? '';
            this.vrijemeBudjenja = podaci['vrijemeBudjenja'] ?? '';
            this.biljeske = podaci['biljeske'] ?? '';
            this.zakljucano = true;
            this.editMode = false;
        } else {
            this.vrijemeSpavanja = '';
            this.vrijemeBudjenja = '';
            this.biljeske = '';
            this.zakljucano = false;
            this.editMode = false;
        }
    }

    private async ucitajSveDane(): Promise<void> {
        const snap = await getDocs(collection(this.firestore, 'korisnici', this.uid, 'sleep'));
        const mapaSati = new Map<string, number>();
        snap.forEach(d => {
            const podaci = d.data();
            if (podaci['vrijemeSpavanja'] && podaci['vrijemeBudjenja']) {
                const [ss, sm] = podaci['vrijemeSpavanja'].split(':').map(Number);
                const [bs, bm] = podaci['vrijemeBudjenja'].split(':').map(Number);
                let minSpav = ss * 60 + sm;
                let minBud = bs * 60 + bm;
                if (minBud <= minSpav) {
                    minBud += 24 * 60;
                }
                mapaSati.set(d.id, Math.round(((minBud - minSpav) / 60) * 10) / 10);
            }
        });

        const danas = new Date();
        const dani: DanSna[] = [];
        for (let i = 13; i >= 0; i--) {
            const datum = new Date(danas);
            datum.setDate(danas.getDate() - i);
            const iso = datum.toISOString().split('T')[0];
            dani.push({
                datum: iso,
                dan: 14 - i,
                satiSna: mapaSati.get(iso) ?? 0,
            });
        }
        this.dani = dani;
    }

    ukljuciEdit(): void {
        this.editMode = true;
    }

    async snimi(): Promise<void> {
        if (!this.vrijemeSpavanja || !this.vrijemeBudjenja) {
            return;
        }
        await setDoc(doc(this.firestore, 'korisnici', this.uid, 'sleep', this.odabraniDatum), {
            vrijemeSpavanja: this.vrijemeSpavanja,
            vrijemeBudjenja: this.vrijemeBudjenja,
            biljeske: this.biljeske,
        });
        this.zakljucano = true;
        this.editMode = false;
        await this.ucitajSveDane();
    }

    visinaTrake(satiSna: number): number {
        return Math.min(100, (satiSna / 12) * 100);
    }

    async preuzmiKaoPDF(): Promise<void> {
        const element = document.getElementById('sleep-tracker-sadrzaj');
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
            orientation: sirinaMm > visinaMm ? 'landscape' : 'portrait',
        });

        pdf.addImage(imgData, 'JPEG', margin, margin, sirinaMm, visinaMm);
        pdf.save('sleep-tracker.pdf');
    }
}