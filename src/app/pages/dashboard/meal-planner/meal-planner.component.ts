import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ObrociDana {
    dorucak: string;
    rucak: string;
    vecera: string;
}

@Component({
    selector: 'app-meal-planner',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './meal-planner.component.html',
    styleUrl: './meal-planner.component.css'
})
export class MealPlannerComponent implements OnInit {
    private uid = '';

    dani = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];

    odabraniDatum = this.danasnjiDatum();
    pocetakSedmice = '';

    obroci: { [dan: string]: ObrociDana } = {};
    grickalice = '';
    listaNamirnica = '';

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

    private praznaTabela(): void {
        this.obroci = {};
        for (const dan of this.dani) {
            this.obroci[dan] = { dorucak: '', rucak: '', vecera: '' };
        }
        this.grickalice = '';
        this.listaNamirnica = '';
    }

    async promjenaDatuma(): Promise<void> {
        await this.ucitajSedmicu();
    }

    private async ucitajSedmicu(): Promise<void> {
        this.pocetakSedmice = this.izracunajPonedjeljak(this.odabraniDatum);

        const snap = await getDoc(doc(this.firestore, 'korisnici', this.uid, 'mealPlanner', this.pocetakSedmice));
        if (snap.exists()) {
            const podaci = snap.data();
            this.obroci = podaci['obroci'] ?? {};
            this.grickalice = podaci['grickalice'] ?? '';
            this.listaNamirnica = podaci['listaNamirnica'] ?? '';
            this.zakljucano = true;
            this.editMode = false;
        } else {
            this.praznaTabela();
            this.zakljucano = false;
            this.editMode = false;
        }
    }

    ukljuciEdit(): void {
        this.editMode = true;
    }

    async snimi(): Promise<void> {
        await setDoc(doc(this.firestore, 'korisnici', this.uid, 'mealPlanner', this.pocetakSedmice), {
            obroci: this.obroci,
            grickalice: this.grickalice,
            listaNamirnica: this.listaNamirnica,
        });
        this.zakljucano = true;
        this.editMode = false;
    }

    async preuzmiKaoPDF(): Promise<void> {
        const element = document.getElementById('meal-planner-sadrzaj');
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
        pdf.save('meal-planner.pdf');
    }
}