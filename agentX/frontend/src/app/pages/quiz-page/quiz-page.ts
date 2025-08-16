import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    imports: [CommonModule,FormsModule],
  templateUrl: './quiz-page.html',
  styleUrls: ['./quiz-page.scss']
})
export class QuizPageComponent {

  qBank: Question[] = [
    { id: 1, question: "What is the capital of Haryana?",
      options: ["Yamunanagar", "Panipat", "Gurgaon", "Chandigarh"],
      answer: "Chandigarh", selected: '', correct: false },
    { id: 2, question: "What is the capital of Punjab?",
      options: ["Patiala", "Ludhiana", "Amritsar", "Chandigarh"],
      answer: "Chandigarh", selected: '', correct: false },
    { id: 3, question: "What is the capital of India?",
      options: ["Delhi", "Mumbai", "Kolkata", "Chennai"],
      answer: "Delhi", selected: '', correct: false },
    { id: 4, question: "What is the capital of Uttarakhand?",
      options: ["Roorkee", "Haridwar", "Dehradun", "Nainital"],
      answer: "Dehradun", selected: '', correct: false },
    { id: 5, question: "What is the capital of Uttar Pradesh?",
      options: ["GB Nagar", "Lucknow", "Prayagraj", "Agra"],
      answer: "Lucknow", selected: '', correct: false }
  ];

  quizSubmitted = false;
  score = 0;

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
}
