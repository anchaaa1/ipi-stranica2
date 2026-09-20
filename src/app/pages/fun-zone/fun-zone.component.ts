import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface StavkaFunZone {
    naziv: string;
    opis: string;
    ikona: string;
    ruta: string;
}

@Component({
    selector: 'app-fun-zone',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './fun-zone.component.html',
    styleUrl: './fun-zone.component.css'
})
export class FunZoneComponent {
    stavke: StavkaFunZone[] = [
        { naziv: 'Bingo', opis: 'Klasična bingo igra sa pitanjima.', ikona: '🎯', ruta: '/fun-zone/bingo' },
        { naziv: 'Kviz', opis: 'Testiraj svoje znanje.', ikona: '❓', ruta: '/fun-zone/kviz' },
        { naziv: 'Whiteboard', opis: 'Slobodno crtanje i bilješke.', ikona: '🖊️', ruta: '/fun-zone/whiteboard' },
        { naziv: 'Kanban board', opis: 'Organizuj zadatke po kolonama.', ikona: '🗂️', ruta: '/fun-zone/kanban' },
        { naziv: 'Vision board', opis: 'Vizualizuj svoje ciljeve.', ikona: '🎨', ruta: '/fun-zone/vision-board' },
        
    ];
}