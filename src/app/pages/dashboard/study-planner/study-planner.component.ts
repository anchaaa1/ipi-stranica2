import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface StavkaObaveze {
    tekst: string;
    gotovo: boolean;
}

@Component({
    selector: 'app-study-planner',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './study-planner.component.html',
    styleUrl: './study-planner.component.css'
})
export class StudyPlannerComponent implements OnInit {
    private uid = '';

    dani = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];

    odabraniDatum = this.danasnjiDatum();
    pocetakSedmice = '';

    ciljevi = '';
    planPoDanima: { [dan: string]: string } = {};
    napomene = '';
    listaObaveza: StavkaObaveze[] = [];
    novaObaveza = '';

    zakljucano = false;
    editMode = false;

    constructor(private auth: Auth, private firestore: Firestore) {}

    ngOnInit(): void {
        authState(this.auth).subscribe(async korisnik => {
            if (!korisnik) {
                return;
            }
            this.uid = korisnik.uid;
            await this.ucitajSedmicu();
        });
    }

    private danasnjiDatum(): string {
        return new Date().toISOString().split('T')[0];
    }

    private izracunajPonedjeljak(datumString: string): string {
        const datum = new Date(datumString);
        const danUSedmici = datum.getDay();
        const pomak = danUSedmici === 0 ? -6 : 1 - danUSedmici;
        datum.setDate(datum.getDate() + pomak);
        return datum.toISOString().split('T')[0];
    }

    private praznoStanje(): void {
        this.ciljevi = '';
        this.planPoDanima = {};
        for (const dan of this.dani) {
            this.planPoDanima[dan] = '';
        }
        this.napomene = '';
        this.listaObaveza = [];
    }

    async promjenaDatuma(): Promise<void> {
        await this.ucitajSedmicu();
    }

    private async ucitajSedmicu(): Promise<void> {
        this.pocetakSedmice = this.izracunajPonedjeljak(this.odabraniDatum);

        const snap = await getDoc(doc(this.firestore, 'korisnici', this.uid, 'studyPlanner', this.pocetakSedmice));
        if (snap.exists()) {
            const podaci = snap.data();
            this.ciljevi = podaci['ciljevi'] ?? '';
            this.planPoDanima = podaci['planPoDanima'] ?? {};
            this.napomene = podaci['napomene'] ?? '';
            this.listaObaveza = podaci['listaObaveza'] ?? [];
            this.zakljucano = true;
            this.editMode = false;
        } else {
            this.praznoStanje();
            this.zakljucano = false;
            this.editMode = false;
        }
    }

    private async sacuvajSve(): Promise<void> {
        await setDoc(doc(this.firestore, 'korisnici', this.uid, 'studyPlanner', this.pocetakSedmice), {
            ciljevi: this.ciljevi,
            planPoDanima: this.planPoDanima,
            napomene: this.napomene,
            listaObaveza: this.listaObaveza,
        });
    }

    ukljuciEdit(): void {
        this.editMode = true;
    }

    async snimi(): Promise<void> {
        await this.sacuvajSve();
        this.zakljucano = true;
        this.editMode = false;
    }

    async dodajObavezu(): Promise<void> {
        const tekst = this.novaObaveza.trim();
        if (tekst === '') {
            return;
        }
        this.listaObaveza.push({ tekst, gotovo: false });
        this.novaObaveza = '';
        await this.sacuvajSve();
    }

    async prekidacObavezu(stavka: StavkaObaveze): Promise<void> {
        stavka.gotovo = !stavka.gotovo;
        await this.sacuvajSve();
    }

    async obrisiObavezu(indeks: number): Promise<void> {
        this.listaObaveza.splice(indeks, 1);
        await this.sacuvajSve();
    }

    async preuzmiKaoPDF(): Promise<void> {
        const element = document.getElementById('study-planner-sadrzaj');
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
        pdf.save('study-planner.pdf');
    }
}