export interface Test {
  ID: number;
  Title: string;
  description: string;
  time_limit: number; // in minutes
  Questions?: Question[];
}

export interface Question {
  ID: number;
  test_id: number;
  text: string;
  type: 'single_choice' | 'multiple_choice' | 'text';
  time_limit?: number; // in milliseconds (stored as this in DB sometimes)
  Options?: Option[];
}

export interface Option {
  ID: number;
  question_id: number;
  text: string;
  is_correct: boolean;
  correct_text?: string; // for text-type questions
}

export interface UserAnswer {
  ID: number;
  test_id: number;
  question_id: number;
  user_id: string;
  type: string;
  text_answer?: string;
  SelectedOptions: { option_id: number }[];
  is_correct_answer: boolean;
  user?: {
    full_name: string;
    username: string;
  };
  question?: {
    text: string;
    Options: Option[];
  };
}
