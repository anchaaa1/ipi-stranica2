import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Navika {
    naziv: string;
    oznaceniDani: boolean[];
}

@Component({
    selector: 'app-habit-tracker',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './habit-tracker.component.html',
    styleUrl: './habit-tracker.component.css'
})
export class HabitTrackerComponent implements OnInit {
    private uid = '';

    odabraniMjesec = this.trenutniMjesec();
    navike: Navika[] = [];
    nazivNoveNavike = '';
    dani: number[] = [];

    constructor(private auth: Auth, private firestore: Firestore) {}

    ngOnInit(): void {
        authState(this.auth).subscribe(async korisnik => {
            if (!korisnik) {
                return;
            }
            this.uid = korisnik.uid;
            await this.ucitajMjesec();
        });
    }

    private trenutniMjesec(): string {
        const danas = new Date();
        const godina = danas.getFullYear();
        const mjesec = String(danas.getMonth() + 1).padStart(2, '0');
        return `${godina}-${mjesec}`;
    }

    private brojDanaUMjesecu(mjesec: string): number {
        const [godina, mj] = mjesec.split('-').map(Number);
        return new Date(godina, mj, 0).getDate();
    }

    private izracunajDane(): void {
        const broj = this.brojDanaUMjesecu(this.odabraniMjesec);
        this.dani = Array.from({ length: broj }, (_, i) => i + 1);
    }

    async promjenaMjeseca(): Promise<void> {
        await this.ucitajMjesec();
    }

    private async ucitajMjesec(): Promise<void> {
        this.izracunajDane();
        const snap = await getDoc(doc(this.firestore, 'korisnici', this.uid, 'habitTracker', this.odabraniMjesec));
        if (snap.exists()) {
            this.navike = snap.data()['navike'] ?? [];
            this.uskladiDuzineDana();
        } else {
            this.navike = [];
        }
    }

    private uskladiDuzineDana(): void {
        const brojDana = this.dani.length;
        for (const navika of this.navike) {
            while (navika.oznaceniDani.length < brojDana) {
                navika.oznaceniDani.push(false);
            }
        }
    }

    private async sacuvajMjesec(): Promise<void> {
        await setDoc(doc(this.firestore, 'korisnici', this.uid, 'habitTracker', this.odabraniMjesec), {
            navike: this.navike,
        });
    }

    async dodajNaviku(): Promise<void> {
        const naziv = this.nazivNoveNavike.trim();
        if (naziv === '') {
            return;
        }
        this.navike.push({
            naziv,
            oznaceniDani: new Array(this.dani.length).fill(false),
        });
        this.nazivNoveNavike = '';
        await this.sacuvajMjesec();
    }

    async obrisiNaviku(indeks: number): Promise<void> {
        this.navike.splice(indeks, 1);
        await this.sacuvajMjesec();
    }

    async prekidacDan(navika: Navika, danIndeks: number): Promise<void> {
        navika.oznaceniDani[danIndeks] = !navika.oznaceniDani[danIndeks];
        await this.sacuvajMjesec();
    }

    async preuzmiKaoPDF(): Promise<void> {
        const element = document.getElementById('habit-tracker-sadrzaj');
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
            orientation: 'landscape',
        });

        pdf.addImage(imgData, 'JPEG', margin, margin, sirinaMm, visinaMm);
        pdf.save('habit-tracker.pdf');
    }
}