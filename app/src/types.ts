export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface ExpenseFormData {
  date: string;
  description: string;
  amount: string;
  category: string;
}