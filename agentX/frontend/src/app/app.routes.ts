import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Start } from './pages/start/start';
import { Signup } from './pages/signup/signup';
import { Dashboard } from './pages/dashboard/dashboard';
import { Pricing } from './pages/pricing/pricing';
import { Payments } from './pages/payments/payments';
import { DetailsPage } from './pages/details-page/details-page';
import { QuizPage } from './pages/quiz-page/quiz-page';

export const routes: Routes = [
    { path: '', redirectTo: 'start', pathMatch: 'full' },
    { path: 'start', component: Start },
    { path: 'login', component: Login },
    { path: 'signup', component: Signup },
    { path: 'dashboard', component: Dashboard },
    { path: 'pricing', component: Pricing },
    { path: 'payments', component: Payments },
    { path: 'details', component: DetailsPage },
    { path: 'quiz', component: QuizPage },
];
