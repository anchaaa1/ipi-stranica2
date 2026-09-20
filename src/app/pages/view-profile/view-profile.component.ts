import { Component, OnInit } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
    selector: 'app-view-profile',
    standalone: true,
    imports: [],
    templateUrl: './view-profile.component.html',
    styleUrl: './view-profile.component.css'
})
export class ViewProfileComponent implements OnInit {
    ime = '';
    email = '';
    ucitavanje = true;

    constructor(private auth: Auth, private firestore: Firestore) {}

    ngOnInit(): void {
        authState(this.auth).subscribe(async korisnik => {
            if (!korisnik) {
                return;
            }
            this.email = korisnik.email ?? '';
            const snap = await getDoc(doc(this.firestore, 'korisnici', korisnik.uid));
            const podaci = snap.data();
            this.ime = podaci?.['ime'] ?? '';
            this.ucitavanje = false;
        });
    }
}