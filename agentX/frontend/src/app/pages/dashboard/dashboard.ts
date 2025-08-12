import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { MarkdownComponent } from 'ngx-markdown';

interface HistoryItem {
  id: number;
  url: string;
  transcript: string;
  date: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, MarkdownComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard {
  user: any = null;
  showProfile = false;
  selectedHistoryItem: number | null = null;
  selectedTab = 'summariser';
  pastedUrl = '';

  // NEW: transcript related state
  transcript: any = null;
  transcriptError: string | null = null;
  transcriptLoading = false;

  historyItems: HistoryItem[] = [];
  historyLoading = false;
  historyError: string | null = null;

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadUserHistory();
    this.auth.me().subscribe({
      next: (u) => {
        this.user = u;
        this.cdr.markForCheck();
        // If history wasn't loaded yet due to auth issues, try again
        if (this.historyItems.length === 0 && !this.historyLoading && !this.historyError) {
          this.loadUserHistory();
        }
      },
      error: () => this.router.navigate(['/login'])
    });
  }
  loadUserHistory(): void {
    this.historyLoading = true;
    this.historyError = null;

    this.auth.getUserConversations()
      .pipe(finalize(() => this.historyLoading = false))
      .subscribe({
        next: (response) => {
          console.log('User conversations loaded:', response);
          this.historyItems = response.conversations || [];;
        },
        error: (err) => {
          console.error('Failed to load user history:', err);
          this.historyError = 'Failed to load conversation history';
          // Keep empty array if loading fails
          this.historyItems = [];
        }
      });
  }

  logout() {
    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }
  generateSummary() {
    if (!this.pastedUrl) {
      this.transcriptError = 'Please paste a URL first.';
      return;
    }

    this.transcriptLoading = true;
    this.transcriptError = null;
    this.transcript = null;

    this.auth.getTranscript(this.pastedUrl)
      .pipe(finalize(() => {
        this.transcriptLoading = false;   // <-- will ALWAYS run (success or error)
        // this.cdr.markForCheck();        // if you're on OnPush CD, uncomment after injecting ChangeDetectorRef
      }))
      .subscribe({
        next: (res) => {
          console.log('get_transcript success:', res);
          this.transcript = res.text;
          this.loadUserHistory();
        },
        error: (err) => {
          console.error('get_transcript error:', err);
          this.transcriptError = err?.error?.detail || 'Failed to fetch transcript';
        }
      });
  }
  get prettyTranscript(): string {
    return JSON.stringify(this.transcript, null, 2);
  }

  selectHistoryItem(index: number): void {
    this.selectedHistoryItem = index;
    // Load the transcript and URL from selected history item
    const selectedItem = this.historyItems[index];
    if (selectedItem) {
      this.transcript = selectedItem.transcript;
      this.pastedUrl = selectedItem.url;
    }
  }

  startNewChat(): void {
    this.selectedHistoryItem = null;
    this.transcript = null;
    this.transcriptError = null;
    this.pastedUrl = '';
  }

  getCurrentSummary(): string {
    if (this.selectedHistoryItem !== null && this.historyItems[this.selectedHistoryItem]) {
      return this.historyItems[this.selectedHistoryItem].transcript;
    }
    return '';
  }

  // Helper method to refresh history (useful after creating new conversations)
  refreshHistory(): void {
    this.loadUserHistory();
  }

  // Helper method to get relative time formatting
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }
}

