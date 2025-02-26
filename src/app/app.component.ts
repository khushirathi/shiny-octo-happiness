import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MaterialModule } from './material.module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MaterialModule, FormsModule],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <!-- Left Navigation Sidebar -->
      <mat-sidenav #sidenav mode="side" opened class="sidenav">
        <mat-nav-list>
          <a mat-list-item routerLink="/home" class="nav-item">
            <mat-icon>home</mat-icon>
            <span>Home</span>
          </a>
          <!-- Add other navigation items -->
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <!-- Top Navigation Bar -->
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span>WORKFORCE CONNECT</span>
          <span class="toolbar-spacer"></span>
          
          <!-- Search Box -->
          <mat-form-field appearance="outline" class="search-field">
            <input matInput placeholder="Search by Associate, Entity, Position, Requisition ID or SOW No">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <!-- About Button -->
          <button mat-button routerLink="/about">About</button>
        </mat-toolbar>

        <!-- Main Content Area -->
        <div class="main-content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 250px;
      background-color: var(--primary-color);
    }

    .nav-item {
      color: white;
      mat-icon {
        margin-right: 8px;
      }
      &:hover {
        background-color: var(--primary-color-light-20);
      }
      &.active {
        background-color: var(--primary-color-dark-20);
      }
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .search-field {
      width: 400px;
      margin: 0 16px;
    }

    .main-content {
      padding: 20px;
    }
  `]
})
export class AppComponent {
  title = 'workforce-connect';
}