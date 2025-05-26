import React, { useState, useEffect } from "react";
import Loading from "./Loading";
import "./App.css";
// import SellIcon from "@mui/icons-material/Sell";
import axios from "axios";
import supabase from './supabaseClient';

function App() {
  console.log("supabase")
  console.log(supabase)
  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyBT9PZzeP0p0uxlcFL6zDQyBtL2QCTW7k0XdobKhbVTiX08QHAj20MDiq1j8jHMmHn/exec";

  const incomeCategories = ["Salary", "Business", "Investment", "Other"];
  const expenseCategories = [
    "Food",
    "Transport",
    "Entertainment",
    "Bills",
    "Other",
  ];

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    category: "",
    date: "",
    note: "",
  });

  const deleteRow = (indexToDelete) => {
    const transactionToDelete = transactions[indexToDelete];
    const amount = parseInt(transactionToDelete.Amount);

    let updatedIncome = totalIncome;
    let updatedExpense = totalExpense;

    if (transactionToDelete.Type === "income") {
      updatedIncome -= amount;
    } else {
      updatedExpense -= amount;
    }

    const updatedBalance = updatedIncome - updatedExpense;

    const updatedTransactions = transactions.filter(
      (_, index) => index !== indexToDelete
    );

    setTransactions(updatedTransactions);
    setTotalIncome(updatedIncome);
    setTotalExpense(updatedExpense);
    setTotalBalance(updatedBalance);
  };

  const fetchTodos = async () => {
    const { data, error } = await supabase.from('expense_tracker').select('*');
    if (error) console.error('Fetch error:', error);
    else console.log(data)
  };

  useEffect(() => {
    fetchTodos()
    fetch(GOOGLE_SCRIPT_URL)
      .then((res) => res.json())
      .then((data) => {
        console.log("Google Sheet Data:", data);
        if (data && data.length > 0) {
          setTransactions(data);
          setTotalIncome(data[data.length - 1].Income || 0);
          setTotalExpense(data[data.length - 1].Expense || 0);
          setTotalBalance(data[data.length - 1].Balance || 0);
        }
      })
      .catch((err) => console.error("Error fetching data:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        category: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "date" ? new Date(value).toISOString() : value,
      }));
    }
  };

  const clearFormData = () => {
    setFormData({
      type: "",
      amount: "",
      category: "",
      date: "",
      note: "",
    });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const amount = parseInt(formData.amount) || 0;
  //   let updatedIncome = totalIncome;
  //   let updatedExpense = totalExpense;
  //   let updatedBalance = totalBalance;

  //   if (formData.type === "income") {
  //     updatedIncome += amount;
  //     updatedBalance += amount;
  //   } else {
  //     updatedExpense += amount;
  //     updatedBalance -= amount;
  //     if (updatedBalance < 0) {
  //       updatedBalance = 0;
  //     }
  //   }

  //   const newTransaction = {
  //     ID:
  //       transactions.length > 0
  //         ? transactions[transactions.length - 1].ID + 1
  //         : 1,
  //     Type: formData.type,
  //     Amount: amount,
  //     Category: formData.category,
  //     Date: formData.date,
  //     Note: formData.note || "----",
  //     Income: updatedIncome,
  //     Expense: updatedExpense,
  //     Balance: updatedBalance,
  //   };

  //   console.log(newTransaction);

  //   setTransactions((prev) => [newTransaction, ...prev]);
  //   setTotalIncome(updatedIncome);
  //   setTotalExpense(updatedExpense);
  //   setTotalBalance(updatedBalance);

  //   try {
  //     const response = await axios.post(GOOGLE_SCRIPT_URL, formData);
  //     console.log("Data saved successfully:", response.data);
  //   } catch (error) {
  //     console.error("Error saving data:", error);
  //   }

  //   clearFormData();
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = parseInt(formData.amount) || 0;
    let updatedIncome = totalIncome;
    let updatedExpense = totalExpense;
    let updatedBalance = totalBalance;

    if (formData.type === "income") {
      updatedIncome += amount;
      updatedBalance += amount;
    } else {
      updatedExpense += amount;
      updatedBalance -= amount;
      if (updatedBalance < 0) {
        updatedBalance = 0;
      }
    }

    const newId =
      transactions.length > 0
        ? Math.max(...transactions.map((tx) => tx.ID)) + 1
        : 1;

    try {
      const sheetData = {
        action: "addTransaction",
        data: {
          ID: newId,
          Date: formData.date || new Date().toISOString(),
          Type: formData.type,
          Amount: amount,
          Category: formData.category,
          Note: formData.note || "",
          Income: updatedIncome,
          Expense: updatedExpense,
          Balance: updatedBalance,
        },
      };

      const response = await axios.post(GOOGLE_SCRIPT_URL, sheetData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.result === "success") {
        const newTransaction = {
          ID: newId,
          Date: sheetData.data.Date,
          Type: formData.type,
          Amount: amount,
          Category: formData.category,
          Note: formData.note || "----",
          Income: updatedIncome,
          Expense: updatedExpense,
          Balance: updatedBalance,
        };

        setTransactions((prev) => [newTransaction, ...prev]);
        setTotalIncome(updatedIncome);
        setTotalExpense(updatedExpense);
        setTotalBalance(updatedBalance);
        clearFormData();
      } else {
        throw new Error("Failed to save to Google Sheet");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save transaction. Please try again.");
    }
  };

  

  return (
    <div className="container mx-auto mt-10">
      {loading ? (
        <Loading />
      ) : (
        <div className="box p-5">
          <div className="header flex justify-between items-center">
            <div className="title">
              <p className="titleFont">Expense Tracker</p>
            </div>

            <div className="flex">
              <div className="totalExpense p-2">
                <p>Total Income</p>
                <p className="text-green-500">₹ {totalIncome}</p>
              </div>
              <div className="totalExpense p-2 ml-3">
                <p>Total Expense</p>
                <p className="text-red-500">₹ {totalExpense}</p>
              </div>
              <div className="totalExpense p-2 ml-3">
                <p>Total Balance</p>
                <p className="text-blue-500">₹ {totalBalance}</p>
              </div>
            </div>
          </div>
          <div className="content grid md:grid-cols-3 gap-4 mt-6">
            <div className="form md:col-span-1 p-4 rounded bg-white shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                Add New Transaction
              </h2>
              <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Type <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">-- Select --</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">-- Select --</option>
                      {(formData.type === "income"
                        ? incomeCategories
                        : formData.type === "expense"
                        ? expenseCategories
                        : []
                      ).map((cat) => (
                        <option key={cat} value={cat.toLowerCase()}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount || ""}
                      onChange={handleChange}
                      required
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date ? formData.date.slice(0, 10) : ""}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Note
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      rows="3"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-between">
                    <div className="w-1/2 pr-2">
                      <button
                        type="reset"
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="w-1/2 pl-2">
                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="showTransaction md:col-span-2 p-4 rounded shadow-inner">
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto bg-white border rounded shadow-sm">
                  <thead>
                    <tr className="bg-blue-100 text-left text-sm font-medium text-gray-700">
                      <th className="px-4 py-2 border">Date</th>
                      <th className="px-4 py-2 border">Type</th>
                      <th className="px-4 py-2 border">Category</th>
                      <th className="px-4 py-2 border">Note</th>
                      <th className="px-4 py-2 border">Amount</th>
                      <th className="px-4 py-2 border">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center text-gray-500 italic py-4"
                        >
                          No transactions to display yet.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx, index) => (
                        <tr key={index} className="text-sm border-t">
                          <td className="px-4 py-2 border">
                            {tx.Date?.slice(0, 10)}
                          </td>
                          <td className="px-4 py-2 border capitalize">
                            {tx.Type}
                          </td>
                          <td className="px-4 py-2 border capitalize">
                            {tx.Category}
                          </td>
                          <td className="px-4 py-2 border">{tx.Note}</td>
                          <td className="px-4 py-2 border">₹ {tx.Amount}</td>
                          <td className="px-4 py-2 border text-center">
                            <button
                              onClick={() => deleteRow(index)}
                              className="px-3 py-1 text-red-500 rounded"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
