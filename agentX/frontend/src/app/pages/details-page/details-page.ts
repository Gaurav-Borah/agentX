import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-details-page',
  templateUrl: './details-page.html',
  styleUrl: './details-page.scss'
})
export class DetailsPage {
  // NEW/UPDATED: Flex basis values for panels, initial values.
  leftPanelFlex = 1.1;
  rightPanelFlex = 0.9;
  youtubeHeight = 260; // in px, initial video height
  minYoutubeHeight = 120;
  minTranscriptHeight = 100;

  // NEW: Tracking resizer state
  private resizing = false;
  private resizeDirection: 'vertical' | 'horizontal' | null = null;
  private startX = 0;
  private startY = 0;
  private startLeftFlex = 1.1;
  private startRightFlex = 0.9;
  private startYoutubeHeight = 260;

  // Called when user presses mouse on resizer
  onMouseDown(direction: 'vertical' | 'horizontal', event: MouseEvent) {
    event.preventDefault();
    this.resizing = true;
    this.resizeDirection = direction;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startLeftFlex = this.leftPanelFlex;
    this.startRightFlex = this.rightPanelFlex;
    this.startYoutubeHeight = this.youtubeHeight;
    // Add dragging classes to show highlight (optional)
    document.body.classList.add('resizing');
  }

  // Mouse move over the panels (could be over left/right panel)
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.resizing) return;
    if (this.resizeDirection === 'vertical') {
      // Calculate how much X movement
      const deltaX = event.clientX - this.startX;
      // Adjust flex numbers proportionally
      // Total flex is 2 (1.1+0.9)
      const totalFlex = this.startLeftFlex + this.startRightFlex;
      // Widths of both panels in px
      const detailsPage = document.querySelector('.details-page') as HTMLElement;
      if (!detailsPage) return;
      const width = detailsPage.clientWidth;
      // Update flex values based on deltaX
      let leftWidth = (this.startLeftFlex / totalFlex) * width + deltaX;
      let rightWidth = width - leftWidth;
      // Set minimum widths
      if (leftWidth < 160) leftWidth = 160;
      if (rightWidth < 160) rightWidth = 160;
      this.leftPanelFlex = leftWidth / width * totalFlex;
      this.rightPanelFlex = rightWidth / width * totalFlex;
    } else if (this.resizeDirection === 'horizontal') {
      // Calculate Y movement
      const deltaY = event.clientY - this.startY;
      // Set YouTube container height
      let newHeight = this.startYoutubeHeight + deltaY;
      if (newHeight < this.minYoutubeHeight) newHeight = this.minYoutubeHeight;
      // 340px container: prevent overlap/overflow
      if (newHeight > 340 - this.minTranscriptHeight) newHeight = 340 - this.minTranscriptHeight;
      this.youtubeHeight = newHeight;
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (this.resizing) {
      this.resizing = false;
      this.resizeDirection = null;
      // Remove highlighting classes
      document.body.classList.remove('resizing');
    }
  }
}
