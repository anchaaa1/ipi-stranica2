import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Auth, authState, signOut, User } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, CommonModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent {
    prijavljenKorisnik$: Observable<User | null>;

    constructor(private auth: Auth, private router: Router) {
        this.prijavljenKorisnik$ = authState(this.auth);
    }

    async odjaviSe(): Promise<void> {
        await signOut(this.auth);
        this.router.navigate(['/']);
    }
}