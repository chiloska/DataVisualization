import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DownloadReportComponent } from './components/reports/download-report/download-report.component';

const appRoutes: Routes = [
    {
        path: '',
        component: DashboardComponent
    },
    {
        path: 'reports/download',
        component: DownloadReportComponent
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes)