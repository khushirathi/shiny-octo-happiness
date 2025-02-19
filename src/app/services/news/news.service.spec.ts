// src/app/services/news.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NewsService } from './news.service';
import { NewsApiResponse, Article } from './news.interface';
import { environment } from '../../../../environments/environment';

describe('NewsService', () => {
    let service: NewsService;
    let httpMock: HttpTestingController;

    const mockArticle: Article = {
        source: {
            id: null,
            name: "Gizmodo.com"
        },
        author: "AJ Dellinger",
        title: "MicroStrategy Says Drop the Micro, It's Cleaner",
        description: "The tech company turned Bitcoin repository is changing its name.",
        url: "sample url",
        urlToImage: "another sample url",
        publishedAt: "2025-02-06T13:45:12Z",
        content: "Test content multiline long content"
    };

    const mockNewsResponse: NewsApiResponse = {
        status: "ok",
        totalResults: 1,
        articles: [mockArticle]
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [NewsService]
        });

        service = TestBed.inject(NewsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getArticles', () => {
        it('should fetch articles with basic query parameters', () => {
            service.getArticles({ q: 'bitcoin' }).subscribe(response => {
                expect(response).toEqual(mockNewsResponse);
            });

            const req = httpMock.expectOne(req => 
                req.url === 'https://newsapi.org/v2/everything' &&
                req.params.get('q') === 'bitcoin'
            );

            expect(req.request.method).toBe('GET');
            expect(req.request.headers.get('X-Api-Key')).toBe(environment.apiKey);
            req.flush(mockNewsResponse);
        });

        it('should include all optional parameters when provided', () => {
            const queryParams = {
                q: 'bitcoin',
                page: 1,
                pageSize: 20,
                sortBy: 'publishedAt' as const,
                language: 'en',
                from: '2024-01-01',
                to: '2024-02-01'
            };

            service.getArticles(queryParams).subscribe(response => {
                expect(response).toEqual(mockNewsResponse);
            });

            const req = httpMock.expectOne(req => {
                const params = req.params;
                return req.url === 'https://newsapi.org/v2/everything' &&
                    params.get('q') === 'bitcoin' &&
                    params.get('page') === '1' &&
                    params.get('pageSize') === '20' &&
                    params.get('sortBy') === 'publishedAt' &&
                    params.get('language') === 'en' &&
                    params.get('from') === '2024-01-01' &&
                    params.get('to') === '2024-02-01';
            });

            expect(req.request.method).toBe('GET');
            req.flush(mockNewsResponse);
        });
    });

    describe('searchArticles', () => {
        it('should fetch articles with search term', () => {
            service.searchArticles('crypto').subscribe(response => {
                expect(response).toEqual(mockNewsResponse);
            });

            const req = httpMock.expectOne(req => 
                req.url === 'https://newsapi.org/v2/everything' &&
                req.params.get('q') === 'crypto' &&
                req.params.get('pageSize') === '20' &&
                req.params.get('sortBy') === 'publishedAt'
            );

            expect(req.request.method).toBe('GET');
            req.flush(mockNewsResponse);
        });
    });

    describe('getTopBitcoinNews', () => {
        it('should fetch top bitcoin news', () => {
            service.getTopBitcoinNews().subscribe(response => {
                expect(response).toEqual(mockNewsResponse);
            });

            const req = httpMock.expectOne(req => 
                req.url === 'https://newsapi.org/v2/everything' &&
                req.params.get('q') === 'bitcoin' &&
                req.params.get('pageSize') === '10' &&
                req.params.get('sortBy') === 'popularity'
            );

            expect(req.request.method).toBe('GET');
            req.flush(mockNewsResponse);
        });
    });

    describe('error handling', () => {
        it('should handle 401 unauthorized error', () => {
            service.getArticles({ q: 'bitcoin' }).subscribe({
                error: error => {
                    expect(error.message).toBe('Invalid API key. Please check your configuration.');
                }
            });

            const req = httpMock.expectOne(req => req.url === 'https://newsapi.org/v2/everything');
            req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
        });

        it('should handle 429 rate limit error', () => {
            service.getArticles({ q: 'bitcoin' }).subscribe({
                error: error => {
                    expect(error.message).toBe('Too many requests. Please try again later.');
                }
            });

            const req = httpMock.expectOne(req => req.url === 'https://newsapi.org/v2/everything');
            req.flush('Too Many Requests', { status: 429, statusText: 'Too Many Requests' });
        });

        it('should handle network error', () => {
            service.getArticles({ q: 'bitcoin' }).subscribe({
                error: error => {
                    expect(error.message).toContain('Error:');
                }
            });

            const req = httpMock.expectOne(req => req.url === 'https://newsapi.org/v2/everything');
            req.error(new ErrorEvent('Network error'));
        });
    });
});