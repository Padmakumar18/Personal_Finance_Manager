import React, { useState, useEffect } from "react";
import Loading from "./Loading";
import "./App.css";
import supabase from "./supabaseClient";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const incomeCategories = ["Salary", "Business", "Investment", "Other"];
  const expenseCategories = [
    "Food",
    "Transport",
    "Entertainment",
    "Bills",
    "Other",
  ];

  const [totalIncome, setTotalIncome] = useState(0);

  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchExpenses(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchExpenses(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // console.log("user")
    // console.log(user)
    // console.log("transactions");
    // console.log(transactions);
    findIncomeExpense();
  }, [user, transactions]);

  const findIncomeExpense = () => {
    if (transactions && transactions.length > 0) {
      let updatedIncome = 0;
      let updatedExpense = 0;
      let updatedBalance = 0;
      console.log("All Transactions:");
      console.table(transactions);

      transactions.forEach((a) => {
        if (a.type === "income") {
          updatedIncome = updatedIncome + a.income;
        } else if (a.type === "expense") {
          updatedExpense = updatedExpense + a.expense;
        }
      });
      updatedBalance =
        updatedIncome - updatedExpense < 0 ? 0 : updatedIncome - updatedExpense;
      setTotalIncome(updatedIncome);
      setTotalExpense(updatedExpense);
      setTotalBalance(updatedBalance);
    } else {
      console.log("🚫 No transactions found.");
    }
  };

  const deleteRow = async (id) => {
    const transactionToDelete = transactions.find((item) => item.id === id);
    const amount = parseInt(transactionToDelete.amount);

    let updatedIncome = totalIncome;
    let updatedExpense = totalExpense;
    if (transactionToDelete.type === "income") {
      updatedIncome -= amount;
    } else {
      updatedExpense -= amount;
    }

    const updatedBalance =
      updatedIncome - updatedExpense == 0 ? 0 : updatedIncome - updatedExpense;

    const { error_delete } = await supabase
      .from("expense_tracker")
      .delete()
      .eq("id", id);

    // const { error_update } = await supabase
    //   .from("expense_tracker")
    //   .update({
    //     income: updatedIncome,
    //     expense: updatedExpense,
    //     balance: updatedBalance,
    //   })
    //   .eq("id", id);

    if (error_delete) {
      console.error("Delete error:", error_delete);
      // console.error("Update error:", error_update);
      toast.error("Failed to delete transaction.");
    } else {
      toast.success("Transaction deleted.");
      setTransactions((prev) => prev.filter((t) => t.id !== id));

      setTotalIncome(updatedIncome);
      setTotalExpense(updatedExpense);
      setTotalBalance(updatedBalance);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.success("Adding Transaction...");

    console.log(formData);

    const amount = parseFloat(formData.amount) || 0;
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

    const { data, error } = await supabase
      .from("expense_tracker")
      .insert([
        {
          user_id: user.id,
          created_at: formData.date,
          type: formData.type,
          amount: amount,
          category: formData.category,
          note: formData.note || "----",
          income: updatedIncome,
          expense: updatedExpense,
          balance: updatedBalance,
          name: user.name || "User",
        },
      ])
      .select("*");

    if (error) {
      console.error("Insert error:", error);
      toast.error("Failed to add transaction.");
      return;
    }

    const inserted = data[0];

    setTransactions((prev) => [inserted, ...prev]);
    setTotalIncome(updatedIncome);
    setTotalExpense(updatedExpense);
    setTotalBalance(updatedBalance);
    clearFormData();
    toast.success("Transaction added successfully!");
  };

  const sendMagicLink = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });
    if (error) {
      toast.error("Failed to send magic link: " + error.message);
    } else {
      toast.success("Check your email for the magic login link!");
    }
  };

  const fetchExpenses = async (userId) => {
    const { data, error } = await supabase
      .from("expense_tracker")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Try again");
    } else {
      setTransactions(data);
      console.log(transactions);
      if (data && data.length != 0) {
        setTotalBalance(data[data.length - 1].balance);
        setTotalExpense(data[data.length - 1].expense);
        setTotalIncome(data[data.length - 1].income);
      }
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTransactions([]);
    toast.success("Logged out successfully");
  };

  return (
    <div className="container mx-auto px-4 mt-10">
      <Toaster position="top-center" />
      {!user ? (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="login bg-white p-8 rounded-2xl w-full max-w-md transition duration-300 ease-in-out shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
              Welcome Back 👋
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Enter your email to sign in or sign up:
            </p>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
            />
            <button
              onClick={sendMagicLink}
              className="w-full bg-purple-600 text-white py-3 rounded-xl mt-6 hover:bg-purple-700 transition duration-300 shadow-md"
            >
              Send Magic Link
            </button>
          </div>
        </div>
      ) : loading ? (
        <Loading />
      ) : (
        <div className="box">
          <div className="header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="titleFont text-xl font-bold text-gray-800">
              Expense Tracker
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-3 text-sm text-center">
                <div className="totalExpense p-2 bg-white rounded shadow">
                  <p>Total Income</p>
                  <p className="text-green-500 font-semibold">
                    ₹ {totalIncome}
                  </p>
                </div>
                <div className="totalExpense p-2 bg-white rounded shadow">
                  <p>Total Expense</p>
                  <p className="text-red-500 font-semibold">₹ {totalExpense}</p>
                </div>
                <div className="totalExpense p-2 bg-white rounded shadow">
                  <p>Total Balance</p>
                  <p className="text-blue-500 font-semibold">
                    ₹ {totalBalance}
                  </p>
                </div>
              </div>
              <div className="logoutButton">
                <button
                  className="logout_button bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={logout}
                >
                  Log out
                </button>
              </div>
            </div>
          </div>

          <div className="content grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="form md:col-span-1 p-4 rounded bg-white shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                Add New Transaction
              </h2>
              <form onSubmit={handleSubmit} className="bg-white space-y-4">
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

                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <button
                    type="reset"
                    className="w-full sm:w-1/2 px-4 py-2 border text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-400 focus:outline-none"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-1/2 px-4 py-2 border text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>

            <div className="showTransaction md:col-span-2 p-4 rounded shadow-inner bg-white overflow-x-auto">
              <table className="min-w-full table-auto text-sm border rounded shadow-sm">
                <thead>
                  <tr className="bg-blue-100 text-left font-medium text-gray-700">
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
                        colSpan="6"
                        className="text-center text-gray-500 italic py-4"
                      >
                        No transactions to display yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2 border">
                          {tx.created_at &&
                            new Date(tx.created_at).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-4 py-2 border capitalize">
                          {tx.type}
                        </td>
                        <td className="px-4 py-2 border capitalize">
                          {tx.category}
                        </td>
                        <td className="px-4 py-2 border">{tx.note}</td>
                        <td className="px-4 py-2 border">₹ {tx.amount}</td>
                        <td className="px-4 py-2 border text-center">
                          <button
                            onClick={() => deleteRow(tx.id)}
                            className="px-3 py-1 text-red-500 hover:text-red-700"
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
      )}
    </div>
  );
}

export default App;
