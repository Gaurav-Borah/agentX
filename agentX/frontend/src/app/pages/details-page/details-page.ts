import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MarkdownComponent } from 'ngx-markdown';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-details-page',
  imports: [CommonModule, MarkdownComponent],
  templateUrl: './details-page.html',
  styleUrl: './details-page.scss'
})
export class DetailsPage implements OnInit {
  // Data received from dashboard
  transcript: string = '';
  summary: string = '';
  url: string = '';
  detailedNotes: string = '';

  // NEW: Safe embed URL (precomputed to avoid iframe flicker)
  safeEmbedUrl: SafeResourceUrl | null = null;

  // Flex basis values for panels
  leftPanelFlex = 1.1;
  rightPanelFlex = 0.9;
  youtubeHeight = 220; // in px, initial video height
  minYoutubeHeight = 100;
  minTranscriptHeight = 140;

  exporting = false;
  showDetailedNotes = false; // Track if detailed notes are being shown

  // Tracking resizer state
  resizing = false; // Made public so template can access it
  private resizeDirection: 'vertical' | 'horizontal' | null = null;
  private startX = 0;
  private startY = 0;
  private startLeftFlex = 1.1;
  private startRightFlex = 0.9;
  private startYoutubeHeight = 220;

  constructor(
    private auth: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.transcript = String(navigation.extras.state['transcript'] || '');
      this.summary = String(navigation.extras.state['summary'] || '');
      this.url = navigation.extras.state['url'] || '';
    }
  }

  ngOnInit(): void {
    if (!this.transcript && !this.url) {
      console.warn('No transcript or URL data found. Redirecting to dashboard.');
      this.router.navigate(['/dashboard']);
    }

    // Precompute YouTube embed URL once to prevent flickering
    this.safeEmbedUrl = this.buildYouTubeEmbedUrl(this.url);
  }

  // Helper method to build YouTube embed URL
  private buildYouTubeEmbedUrl(url: string): SafeResourceUrl | null {
    if (!url) return null;

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      const videoId = match[2];
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }

    return null;
  }

  // Resizer logic
  onMouseDown(direction: 'vertical' | 'horizontal', event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.resizing = true;
    this.resizeDirection = direction;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startLeftFlex = this.leftPanelFlex;
    this.startRightFlex = this.rightPanelFlex;
    this.startYoutubeHeight = this.youtubeHeight;

    document.body.classList.add('resizing');

    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.style.pointerEvents = 'none';
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.resizing) return;
    event.preventDefault();

    if (this.resizeDirection === 'vertical') {
      const deltaX = event.clientX - this.startX;
      const totalFlex = this.startLeftFlex + this.startRightFlex;
      const detailsPage = document.querySelector('.details-page') as HTMLElement;
      if (!detailsPage) return;
      const width = detailsPage.clientWidth;

      let leftWidth = (this.startLeftFlex / totalFlex) * width + deltaX;
      let rightWidth = width - leftWidth;

      if (leftWidth < 160) leftWidth = 160;
      if (rightWidth < 160) rightWidth = 160;

      this.leftPanelFlex = (leftWidth / width) * totalFlex;
      this.rightPanelFlex = (rightWidth / width) * totalFlex;
    } else if (this.resizeDirection === 'horizontal') {
      const deltaY = event.clientY - this.startY;
      let newHeight = this.startYoutubeHeight + deltaY;
      if (newHeight < this.minYoutubeHeight) newHeight = this.minYoutubeHeight;
      if (newHeight > 340 - this.minTranscriptHeight) {
        newHeight = 340 - this.minTranscriptHeight;
      }
      this.youtubeHeight = newHeight;
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.resizing) {
      event.preventDefault();
      event.stopPropagation();
      this.resizing = false;
      this.resizeDirection = null;
      document.body.classList.remove('resizing');

      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.style.pointerEvents = 'auto';
      }
    }
  }

  // Navigation helper
  goBackToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  // Notes export
  exportNotes(): void {
    this.exporting = true;
    this.auth.getDetailedNotes(this.url).subscribe({
      next: (res) => {
        this.exporting = false;
        console.log('detailed_notes raw response:', res);

        if (res && typeof res === 'object' && 'detailed_notes' in res) {
          this.detailedNotes = res.detailed_notes;
        } else if (typeof res === 'string') {
          this.detailedNotes = res;
        } else {
          console.warn('Unexpected response format:', res);
          this.detailedNotes = String(res || '');
        }

        this.showDetailedNotes = true;
        console.log('Final detailedNotes:', this.detailedNotes);
      },
      error: (err) => {
        this.exporting = false;
        console.error('Error exporting notes:', err);
        alert('Failed to export notes.');
      },
    });
  }
}
