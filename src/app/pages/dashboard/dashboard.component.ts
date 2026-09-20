import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Tracker {
    id: string;
    naziv: string;
    ikona: string;
    ruta: string;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
    trackeri: Tracker[] = [
        { id: 'sleep', naziv: 'Sleep Tracker', ikona: '😴', ruta: '/dashboard/sleep' },
        { id: 'meal', naziv: 'Meal Tracker', ikona: '🍽️', ruta: '/dashboard/meal' },
        { id: 'habit', naziv: 'Habit Tracker', ikona: '✅', ruta: '/dashboard/habit' },
        { id: 'study', naziv: 'Study Planner', ikona: '📚', ruta: '/dashboard/study' },
        { id: 'water', naziv: 'Water Tracker', ikona: '💧', ruta: '/dashboard/water' },
        { id: 'calendar', naziv: 'Calendar Tracker', ikona: '📅', ruta: '/dashboard/calendar' },
    ];
}