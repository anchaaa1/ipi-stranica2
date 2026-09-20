import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private kljuc = 'tema';

    postavi(tema: string): void {
        document.documentElement.setAttribute('data-tema', tema);
        localStorage.setItem(this.kljuc, tema);
    }

    ucitaj(): void {
        const sacuvanaTema = localStorage.getItem(this.kljuc) ?? 'zelena';
        this.postavi(sacuvanaTema);
    }

    trenutnaTema(): string {
        return localStorage.getItem(this.kljuc) ?? 'zelena';
    }
}