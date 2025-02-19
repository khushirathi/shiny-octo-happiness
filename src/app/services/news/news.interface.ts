// src/app/models/news.interface.ts

export interface NewsSource {
    id: string | null;
    name: string;
}

export interface Article {
    source: NewsSource;
    author: string;
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    content: string;
}

export interface NewsApiResponse {
    status: string;
    totalResults: number;
    articles: Article[];
}

export interface NewsQueryParams {
    q: string;
    page?: number;
    pageSize?: number;
    sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
    language?: string;
    from?: string;
    to?: string;
}