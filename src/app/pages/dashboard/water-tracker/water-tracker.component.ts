import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, collection, doc, getDoc, getDocs, setDoc } from '@angular/fire/firestore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface DanUnosa {
    datum: string;
    dan: number;
    litri: number;
}

@Component({
    selector: 'app-water-tracker',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './water-tracker.component.html',
    styleUrl: './water-tracker.component.css'
})
export class WaterTrackerComponent implements OnInit {
    private uid = '';

    odabraniDatum = this.danasnjiDatum();
    litri: number | null = null;
    zakljucano = false;
    editMode = false;

    dani: DanUnosa[] = [];

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

    async promjenaDatuma(): Promise<void> {
        await this.ucitajUnosZaDatum();
    }

    private async ucitajUnosZaDatum(): Promise<void> {
        const snap = await getDoc(doc(this.firestore, 'korisnici', this.uid, 'water', this.odabraniDatum));
        if (snap.exists()) {
            this.litri = snap.data()['litri'];
            this.zakljucano = true;
            this.editMode = false;
        } else {
            this.litri = null;
            this.zakljucano = false;
            this.editMode = false;
        }
    }

    private async ucitajSveDane(): Promise<void> {
        const snap = await getDocs(collection(this.firestore, 'korisnici', this.uid, 'water'));
        const mapaLitara = new Map<string, number>();
        snap.forEach(d => mapaLitara.set(d.id, d.data()['litri']));

        const danas = new Date();
        const dani: DanUnosa[] = [];
        for (let i = 29; i >= 0; i--) {
            const datum = new Date(danas);
            datum.setDate(danas.getDate() - i);
            const iso = datum.toISOString().split('T')[0];
            dani.push({
                datum: iso,
                dan: 30 - i,
                litri: mapaLitara.get(iso) ?? 0,
            });
        }
        this.dani = dani;
    }

    ukljuciEdit(): void {
        this.editMode = true;
    }

    async snimi(): Promise<void> {
        if (this.litri === null || this.litri < 0) {
            return;
        }
        await setDoc(doc(this.firestore, 'korisnici', this.uid, 'water', this.odabraniDatum), {
            litri: this.litri,
        });
        this.zakljucano = true;
        this.editMode = false;
        await this.ucitajSveDane();
    }

    brojCasaZaDan(litri: number): number {
        return Math.min(8, Math.round(litri / 0.25));
    }

    async preuzmiKaoPDF(): Promise<void> {
        const element = document.getElementById('water-tracker-sadrzaj');
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
        pdf.save('water-tracker.pdf');
    }
}