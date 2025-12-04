'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [servers, setServers] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [instruction, setInstruction] = useState('');
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'servers' | 'resources' | 'prompts'>('servers');

  useEffect(() => {
    fetchHealth();
    fetchServers();
    fetchResources();
    fetchPrompts();
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

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      setResources(data.resources || []);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    }
  };

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/prompts');
      const data = await res.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
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

  const tabStyle = (tab: string) => ({
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem 0.5rem 0 0',
    border: 'none',
    background: activeTab === tab ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: activeTab === tab ? 'bold' : 'normal',
    cursor: 'pointer',
    marginRight: '0.5rem'
  });

  return (
    <main style={{ minHeight: '100vh', padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🚀 MMC MCP Bridge</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>Enterprise MCP Orchestration Platform</p>
          <p style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.5rem' }}>Full MCP Protocol: Tools • Resources • Prompts • Sampling • GraphQL • SSE</p>
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', fontSize: '0.75rem', fontFamily: 'monospace', textAlign: 'left', maxWidth: '600px', margin: '1rem auto' }}>
            <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Cursor IDE Config:</div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{`{
  "mcpServers": {
    "MMC-MCP-Bridge": {
      "type": "sse",
      "url": "${typeof window !== 'undefined' ? window.location.origin : 'https://your-bridge.railway.app'}/api/sse"
    }
  }
}`}</pre>
          </div>
        </header>

        {health && (
          <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>System Health</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div><div style={{ opacity: 0.8, fontSize: '0.875rem' }}>Status</div><div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{health.status}</div></div>
              <div><div style={{ opacity: 0.8, fontSize: '0.875rem' }}>Version</div><div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{health.version}</div></div>
              <div><div style={{ opacity: 0.8, fontSize: '0.875rem' }}>Servers</div><div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{health.servers?.enabled} / {health.servers?.total}</div></div>
              <div><div style={{ opacity: 0.8, fontSize: '0.875rem' }}>MCP Protocol</div><div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{health.mcp_protocol}</div></div>
            </div>
          </div>
        )}

        <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Agentic Execution</h2>
          <textarea value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="Enter your instruction for the AI agent..." style={{ width: '100%', minHeight: '100px', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical', marginBottom: '1rem' }} />
          <button onClick={executeAgent} disabled={!instruction.trim()} style={{ padding: '0.75rem 2rem', borderRadius: '0.5rem', border: 'none', background: instruction.trim() ? '#fff' : 'rgba(255,255,255,0.3)', color: instruction.trim() ? '#667eea' : '#fff', fontSize: '1rem', fontWeight: 'bold', cursor: instruction.trim() ? 'pointer' : 'not-allowed' }}>Execute Agent</button>
          {result && <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.875rem' }}><pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(result, null, 2)}</pre></div>}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ marginBottom: '1rem' }}>
            <button onClick={() => setActiveTab('servers')} style={tabStyle('servers')}>Servers</button>
            <button onClick={() => setActiveTab('resources')} style={tabStyle('resources')}>Resources</button>
            <button onClick={() => setActiveTab('prompts')} style={tabStyle('prompts')}>Prompts</button>
          </div>

          {activeTab === 'servers' && (
            <>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>MCP Servers ({servers.length})</h2>
              {loading ? <div>Loading servers...</div> : servers.length === 0 ? <div style={{ opacity: 0.7 }}>No servers enabled. Configure environment variables to enable MCP servers.</div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {servers.map((server, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <div style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{server.name}</div>
                      <div style={{ opacity: 0.8, fontSize: '0.875rem', marginBottom: '0.5rem' }}>{server.category}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>🔧 {server.tools?.length || 0} tools</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>📦 {server.resources?.length || 0} resources</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>💬 {server.prompts?.length || 0} prompts</div>
                      {server.hasGraphQL && <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>⚡ GraphQL</div>}
                      {server.supportsSampling && <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>🎲 Sampling</div>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'resources' && (
            <>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>MCP Resources ({resources.length})</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {resources.map((resource, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{resource.name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.5rem', fontFamily: 'monospace' }}>{resource.uri}</div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>{resource.description}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Server: {resource.server}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'prompts' && (
            <>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>MCP Prompts ({prompts.length})</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {prompts.map((prompt, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{prompt.name}</div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>{prompt.description}</div>
                    {prompt.arguments && prompt.arguments.length > 0 && (
                      <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                        Args: {prompt.arguments.map((arg: any) => arg.name).join(', ')}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Server: {prompt.server}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
