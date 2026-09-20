import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, collection, doc, getDocs, setDoc } from '@angular/fire/firestore';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
    selector: 'app-statistika',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './statistika.component.html',
    styleUrl: './statistika.component.css'
})
export class StatistikaComponent implements AfterViewInit, OnDestroy {
    @ViewChild('sanCanvas') sanCanvasRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('ucenjeCanvas') ucenjeCanvasRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('pieCanvas') pieCanvasRef!: ElementRef<HTMLCanvasElement>;

    private uid = '';
    private sanChart?: Chart;
    private ucenjeChart?: Chart;
    private pieChart?: Chart;

    opseg: '7' | '30' = '7';

    datumUcenja = new Date().toISOString().split('T')[0];
    minutaUcenja: number | null = null;

    constructor(private auth: Auth, private firestore: Firestore) {}

    ngAfterViewInit(): void {
        authState(this.auth).subscribe(async korisnik => {
            if (!korisnik) {
                return;
            }
            this.uid = korisnik.uid;
            await this.osvjeziSve();
        });
    }

    ngOnDestroy(): void {
        this.sanChart?.destroy();
        this.ucenjeChart?.destroy();
        this.pieChart?.destroy();
    }

    async promjenaOpsega(): Promise<void> {
        await this.osvjeziSve();
    }

    private nazadDana(): number {
        return this.opseg === '7' ? 7 : 30;
    }

    private posljednjihNDana(n: number): string[] {
        const danas = new Date();
        const dani: string[] = [];
        for (let i = n - 1; i >= 0; i--) {
            const d = new Date(danas);
            d.setDate(danas.getDate() - i);
            dani.push(d.toISOString().split('T')[0]);
        }
        return dani;
    }

    private async osvjeziSve(): Promise<void> {
        await Promise.all([
            this.iscrtajGrafSna(),
            this.iscrtajGrafUcenja(),
            this.iscrtajPieGraf(),
        ]);
    }

    private async iscrtajGrafSna(): Promise<void> {
        const dani = this.posljednjihNDana(this.nazadDana());
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

        const podaci = dani.map(datum => mapaSati.get(datum) ?? 0);

        this.sanChart?.destroy();
        this.sanChart = new Chart(this.sanCanvasRef.nativeElement, {
            type: 'bar',
            data: {
                labels: dani.map(d => d.slice(5)),
                datasets: [{
                    label: 'Sati spavanja',
                    data: podaci,
                    backgroundColor: '#1f6f78',
                }],
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } },
            },
        });
    }

    private async iscrtajGrafUcenja(): Promise<void> {
        const dani = this.posljednjihNDana(this.nazadDana());
        const snap = await getDocs(collection(this.firestore, 'korisnici', this.uid, 'ucenje'));
        const mapaMinuta = new Map<string, number>();
        snap.forEach(d => mapaMinuta.set(d.id, d.data()['minuta'] ?? 0));

        const podaci = dani.map(datum => mapaMinuta.get(datum) ?? 0);

        this.ucenjeChart?.destroy();
        this.ucenjeChart = new Chart(this.ucenjeCanvasRef.nativeElement, {
            type: 'line',
            data: {
                labels: dani.map(d => d.slice(5)),
                datasets: [{
                    label: 'Minute učenja',
                    data: podaci,
                    borderColor: '#1f6f78',
                    backgroundColor: 'rgba(31, 111, 120, 0.2)',
                    tension: 0.3,
                    fill: true,
                }],
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } },
            },
        });
    }

    private async iscrtajPieGraf(): Promise<void> {
        const kolekcije = [
            { naziv: 'Water', putanja: 'water' },
            { naziv: 'Sleep', putanja: 'sleep' },
            { naziv: 'Habit', putanja: 'habitTracker' },
            { naziv: 'Meal', putanja: 'mealPlanner' },
            { naziv: 'Study', putanja: 'studyPlanner' },
            { naziv: 'Calendar', putanja: 'calendar' },
        ];

        const brojevi: number[] = [];
        for (const k of kolekcije) {
            const snap = await getDocs(collection(this.firestore, 'korisnici', this.uid, k.putanja));
            brojevi.push(snap.size);
        }

        this.pieChart?.destroy();
        this.pieChart = new Chart(this.pieCanvasRef.nativeElement, {
            type: 'pie',
            data: {
                labels: kolekcije.map(k => k.naziv),
                datasets: [{
                    data: brojevi,
                    backgroundColor: ['#1f6f78', '#2c8c96', '#a9d4d8', '#164f56', '#e6f3f4', '#6b6b6b'],
                }],
            },
            options: {
                responsive: true,
            },
        });
    }

    async dodajUcenje(): Promise<void> {
        if (this.minutaUcenja === null || this.minutaUcenja < 0) {
            return;
        }
        await setDoc(doc(this.firestore, 'korisnici', this.uid, 'ucenje', this.datumUcenja), {
            minuta: this.minutaUcenja,
        });
        this.minutaUcenja = null;
        await this.iscrtajGrafUcenja();
    }
}