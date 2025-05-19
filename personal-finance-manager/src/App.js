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

  const [getData] = useState({
    totalIncome: 0,
    balance: 0,
    expense: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(GOOGLE_SCRIPT_URL)
      .then((res) => res.json())
      .then((data) => {
        console.log("Google Sheet Data:", data);
        setTransactions(data);
      })
      .catch((err) => console.error("Error fetching data:", err))
      .finally(() => setLoading(false)); // Set loading false regardless of success/fail
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div className="container mx-auto">
      {loading ? (
        <Loading />
      ) : (
        <div className="box p-5">
          <div className="header flex justify-between items-center">
            <div className="title">
              <p className="titleFont">
                Expense Tracker
                <SellIcon />
              </p>
            </div>

            <div className="totalExpense p-2">
              <p>Total expense</p>
              <p className="text-green -500">₹100</p>
            </div>
          </div>

          <div className="content">
            <div className="form p-4 rounded mt-6">
              <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="">
                  {/* Type */}
                  <div>
                    <label className="block mb-1">Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="border p-2 w-full rounded"
                    >
                      <option value="">--Select--</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Amount</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      className="border p-2 w-full rounded"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="border p-2 w-full rounded"
                    >
                      <option value="">--Select--</option>
                      <option value="salary">Salary</option>
                      <option value="food">Food</option>
                      <option value="transport">Transport</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="border p-2 w-full rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Note</label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                  />
                </div>

                <div className="text-right">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>

            <div className="showTransaction">
              <p>Hi</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
