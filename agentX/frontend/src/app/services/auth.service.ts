// src/app/services/auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

const API_URL = 'http://localhost:8000/auth';

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
            { withCredentials: true }
        );
    }

}