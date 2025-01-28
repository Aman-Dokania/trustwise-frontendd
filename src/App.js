import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const App = () => {
  const [text, setText] = useState("");
  const [toxicityResult, setToxicityResult] = useState(null);
  const [eduScoreResult, setEduScoreResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const handleAnalyzeText = async () => {
    setError(null);
    setToxicityResult(null);
    setEduScoreResult(null);

    try {
      const toxicityResponse = await axios.post("http://127.0.0.1:8000/toxicity", { text });
      setToxicityResult(toxicityResponse.data);

      const eduScoreResponse = await axios.post("http://127.0.0.1:8000/edu-score", { text });
      setEduScoreResult(eduScoreResponse.data);

      // Fetch logs after analyzing
      fetchLogs();
    } catch (err) {
      setError("An error occurred while processing the text.");
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/logs");
      setLogs(response.data);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  const handleClearLogs = async () => {
    try {
      await axios.delete("http://127.0.0.1:8000/clear-logs");
      setLogs([]);
    } catch (err) {
      console.error("Failed to clear logs:", err);
    }
  };

  useEffect(() => {
    // Fetch logs on initial load
    fetchLogs();
  }, []);

  // Prepare data for the graph
  const chartData = {
    labels: logs.map((log) => `Log ${log.id}`), // X-axis labels
    datasets: [
      {
        label: "Toxicity Score",
        data: logs
          .filter((log) => log.result_type === "Toxicity")
          .map((log) => log.score || 0),
        borderColor: "rgba(255, 99, 132, 1)", // Red color for toxicity
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      },
      {
        label: "Education Score",
        data: logs
          .filter((log) => log.result_type === "Education")
          .map((log) => log.score || 0),
        borderColor: "rgba(54, 162, 235, 1)", // Blue color for education
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f7fc",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#4b9cd3", marginBottom: "30px" }}>
        Text Analysis with Visualization
      </h1>

      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
          marginBottom: "30px",
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to analyze"
          style={{
            width: "100%",
            height: "120px",
            marginBottom: "15px",
            padding: "15px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            fontSize: "16px",
            fontFamily: "Arial, sans-serif",
          }}
        />
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleAnalyzeText}
            style={{
              padding: "12px 25px",
              marginRight: "15px",
              backgroundColor: "#4b9cd3",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Analyze Text
          </button>
          <button
            onClick={handleClearLogs}
            style={{
              padding: "12px 25px",
              backgroundColor: "red",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Clear Logs
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: "red", textAlign: "center", marginTop: "10px", fontSize: "16px" }}>
          {error}
        </div>
      )}

      {toxicityResult && (
        <div
          style={{
            marginTop: "30px",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ color: "#4b9cd3" }}>Toxicity Result</h2>
          <p><strong>Text:</strong> {toxicityResult.text}</p>
          <p><strong>Predicted Class:</strong> {toxicityResult.predicted_class}</p>
          <p><strong>Score (Toxicity):</strong> {toxicityResult.score}</p>
          <p><strong>Neutral Score:</strong> {toxicityResult.probabilities.Neutral}</p>
        </div>
      )}

      {eduScoreResult && (
        <div
          style={{
            marginTop: "30px",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ color: "#4b9cd3" }}>Education Score Result</h2>
          <p><strong>Text:</strong> {eduScoreResult.text}</p>
          <p><strong>Score:</strong> {eduScoreResult.score.toFixed(2)}</p>
          <p><strong>Integer Score:</strong> {eduScoreResult.int_score}</p>
        </div>
      )}

      <div
        style={{
          marginTop: "30px",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#4b9cd3" }}>Score Visualization</h2>
        <Line
          data={chartData}
          options={{
            responsive: true,
            scales: {
              x: {
                type: "category", // Ensures X-axis is categorical
                title: {
                  display: true,
                  text: "Log ID",
                },
              },
            },
            plugins: {
              legend: {
                position: "top",
              },
              title: {
                display: true,
                text: "Toxicity and Education Scores Over Logs",
                font: { size: 18 },
              },
            },
          }}
        />
      </div>

      <div
        style={{
          marginTop: "30px",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#4b9cd3" }}>Log History</h2>
        <table
          border="1"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            marginTop: "20px",
            borderRadius: "8px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <thead style={{ backgroundColor: "#4b9cd3", color: "white" }}>
            <tr>
              <th>ID</th>
              <th>Text</th>
              <th>Result Type</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td>{log.id}</td>
                <td>{log.text}</td>
                <td>{log.result_type}</td>
                <td>{log.score !== null ? log.score : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
