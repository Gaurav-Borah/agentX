import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 

interface HistoryItem {
  title: string;
  summary: string;
  date: string;
  type: 'file' | 'url';
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'] 
})
export class Dashboard {
  showProfile = false;
  selectedHistoryItem: number | null = null;

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
