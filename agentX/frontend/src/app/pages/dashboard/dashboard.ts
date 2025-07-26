import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { MarkdownComponent } from 'ngx-markdown';

interface HistoryItem {
  title: string;
  summary: string;
  date: string;
  type: 'file' | 'url';
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

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.auth.me().subscribe({
      next: (u) => (this.user = u),
      error: () => this.router.navigate(['/login'])
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

  historyItems: HistoryItem[] = [
    {
      title: 'Biology Chapter 3 (file.pdf)',
      summary: 'Photosynthesis occurs in the chloroplast and involves the conversion of light energy into chemical energy. The process includes light-dependent and light-independent reactions.',
      date: '2 hours ago',
      type: 'file'
    },
    {
      title: 'Article: Climate Change Impact',
      summary: 'This article discusses the main impacts of climate change on global ecosystems, including rising temperatures, sea level changes, and biodiversity loss.',
      date: '1 day ago',
      type: 'url'
    },
    {
      title: 'Chemistry Notes (notes.docx)',
      summary: 'Chemical reactions involve rearrangement of atoms and formation of new bonds. Types include synthesis, decomposition, and exchange reactions.',
      date: '3 days ago',
      type: 'file'
    },
    {
      title: 'Physics Lecture - Quantum Mechanics',
      summary: 'Introduction to quantum mechanics principles including wave-particle duality, uncertainty principle, and quantum states.',
      date: '1 week ago',
      type: 'file'
    }
  ];

  selectHistoryItem(index: number): void {
    this.selectedHistoryItem = index;
  }

  startNewChat(): void {
    this.selectedHistoryItem = null;
  }

  getCurrentSummary(): string {
    if (this.selectedHistoryItem !== null) {
      return this.historyItems[this.selectedHistoryItem].summary;
    }
    return '';
  }

}
