import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { ThemeService } from '../../core/theme.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    ime = '';
    email = '';
    password = '';
    tema = 'zelena';
    poruka = '';

    constructor(
        private auth: Auth,
        private firestore: Firestore,
        private themeService: ThemeService,
        private router: Router
    ) {}

    onPromjenaTeme(): void {
        this.themeService.postavi(this.tema);
    }

    async registruj(): Promise<void> {
        try {
            const cred = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
            await setDoc(doc(this.firestore, 'korisnici', cred.user.uid), {
                ime: this.ime,
                email: cred.user.email,
                tema: this.tema,
                moduli: []
            });
            this.themeService.postavi(this.tema);
            this.poruka = 'Registracija uspješna!';
            this.router.navigate(['/fun-zone']);
        } catch (err: any) {
            this.poruka = 'Greška: ' + err.message;
        }
    }

    async prijaviSe(): Promise<void> {
        try {
            const cred = await signInWithEmailAndPassword(this.auth, this.email, this.password);
            const snap = await getDoc(doc(this.firestore, 'korisnici', cred.user.uid));
            const tema = snap.exists() ? snap.data()['tema'] : 'zelena';
            this.themeService.postavi(tema);
            this.poruka = 'Prijava uspješna!';
            this.router.navigate(['/fun-zone']);
        } catch (err: any) {
            this.poruka = 'Greška: ' + err.message;
        }
    }
}