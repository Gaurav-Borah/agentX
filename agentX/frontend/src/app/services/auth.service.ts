// src/app/services/auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

const API_URL = 'http://localhost:8000/auth';

export interface Question {
    id: number;
    question: string;
    options: string[];
    answer: string;
    selected: string;
    correct: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    constructor(
        private http: HttpClient,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    signup(data: any): Observable<any> {
        return this.http.post(`${API_URL}/signup`, data, { withCredentials: true });
    }

    login(data: any): Observable<any> {
        return this.http.post(`${API_URL}/login`, data, { withCredentials: true });
    }

    me(): Observable<any> {
        return this.http.get(`${API_URL}/me`, { withCredentials: true });
    }

    logout(): Observable<any> {
        return this.http.post(`${API_URL}/logout`, {}, { withCredentials: true });
    }
    getTranscript(url: string): Observable<any> {
        return this.http.post(
            `${API_URL}/get_transcript`,
            { url },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        );
    }

    getDetailedNotes(url: string): Observable<any> {
        return this.http.post(
            `${API_URL}/generate_detailed_notes`,
            { url },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        );
    }

    getUserConversations(): Observable<any> {
        return this.http.get(`${API_URL}/conversations`, { withCredentials: true });
    }

    // Add this method to your AuthService class
    generateTest(transcript: string): Observable<{ questions: Question[] }> {
        const url = `${API_URL}/generate_quiz`;
        const body = { transcript: transcript };

        return this.http.post<{ questions: Question[] }>(url, body, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
    }

    postPayments(amount: any): Observable<any> {
        return this.http.post(
            `${API_URL}/create-checkout-session`,
            amount,

        );
    }

    getstripepublishablekey(apiKey: string): Observable<any> {
        return this.http.post(
            `${API_URL}/stripe-publishable-key`,
            apiKey,

        );
    }


}