import React, { useState , useEffect } from "react";

function App() {
   const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwrkCkZ63uw7JkG5s61aF1hlLTZ0MQZ86cC588qukHHzjqr5a_iwcDp3ydq2hQWiWeL/exec";
   useEffect(() => {
    fetch(GOOGLE_SCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        console.log("Google Sheet Data:", data);
      })
      .catch(err => console.error('Error fetching data:', err));
  }, []);

  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    category: "",
    note: "",
    date: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log("Saved to Google Sheet:", result);
      setFormData({
        type: "",
        amount: "",
        category: "",
        note: "",
        date: "",
      });
    } catch (err) {
      console.error("Error saving to sheet:", err);
    }
  };

  return (
    <div className="container">
      <div className="Summary">
        <p>Total Income</p>
        <p>Total Expense</p>
        <p>Current Balance</p>
      </div>

      <div className="Add_transaction">
        <h1>Add Transcation</h1>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <label className="w-28">Type:</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="border p-2 rounded w-40"
            >
              <option value="">--Select--</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <label className="w-28">Amount:</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              className="border p-2 rounded w-40"
            />

            <label className="w-28">Category:</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="border p-2 rounded w-40"
            >
              <option value="">--Select--</option>
              <option value="salary">Salary</option>
              <option value="food">Food</option>
              <option value="transport">Transport</option>
              <option value="entertainment">Entertainment</option>
              <option value="other">Other</option>
            </select>

            <label className="w-28">Date:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="border p-2 rounded w-40"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-28">Note:</label>
            <textarea
              type="text"
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="flex justify-end">
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
        <p>List of transaction</p>
        <p>Show recent transactions</p>
        <p>Display: title, amount, type, category, date</p>
        <p>Use icons/colors to differentiate income & expense</p>
      </div>
      
      <div className="Delete_or_edit_transaction">

      </div>
    </div>
  );
}

export default App;