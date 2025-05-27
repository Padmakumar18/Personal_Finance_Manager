import React, { useState, useEffect } from "react";
import Loading from "./Loading";
import "./App.css";
import supabase from "./supabaseClient";
import toast, { Toaster } from 'react-hot-toast';

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
      console.log(session.user.id)
      // console.log(session.user.id)
      
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

// useEffect(()=>{
//   console.log("user")
//   console.log(user)
// },[user])

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
    toast.success("Hi")
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

    const newTransaction = {
      ID:
        transactions.length > 0
          ? transactions[transactions.length - 1].ID + 1
          : 1,
      Type: formData.type,
      Amount: amount,
      Category: formData.category,
      Date: formData.date,
      Note: formData.note || "----",
      Income: updatedIncome,
      Expense: updatedExpense,
      Balance: updatedBalance,
    };

    console.log(newTransaction);

    // const { error } = await supabase
    // .from('expense_tracker')
    // .insert([
    //   {
    //     user_id: user.id,
    //     type,
    //     category,
    //     amount: parseFloat(amount),
    //     date,
    //     note,
    //   }
    // ])

    setTransactions((prev) => [newTransaction, ...prev]);
    setTotalIncome(updatedIncome);
    setTotalExpense(updatedExpense);
    setTotalBalance(updatedBalance);

    clearFormData();
  };

  /////////////////////////////////////////////////

  const sendMagicLink = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });
    if (error) {
      toast.error('Failed to send magic link: ' + error.message)
    } else {
      toast.success('Check your email for the magic login link!')
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
      toast.error("Try again")
    } else {
      setTransactions(data);
      // toast.success("Logged in successfully")
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTransactions([]);
    toast.success("Logged out successfully")
  };

  return (
    <div className="container mx-auto mt-10">
       <Toaster position="top-center" />
      {!user ? (
        <div className=" min-h-screen flex items-center justify-center ">
          <div className="login bg-white p-8 rounded-2xl w-full max-w-md transition duration-300 ease-in-out">
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
          <div className="header flex justify-between items-center">
            <div className="title">
              <p className="titleFont">Expense Tracker</p>
            </div>

            <div className="flex">
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
              <div className="logoutButton ml-5">
                <button className="logout_button" onClick={logout}>
                  Log out
                </button>
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
