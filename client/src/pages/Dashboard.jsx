
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

const slots = [
  "Morning fasting",
  "After breakfast",
  "After lunch",
  "After dinner"
];

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const emptyForm = {
  reading_date: today(),
  reading_slot: "Morning fasting",
  glucose_level: ""
};

function Dashboard() {
  const [readings, setReadings] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [report, setReport] = useState(null);
  const [reportType, setReportType] = useState("daily");
  const [reportDate, setReportDate] = useState(today());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchReadings = async () => {
    try {
      const response = await api.get("/glucose");
      setReadings(response.data.readings || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load readings");
    }
  };

  const fetchReport = async () => {
    try {
      let response;

      if (reportType === "daily") {
        response = await api.get(
          `/reports/daily?date=${reportDate}`
        );
      } else if (reportType === "month-to-date") {
        response = await api.get("/reports/month-to-date");
      } else {
        response = await api.get("/reports/previous-month");
      }

      setReport(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load report");
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [reportType, reportDate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        glucose_level: Number(form.glucose_level)
      };

      if (
        !Number.isInteger(payload.glucose_level) ||
        payload.glucose_level < 40 ||
        payload.glucose_level > 600
      ) {
        setError("Glucose level must be a whole number between 40 and 600.");
        return;
      }

      if (editingId) {
        await api.put(`/glucose/${editingId}`, payload);
        setMessage("Reading updated successfully.");
      } else {
        await api.post("/glucose", payload);
        setMessage("Reading added successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await fetchReadings();
      await fetchReport();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save reading");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reading) => {
    const dateValue = String(reading.reading_date).slice(0, 10);

    setForm({
      reading_date: dateValue,
      reading_slot: reading.reading_slot,
      glucose_level: String(reading.glucose_level)
    });

    setEditingId(reading.id);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reading?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/glucose/${id}`);
      setMessage("Reading deleted successfully.");
      await fetchReadings();
      await fetchReport();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete reading");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  };

  const summary = report?.summary || {};

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-container">
        <section className="page-heading">
          <div>
            <p className="eyebrow">YOUR HEALTH COMPANION</p>
            <h1>Blood Glucose Dashboard</h1>
            <p>Keep track of your readings and understand your trends.</p>
          </div>
        </section>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <section className="content-grid">
          <div className="panel form-panel">
            <h2>{editingId ? "Edit Reading" : "Add New Reading"}</h2>
            <p className="panel-description">
              Enter your blood glucose measurement.
            </p>

            <form onSubmit={handleSubmit}>
              <label>Reading date</label>
              <input
                type="date"
                name="reading_date"
                value={form.reading_date}
                max={today()}
                onChange={handleChange}
                required
              />

              <label>Reading time</label>
              <select
                name="reading_slot"
                value={form.reading_slot}
                onChange={handleChange}
                required
              >
                {slots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>

              <label>Glucose level (mg/dL)</label>
              <input
                type="number"
                name="glucose_level"
                value={form.glucose_level}
                onChange={handleChange}
                placeholder="Example: 110"
                min="40"
                max="600"
                step="1"
                required
              />

              <button className="primary-button" disabled={loading}>
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Reading"
                  : "Add Reading"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={cancelEdit}
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          <div className="panel report-panel">
            <h2>Glucose Reports</h2>
            <p className="panel-description">
              Review your glucose statistics.
            </p>

            <label>Choose report</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="daily">Daily report</option>
              <option value="month-to-date">Month to date</option>
              <option value="previous-month">Previous month</option>
            </select>

            {reportType === "daily" && (
              <>
                <label>Report date</label>
                <input
                  type="date"
                  value={reportDate}
                  max={today()}
                  onChange={(e) => setReportDate(e.target.value)}
                />
              </>
            )}

            <div className="stats-grid">
              <div className="stat-card">
                <span>Highest</span>
                <strong>{summary.high ?? "--"}</strong>
                <small>mg/dL</small>
              </div>

              <div className="stat-card">
                <span>Lowest</span>
                <strong>{summary.low ?? "--"}</strong>
                <small>mg/dL</small>
              </div>

              <div className="stat-card">
                <span>Average</span>
                <strong>{summary.average ?? "--"}</strong>
                <small>mg/dL</small>
              </div>

              <div className="stat-card">
                <span>Readings</span>
                <strong>{summary.count ?? 0}</strong>
                <small>total</small>
              </div>
            </div>
          </div>
        </section>

        <section className="panel history-panel">
          <div className="history-heading">
            <div>
              <h2>Reading History</h2>
              <p className="panel-description">
                Your recorded glucose measurements.
              </p>
            </div>
            <span className="record-count">
              {readings.length} records
            </span>
          </div>

          {readings.length === 0 ? (
            <div className="empty-state">
              <span>♡</span>
              <h3>No readings yet</h3>
              <p>Add your first glucose reading to get started.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Reading slot</th>
                    <th>Glucose level</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {readings.map((reading) => (
                    <tr key={reading.id}>
                      <td>{String(reading.reading_date).slice(0, 10)}</td>
                      <td>{reading.reading_slot}</td>
                      <td>
                        <strong>{reading.glucose_level}</strong> mg/dL
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-button"
                            onClick={() => handleEdit(reading)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDelete(reading.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
