import { Routes } from '@angular/router';
import { PocetnaComponent } from './pages/pocetna/pocetna.component';
import { PopisComponent } from './pages/popis/popis.component';
import { RasporedComponent } from './pages/raspored/raspored.component';
import { KontaktComponent } from './pages/kontakt/kontakt.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FunZoneComponent } from './pages/fun-zone/fun-zone.component';
import { BingoComponent } from './pages/fun-zone/bingo/bingo.component';
import { KvizComponent } from './pages/fun-zone/kviz/kviz.component';
import { WhiteboardComponent } from './pages/fun-zone/whiteboard/whiteboard.component';
import { KanbanComponent } from './pages/fun-zone/kanban/kanban.component';
import { VisionBoardComponent } from './pages/fun-zone/vision-board/vision-board.component';
import { ViewProfileComponent } from './pages/view-profile/view-profile.component';
import { authGuard } from './core/auth.guard';
import { WaterTrackerComponent } from './pages/dashboard/water-tracker/water-tracker.component';
import { HabitTrackerComponent } from './pages/dashboard/habit-tracker/habit-tracker.component';
import { SleepTrackerComponent } from './pages/dashboard/sleep-tracker/sleep-tracker.component';
import { MealPlannerComponent } from './pages/dashboard/meal-planner/meal-planner.component';
import { StudyPlannerComponent } from './pages/dashboard/study-planner/study-planner.component';
import { CalendarTrackerComponent } from './pages/dashboard/calendar-tracker/calendar-tracker.component';
import { StatistikaComponent } from './pages/statistika/statistika.component';

export const routes: Routes = [
    { path: '', component: PocetnaComponent },
    { path: 'popis', component: PopisComponent },
    { path: 'raspored', component: RasporedComponent },
    { path: 'kontakt', component: KontaktComponent },
    { path: 'login', component: LoginComponent },
    { path: 'view-profile', component: ViewProfileComponent, canActivate: [authGuard] },
    { path: 'fun-zone', component: FunZoneComponent, canActivate: [authGuard] },
    { path: 'fun-zone/bingo', component: BingoComponent, canActivate: [authGuard] },
    { path: 'fun-zone/kviz', component: KvizComponent, canActivate: [authGuard] },
    { path: 'fun-zone/whiteboard', component: WhiteboardComponent, canActivate: [authGuard] },
    { path: 'fun-zone/kanban', component: KanbanComponent, canActivate: [authGuard] },
    { path: 'fun-zone/vision-board', component: VisionBoardComponent, canActivate: [authGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'dashboard/water', component: WaterTrackerComponent, canActivate: [authGuard] },
    { path: 'dashboard/habit', component: HabitTrackerComponent, canActivate: [authGuard] },
    { path: 'dashboard/sleep', component: SleepTrackerComponent, canActivate: [authGuard] },
    { path: 'dashboard/meal', component: MealPlannerComponent, canActivate: [authGuard] },
    { path: 'dashboard/study', component: StudyPlannerComponent, canActivate: [authGuard] },
    { path: 'dashboard/calendar', component: CalendarTrackerComponent, canActivate: [authGuard] },
    { path: 'statistika', component: StatistikaComponent, canActivate: [authGuard] },
];