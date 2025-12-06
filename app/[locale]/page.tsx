"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../components/LanguageSwitcher";
import PWARegister from "../components/PWARegister";

export default function Home() {
  const t = useTranslations();
  const [servers, setServers] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [instruction, setInstruction] = useState("");
  const [result, setResult] = useState<any>(null);
  const [agentJobId, setAgentJobId] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<any>(null);
  const [agentPolling, setAgentPolling] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "servers" | "resources" | "prompts"
  >("servers");

  useEffect(() => {
    fetchHealth();
    fetchServers();
    fetchResources();
    fetchPrompts();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
    } catch (error) {
      console.error("Failed to fetch health:", error);
    }
  };

  const fetchServers = async () => {
    try {
      const res = await fetch("/api/servers");
      const data = await res.json();
      setServers(data.servers || []);
    } catch (error) {
      console.error("Failed to fetch servers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await fetch("/api/resources");
      const data = await res.json();
      setResources(data.resources || []);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    }
  };

  const fetchPrompts = async () => {
    try {
      const res = await fetch("/api/prompts");
      const data = await res.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
    }
  };

  const executeAgent = async () => {
    if (!instruction.trim()) return;
    setResult(null);
    setAgentStatus({ state: "queued", message: t("agent.queued") });
    setAgentPolling(false);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAgentStatus({
          state: "error",
          error: data.error || t("agent.error"),
        });
        return;
      }

      setAgentJobId(data.jobId);
      setAgentStatus({
        state: "submitted",
        message: data.message || t("agent.submitted"),
        pollUrl: data.pollUrl,
      });
      setAgentPolling(true);
    } catch (error: any) {
      setAgentStatus({ state: "error", error: error.message });
    }
  };

  useEffect(() => {
    if (!agentPolling || !agentJobId) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/agent/status/${agentJobId}`);
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setAgentStatus({
            state: "error",
            error: data.error || t("agent.error"),
          });
          setAgentPolling(false);
          return;
        }

        setAgentStatus({
          state: data.state,
          progress: data.progress,
          summary: data.result?.summary,
          raw: data,
        });

        if (data.state === "completed" || data.state === "failed") {
          setAgentPolling(false);
          setResult(data.result || data);
        }
      } catch (error: any) {
        if (!cancelled) {
          setAgentStatus({ state: "error", error: error.message });
          setAgentPolling(false);
        }
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [agentPolling, agentJobId, t]);

  const baseStyles = {
    main: {
      minHeight: "100vh",
      padding: "clamp(1rem, 4vw, 2rem)",
      fontFamily: "system-ui, -apple-system, sans-serif",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#fff",
    },
    container: {
      maxWidth: "1400px",
      margin: "0 auto",
    },
    header: {
      textAlign: "center" as const,
      marginBottom: "clamp(1.5rem, 5vw, 3rem)",
    },
    title: {
      fontSize: "clamp(2rem, 8vw, 3rem)",
      fontWeight: "bold" as const,
      marginBottom: "0.5rem",
    },
    subtitle: {
      fontSize: "clamp(1rem, 4vw, 1.25rem)",
      opacity: 0.9,
    },
    description: {
      fontSize: "clamp(0.75rem, 3vw, 0.875rem)",
      opacity: 0.7,
      marginTop: "0.5rem",
    },
    card: {
      background: "rgba(255,255,255,0.1)",
      backdropFilter: "blur(10px)",
      borderRadius: "1rem",
      padding: "clamp(1rem, 4vw, 1.5rem)",
      marginBottom: "2rem",
      border: "1px solid rgba(255,255,255,0.2)",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1rem",
    },
    tabButton: (active: boolean) => ({
      padding: "clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 4vw, 1.5rem)",
      borderRadius: "0.5rem 0.5rem 0 0",
      border: "none",
      background: active ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)",
      color: "#fff",
      fontSize: "clamp(0.875rem, 3vw, 1rem)",
      fontWeight: active ? ("bold" as const) : ("normal" as const),
      cursor: "pointer",
      marginRight: "0.5rem",
      transition: "all 0.2s",
    }),
    serverGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
      gap: "1rem",
    },
    serverCard: {
      background: "rgba(255,255,255,0.1)",
      padding: "1rem",
      borderRadius: "0.5rem",
      border: "1px solid rgba(255,255,255,0.2)",
    },
  };

  return (
    <>
      <PWARegister />
      <main style={baseStyles.main}>
        <div style={baseStyles.container}>
          <header style={baseStyles.header}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1rem",
              }}
            >
              <div style={{ flex: 1 }} />
              <LanguageSwitcher />
            </div>
            <h1 style={baseStyles.title}>🚀 {t("app.title")}</h1>
            <p style={baseStyles.subtitle}>{t("app.subtitle")}</p>
            <p style={baseStyles.description}>{t("app.description")}</p>
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                background: "rgba(0,0,0,0.2)",
                borderRadius: "0.5rem",
                fontSize: "clamp(0.625rem, 2.5vw, 0.75rem)",
                fontFamily: "monospace",
                textAlign: "left",
                maxWidth: "600px",
                margin: "1rem auto",
                overflowX: "auto",
              }}
            >
              <div style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>
                {t("cursor.title")}
              </div>
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >{`{
  "mcpServers": {
    "MMC-MCP-Bridge": {
      "type": "sse",
      "url": "${
        typeof window !== "undefined"
          ? window.location.origin
          : "https://your-bridge.railway.app"
      }/api/sse"
    }
  }
}`}</pre>
            </div>
          </header>

          {health && (
            <div style={baseStyles.card}>
              <h2
                style={{
                  fontSize: "clamp(1.25rem, 5vw, 1.5rem)",
                  marginBottom: "1rem",
                }}
              >
                {t("health.title")}
              </h2>
              <div style={baseStyles.grid}>
                <div>
                  <div
                    style={{
                      opacity: 0.8,
                      fontSize: "clamp(0.75rem, 3vw, 0.875rem)",
                    }}
                  >
                    {t("health.status")}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(1rem, 4vw, 1.25rem)",
                      fontWeight: "bold",
                    }}
                  >
                    {health.status}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      opacity: 0.8,
                      fontSize: "clamp(0.75rem, 3vw, 0.875rem)",
                    }}
                  >
                    {t("health.version")}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(1rem, 4vw, 1.25rem)",
                      fontWeight: "bold",
                    }}
                  >
                    {health.version}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      opacity: 0.8,
                      fontSize: "clamp(0.75rem, 3vw, 0.875rem)",
                    }}
                  >
                    {t("health.servers")}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(1rem, 4vw, 1.25rem)",
                      fontWeight: "bold",
                    }}
                  >
                    {health.servers?.enabled} / {health.servers?.total}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      opacity: 0.8,
                      fontSize: "clamp(0.75rem, 3vw, 0.875rem)",
                    }}
                  >
                    {t("health.mcpProtocol")}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(1rem, 4vw, 1.25rem)",
                      fontWeight: "bold",
                    }}
                  >
                    {health.mcp_protocol}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={baseStyles.card}>
            <h2
              style={{
                fontSize: "clamp(1.25rem, 5vw, 1.5rem)",
                marginBottom: "1rem",
              }}
            >
              {t("agent.title")}
            </h2>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder={t("agent.placeholder")}
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "1rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "clamp(0.875rem, 3vw, 1rem)",
                fontFamily: "inherit",
                resize: "vertical" as const,
                marginBottom: "1rem",
              }}
            />
            <button
              onClick={executeAgent}
              disabled={!instruction.trim()}
              style={{
                padding: "clamp(0.5rem, 2vw, 0.75rem) clamp(1.5rem, 6vw, 2rem)",
                borderRadius: "0.5rem",
                border: "none",
                background: instruction.trim()
                  ? "#fff"
                  : "rgba(255,255,255,0.3)",
                color: instruction.trim() ? "#667eea" : "#fff",
                fontSize: "clamp(0.875rem, 3vw, 1rem)",
                fontWeight: "bold",
                cursor: instruction.trim() ? "pointer" : "not-allowed",
                marginRight: "0.75rem",
                transition: "all 0.2s",
              }}
            >
              {t("agent.execute")}
            </button>
            {agentStatus && (
              <span
                style={{
                  fontSize: "clamp(0.75rem, 3vw, 0.875rem)",
                  opacity: 0.9,
                }}
              >
                {agentStatus.state === "error"
                  ? `${t("agent.error")}: ${agentStatus.error}`
                  : agentStatus.summary ||
                    agentStatus.message ||
                    `${t("agent.state")}: ${t(`agent.${agentStatus.state}`)} ${
                      agentStatus.progress != null
                        ? `(${agentStatus.progress}%)`
                        : ""
                    }`}
              </span>
            )}
            {(result || agentStatus?.raw) && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "rgba(0,0,0,0.2)",
                  borderRadius: "0.5rem",
                  fontFamily: "monospace",
                  fontSize: "clamp(0.75rem, 3vw, 0.875rem)",
                  overflowX: "auto",
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {JSON.stringify(result || agentStatus?.raw, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div style={baseStyles.card}>
            <div
              style={{
                marginBottom: "1rem",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <button
                onClick={() => setActiveTab("servers")}
                style={baseStyles.tabButton(activeTab === "servers")}
              >
                {t("tabs.servers")}
              </button>
              <button
                onClick={() => setActiveTab("resources")}
                style={baseStyles.tabButton(activeTab === "resources")}
              >
                {t("tabs.resources")}
              </button>
              <button
                onClick={() => setActiveTab("prompts")}
                style={baseStyles.tabButton(activeTab === "prompts")}
              >
                {t("tabs.prompts")}
              </button>
            </div>

            {activeTab === "servers" && (
              <>
                <h2
                  style={{
                    fontSize: "clamp(1.25rem, 5vw, 1.5rem)",
                    marginBottom: "1rem",
                  }}
                >
                  {t("servers.title")} ({servers.length})
                </h2>
                {loading ? (
                  <div>{t("common.loading")}</div>
                ) : servers.length === 0 ? (
                  <div style={{ opacity: 0.7 }}>{t("servers.noServers")}</div>
                ) : (
                  <div style={baseStyles.serverGrid}>
                    {servers.map((server, idx) => (
                      <div key={idx} style={baseStyles.serverCard}>
                        <div
                          style={{
                            fontSize: "clamp(1rem, 4vw, 1.125rem)",
                            fontWeight: "bold",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {server.name}
                        </div>
                        <div
                          style={{
                            opacity: 0.8,
                            fontSize: "clamp(0.75rem, 3vw, 0.875rem)",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {server.category}
                        </div>
                        <div
                          style={{
                            fontSize: "clamp(0.625rem, 2.5vw, 0.75rem)",
                            opacity: 0.7,
                            marginBottom: "0.25rem",
                          }}
                        >
                          🔧 {server.tools?.length || 0} {t("servers.tools")}
                        </div>
                        <div
                          style={{
                            fontSize: "clamp(0.625rem, 2.5vw, 0.75rem)",
                            opacity: 0.7,
                            marginBottom: "0.25rem",
                          }}
                        >
                          📦 {server.resources?.length || 0}{" "}
                          {t("servers.resources")}
                        </div>
                        <div
                          style={{
                            fontSize: "clamp(0.625rem, 2.5vw, 0.75rem)",
                            opacity: 0.7,
                            marginBottom: "0.25rem",
                          }}
                        >
                          💬 {server.prompts?.length || 0}{" "}
                          {t("servers.prompts")}
                        </div>
                        {server.hasGraphQL && (
                          <div
                            style={{
                              fontSize: "clamp(0.625rem, 2.5vw, 0.75rem)",
                              opacity: 0.7,
                            }}
                          >
                            ⚡ {t("servers.graphql")}
                          </div>
                        )}
                        {server.supportsSampling && (
                          <div
                            style={{
                              fontSize: "clamp(0.625rem, 2.5vw, 0.75rem)",
                              opacity: 0.7,
                            }}
                          >
                            🎲 {t("servers.sampling")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "resources" && (
              <>
                <h2
                  style={{
                    fontSize: "clamp(1.25rem, 5vw, 1.5rem)",
                    marginBottom: "1rem",
                  }}
                >
                  {t("resources.title")} ({resources.length})
                </h2>
                <div style={baseStyles.serverGrid}>
                  {resources.map((resource, idx) => (
                    <div key={idx} style={baseStyles.serverCard}>
                      <div
                        style={{
                          fontSize: "clamp(0.875rem, 3.5vw, 1rem)",
                          fontWeight: "bold",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {resource.name}
                      </div>
                      <div
                        style={{
                          fontSize: "clamp(0.625rem, 2.5vw, 0.75rem)",
                          opacity: 0.7,
                          marginBottom: "0.5rem",
                          fontFamily: "monospace",
                          wordBreak: "break-word",
                        }}
                      >
                        {resource.uri}
                      </div>
                      <div
                        style={{
                          fontSize: "clamp(0.75rem, 3vw, 0.875rem)",
                          opacity: 0.8,
                          marginBottom: "0.5rem",
                        }}
                      >
                        {resource.description}
                      </div>
                      <div
                        style={{
                          fontSize: "clamp(0.625rem, 2.5vw, 0.75rem)",
                          opacity: 0.6,
                        }}
                      >
                        {t("resources.server")}: {resource.server}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "prompts" && (
              <>
                <h2
                  style={{
                    fontSize: "clamp(1.25rem, 5vw, 1.5rem)",
                    marginBottom: "1rem",
                  }}
                >
                  {t("prompts.title")} ({prompts.length})
                </h2>
                <div style={baseStyles.serverGrid}>
                  {prompts.map((prompt, idx) => (
                    <div key={idx} style={baseStyles.serverCard}>
                      <div
                        style={{
                          fontSize: "clamp(0.875rem, 3.5vw, 1rem)",
                          fontWeight: "bold",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {prompt.name}
                      </div>
                      <div
                        style={{
                          fontSize: "clamp(0.75rem, 3vw, 0.875rem)",
                          opacity: 0.8,
                          marginBottom: "0.5rem",
                        }}
                      >
                        {prompt.description}
                      </div>
                      {prompt.arguments && prompt.arguments.length > 0 && (
                        <div
                          style={{
                            fontSize: "clamp(0.625rem, 2.5vw, 0.75rem)",
                            opacity: 0.7,
                            marginBottom: "0.5rem",
                          }}
                        >
                          {t("prompts.args")}:{" "}
                          {prompt.arguments
                            .map((arg: any) => arg.name)
                            .join(", ")}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: "clamp(0.625rem, 2.5vw, 0.75rem)",
                          opacity: 0.6,
                        }}
                      >
                        {t("prompts.server")}: {prompt.server}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
