import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Interface representing a quiz question structure
 */
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  category?: string;
}

/**
 * Interface representing quiz statistics
 */
interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  correctAnswers: string[];
  incorrectAnswers: { question: string; userAnswer: string; correctAnswer: string }[];
}

@Component({
  selector: 'app-quiz-page',
  imports: [CommonModule],
  templateUrl: './quiz-page.html',
  styleUrls: ['./quiz-page.scss']
})
export class QuizPageComponent implements OnInit {
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC PROPERTIES
  // ═══════════════════════════════════════════════════════════════════════════
  
  readonly questions: QuizQuestion[] = [
    {
      id: 1,
      question: 'What is the capital of France?',
      options: ['Madrid', 'Berlin', 'Paris', 'Rome'],
      correctAnswer: 'Paris',
      category: 'Geography'
    },
    {
      id: 2,
      question: 'What is the result of 2 + 2?',
      options: ['3', '4', '5', '22'],
      correctAnswer: '4',
      category: 'Mathematics'
    },
    {
      id: 3,
      question: 'Which planet is known as the Red Planet?',
      options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 'Mars',
      category: 'Science'
    },
    {
      id: 4,
      question: 'Who painted the Mona Lisa?',
      options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Claude Monet'],
      correctAnswer: 'Leonardo da Vinci',
      category: 'Art'
    },
    {
      id: 5,
      question: 'What is the largest ocean on Earth?',
      options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
      correctAnswer: 'Pacific Ocean',
      category: 'Geography'
    },
    {
      id: 6,
      question: 'In which year did World War II end?',
      options: ['1943', '1944', '1945', '1946'],
      correctAnswer: '1945',
      category: 'History'
    },
    {
      id: 7,
      question: 'What is the chemical symbol for gold?',
      options: ['Go', 'Gd', 'Au', 'Ag'],
      correctAnswer: 'Au',
      category: 'Science'
    },
    {
      id: 8,
      question: 'Which programming language is known for web development?',
      options: ['Python', 'JavaScript', 'C++', 'Java'],
      correctAnswer: 'JavaScript',
      category: 'Technology'
    },
    {
      id: 9,
      question: 'What is the smallest prime number?',
      options: ['0', '1', '2', '3'],
      correctAnswer: '2',
      category: 'Mathematics'
    }
  ];

  selectedAnswers: Map<number, string> = new Map();
  quizResult: QuizResult | null = null;
  isQuizCompleted = false;
  isSubmitting = false;

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE HOOKS
  // ═══════════════════════════════════════════════════════════════════════════

  ngOnInit(): void {
    this.initializeQuiz();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * TrackBy function for questions to optimize *ngFor performance
   * @param index - The index of the item
   * @param question - The question object
   * @returns The unique identifier for tracking
   */
  trackByQuestionId(index: number, question: QuizQuestion): number {
    return question.id;
  }

  /**
   * TrackBy function for options to optimize *ngFor performance
   * @param index - The index of the item
   * @param option - The option string
   * @returns The option string for tracking
   */
  trackByOption(index: number, option: string): string {
    return option;
  }

  /**
   * Handles option selection for a specific question
   * @param questionId - The ID of the question
   * @param selectedOption - The selected answer option
   */
  onOptionSelected(questionId: number, selectedOption: string): void {
    this.selectedAnswers.set(questionId, selectedOption);
  }

  /**
   * Checks if an option is selected for a given question
   * @param questionId - The ID of the question
   * @param option - The option to check
   * @returns boolean indicating if the option is selected
   */
  isOptionSelected(questionId: number, option: string): boolean {
    return this.selectedAnswers.get(questionId) === option;
  }

  /**
   * Checks if all questions have been answered
   * @returns boolean indicating if quiz is complete
   */
  get canSubmitQuiz(): boolean {
    return this.selectedAnswers.size === this.questions.length;
  }

  /**
   * Submits the quiz and calculates results
   */
  async onSubmitQuiz(): Promise<void> {
    if (!this.canSubmitQuiz) return;

    this.isSubmitting = true;
    
    // Simulate API call delay for better UX
    await this.delay(800);
    
    this.quizResult = this.calculateQuizResult();
    this.isQuizCompleted = true;
    this.isSubmitting = false;
  }

  /**
   * Resets the quiz to initial state
   */
  onResetQuiz(): void {
    this.initializeQuiz();
  }

  /**
   * Gets the completion progress as a percentage
   */
  get completionProgress(): number {
    return Math.round((this.selectedAnswers.size / this.questions.length) * 100);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  private initializeQuiz(): void {
    this.selectedAnswers.clear();
    this.quizResult = null;
    this.isQuizCompleted = false;
    this.isSubmitting = false;
  }

  private calculateQuizResult(): QuizResult {
    let correctCount = 0;
    const correctAnswers: string[] = [];
    const incorrectAnswers: { question: string; userAnswer: string; correctAnswer: string }[] = [];

    this.questions.forEach(question => {
      const userAnswer = this.selectedAnswers.get(question.id);
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) {
        correctCount++;
        correctAnswers.push(question.question);
      } else if (userAnswer) {
        incorrectAnswers.push({
          question: question.question,
          userAnswer,
          correctAnswer: question.correctAnswer
        });
      }
    });

    return {
      score: correctCount,
      totalQuestions: this.questions.length,
      percentage: Math.round((correctCount / this.questions.length) * 100),
      correctAnswers,
      incorrectAnswers
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
