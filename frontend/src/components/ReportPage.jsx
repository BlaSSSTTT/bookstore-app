import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchReports, createReport, deleteReport, generateReport } from '../api';
import '../css/Page.css';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function ReportPage() {
  const [content, setContent] = useState('');
  const [type, setType] = useState('');
  const [reports, setReports] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const navigate = useNavigate();

  const reportTypes = [
    { value: 'sales', label: 'Продажі' },
    { value: 'inventory', label: 'Запаси' },
    { value: 'genres', label: 'Жанри' },
    { value: 'financial', label: 'Фінанси' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      loadReports();
    }
  }, [navigate]);

  const loadReports = async () => {
    try {
      const data = await fetchReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createReport({ content, type, period: 'Manual', totalRevenue: 0, totalSales: 0 });
      setContent('');
      setType('');
      setIsCreateModalOpen(false);
      await loadReports();
    } catch (error) {
      console.error('Error creating report:', error);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await generateReport({ startDate, endDate, employeeId: employeeId || null });
      setStartDate('');
      setEndDate('');
      setEmployeeId('');
      setIsGenerateModalOpen(false);
      await loadReports();
    } catch (error) {
      console.error('Error generating report:', error);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей звіт?')) {
      try {
        await deleteReport(reportId);
        setIsDetailsModalOpen(false);
        setSelectedReport(null);
        await loadReports();
      } catch (error) {
        console.error('Error deleting report:', error);
        if (error.message.includes('401')) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    }
  };

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => {
    setContent('');
    setType('');
    setIsCreateModalOpen(false);
  };

  const openGenerateModal = () => setIsGenerateModalOpen(true);
  const closeGenerateModal = () => {
    setStartDate('');
    setEndDate('');
    setEmployeeId('');
    setIsGenerateModalOpen(false);
  };

  const openDetailsModal = (report) => {
    setSelectedReport(report);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedReport(null);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getChartData = (report) => {
    if (!report.data) return null;
    const { salesByDate, topGenres } = report.data;

    const barData = {
      labels: Object.keys(salesByDate || {}),
      datasets: [{
        label: 'Продажі (грн)',
        data: Object.values(salesByDate || {}),
        backgroundColor: '#8b5e3c',
        borderColor: '#6b4e31',
        borderWidth: 1,
      }],
    };

    const pieData = {
      labels: Object.keys(topGenres || {}),
      datasets: [{
        label: 'Жанри',
        data: Object.values(topGenres || {}),
        backgroundColor: ['#8b5e3c', '#a94442', '#6b4e31', '#d9c7b3'],
        borderColor: '#fff8f0',
        borderWidth: 1,
      }],
    };

    return { barData, pieData };
  };

  return (
    <div className="container">
      <h1>Звіти</h1>
      <div className="report-actions">
        <button onClick={openGenerateModal} className="add-report-button">Згенерувати звіт</button>
      </div>
      {isGenerateModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="modal-header">Згенерувати звіт</h2>
            <form onSubmit={handleGenerate}>
              <div className="form-fields">
                <div className="form-field-card">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-field-card">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
              </div>
              <div className="modal-buttons">
                <button type="button" className="modal-button cancel-button" onClick={closeGenerateModal}>
                  Скасувати
                </button>
                <button type="submit" className="modal-button submit-button">Згенерувати</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDetailsModalOpen && selectedReport && (
        <div className="details-modal">
          <div className="details-modal-content">
            <h2 className="modal-header">Звіт #{selectedReport.id}</h2>
            <div className="report-details">
              <div className="report-content">
                <p className="report-meta">
                  <strong>Період:</strong> {selectedReport.period}
                </p>
                <p className="report-meta">
                  <strong>Тип:</strong> {reportTypes.find(t => t.value === selectedReport.type)?.label || 'Невідомий'}
                </p>
                <p className="report-meta">
                  <strong>Дата:</strong> {formatDate(selectedReport.createdAt)}
                </p>
                {selectedReport.employeeId && selectedReport.Employee && (
                  <p className="report-meta">
                    <strong>Працівник:</strong> {selectedReport.Employee.name}
                  </p>
                )}
                <p className="report-meta">
                  <strong>Виручка:</strong> {selectedReport.totalRevenue} грн
                </p>
                <p className="report-meta">
                  <strong>Продано книг:</strong> {selectedReport.totalSales}
                </p>
                {selectedReport.popularBooks && (
                  <div className="report-text">
                    <h3>Популярні книги:</h3>
                    <ul>
                      {Object.entries(selectedReport.popularBooks).map(([title, qty]) => (
                        <li key={title}>{title}: {qty}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="report-text">
                  <h3>Вміст:</h3>
                  <p>{selectedReport.content}</p>
                </div>
              </div>
              <div className="report-visualization">
                {selectedReport.data ? (
                  <div className="charts-container">
                    {selectedReport.data.salesByDate && (
                      <div className="chart">
                        <Bar
                          data={getChartData(selectedReport).barData}
                          options={{
                            responsive: true,
                            plugins: { legend: { position: 'top' }, title: { display: true, text: 'Продажі за днями' } },
                          }}
                        />
                      </div>
                    )}
                    {selectedReport.data.topGenres && (
                      <div className="chart">
                        <Pie
                          data={getChartData(selectedReport).pieData}
                          options={{
                            responsive: true,
                            plugins: { legend: { position: 'top' }, title: { display: true, text: 'Розподіл за жанрами' } },
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="visualization-placeholder">
                    Графік відсутній, оскільки звіт не містить числових даних.
                  </p>
                )}
              </div>
            </div>
            <div className="modal-buttons">
              <button type="button" className="modal-button cancel-button" onClick={closeDetailsModal}>
                Закрити
              </button>
              <button
                className="modal-button delete-button"
                onClick={() => handleDelete(selectedReport.id)}
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid">
        {reports.length === 0 ? (
          <p className="no-items">Немає звітів</p>
        ) : (
          reports.map((r) => (
            <div
              key={r.id}
              className="item-card"
              onClick={() => openDetailsModal(r)}
            >
              <div className="book-cover">
                <h3>Звіт #{r.id}</h3>
                <p className="book-type">
                  {reportTypes.find(t => t.value === r.type)?.label || 'Невідомий'}
                </p>
                <p className="book-date">{r.period}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ReportPage;