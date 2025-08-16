import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  selected: string;
  correct: boolean;
}

@Component({
  selector: 'app-quiz-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-page.html',
  styleUrls: ['./quiz-page.scss']
})
export class QuizPage implements OnInit {

  qBank: Question[] = [
    {
      id: 1, question: "What is the capital of Haryana?",
      options: ["Yamunanagar", "Panipat", "Gurgaon", "Chandigarh"],
      answer: "Chandigarh", selected: '', correct: false
    },
    {
      id: 2, question: "What is the capital of Punjab?",
      options: ["Patiala", "Ludhiana", "Amritsar", "Chandigarh"],
      answer: "Chandigarh", selected: '', correct: false
    },
    {
      id: 3, question: "What is the capital of India?",
      options: ["Delhi", "Mumbai", "Kolkata", "Chennai"],
      answer: "Delhi", selected: '', correct: false
    },
    {
      id: 4, question: "What is the capital of Uttarakhand?",
      options: ["Roorkee", "Haridwar", "Dehradun", "Nainital"],
      answer: "Dehradun", selected: '', correct: false
    },
    {
      id: 5, question: "What is the capital of Uttar Pradesh?",
      options: ["GB Nagar", "Lucknow", "Prayagraj", "Agra"],
      answer: "Lucknow", selected: '', correct: false
    }
  ];

  // Data from details page
  transcript: string = '';
  url: string = '';
  isGeneratedQuiz = false; // Flag to know if this is a generated quiz

  quizSubmitted = false;
  score = 0;

  constructor(private router: Router) {
    // Check if quiz data was passed from details page
    const navigation = this.router.getCurrentNavigation();
    console.log('Quiz page navigation:', navigation);

    if (navigation?.extras?.state) {
      const receivedQBank = navigation.extras.state['qBank'];
      if (receivedQBank && Array.isArray(receivedQBank) && receivedQBank.length > 0) {
        this.qBank = receivedQBank;
        this.isGeneratedQuiz = true;
        console.log('Received generated quiz data:', this.qBank);
        console.log('Quiz questions count:', this.qBank.length);
      }

      // Store additional data
      this.transcript = navigation.extras.state['transcript'] || '';
      this.url = navigation.extras.state['url'] || '';
    } else {
      console.log('No navigation data - using default quiz questions');
      this.isGeneratedQuiz = false;
    }
  }

  ngOnInit(): void {
    // Additional initialization if needed
    if (this.isGeneratedQuiz) {
      console.log('Quiz page loaded with generated questions');
    } else {
      console.log('Quiz page loaded with default questions');
    }
  }

  selectAnswer(qId: number, option: string) {
    const question = this.qBank.find(q => q.id === qId);
    if (question) question.selected = option;
  }

  submitQuiz() {
    this.score = 0;
    this.qBank.forEach(question => {
      if (question.selected === question.answer) {
        question.correct = true;
        this.score++;
      } else {
        question.correct = false;
      }
    });
    this.quizSubmitted = true;
  }

  resetQuiz() {
    this.qBank.forEach(q => {
      q.selected = '';
      q.correct = false;
    });
    this.quizSubmitted = false;
    this.score = 0;
  }

  // Go back to details page with the original data
  goBackToDetails() {
    if (this.transcript && this.url) {
      this.router.navigate(['/details'], {
        state: {
          transcript: this.transcript,
          summary: '', // You might want to store and pass back the original summary
          url: this.url
        }
      });
    } else {
      // Fallback to dashboard
      this.router.navigate(['/dashboard']);
    }
  }

  // Go back to dashboard
  goBackToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  // Check if all questions have been answered
  allQuestionsAnswered(): boolean {
    return this.qBank.every(q => q.selected !== '');
  }
}