import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";
import { Copy, Check, Terminal, Code } from "lucide-react";
import { theme, radius } from "../styles/designSystem";

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleCopy}
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        background: "rgba(0,0,0,0.4)",
        border: `1px solid rgba(255,255,255,0.1)`,
        borderRadius: 6,
        padding: "4px 8px",
        cursor: "pointer",
        color: theme.textMuted,
        fontSize: 11,
        display: "flex",
        alignItems: "center",
        gap: 4,
        backdropFilter: "blur(8px)",
        transition: "all 0.15s ease",
      }}
    >
      {copied ? <Check size={12} color={theme.green} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </motion.button>
  );
};

const components = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = String(children).replace(/\n$/, "");

    if (!inline && match) {
      return (
        <div style={{ position: "relative", margin: "12px 0", borderRadius: 10, overflow: "hidden", border: `1px solid ${theme.border}` }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 12px",
            background: "rgba(0,0,0,0.3)",
            borderBottom: `1px solid ${theme.border}`,
          }}>
            <span style={{ fontSize: 11, color: theme.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
              <Terminal size={11} />
              {match[1]}
            </span>
          </div>
          <CopyButton text={codeString} />
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            customStyle={{ margin: 0, borderRadius: 0, fontSize: 12, lineHeight: 1.6 }}
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      );
    }

    if (!inline) {
      return (
        <div style={{ position: "relative", margin: "12px 0", borderRadius: 10, overflow: "hidden", border: `1px solid ${theme.border}` }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 12px",
            background: "rgba(0,0,0,0.3)",
            borderBottom: `1px solid ${theme.border}`,
          }}>
            <span style={{ fontSize: 11, color: theme.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
              <Code size={11} />
              code
            </span>
          </div>
          <CopyButton text={codeString} />
          <SyntaxHighlighter
            style={oneDark}
            PreTag="div"
            customStyle={{ margin: 0, borderRadius: 0, fontSize: 12, lineHeight: 1.6 }}
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <code style={{
        background: "rgba(255,255,255,0.08)",
        padding: "2px 6px",
        borderRadius: 4,
        fontSize: "0.9em",
        color: theme.red,
      }} {...props}>
        {children}
      </code>
    );
  },
  p({ children, ...props }) {
    return <p style={{ margin: "0 0 8px", lineHeight: 1.65, fontSize: 13 }} {...props}>{children}</p>;
  },
  h1({ children, ...props }) {
    return <h1 style={{ fontSize: 18, fontWeight: 600, margin: "16px 0 8px", color: theme.text }} {...props}>{children}</h1>;
  },
  h2({ children, ...props }) {
    return <h2 style={{ fontSize: 16, fontWeight: 600, margin: "14px 0 6px", color: theme.text }} {...props}>{children}</h2>;
  },
  h3({ children, ...props }) {
    return <h3 style={{ fontSize: 14, fontWeight: 600, margin: "12px 0 6px", color: theme.text }} {...props}>{children}</h3>;
  },
  ul({ children, ...props }) {
    return <ul style={{ margin: "0 0 8px", paddingLeft: 20, lineHeight: 1.8 }} {...props}>{children}</ul>;
  },
  ol({ children, ...props }) {
    return <ol style={{ margin: "0 0 8px", paddingLeft: 20, lineHeight: 1.8 }} {...props}>{children}</ol>;
  },
  li({ children, ...props }) {
    return <li style={{ fontSize: 13 }} {...props}>{children}</li>;
  },
  blockquote({ children, ...props }) {
    return (
      <blockquote style={{
        margin: "8px 0",
        padding: "8px 14px",
        borderLeft: `3px solid ${theme.red}`,
        background: "rgba(255,59,59,0.05)",
        borderRadius: "0 8px 8px 0",
        color: theme.textMuted,
        fontStyle: "italic",
        fontSize: 13,
      }} {...props}>
        {children}
      </blockquote>
    );
  },
  table({ children, ...props }) {
    return (
      <div style={{ overflowX: "auto", margin: "12px 0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 300 }} {...props}>
          {children}
        </table>
      </div>
    );
  },
  th({ children, ...props }) {
    return <th style={{ padding: "8px 12px", border: `1px solid ${theme.border}`, background: theme.bgCard2, fontWeight: 600, textAlign: "left" }} {...props}>{children}</th>;
  },
  td({ children, ...props }) {
    return <td style={{ padding: "6px 12px", border: `1px solid ${theme.border}`, color: theme.textMuted }} {...props}>{children}</td>;
  },
  a({ children, href, ...props }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer"
        style={{ color: theme.blue, textDecoration: "underline", textUnderlineOffset: 2 }}
        {...props}>
        {children}
      </a>
    );
  },
  hr() {
    return <hr style={{ border: "none", borderTop: `1px solid ${theme.border}`, margin: "16px 0" }} />;
  },
  strong({ children, ...props }) {
    return <strong style={{ fontWeight: 600, color: theme.text }} {...props}>{children}</strong>;
  },
};

export default function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
