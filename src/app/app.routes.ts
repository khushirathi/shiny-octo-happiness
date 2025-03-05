// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { NewsListComponent } from './components/news-list/news-list.component';
import { OrganizationTableComponent } from './components/organization-table/organization-table.component';

export const routes: Routes = [
    {
        path: 'news',
        component: NewsListComponent,
        title: 'News Search' // This sets the page title
    },
    {
        path: 'org',
        component: OrganizationTableComponent,
        title: 'Org Table' // This sets the page title
    }
    // {
    //     path: '',
    //     redirectTo: '/news',
    //     pathMatch: 'full'
    // }
];