import React, { useState, useEffect } from 'react';
import { Receipt } from 'lucide-react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import { Expense, ExpenseFormData } from './types';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch expenses from Google Sheets
    setLoading(false);
  }, []);

  const handleAddExpense = async (formData: ExpenseFormData) => {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      date: formData.date,
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
    };

    // TODO: Add expense to Google Sheets
    setExpenses([...expenses, newExpense]);
  };

  const handleDeleteExpense = async (id: string) => {
    // TODO: Delete expense from Google Sheets
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-blue-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Expense Tracker</h1>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
              <span className="text-sm text-gray-500">Total Expenses</span>
              <p className="text-2xl font-bold text-blue-600">${totalExpenses.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ExpenseForm onSubmit={handleAddExpense} />
            </div>
            <div className="lg:col-span-2">
              <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;