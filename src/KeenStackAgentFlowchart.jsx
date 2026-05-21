import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Bot,
  BrainCircuit,
  Cable,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Cloud,
  Code2,
  Database,
  FileText,
  Gauge,
  GitBranch,
  Globe2,
  Layers3,
  Lock,
  MessageSquareText,
  Network,
  Puzzle,
  Route,
  Search,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Workflow,
  Wrench,
} from "lucide-react";

/*
  KeenStack Agent V2 Architecture Flowchart
  -------------------------------------------------------
  Self-contained React artifact using a KeenStack-inspired
  design system: Phantom navy, Polar canvas, Keen Green,
  Code Blue, soft cards, Sora-like headings, Open-Sans-like body.

  No shadcn imports. No external images. All UI components live here.
*/

const KS = {
  phantom: "#112245",
  phantom90: "#1A2D56",
  phantom80: "#2B3D65",
  phantom60: "#5B6A8A",
  phantom40: "#8C98B0",
  phantom20: "#BDC4D2",
  polar: "#ECF2F7",
  keenGreen: "#20C9A0",
  greenDark: "#1AA786",
  greenLight: "#B4EBDA",
  codeBlue: "#153CA8",
  blueDark: "#0F2E85",
  slate: "#D9DEE2",
  white: "#FFFFFF",
  danger: "#D8453E",
  warning: "#E8A838",
};

const laneThemes = {
  channel: {
    tint: "#EAF7FF",
    border: "#C9E7F7",
    accent: KS.codeBlue,
    chip: "Channels",
  },
  servicenow: {
    tint: "#EAF9F4",
    border: "#BFEBDD",
    accent: KS.keenGreen,
    chip: "ServiceNow",
  },
  ai: {
    tint: "#F1F0FF",
    border: "#D7D2FF",
    accent: "#5B4BDB",
    chip: "Reasoning",
  },
  tool: {
    tint: "#FFF7E6",
    border: "#F1D99A",
    accent: KS.warning,
    chip: "Execution",
  },
  data: {
    tint: "#F7F9FC",
    border: KS.slate,
    accent: KS.phantom60,
    chip: "Evidence",
  },
  provider: {
    tint: "#EDF4FF",
    border: "#C7D9FF",
    accent: KS.codeBlue,
    chip: "Providers",
  },
  reliability: {
    tint: "#FFF0EF",
    border: "#F0C9C6",
    accent: KS.danger,
    chip: "Reliability",
  },
};

const currentArchitecture = [
  {
    lane: "User / UI Channels",
    color: "channel",
    icon: MessageSquareText,
    nodes: [
      {
        id: "c-1-1",
        title: "Service Portal Chat UI",
        icon: Bot,
        body: "Main user surface with chat, history panel, dark mode, Planning Mode toggle, raw tool calls, file/CSV upload and download links.",
        proof: "This is what made the app feel like a product instead of only a background script demo.",
        devNote: "Inspect the Service Portal widget client script, server script, template, and CSS. Keep the UI as a renderer/controller, not the place where ServiceNow records are mutated.",
      },
      {
        id: "c-1-2",
        title: "Planning Mode UI",
        icon: ClipboardCheck,
        body: "Shows a step-by-step plan before executing multi-step operations like dependency analysis → incident creation → CSV export → work note.",
        proof: "Best controlled automation story: plan first, execute only after approval.",
        devNote: "The UI should submit mode=planning or execute_plan with a stable workflow identifier. Do not rely only on free-text approval matching.",
      },
      {
        id: "c-1-3",
        title: "Developer / Operator Queries",
        icon: Code2,
        body: "Users can ask app/backend questions: architecture, tables, flows, business rules, debugging paths, and where to change code.",
        proof: "Evolved into Developer Operator and 792 export-backed app intelligence.",
        devNote: "Developer intent must route before generic list/search shortcuts. Otherwise architecture prompts get hijacked by list_appeals or ci_search.",
      },
    ],
  },
  {
    lane: "ServiceNow Entry + State",
    color: "servicenow",
    icon: Database,
    nodes: [
      {
        id: "c-2-1",
        title: "ChatAgentAjax",
        icon: Cable,
        body: "Ajax bridge between portal and backend. Submits prompt/session/mode and receives conversation_id or response status.",
        proof: "Keeps browser thin and moves real execution into ServiceNow backend.",
        devNote: "Contract: input message/session/source/planning flag; output conversation_id/status/error. Avoid returning empty or inconsistent JSON.",
      },
      {
        id: "c-2-2",
        title: "Conversation Table",
        icon: Database,
        body: "Stores message, session, source, status, final answer, raw tool calls, errors, attachments, timing and history.",
        proof: "This is the durable async state machine: queued → processing → complete/error.",
        devNote: "This table is the source of truth for portal polling. Debug stuck responses by checking status, error, toolCalls, response fields, and sys_updated_on.",
      },
      {
        id: "c-2-3",
        title: "ChatAgentAjaxWorker",
        icon: Workflow,
        body: "Runtime traffic controller. Handles fast paths, Planning Mode, Developer Operator route, LLM calls, tool execution and response persistence.",
        proof: "Most important script to stabilize because route order decides what gets called.",
        devNote: "Read this first. It owns route order, fast paths, worker completion, LLM call delegation, and the response shape the portal expects.",
      },
    ],
  },
  {
    lane: "Reasoning + Governance",
    color: "ai",
    icon: BrainCircuit,
    nodes: [
      {
        id: "c-3-1",
        title: "NowLLMOrchestrator",
        icon: BrainCircuit,
        body: "Builds prompt, includes tool descriptions, uses ReAct-style Action / Action Input / Final Answer parsing.",
        proof: "LLM decides or explains, but does not directly write records.",
        devNote: "Log raw model output before parsing. If Action and Final Answer both appear, prefer a valid Action when a tool call is clearly intended.",
      },
      {
        id: "c-3-2",
        title: "GuardPolicyEvaluator",
        icon: ShieldCheck,
        body: "Checks if a tool/action is allowed, risky, duplicate, or blocked before execution.",
        proof: "Prevents repeated record creation and unsafe write actions.",
        devNote: "Every write-capable tool should pass governance. Block messages should include tool, risk, and clear reason.",
      },
      {
        id: "c-3-3",
        title: "Duplicate Call Prevention",
        icon: Lock,
        body: "Stops repeated unsafe tool calls with the same normalized input, especially around create/update actions.",
        proof: "Useful, but must not block harmless navigation or architecture explanations.",
        devNote: "Use operation-aware duplicate keys. Do not block read-only tools purely because the same tool name is repeated.",
      },
    ],
  },
  {
    lane: "Tool Execution Layer",
    color: "tool",
    icon: Wrench,
    nodes: [
      {
        id: "c-4-1",
        title: "ToolRouter",
        icon: Route,
        body: "Looks up tool registry row, resolves handler Script Include and method, invokes handler with JSON params.",
        proof: "Turns LLM tool calls into deterministic backend function calls.",
        devNote: "Undefined is not a function usually means registry method and Script Include prototype method do not match, or scope access failed.",
      },
      {
        id: "c-4-2",
        title: "ITSM Tools",
        icon: ClipboardCheck,
        body: "Incident search/create/update, impact/urgency/priority updates, work notes, assignment/change context.",
        proof: "Shows the agent can operate on ServiceNow records, not just chat.",
        devNote: "Normalize create vs update intent. Missing incident number should block update but not create.",
      },
      {
        id: "c-4-3",
        title: "CMDB Tools",
        icon: GitBranch,
        body: "CI search, dependency traversal, upstream/downstream impact analysis, CSV export, affected CI context.",
        proof: "Payment Gateway dependency analysis is one of the strongest demos.",
        devNote: "Always log selected CI sys_id/name/class, relationship direction, depth, row count, and export row count. UI summary and CSV must use the same result set.",
      },
      {
        id: "c-4-4",
        title: "KB + Navigation Tools",
        icon: Search,
        body: "Knowledge article search, troubleshooting guidance, and ServiceNow module navigation links/steps.",
        proof: "Safe, useful, operator-friendly demo path.",
        devNote: "Search/navigation is safer live than create. Creation paths should be guarded for duplicate KB drafts.",
      },
    ],
  },
  {
    lane: "App Intelligence + Evidence",
    color: "data",
    icon: FileText,
    nodes: [
      {
        id: "c-5-1",
        title: "Developer Operator",
        icon: ServerCog,
        body: "Developer-focused route for architecture, debugging, scripts, tables, flows, business rules, and where-to-change-code questions.",
        proof: "Prevents developer questions from being hijacked by generic list/search tools.",
        devNote: "Treat it as read-only context intelligence. It should not mutate records. It should answer from exported/known metadata, not guesses.",
      },
      {
        id: "c-5-2",
        title: "792 Export Context",
        icon: FileText,
        body: "Chunked metadata from real 792 app export: x_kest_ai_powere_1_appeal, x_kest_referral_fa_referrals, fields, flows, BRs, UI actions, REST endpoints.",
        proof: "Solves wrong-source problem where the agent explained ven08793 bridge handlers instead of the real Appeals app.",
        devNote: "Use flow-first compact mode for long app walkthroughs so flows and BRs appear before field dumps.",
      },
      {
        id: "c-5-3",
        title: "Evidence Outputs",
        icon: CheckCircle2,
        body: "Incident links, CSV downloads, raw tool calls, attachment references, route names, timing logs, final markdown answers.",
        proof: "Makes answers inspectable and demo-safe.",
        devNote: "A demo answer should include proof: route, tool calls, record links, attachment links, and clear known limitations.",
      },
    ],
  },
];

const nextArchitecture = [
  {
    lane: "User / Channel Layer",
    color: "channel",
    icon: MessageSquareText,
    nodes: [
      {
        id: "n-1-1",
        title: "Service Portal",
        icon: Bot,
        body: "Primary ServiceNow-native UI continues to use conversation row + async polling.",
        outcome: "No webhook-style blocking from the browser.",
        devNote: "Keep the portal as the consistent UX shell across providers. The provider should not change the portal contract.",
      },
      {
        id: "n-1-2",
        title: "Teams Bot",
        icon: MessageSquareText,
        body: "Teams becomes another entry point using the same backend contract and conversation state.",
        outcome: "Same agent capabilities outside the portal.",
        devNote: "Teams should call the same backend API/worker path, not maintain a separate duplicated agent brain.",
      },
      {
        id: "n-1-3",
        title: "Standalone Web App / API Clients",
        icon: Globe2,
        body: "Future external channels call a stable API contract instead of duplicating logic.",
        outcome: "One agent backend, many frontends.",
        devNote: "Expose a stable channel contract: submit message, receive conversation/job id, poll status, render final answer/evidence.",
      },
    ],
  },
  {
    lane: "ServiceNow Execution Plane",
    color: "servicenow",
    icon: Database,
    nodes: [
      {
        id: "n-2-1",
        title: "Conversation + Async Worker",
        icon: Workflow,
        body: "ServiceNow creates conversation, enqueues work, polls status, and renders final response.",
        outcome: "Avoids timeout whether using LLMClient, Bedrock Spoke, or external gateway.",
        devNote: "This is the timeout fix. Do not wait synchronously for long model calls inside the UI request.",
      },
      {
        id: "n-2-2",
        title: "LLM Provider Router",
        icon: Route,
        body: "New abstraction inside ServiceNow: servicenow_llmclient | bedrock_spoke | external_gateway.",
        outcome: "Provider can change without rewriting every worker route.",
        devNote: "Create one provider interface: call(prompt, model, options) → normalized response. Route provider by property/config.",
      },
      {
        id: "n-2-3",
        title: "Tool Execution Stays Local",
        icon: Wrench,
        body: "ToolRouter, GuardPolicyEvaluator, record updates, attachments, CSV export and audit remain in ServiceNow.",
        outcome: "ServiceNow remains system of record and action layer.",
        devNote: "External model/gateway can decide, but ServiceNow should execute writes because ACLs, records, and audit live there.",
      },
    ],
  },
  {
    lane: "Model Provider Options",
    color: "provider",
    icon: Cloud,
    nodes: [
      {
        id: "n-3-1",
        title: "ServiceNow LLMClient",
        icon: BrainCircuit,
        body: "Current/default provider path for existing working behavior.",
        outcome: "Keeps stable fallback while v2 evolves.",
        devNote: "Do not remove this until Bedrock/external paths pass regression tests.",
      },
      {
        id: "n-3-2",
        title: "Amazon Bedrock Spoke",
        icon: Cloud,
        body: "ServiceNow-native Bedrock integration through Flow/IntegrationHub/GenAI Controller path.",
        outcome: "Enterprise-friendly AWS model story without mandatory custom API.",
        devNote: "The spoke is a provider option, not a timeout fix by itself. Keep async worker/polling.",
      },
      {
        id: "n-3-3",
        title: "External AI Gateway API",
        icon: Cable,
        body: "Optional advanced layer for provider routing, streaming, async jobs, retries, model experiments, and multi-agent orchestration.",
        outcome: "Best for long-term multi-provider and cross-channel architecture.",
        devNote: "Use job_id/status/callback pattern. Never make ServiceNow block on a long external LLM request.",
      },
    ],
  },
  {
    lane: "Multi-Agent Layer",
    color: "ai",
    icon: Network,
    nodes: [
      {
        id: "n-4-1",
        title: "Supervisor Agent",
        icon: Network,
        body: "Classifies intent and delegates to a specialist. Does not execute ServiceNow writes directly.",
        outcome: "Reduces wrong-tool selection and overloaded prompts.",
        devNote: "Supervisor chooses specialist and mode. It should not own all tool descriptions or execute all tools.",
      },
      {
        id: "n-4-2",
        title: "Specialist Agents",
        icon: Puzzle,
        body: "ITSM Operator, CMDB Analyst, Knowledge Assistant, Developer Operator, App Context Analyst, Document Intake Agent.",
        outcome: "Each agent gets a smaller tool set and better prompt scope.",
        devNote: "Give each specialist a narrow allowed tool set. This is the main fix for wrong-tool selection at scale.",
      },
      {
        id: "n-4-3",
        title: "Planning Coordinator",
        icon: ClipboardCheck,
        body: "Maps multi-step requests to approved composite workflow IDs, not freehand action chains.",
        outcome: "Stable plan → approve → execute path.",
        devNote: "Composite workflows should be config/table-driven, not string-matched from natural language only.",
      },
    ],
  },
  {
    lane: "Reliability + Observability",
    color: "reliability",
    icon: Gauge,
    nodes: [
      {
        id: "n-5-1",
        title: "Regression Test Runner",
        icon: CheckCircle2,
        body: "Batch tests for every tool family: ITSM, CMDB, KB, navigation, Planning, Developer Operator, 792 app context.",
        outcome: "One fix should not break another feature.",
        devNote: "Every route/tool needs happy path, missing-input path, governance path, and response-shape check.",
      },
      {
        id: "n-5-2",
        title: "Telemetry Contract",
        icon: Gauge,
        body: "Log route, agent, provider, model, tool, handler, guard result, latency, tokens, status and errors.",
        outcome: "Every failure becomes diagnosable.",
        devNote: "This is how you stop guessing. Each response should reveal route selected, tool selected, provider used, and failure point.",
      },
      {
        id: "n-5-3",
        title: "Normalized Response Shape",
        icon: Layers3,
        body: "All handlers return success, answer, data, links, attachments, toolCalls, error, telemetry.",
        outcome: "Portal rendering becomes predictable and stable.",
        devNote: "This prevents blank UI responses caused by handler-specific return shapes.",
      },
    ],
  },
];

const providerOptions = [
  {
    name: "Current: ServiceNow LLMClient",
    icon: BrainCircuit,
    bestFor: "Keep today’s successful demo path working.",
    risk: "Less provider abstraction. Model behavior tied to instance configuration.",
    pattern: "Worker → LLMClient → ToolRouter",
  },
  {
    name: "Next: Amazon Bedrock Spoke",
    icon: Cloud,
    bestFor: "ServiceNow-native enterprise Bedrock path using IntegrationHub/Flow Designer.",
    risk: "Still needs async worker/polling. Spoke does not automatically solve long wait time.",
    pattern: "Worker → Flow/Spoke → Bedrock → Worker updates conversation",
  },
  {
    name: "Future: External AI Gateway",
    icon: Cable,
    bestFor: "Advanced model routing, retries, streaming, multi-agent orchestration, cross-channel use.",
    risk: "More infra and auth surface. Needs job_id/status pattern to avoid webhook timeout.",
    pattern: "Worker → Gateway job_id → Bedrock/Claude/OpenAI → status/callback → ServiceNow executes tools",
  },
];

const timeoutPatterns = [
  {
    title: "Bad synchronous pattern",
    icon: AlertTriangle,
    tone: "bad",
    flow: ["Portal Send", "Worker waits", "External API waits", "Bedrock waits", "Response maybe times out"],
    note: "This recreates the webhook timeout problem. Avoid for long LLM calls.",
  },
  {
    title: "Safe async pattern",
    icon: CheckCircle2,
    tone: "good",
    flow: ["Create conversation", "Start async job", "Return job_id/status", "Poll conversation/status", "Render final answer"],
    note: "This works with LLMClient, Bedrock Spoke, or external API.",
  },
];

const migrationPhases = [
  {
    phase: "Phase 1",
    title: "Stabilize current agent",
    items: ["Clean stale route blocks", "Normalize handler responses", "Add regression runner", "Lock demo-safe queries", "Improve duplicate prevention"],
  },
  {
    phase: "Phase 2",
    title: "Add LLM Provider Router",
    items: ["Create provider interface", "Keep LLMClient as default", "Add Bedrock Spoke provider", "Add external gateway provider stub", "Log provider/model telemetry"],
  },
  {
    phase: "Phase 3",
    title: "Bedrock Spoke integration",
    items: ["Use Flow/IntegrationHub action", "Keep async conversation pattern", "Add fallback provider", "Track latency and failure reasons"],
  },
  {
    phase: "Phase 4",
    title: "Multi-agent routing",
    items: ["Supervisor Agent", "Specialist agents", "Approved composite workflow registry", "Planning Coordinator", "Shared evidence context"],
  },
  {
    phase: "Phase 5",
    title: "External gateway if needed",
    items: ["Job queue", "Streaming/status endpoints", "Provider routing", "Retry/rate limit", "Cross-channel API"],
  },
];

const smokeTests = [
  {
    name: "Current view default selection",
    expected: "The first node should be Service Portal Chat UI and render without missing icons.",
  },
  {
    name: "Next view reliability lane",
    expected: "The Reliability + Observability lane should render the Gauge icon without errors.",
  },
  {
    name: "Compare mode",
    expected: "Clicking Compare should display What we have vs Next stage cards side by side.",
  },
  {
    name: "Node detail drawer",
    expected: "Clicking any node should update the selected-node drawer with title, body, dev note, and outcome/proof.",
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const UI = {
  pageGutter: "px-4 sm:px-6 lg:px-8",
  sectionY: "py-14 md:py-20",
  cardPad: "p-5 md:p-6",
  cardPadLoose: "p-5 md:p-8",
  panelPad: "p-4 md:p-5",
  compactPad: "p-4",
  cardRadius: "rounded-[28px]",
  panelRadius: "rounded-[20px]",
  gridGap: "gap-5 md:gap-6",
};

function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={cn("border bg-white", className)}
      style={{
        borderColor: "rgba(217, 222, 226, 0.82)",
        boxShadow: "0 20px 48px rgba(17,34,69,0.11)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Button({ children, active, variant = "solid", className = "", ...props }) {
  const isOutline = variant === "outline";
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-[999px] px-4 py-2.5 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-4 sm:px-5 sm:py-3",
        active
          ? "text-white"
          : isOutline
            ? "bg-white text-[#112245] hover:bg-[#ECF2F7]"
            : "text-white hover:opacity-95",
        className
      )}
      style={{
        background: active || !isOutline ? KS.phantom : KS.white,
        border: isOutline ? `1px solid ${KS.slate}` : `1px solid ${KS.phantom}`,
        boxShadow: active ? "0 12px 28px rgba(17,34,69,0.18)" : "0 2px 8px rgba(17,34,69,0.08)",
      }}
    >
      {children}
    </button>
  );
}

function SectionTitle({ eyebrow, title, subtitle, dark = false }) {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <div
        className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] shadow-sm"
        style={{
          color: KS.keenGreen,
          background: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.86)",
          borderColor: dark ? "rgba(255,255,255,0.14)" : "rgba(32,201,160,0.22)",
        }}
      >
        <Sparkles className="h-3.5 w-3.5" /> {eyebrow}
      </div>
      <h2
        className={cn("tracking-[-0.04em]", dark ? "text-white" : "text-[#112245]")}
        style={{ fontSize: "clamp(32px, 4vw, 56px)", lineHeight: 1.04, fontWeight: 500 }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-5 text-base leading-8 md:text-lg", dark ? "text-white/70" : "text-[#2B3D65]")}>{subtitle}</p>
      )}
    </div>
  );
}

function FlowNode({ node, color, active, onClick }) {
  const Icon = node.icon || Bot;
  const theme = laneThemes[color] || laneThemes.data;

  return (
    <button
      onClick={onClick}
      className={cn("group w-full border text-left transition duration-300 hover:-translate-y-1", UI.panelRadius, UI.panelPad, active && "scale-[1.015]")}
      style={{
        background: active ? KS.white : theme.tint,
        borderColor: active ? theme.accent : theme.border,
        boxShadow: active ? `0 18px 42px rgba(17,34,69,0.18), 0 0 0 4px ${theme.border}` : "0 8px 24px rgba(17,34,69,0.08)",
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-[16px] shadow-sm"
          style={{ background: KS.white, color: theme.accent }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <ChevronRight className="mt-2 h-4 w-4 text-[#8C98B0] transition group-hover:translate-x-1" />
      </div>
      <h3 className="text-base font-bold tracking-[-0.02em] text-[#112245]">{node.title}</h3>
      <p className="mt-2 text-xs leading-5 text-[#5B6A8A]">{node.body}</p>
    </button>
  );
}

function Lane({ lane, index, activeKey, setActiveKey, mode }) {
  const LaneIcon = lane.icon || Layers3;
  const theme = laneThemes[lane.color] || laneThemes.data;

  return (
    <div className="relative">
      <Card className={cn("h-full bg-white/88 backdrop-blur", UI.cardRadius)}>
        <div className={UI.cardPad}>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] text-white" style={{ background: KS.phantom }}>
              <LaneIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: theme.accent }}>
                Layer {index + 1} · {theme.chip}
              </div>
              <h3 className="text-lg font-bold tracking-[-0.03em] text-[#112245]">{lane.lane}</h3>
            </div>
          </div>
          <div className="space-y-3">
            {lane.nodes.map((node, nodeIndex) => {
              const key = `${mode}-${index}-${nodeIndex}`;
              return <FlowNode key={node.id || node.title} node={node} color={lane.color} active={activeKey === key} onClick={() => setActiveKey(key)} />;
            })}
          </div>
        </div>
      </Card>
      {index < 4 && (
        <div className="absolute -right-5 top-1/2 z-10 hidden -translate-y-1/2 rounded-full p-2 text-white shadow-lg xl:block" style={{ background: KS.phantom }}>
          <ArrowRight className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

function DetailDrawer({ selected, mode }) {
  if (!selected) return null;
  const Icon = selected.icon || Bot;
  const proofLabel = mode === "current" ? "Why this matters now" : "Next-stage outcome";
  const value = selected.proof || selected.outcome || "No outcome recorded.";

  return (
    <motion.div
      key={selected.id || selected.title}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className={cn("mx-auto mt-8 max-w-6xl text-white", UI.cardRadius, UI.cardPad)}
      style={{ background: KS.phantom, boxShadow: "0 24px 70px rgba(17,34,69,0.28)" }}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px]" style={{ background: KS.keenGreen, color: KS.phantom }}>
          <Icon className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: KS.keenGreen }}>
            Selected node
          </div>
          <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">{selected.title}</h3>
          <p className="mt-3 text-base leading-8 text-white/72">{selected.body}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className={cn("bg-white/10 ring-1 ring-white/10", UI.panelRadius, UI.panelPad)}>
              <div className="text-xs font-bold uppercase tracking-wide" style={{ color: KS.greenLight }}>
                {proofLabel}
              </div>
              <p className="mt-2 text-sm font-semibold leading-6 text-white">{value}</p>
            </div>
            <div className={cn("bg-white/10 ring-1 ring-white/10", UI.panelRadius, UI.panelPad)}>
              <div className="text-xs font-bold uppercase tracking-wide" style={{ color: KS.greenLight }}>
                Developer note
              </div>
              <p className="mt-2 text-sm font-semibold leading-6 text-white">{selected.devNote || "No developer note recorded."}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MiniFlow({ pattern }) {
  const Icon = pattern.icon || CheckCircle2;
  const isGood = pattern.tone === "good";

  return (
    <Card className={UI.cardRadius} style={{ background: isGood ? "#EAF9F4" : "#FFF0EF", borderColor: isGood ? "#BFEBDD" : "#F0C9C6" }}>
      <div className={UI.cardPad}>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[16px] text-white" style={{ background: isGood ? KS.greenDark : KS.danger }}>
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#112245]">{pattern.title}</h3>
        </div>
        <div className="space-y-3">
          {pattern.flow.map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-white text-xs font-bold text-[#112245] shadow-sm">{index + 1}</div>
              <div className="flex-1 rounded-[16px] bg-white/82 p-3 text-sm font-bold text-[#2B3D65]">{step}</div>
              {index < pattern.flow.length - 1 && <ArrowDown className="hidden h-4 w-4 text-[#8C98B0] md:block" />}
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm font-semibold leading-6 text-[#2B3D65]">{pattern.note}</p>
      </div>
    </Card>
  );
}

function SmokeTestCard({ test, index }) {
  return (
    <Card className={cn("bg-white/90", UI.panelRadius)}>
      <div className={UI.panelPad}>
        <div className="mb-3 flex items-center justify-between">
          <div className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "#EAF9F4", color: KS.greenDark, border: "1px solid #BFEBDD" }}>
            Test {index + 1}
          </div>
          <CheckCircle2 className="h-5 w-5" style={{ color: KS.keenGreen }} />
        </div>
        <h3 className="text-lg font-bold text-[#112245]">{test.name}</h3>
        <p className="mt-2 text-sm leading-6 text-[#5B6A8A]">{test.expected}</p>
      </div>
    </Card>
  );
}

export default function KeenStackAgentFlowchart() {
  const [view, setView] = useState("current");
  const [activeKey, setActiveKey] = useState("current-0-0");
  const [compareMode, setCompareMode] = useState(false);

  const architecture = view === "current" ? currentArchitecture : nextArchitecture;

  const selected = useMemo(() => {
    const [mode, laneIndex, nodeIndex] = activeKey.split("-");
    const source = mode === "current" ? currentArchitecture : nextArchitecture;
    return source?.[Number(laneIndex)]?.nodes?.[Number(nodeIndex)] || source?.[0]?.nodes?.[0];
  }, [activeKey]);

  function switchView(nextView) {
    setView(nextView);
    setActiveKey(`${nextView}-0-0`);
  }

  return (
    <div
      className="min-h-screen text-[#112245]"
      style={{
        background: `radial-gradient(circle at top left, rgba(32,201,160,0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(21,60,168,0.16), transparent 34%), ${KS.polar}`,
        fontFamily: "Open Sans, system-ui, -apple-system, Segoe UI, sans-serif",
      }}
    >
      <header className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{ background: "rgba(255,255,255,0.78)", borderColor: "rgba(217,222,226,0.8)" }}>
        <div className={cn("mx-auto flex max-w-7xl flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between", UI.pageGutter)}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] text-white shadow-lg" style={{ background: KS.phantom }}>
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.24em] text-[#112245]">KeenStack AI Agent</div>
              <div className="text-xs font-semibold text-[#5B6A8A]">Current architecture + next-stage flowchart</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => switchView("current")} active={view === "current"} variant={view === "current" ? "solid" : "outline"}>
              What we have
            </Button>
            <Button onClick={() => switchView("next")} active={view === "next"} variant={view === "next" ? "solid" : "outline"}>
              Next stage
            </Button>
            <Button variant="outline" onClick={() => setCompareMode(!compareMode)}>
              <Layers3 className="mr-2 h-4 w-4" /> {compareMode ? "Hide compare" : "Compare"}
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className={cn("mx-auto max-w-7xl pb-12 pt-12 md:pb-16 md:pt-16", UI.pageGutter)}>
          <div className={cn("grid items-center md:grid-cols-[1.05fr_0.95fr]", UI.gridGap)}>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold shadow-sm" style={{ color: KS.greenDark, border: `1px solid ${KS.greenLight}` }}>
                <Sparkles className="h-4 w-4" /> Architecture draft for agent v2
              </div>
              <h1
                className="leading-[0.96] tracking-[-0.06em] text-[#112245]"
                style={{ fontFamily: "Sora, system-ui, sans-serif", fontSize: "clamp(52px, 7vw, 92px)", fontWeight: 300 }}
              >
                From working demo to
                <span className="block" style={{ color: KS.codeBlue, fontWeight: 500 }}>
                  enterprise agent platform.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#2B3D65]">
                This flowchart shows both states: the ServiceNow-native agent we have now, and the next-stage architecture with stability, Bedrock Spoke, optional external gateway, and multi-agent routing.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className={cn("bg-white/86", UI.cardRadius)}>
                <div className={UI.cardPad}>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: KS.greenDark }}>
                      Core principle
                    </div>
                    <ShieldCheck className="h-5 w-5" style={{ color: KS.keenGreen }} />
                  </div>
                  <div className={cn("text-white", UI.panelRadius, UI.panelPad)} style={{ background: KS.phantom }}>
                    <p className="text-lg font-bold leading-8">
                      ServiceNow remains the execution plane. The LLM decides, explains, plans, or delegates. Tools execute. Guard policy controls. Conversation table remembers.
                    </p>
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {[
                      ["Now", "LLMClient + tools"],
                      ["Next", "Provider router + Bedrock"],
                      ["Future", "Multi-agent gateway"],
                    ].map(([top, bottom]) => (
                      <div key={top} className={cn("rounded-[18px] text-center", UI.compactPad)} style={{ background: "#EAF9F4", border: "1px solid #BFEBDD" }}>
                        <div className="text-xl font-bold text-[#112245]">{top}</div>
                        <div className="mt-1 text-xs font-bold text-[#5B6A8A]">{bottom}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {compareMode && (
          <section className={cn("mx-auto max-w-7xl pb-10", UI.pageGutter)}>
            <Card className={cn("bg-white/90", UI.cardRadius)}>
              <div className={UI.cardPad}>
                <div className="mb-5 flex items-center gap-2 text-lg font-bold text-[#112245]">
                  <Layers3 className="h-5 w-5" style={{ color: KS.keenGreen }} /> Quick comparison
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={cn(UI.panelRadius, UI.panelPad)} style={{ background: "#EAF9F4", border: "1px solid #BFEBDD" }}>
                    <h3 className="text-xl font-bold text-[#112245]">What we have</h3>
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-[#2B3D65]">
                      <li>• Service Portal + async conversation worker</li>
                      <li>• LLM orchestration with governed ToolRouter</li>
                      <li>• ITSM, CMDB, KB, navigation, Planning Mode</li>
                      <li>• Developer Operator and 792 export context</li>
                      <li>• CSV/attachment evidence and raw tool call visibility</li>
                    </ul>
                  </div>
                  <div className={cn(UI.panelRadius, UI.panelPad)} style={{ background: "#EDF4FF", border: "1px solid #C7D9FF" }}>
                    <h3 className="text-xl font-bold text-[#112245]">Next stage</h3>
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-[#2B3D65]">
                      <li>• Regression-tested stable core</li>
                      <li>• LLMProviderRouter with LLMClient / Bedrock Spoke / Gateway</li>
                      <li>• ServiceNow-native Bedrock path without blocking UI</li>
                      <li>• Optional external gateway for advanced orchestration</li>
                      <li>• Supervisor + specialist multi-agent architecture</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        )}

        <section className={cn(UI.pageGutter, UI.sectionY)}>
          <SectionTitle
            eyebrow={view === "current" ? "Current state" : "Next stage"}
            title={view === "current" ? "What we have built" : "What the next architecture should become"}
            subtitle={
              view === "current"
                ? "Click any node to inspect its role in the current ServiceNow-native agent."
                : "Click any node to inspect how the next stage evolves stability, provider routing, Bedrock, external API, and multi-agent routing."
            }
          />

          <div className={cn("mx-auto mt-12 grid max-w-[1800px] xl:grid-cols-5", UI.gridGap)}>
            {architecture.map((lane, index) => (
              <Lane key={lane.lane} lane={lane} index={index} activeKey={activeKey} setActiveKey={setActiveKey} mode={view} />
            ))}
          </div>
          <DetailDrawer selected={selected} mode={view} />
        </section>

        <section className={cn(UI.pageGutter, UI.sectionY)} style={{ background: "rgba(255,255,255,0.54)" }}>
          <SectionTitle
            eyebrow="Provider strategy"
            title="Bedrock Spoke does not remove the need for architecture"
            subtitle="Bedrock Spoke is a ServiceNow-native provider option. It should sit behind an LLM Provider Router so we do not hardcode ourselves into one path."
          />

          <div className={cn("mx-auto mt-12 grid max-w-7xl md:grid-cols-3", UI.gridGap)}>
            {providerOptions.map((option) => {
              const Icon = option.icon || BrainCircuit;
              return (
                <Card key={option.name} className={cn("bg-white/90", UI.cardRadius)}>
                  <div className={UI.cardPad}>
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[16px] text-white" style={{ background: KS.phantom }}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#112245]">{option.name}</h3>
                    <div className={cn("mt-5 rounded-[18px] text-sm leading-6 text-[#2B3D65]", UI.compactPad)} style={{ background: "#EAF9F4", border: "1px solid #BFEBDD" }}>
                      <strong>Best for:</strong> {option.bestFor}
                    </div>
                    <div className={cn("mt-3 rounded-[18px] text-sm leading-6 text-[#2B3D65]", UI.compactPad)} style={{ background: "#FFF7E6", border: "1px solid #F1D99A" }}>
                      <strong>Risk:</strong> {option.risk}
                    </div>
                    <div className={cn("mt-3 rounded-[18px] text-sm font-semibold leading-6 text-white", UI.compactPad)} style={{ background: KS.phantom }}>
                      {option.pattern}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className={cn(UI.pageGutter, UI.sectionY)}>
          <SectionTitle
            eyebrow="Timeout design"
            title="How to avoid webhook timeout with Bedrock or external API"
            subtitle="The provider does not solve timeout by itself. The async conversation pattern solves it."
          />

          <div className={cn("mx-auto mt-12 grid max-w-6xl md:grid-cols-2", UI.gridGap)}>
            {timeoutPatterns.map((pattern) => (
              <MiniFlow key={pattern.title} pattern={pattern} />
            ))}
          </div>
        </section>

        <section className={cn(UI.pageGutter, UI.sectionY)} style={{ background: "rgba(255,255,255,0.56)" }}>
          <SectionTitle
            eyebrow="Smoke tests"
            title="Basic checks for this flowchart"
            subtitle="These lightweight tests make sure the interactive architecture view renders and missing-icon issues stay fixed."
          />
          <div className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-2">
            {smokeTests.map((test, index) => (
              <SmokeTestCard key={test.name} test={test} index={index} />
            ))}
          </div>
        </section>

        <section className={cn("text-white", UI.pageGutter, UI.sectionY)} style={{ background: KS.phantom }}>
          <SectionTitle dark eyebrow="Migration path" title="Build sequence" subtitle="This is the practical order. Do not jump straight into multi-agent until the core is stable." />

          <div className="mx-auto mt-12 max-w-6xl">
            <div className="relative space-y-5">
              <div className="absolute left-6 top-0 hidden h-full w-px md:block" style={{ background: `linear-gradient(${KS.keenGreen}, rgba(255,255,255,0.12), transparent)` }} />
              {migrationPhases.map((phase, index) => (
                <motion.div key={phase.title} initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }} className="relative flex gap-5">
                  <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] text-[#112245] shadow-lg" style={{ background: KS.keenGreen }}>
                    <span className="font-bold">{index + 1}</span>
                  </div>
                  <div className={cn("flex-1 border border-white/10 bg-white/8 shadow-xl shadow-black/20", UI.cardRadius, UI.cardPad)}>
                    <div className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: KS.greenLight }}>
                      {phase.phase}
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">{phase.title}</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {phase.items.map((item) => (
                        <div key={item} className="rounded-[18px] bg-white/10 p-3 text-sm font-semibold leading-6 text-white ring-1 ring-white/10">
                          <CheckCircle2 className="mr-2 inline h-4 w-4" style={{ color: KS.keenGreen }} /> {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className={cn(UI.pageGutter, UI.sectionY)}>
          <SectionTitle eyebrow="Final v2 shape" title="The architecture sentence" subtitle="This is the simplest way to explain the next stage without overcomplicating it." />
          <Card className={cn("mx-auto mt-10 max-w-5xl bg-white/90", UI.cardRadius)}>
            <div className={UI.cardPadLoose}>
              <div className={cn("text-xl font-semibold leading-9 text-white md:text-2xl", UI.panelRadius, UI.cardPad)} style={{ background: KS.phantom }}>
                KeenStack AI Agent v2 should keep ServiceNow as the execution plane, add an LLM Provider Router for LLMClient / Bedrock Spoke / external gateway, and evolve into a supervisor-led multi-agent system where specialist agents handle ITSM, CMDB, Knowledge, Developer Operator, App Context, and Planning workflows.
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  [ShieldCheck, "Stable core first", "Regression tests, normalized responses, clear routing, better telemetry."],
                  [Cloud, "Bedrock as provider", "Use Bedrock Spoke behind provider router, not hardcoded in worker logic."],
                  [Network, "Multi-agent next", "Supervisor delegates to scoped specialists so each agent has fewer ways to fail."],
                ].map(([Icon, title, text]) => (
                  <div key={title} className={cn(UI.panelRadius, UI.panelPad)} style={{ background: "#EAF9F4", border: "1px solid #BFEBDD" }}>
                    <Icon className="mb-3 h-6 w-6" style={{ color: KS.greenDark }} />
                    <h3 className="font-bold text-[#112245]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#5B6A8A]">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
