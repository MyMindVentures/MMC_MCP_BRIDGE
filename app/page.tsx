'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [servers, setServers] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [instruction, setInstruction] = useState('');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchHealth();
    fetchServers();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch (error) {
      console.error('Failed to fetch health:', error);
    }
  };

  const fetchServers = async () => {
    try {
      const res = await fetch('/api/servers');
      const data = await res.json();
      setServers(data.servers || []);
    } catch (error) {
      console.error('Failed to fetch servers:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeAgent = async () => {
    if (!instruction.trim()) return;
    
    setResult({ status: 'loading' });
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction })
      });
      const data = await res.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    }
  };

  return (
    <main style={{ 
      minHeight: '100vh', 
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            🚀 MMC MCP Bridge
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>
            Enterprise MCP Orchestration Platform
          </p>
        </header>

        {health && (
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>System Health</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ opacity: 0.8, fontSize: '0.875rem' }}>Status</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{health.status}</div>
              </div>
              <div>
                <div style={{ opacity: 0.8, fontSize: '0.875rem' }}>Version</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{health.version}</div>
              </div>
              <div>
                <div style={{ opacity: 0.8, fontSize: '0.875rem' }}>Servers Enabled</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                  {health.servers?.enabled} / {health.servers?.total}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Agentic Execution</h2>
          <div style={{ marginBottom: '1rem' }}>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Enter your instruction for the AI agent..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
          <button
            onClick={executeAgent}
            disabled={!instruction.trim()}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: instruction.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
              color: instruction.trim() ? '#667eea' : '#fff',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: instruction.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            Execute Agent
          </button>
          
          {result && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: 'rgba(0,0,0,0.2)', 
              borderRadius: '0.5rem',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            MCP Servers ({servers.length})
          </h2>
          {loading ? (
            <div>Loading servers...</div>
          ) : servers.length === 0 ? (
            <div style={{ opacity: 0.7 }}>No servers enabled. Configure environment variables to enable MCP servers.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {servers.map((server, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {server.name}
                  </div>
                  <div style={{ opacity: 0.8, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    {server.category}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    {server.tools?.length || 0} tools
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

