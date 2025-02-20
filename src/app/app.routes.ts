// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { NewsListComponent } from './components/news-list/news-list.component';

export const routes: Routes = [
    {
        path: 'news',
        component: NewsListComponent,
        title: 'News Search' // This sets the page title
    }
    // {
    //     path: '',
    //     redirectTo: '/news',
    //     pathMatch: 'full'
    // }
];