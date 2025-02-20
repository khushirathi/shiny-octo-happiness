// src/app/components/news-list/news-list.component.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsService } from '../../services/news/news.service';
import { Article } from '../../services/news/news.interface';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
    selector: 'app-news-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './news-list.component.html',
    styleUrl: './news-list.component.scss'
})
export class NewsListComponent implements OnInit, OnDestroy {
    private newsService = inject(NewsService);
    private destroy$ = new Subject<void>();
    private searchSubject = new Subject<string>();
    
    articles: Article[] = [];
    isLoading = false;
    error: string | null = null;
    searchTerm = '';
    totalResults = 0;

    ngOnInit() {
        // Initial load with default Bitcoin news
        this.loadNews();

        // Setup search debounce
        this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(term => {
            if (term) {
                this.searchNews(term);
            }
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSearchChange(term: string) {
        this.searchSubject.next(term);
    }

    search() {
        if (this.searchTerm.trim()) {
            this.searchNews(this.searchTerm);
        } else {
            this.loadNews();
        }
    }

    private searchNews(term: string) {
        this.isLoading = true;
        this.error = null;

        this.newsService.searchArticles(term).subscribe({
            next: (response) => {
                this.articles = response.articles;
                this.totalResults = response.totalResults;
                this.isLoading = false;
            },
            error: (error) => {
                this.error = error.message;
                this.isLoading = false;
            }
        });
    }

    private loadNews() {
        this.isLoading = true;
        this.error = null;

        this.newsService.getTopBitcoinNews().subscribe({
            next: (response) => {
                this.articles = response.articles;
                this.totalResults = response.totalResults;
                this.isLoading = false;
            },
            error: (error) => {
                this.error = error.message;
                this.isLoading = false;
            }
        });
    }
}