import React, { useState, useEffect } from "react";
import Loading from "./Loading";
import "./App.css";
import SellIcon from "@mui/icons-material/Sell";

function App() {
  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwrkCkZ63uw7JkG5s61aF1hlLTZ0MQZ86cC588qukHHzjqr5a_iwcDp3ydq2hQWiWeL/exec";

  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    category: "",
    note: "",
    date: "",
  });

  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(GOOGLE_SCRIPT_URL)
      .then((res) => res.json())
      .then((data) => {
        console.log("Google Sheet Data:", data);
        setTransactions(data);
        console.log("transactions:", transactions);
        console.log("transactions:", transactions.length);
      })
      .catch((err) => console.error("Error fetching data:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    console.log("Updated transactions:", transactions);
  }, [transactions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("formData", formData);
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      console.log(result);
      alert("Transaction saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save transaction.");
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
              <p className="titleFont">
                Expense Tracker
                {/* <SellIcon /> */}
              </p>
            </div>

            <div className="flex">
              <div className="totalExpense p-2">
                <p>Total Icome</p>
                <p className="text-green -500">₹100</p>
              </div>
              <div className="totalExpense p-2 ml-3">
                <p>Total expense</p>
                <p className="text-green -500">₹100</p>
              </div>
            </div>
          </div>

          <div className="content grid md:grid-cols-3 gap-4 mt-6">
            {/* Form (1/3 width on medium+ screens) */}
            <div className="form md:col-span-1 p-4 rounded bg-white shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                Add New Transaction
              </h2>
              <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg">
                <div className="grid grid-cols-1 gap-4">
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Type
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

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">-- Select --</option>
                      <option value="salary">Salary</option>
                      <option value="food">Food</option>
                      <option value="transport">Transport</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
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

                  <div className="text-right">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Submit
                    </button>
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
                        <tr key={index} className="text-sm text-gray-700">
                          <td className="px-4 py-2 border">{`${new Date(
                            tx.Date
                          ).getDate()}-${new Date(
                            tx.Date
                          ).getMonth()}-${new Date(
                            tx.Date
                          ).getFullYear()}`}</td>
                          <td className="px-4 py-2 border capitalize">
                            {tx.Type}
                          </td>
                          <td className="px-4 py-2 border">{tx.Category}</td>
                          <td className="px-4 py-2 border">{tx.Note}</td>
                          <td className="px-4 py-2 border">₹{tx.Amount}</td>
                          <td className="px-4 py-2 border">
                            <button
                              className="text-red-600 hover:underline text-sm"
                              onClick={() =>
                                alert(`Delete action for index ${index}`)
                              }
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
              {/* )} */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
