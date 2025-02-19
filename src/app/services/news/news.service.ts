// src/app/services/news.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { NewsApiResponse, NewsQueryParams } from './news.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NewsService {
    private readonly apiUrl = 'https://newsapi.org/v2/everything';
    private readonly headers = new HttpHeaders().set('X-Api-Key', environment.apiKey);
    private http = inject(HttpClient);

    getArticles(queryParams: NewsQueryParams): Observable<NewsApiResponse> {
        let params = new HttpParams()
            .set('q', queryParams.q);

        // Add optional parameters if they exist
        if (queryParams.page) {
            params = params.set('page', queryParams.page.toString());
        }
        if (queryParams.pageSize) {
            params = params.set('pageSize', queryParams.pageSize.toString());
        }
        if (queryParams.sortBy) {
            params = params.set('sortBy', queryParams.sortBy);
        }
        if (queryParams.language) {
            params = params.set('language', queryParams.language);
        }
        if (queryParams.from) {
            params = params.set('from', queryParams.from);
        }
        if (queryParams.to) {
            params = params.set('to', queryParams.to);
        }

        return this.http.get<NewsApiResponse>(this.apiUrl, {
            headers: this.headers,
            params
        }).pipe(
            catchError(this.handleError)
        );
    }

    searchArticles(searchTerm: string): Observable<NewsApiResponse> {
        return this.getArticles({
            q: searchTerm,
            pageSize: 20,
            sortBy: 'publishedAt'
        });
    }

    getTopBitcoinNews(): Observable<NewsApiResponse> {
        return this.getArticles({
            q: 'bitcoin',
            pageSize: 10,
            sortBy: 'popularity'
        });
    }

    private handleError(error: any) {
        let errorMessage = 'An error occurred while fetching news data.';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Server-side error
            switch (error.status) {
                case 401:
                    errorMessage = 'Invalid API key. Please check your configuration.';
                    break;
                case 429:
                    errorMessage = 'Too many requests. Please try again later.';
                    break;
                case 500:
                    errorMessage = 'Server error. Please try again later.';
                    break;
                default:
                    errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
            }
        }

        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}