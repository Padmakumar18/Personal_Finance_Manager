import "./Loading.css";

function App() {
  return (
    <div id="loader">
      <div className="circle-loader">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
        <div className="circle circle-4"></div>
      </div>
      <p className="loading-text">Getting data...</p>
    </div>
  );
}

export default App;