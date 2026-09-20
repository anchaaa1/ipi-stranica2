import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, collection, doc, getDocs, setDoc } from '@angular/fire/firestore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface DanKalendara {
    datum: string;
    broj: number;
    imaDogadjaj: boolean;
}

@Component({
    selector: 'app-calendar-tracker',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './calendar-tracker.component.html',
    styleUrl: './calendar-tracker.component.css'
})
export class CalendarTrackerComponent implements OnInit {
    private uid = '';

    odabraniMjesec = this.trenutniMjesec();
    dogadjajiMjeseca = new Map<string, string>();
    dani: (DanKalendara | null)[] = [];
    imenaDana = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];

    odabraniDan: string | null = null;
    tekstDogadjaja = '';
    zakljucano = false;
    editMode = false;

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
        return `${danas.getFullYear()}-${String(danas.getMonth() + 1).padStart(2, '0')}`;
    }

    async promjenaMjeseca(): Promise<void> {
        this.odabraniDan = null;
        await this.ucitajMjesec();
    }

    private async ucitajMjesec(): Promise<void> {
        const snap = await getDocs(collection(this.firestore, 'korisnici', this.uid, 'calendar'));
        this.dogadjajiMjeseca.clear();
        snap.forEach(d => {
            if (d.id.startsWith(this.odabraniMjesec)) {
                this.dogadjajiMjeseca.set(d.id, d.data()['tekst'] ?? '');
            }
        });
        this.izgradiMrezu();
    }

    private izgradiMrezu(): void {
        const [godina, mjesec] = this.odabraniMjesec.split('-').map(Number);
        const brojDana = new Date(godina, mjesec, 0).getDate();
        const prviDan = new Date(godina, mjesec - 1, 1);
        let danUSedmiciPrvog = prviDan.getDay();
        danUSedmiciPrvog = danUSedmiciPrvog === 0 ? 6 : danUSedmiciPrvog - 1;

        const dani: (DanKalendara | null)[] = [];
        for (let i = 0; i < danUSedmiciPrvog; i++) {
            dani.push(null);
        }
        for (let dan = 1; dan <= brojDana; dan++) {
            const datum = `${this.odabraniMjesec}-${String(dan).padStart(2, '0')}`;
            dani.push({
                datum,
                broj: dan,
                imaDogadjaj: this.dogadjajiMjeseca.has(datum),
            });
        }
        this.dani = dani;
    }

    odaberiDan(dan: DanKalendara): void {
        this.odabraniDan = dan.datum;
        this.tekstDogadjaja = this.dogadjajiMjeseca.get(dan.datum) ?? '';
        this.zakljucano = this.dogadjajiMjeseca.has(dan.datum);
        this.editMode = false;
    }

    ukljuciEdit(): void {
        this.editMode = true;
    }

    async snimi(): Promise<void> {
        if (!this.odabraniDan) {
            return;
        }
        await setDoc(doc(this.firestore, 'korisnici', this.uid, 'calendar', this.odabraniDan), {
            tekst: this.tekstDogadjaja,
        });
        this.zakljucano = true;
        this.editMode = false;
        await this.ucitajMjesec();
    }

    async preuzmiKaoPDF(): Promise<void> {
        const element = document.getElementById('calendar-tracker-sadrzaj');
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
            orientation: 'portrait',
        });

        pdf.addImage(imgData, 'JPEG', margin, margin, sirinaMm, visinaMm);
        pdf.save('calendar-tracker.pdf');
    }
}