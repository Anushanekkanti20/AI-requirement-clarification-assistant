import React, { useState } from 'react';
import { LogOut, Home, Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Dashboard({ user, onLogout }) {
  const [requirementText, setRequirementText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!requirementText.trim()) return;

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await fetch('http://localhost:5001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: requirementText, userId: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze requirement');
      }

      setAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '12px' }}>
            <Home size={24} />
          </div>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '24px' }}>AI Requirement Assistant</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
              Logged in as <strong>{user.email}</strong>
            </p>
          </div>
        </div>
        <button className="btn-outline" onClick={onLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
      
      <div className="analysis-container">
        
        {/* Input Form */}
        <div className="auth-card" style={{ maxWidth: '100%', margin: 0 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, marginBottom: '24px' }}>
            <Sparkles color="var(--primary)" /> Analyze Requirements
          </h2>
          <form onSubmit={handleAnalyze}>
            <div className="input-group">
              <label>Paste Requirement Text Below:</label>
              <textarea 
                placeholder="The system shall allow users to log in... but what if they forget their password?"
                value={requirementText}
                onChange={(e) => setRequirementText(e.target.value)}
                disabled={loading}
              />
            </div>
            
            {error && (
              <div style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', background: '#450a0a', padding: '12px', borderRadius: '8px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading || !requirementText.trim()} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              {loading ? <Loader2 className="loading-pulse" size={20} /> : <Send size={20} />}
              {loading ? 'Analyzing with Gen AI...' : 'Analyze Requirement'}
            </button>
          </form>
        </div>

        {/* Output Result */}
        {analysis && (
          <div className="result-card">
            <h3><Sparkles size={20} /> Clarification Analysis</h3>
            <div className="markdown-body">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
