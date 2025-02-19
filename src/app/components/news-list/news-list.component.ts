// src/app/components/news-list/news-list.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { NewsService } from '../../services/news/news.service';
import { Article } from '../../services/news/news.interface';

@Component({
  selector: 'app-news-list',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.scss'
})

export class NewsListComponent implements OnInit {
    private newsService = inject(NewsService);
    
    articles: Article[] = [];
    isLoading = false;
    error: string | null = null;

    ngOnInit() {
        this.loadNews();
    }

    loadNews() {
        this.isLoading = true;
        this.error = null;

        this.newsService.getTopBitcoinNews().subscribe({
            next: (response) => {
                this.articles = response.articles;
                this.isLoading = false;
            },
            error: (error) => {
                this.error = error.message;
                this.isLoading = false;
            }
        });
    }
}