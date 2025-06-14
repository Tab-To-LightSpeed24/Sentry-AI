import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale } from "chart.js";
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale);

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/analytics/summary")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <p style={{ color: "#fff", textAlign: "center" }}>Loading analytics...</p>;

  return (
    <div style={{ background: "#111", color: "#fff", padding: "2rem", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center" }}>📊 Reviewer Analytics</h2>

      <p style={{ textAlign: "center" }}>Total Feedbacks: {data.total}</p>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ width: "300px" }}>
          <h3 style={{ textAlign: "center" }}>Feedback by Label</h3>
          <Pie
            data={{
              labels: Object.keys(data.by_label),
              datasets: [
                {
                  data: Object.values(data.by_label),
                  backgroundColor: ["#4caf50", "#f44336", "#2196f3"],
                },
              ],
            }}
          />
        </div>

        <div style={{ width: "400px" }}>
          <h3 style={{ textAlign: "center" }}>Feedbacks by Reviewer</h3>
          <Bar
            data={{
              labels: Object.keys(data.by_user),
              datasets: [
                {
                  label: "Feedback Count",
                  data: Object.values(data.by_user),
                  backgroundColor: "#90caf9",
                },
              ],
            }}
            options={{ plugins: { legend: { display: false } } }}
          />
        </div>
      </div>
    </div>
  );
}
