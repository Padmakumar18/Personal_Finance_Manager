import React, { useState, useEffect } from "react";
import Loading from './Loading';

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

  useEffect(() => {
    fetch(GOOGLE_SCRIPT_URL)
      .then((res) => res.json())
      .then((data) => {
        console.log("Google Sheet Data:", data);
        setTransactions(data);
      })
      .catch((err) => console.error("Error fetching data:", err));
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
    <div className=" mx-auto p-6">
      <Loading/>
      <div className="bg-gray-100 p-4 rounded mb-6 flex justify-between text-center">
        <div>
          <p className="font-semibold">Total Income</p>
          <p className="text-green-600">₹{getData.totalIncome}</p>
        </div>

        <div>
          <p className="font-semibold">Total Expense</p>
          <p className="text-red-600">₹{getData.expense}</p>
        </div>

        <div>
          <p className="font-semibold">Current Balance</p>
          <p className="text-blue-600">₹{getData.balance}</p>
        </div>
      </div>

      <div className="Add_transaction mb-6 bg-gray-100 p-4 rounded">
        <h1 className="text-2xl font-semibold mb-4">Add Transaction</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Responsive grid for form inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label>Type:</label>
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
              <label>Amount :</label>
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
              <label>Category:</label>
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
              <label>Date:</label>
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
            <label>Note:</label>
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

      <div className="List_of_transaction">
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
        <ul className="space-y-2">
          {transactions.map((item, index) => (
            <li
              key={index}
              className="flex justify-between p-3 border rounded"
              // className={`flex justify-between p-3 border rounded ${
              //   item.type === "income" ? "bg-green-100" : "bg-red-100"
              // }`}
            >
              <span>{item.note}</span>
              <span>{item.amount}</span>
              <span className="capitalize">{item.type}</span>
              <span>{item.category}</span>
              <span>{item.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
