import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
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
  X,
} from "lucide-react";
import keenStackLogo from "./assets/keenstack_ai_logo.svg";

/*
  KeenStack Agent V2 Architecture Story
  -------------------------------------------------------
  Self-contained React artifact using a KeenStack-inspired
  design system: Phantom navy, Polar canvas, Keen Green,
  Code Blue, soft cards, Sora-like headings, Open-Sans-like body.

  Interaction model:
  - Every architecture feature opens in a modal popup.
  - No selected-node details are rendered below the flowchart.
  - Copy avoids first-person framing.
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
  channel: { tint: "#EAF7FF", border: "#C9E7F7", accent: KS.codeBlue, chip: "Channels" },
  servicenow: { tint: "#EAF9F4", border: "#BFEBDD", accent: KS.keenGreen, chip: "ServiceNow" },
  ai: { tint: "#F1F0FF", border: "#D7D2FF", accent: "#5B4BDB", chip: "Reasoning" },
  tool: { tint: "#FFF7E6", border: "#F1D99A", accent: KS.warning, chip: "Execution" },
  data: { tint: "#F7F9FC", border: KS.slate, accent: KS.phantom60, chip: "Evidence" },
  provider: { tint: "#EDF4FF", border: "#C7D9FF", accent: KS.codeBlue, chip: "Providers" },
  reliability: { tint: "#FFF0EF", border: "#F0C9C6", accent: KS.danger, chip: "Reliability" },
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.075, delayChildren: 0.08 } },
};

function AnimatedRail({ dark = false }) {
  return (
    <div className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-3">
      {[0, 1, 2, 3, 4].map((item) => (
        <motion.div
          key={item}
          className="h-1.5 rounded-full"
          style={{ background: dark ? "rgba(32,201,160,0.78)" : KS.keenGreen }}
          animate={{ width: [10, 42, 10], opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: item * 0.16, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

const currentArchitecture = [
  {
    lane: "User Channels",
    color: "channel",
    icon: MessageSquareText,
    nodes: [
      {
        id: "c-1-1",
        title: "Service Portal Chat",
        icon: Bot,
        body: "Main user surface with chat, history panel, dark mode, Planning Mode toggle, raw tool calls, file/CSV upload, and download links.",
        proof: "Converts backend automation into a product-like ServiceNow experience instead of a background-script demo.",
        devNote: "Inspect the Service Portal widget client script, server script, template, and CSS. Keep the portal widget as the renderer/controller, not the place where ServiceNow records are mutated.",
      },
      {
        id: "c-1-2",
        title: "Planning Mode",
        icon: ClipboardCheck,
        body: "Shows a step-by-step plan before executing multi-step operations like dependency analysis -> incident creation -> CSV export -> work note.",
        proof: "Best controlled automation story: plan first, execute only after approval.",
        devNote: "The portal should submit mode=planning or execute_plan with a stable workflow identifier. Avoid relying only on free-text approval matching.",
      },
      {
        id: "c-1-3",
        title: "Developer / Operator Queries",
        icon: Code2,
        body: "Users can ask app/backend questions: architecture, tables, flows, business rules, debugging paths, and where to change code.",
        proof: "Evolved into Developer Operator and 792 export-backed app intelligence.",
        devNote: "Developer intent must route before generic list/search shortcuts. Otherwise architecture prompts can be hijacked by list_appeals or ci_search.",
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
        proof: "Keeps browser code thin and moves real execution into the ServiceNow backend.",
        devNote: "Contract: input message/session/source/planning flag; output conversation_id/status/error. Avoid returning empty or inconsistent JSON.",
      },
      {
        id: "c-2-2",
        title: "Conversation Table",
        icon: Database,
        body: "Stores message, session, source, status, final answer, raw tool calls, errors, attachments, timing, and history.",
        proof: "Durable async state machine: queued -> processing -> complete/error.",
        devNote: "This table is the source of truth for portal polling. Debug stuck responses by checking status, error, toolCalls, response fields, and sys_updated_on.",
      },
      {
        id: "c-2-3",
        title: "ChatAgentAjaxWorker",
        icon: Workflow,
        body: "Runtime traffic controller. Handles fast paths, Planning Mode, Developer Operator route, LLM calls, tool execution, and response persistence.",
        proof: "Most important script to stabilize because route order decides which capability gets called.",
        devNote: "Read this first. It owns route order, fast paths, worker completion, LLM call delegation, and the response shape expected by the portal.",
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
        body: "Builds prompts, includes tool descriptions, and uses ReAct-style Action / Action Input / Final Answer parsing.",
        proof: "The LLM decides or explains, but does not directly write records.",
        devNote: "Log raw model output before parsing. If Action and Final Answer both appear, prefer a valid Action when a tool call is clearly intended.",
      },
      {
        id: "c-3-2",
        title: "GuardPolicyEvaluator",
        icon: ShieldCheck,
        body: "Checks whether a tool/action is allowed, risky, duplicate, or blocked before execution.",
        proof: "Prevents repeated record creation and unsafe write actions.",
        devNote: "Every write-capable tool should pass governance. Block messages should include tool, risk, and clear reason.",
      },
      {
        id: "c-3-3",
        title: "Duplicate Call Prevention",
        icon: Lock,
        body: "Stops repeated unsafe tool calls with the same normalized input, especially around create/update actions.",
        proof: "Useful for safety, but should not block harmless navigation or architecture explanations.",
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
        body: "Looks up tool registry row, resolves handler Script Include and method, and invokes the handler with JSON params.",
        proof: "Turns LLM tool calls into deterministic backend function calls.",
        devNote: "Undefined is not a function usually means registry method and Script Include prototype method do not match, or scope access failed.",
      },
      {
        id: "c-4-2",
        title: "ITSM Tools",
        icon: ClipboardCheck,
        body: "Incident search/create/update, impact/urgency/priority updates, work notes, assignment, and change context.",
        proof: "Shows the agent can operate on ServiceNow records, not just chat.",
        devNote: "Normalize create vs update intent. Missing incident number should block update but not create.",
      },
      {
        id: "c-4-3",
        title: "CMDB Tools",
        icon: GitBranch,
        body: "CI search, dependency traversal, upstream/downstream impact analysis, CSV export, and affected CI context.",
        proof: "Payment Gateway dependency analysis is one of the strongest operational demos.",
        devNote: "Always log selected CI sys_id/name/class, relationship direction, depth, row count, and export row count. Portal summary and CSV must use the same result set.",
      },
      {
        id: "c-4-4",
        title: "KB + Navigation Tools",
        icon: Search,
        body: "Knowledge article search, troubleshooting guidance, and ServiceNow module navigation links/steps.",
        proof: "Safe, useful, operator-friendly demo path.",
        devNote: "Search/navigation is safer live than creation. Creation paths should be guarded for duplicate KB drafts.",
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
        body: "Chunked metadata from real 792 app export: x_kest_ai_powere_1_appeal, x_kest_referral_fa_referrals, fields, flows, BRs, record actions, REST endpoints.",
        proof: "Solves wrong-source behavior where the agent explained ven08793 bridge handlers instead of the real Appeals app.",
        devNote: "Use flow-first compact mode for long app walkthroughs so flows and BRs appear before field dumps.",
      },
      {
        id: "c-5-3",
        title: "Evidence Outputs",
        icon: CheckCircle2,
        body: "Incident links, CSV downloads, raw tool calls, attachment references, route names, timing logs, and final markdown answers.",
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
        body: "Primary ServiceNow-native portal experience continues to use conversation row + async polling.",
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
        outcome: "One agent backend, many channels.",
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
        devNote: "This is the timeout fix. Avoid waiting synchronously for long model calls inside the original request.",
      },
      {
        id: "n-2-2",
        title: "LLM Provider Router",
        icon: Route,
        body: "New abstraction inside ServiceNow: servicenow_llmclient | bedrock_spoke | external_gateway.",
        outcome: "Provider can change without rewriting every worker route.",
        devNote: "Create one provider interface: call(prompt, model, options) -> normalized response. Route provider by property/config.",
      },
      {
        id: "n-2-3",
        title: "Tool Execution Stays Local",
        icon: Wrench,
        body: "ToolRouter, GuardPolicyEvaluator, record updates, attachments, CSV export, and audit remain in ServiceNow.",
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
        outcome: "Stable plan -> approve -> execute path.",
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
        body: "Log route, agent, provider, model, tool, handler, guard result, latency, tokens, status, and errors.",
        outcome: "Every failure becomes diagnosable.",
        devNote: "Each response should reveal route selected, tool selected, provider used, and failure point.",
      },
      {
        id: "n-5-3",
        title: "Normalized Response Shape",
        icon: Layers3,
        body: "All handlers return success, answer, data, links, attachments, toolCalls, error, telemetry.",
        outcome: "Portal rendering becomes predictable and stable.",
        devNote: "This prevents blank portal responses caused by handler-specific return shapes.",
      },
    ],
  },
];

const providerOptions = [
  {
    id: "p-1",
    name: "Current: ServiceNow LLMClient",
    icon: BrainCircuit,
    summary: "Stable provider path for the current successful demo behavior.",
    bestFor: "Keep the successful demo path working.",
    risk: "Less provider abstraction. Model behavior tied to instance configuration.",
    pattern: "Worker -> LLMClient -> ToolRouter",
  },
  {
    id: "p-2",
    name: "Next: Amazon Bedrock Spoke",
    icon: Cloud,
    summary: "ServiceNow-native enterprise Bedrock path through IntegrationHub/Flow Designer.",
    bestFor: "ServiceNow-native enterprise Bedrock path using IntegrationHub/Flow Designer.",
    risk: "Still needs async worker/polling. Spoke does not automatically solve long wait time.",
    pattern: "Worker -> Flow/Spoke -> Bedrock -> Worker updates conversation",
  },
  {
    id: "p-3",
    name: "Future: External AI Gateway",
    icon: Cable,
    summary: "Advanced routing, async jobs, retries, streaming, and multi-agent orchestration.",
    bestFor: "Advanced model routing, retries, streaming, multi-agent orchestration, cross-channel use.",
    risk: "More infrastructure and auth surface. Needs job_id/status pattern to avoid webhook timeout.",
    pattern: "Worker -> Gateway job_id -> Bedrock/Claude/OpenAI -> status/callback -> ServiceNow executes tools",
  },
];

const killSwitches = [
  {
    id: "k-1",
    title: "Global Agent Kill Switch",
    scope: "Whole agent runtime",
    trigger: "Major incident, bad model behavior, repeated unsafe tool attempts, demo emergency.",
    action: "Disable LLM execution and return a controlled maintenance message while keeping the portal online.",
    property: "x_kest_ai_agent_v2.agent.enabled = false",
    owner: "Platform admin / product owner",
    icon: ShieldCheck,
  },
  {
    id: "k-2",
    title: "Write-Action Kill Switch",
    scope: "Create/update/close/attach operations",
    trigger: "Duplicate incidents, wrong record updates, governance uncertainty, production risk.",
    action: "Allow read-only search/explain/navigation, but block write tools through GuardPolicyEvaluator.",
    property: "x_kest_ai_agent_v2.tools.write_enabled = false",
    owner: "ServiceNow admin",
    icon: Lock,
  },
  {
    id: "k-3",
    title: "Provider Kill Switch",
    scope: "LLM provider path",
    trigger: "Bedrock outage, LLMClient failure, external gateway latency, token/cost spike.",
    action: "Route to fallback provider or return async degraded-mode response.",
    property: "x_kest_ai_agent_v2.llm.provider.active = llmclient | bedrock_spoke | external_gateway | disabled",
    owner: "AI platform owner",
    icon: Route,
  },
  {
    id: "k-4",
    title: "External Gateway Kill Switch",
    scope: "External API only",
    trigger: "Gateway timeout, auth issue, callback failure, queue backlog.",
    action: "Stop external calls and fall back to ServiceNow-native provider path.",
    property: "x_kest_ai_agent_v2.external_gateway.enabled = false",
    owner: "Integration owner",
    icon: Cable,
  },
  {
    id: "k-5",
    title: "Planning Execution Kill Switch",
    scope: "Approved composite workflows",
    trigger: "Plan maps incorrectly, composite workflow behaves unexpectedly, CSV/incident chaining issue.",
    action: "Keep planning explanations enabled but block Execute buttons/actions.",
    property: "x_kest_ai_agent_v2.planning.execute_enabled = false",
    owner: "Workflow owner",
    icon: ClipboardCheck,
  },
  {
    id: "k-6",
    title: "Tool-Level Kill Switch",
    scope: "Individual tool registry row",
    trigger: "One handler is broken, one table has ACL issue, one API response shape is unstable.",
    action: "Deactivate only the failing tool while keeping the rest of the agent alive.",
    property: "x_kest_ai_agent_v2_tool_registry.active = false for selected tool",
    owner: "Tool owner",
    icon: Wrench,
  },
  {
    id: "k-7",
    title: "Specialist Agent Kill Switch",
    scope: "One specialist agent",
    trigger: "Wrong delegation, specialist hallucination, bad prompt version, narrow tool failure.",
    action: "Disable one specialist and route its intents to fallback general/developer safe mode.",
    property: "x_kest_ai_agent_v2.agent.<specialist>.enabled = false",
    owner: "Agent owner",
    icon: Network,
  },
  {
    id: "k-8",
    title: "Context Source Kill Switch",
    scope: "Developer/app intelligence context",
    trigger: "Wrong source context, stale app export, app metadata mismatch.",
    action: "Disable affected context pack and return context-unavailable instead of guessing.",
    property: "x_kest_ai_agent_v2.context.<pack>.enabled = false",
    owner: "App context owner",
    icon: FileText,
  },
];

const scenarioFlowcharts = [
  {
    id: "s-1",
    title: "Current normal tool execution",
    subtitle: "How the ServiceNow-native agent answers or acts.",
    steps: [
      ["User prompt", "Portal captures message + mode"],
      ["ChatAgentAjax", "Creates conversation / returns status"],
      ["Worker", "Selects fast path or LLM path"],
      ["Orchestrator", "Returns Final Answer or Action JSON"],
      ["Guard", "Allows, blocks, or flags risk"],
      ["ToolRouter", "Runs handler method"],
      ["Evidence", "Writes record links, CSV, tool calls"],
      ["Portal", "Renders final answer"],
    ],
  },
  {
    id: "s-2",
    title: "Next-stage Bedrock Spoke flow",
    subtitle: "ServiceNow-native Bedrock without reintroducing webhook timeout.",
    steps: [
      ["User prompt", "Portal sends message"],
      ["Conversation row", "Status = queued"],
      ["Async worker", "Calls LLM Provider Router"],
      ["Provider Router", "Selects bedrock_spoke"],
      ["Flow / Spoke", "Calls Amazon Bedrock"],
      ["Worker resumes", "Normalizes LLM response"],
      ["Guard + tools", "ServiceNow executes locally"],
      ["Portal polling", "Shows complete response"],
    ],
  },
  {
    id: "s-3",
    title: "External gateway async flow",
    subtitle: "Safe long-running pattern if an external API is added later.",
    steps: [
      ["ServiceNow worker", "POST /agent/respond"],
      ["Gateway", "Returns 202 + job_id fast"],
      ["Gateway queue", "Runs provider/model call async"],
      ["Bedrock / Claude / OpenAI", "Generates decision or answer"],
      ["Status endpoint", "ServiceNow polls job result"],
      ["Tool decision", "Gateway returns tool calls only"],
      ["ServiceNow ToolRouter", "Executes records locally"],
      ["Conversation row", "Persists answer/evidence"],
    ],
  },
  {
    id: "s-4",
    title: "Multi-agent supervisor flow",
    subtitle: "How v2 avoids one overloaded general-purpose agent.",
    steps: [
      ["User intent", "Natural language request"],
      ["Supervisor", "Classifies domain + risk"],
      ["Specialist", "ITSM / CMDB / KB / Developer / App Context"],
      ["Allowed tools", "Small scoped tool set"],
      ["Plan or answer", "Specialist proposes action"],
      ["Guard", "Approves or blocks"],
      ["ServiceNow execution", "Local record work"],
      ["Shared evidence", "Returned to supervisor/user"],
    ],
  },
  {
    id: "s-5",
    title: "Kill-switch safety flow",
    subtitle: "How the system degrades safely instead of failing dangerously.",
    steps: [
      ["Request enters", "Portal / Teams / API"],
      ["Runtime checks", "Global + provider + tool switches"],
      ["If disabled", "Return safe maintenance message"],
      ["If read-only", "Block writes, allow explain/search"],
      ["If provider down", "Use fallback provider"],
      ["If tool down", "Disable only that handler"],
      ["Telemetry", "Log switch reason"],
      ["Admin action", "Fix and re-enable"],
    ],
  },
];

const migrationPhases = [
  {
    id: "m-1",
    phase: "Phase 1",
    title: "Stabilize current agent",
    summary: "Reliability-first cleanup before adding provider complexity.",
    items: ["Clean stale route blocks", "Normalize handler responses", "Add regression runner", "Lock demo-safe queries", "Improve duplicate prevention"],
  },
  {
    id: "m-2",
    phase: "Phase 2",
    title: "Add LLM Provider Router",
    summary: "Create a provider abstraction so Bedrock and external API paths do not require rewriting worker logic.",
    items: ["Create provider interface", "Keep LLMClient as default", "Add Bedrock Spoke provider", "Add external gateway provider stub", "Log provider/model telemetry"],
  },
  {
    id: "m-3",
    phase: "Phase 3",
    title: "Bedrock Spoke integration",
    summary: "Add ServiceNow-native Bedrock without blocking portal requests.",
    items: ["Use Flow/IntegrationHub action", "Keep async conversation pattern", "Add fallback provider", "Track latency and failure reasons"],
  },
  {
    id: "m-4",
    phase: "Phase 4",
    title: "Multi-agent routing",
    summary: "Split the overloaded assistant into supervisor-routed specialists.",
    items: ["Supervisor Agent", "Specialist agents", "Approved composite workflow registry", "Planning Coordinator", "Shared evidence context"],
  },
  {
    id: "m-5",
    phase: "Phase 5",
    title: "External gateway if needed",
    summary: "Use an external gateway only when advanced provider routing or cross-channel orchestration is required.",
    items: ["Job queue", "Streaming/status endpoints", "Provider routing", "Retry/rate limit", "Cross-channel API"],
  },
];

const smokeTests = [
  { name: "Current view default selection", expected: "The first node should be Service Portal Chat and render without missing icons." },
  { name: "Next view reliability lane", expected: "The Reliability + Observability lane should render the Gauge icon without errors." },
  { name: "Compare mode", expected: "Clicking Compare should display current vs next-stage cards side by side." },
  { name: "Feature modal", expected: "Clicking any feature should open a popup with body, outcome, and developer note." },
  { name: "Kill-switch modal", expected: "Clicking any kill switch should open a popup with scope, trigger, action, property, and owner." },
  { name: "Runtime flowcharts", expected: "The flowchart section should switch between current execution, Bedrock, external gateway, multi-agent, and kill-switch safety flows." },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const LAYOUT = {
  pageGutter: "px-4 sm:px-6 lg:px-8",
  sectionY: "py-14 md:py-20",
  heroY: "pb-12 pt-12 md:pb-16 md:pt-16",
  cardPad: "p-5 md:p-6",
  cardPadLoose: "p-5 md:p-8",
  panelPad: "p-4 md:p-5",
  compactPad: "p-4",
  cardRadius: "rounded-[28px]",
  panelRadius: "rounded-[20px]",
  gridGap: "gap-5 md:gap-6",
};

function Card({ children, className = "", style = {}, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={onClick ? { y: -6, scale: 1.012 } : undefined}
      whileTap={onClick ? { scale: 0.992 } : undefined}
      className={cn("relative overflow-hidden border bg-white", onClick && "cursor-pointer", className)}
      style={{
        borderColor: "rgba(217, 222, 226, 0.82)",
        boxShadow: "0 20px 48px rgba(17,34,69,0.11)",
        ...style,
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(32,201,160,0.75), transparent)" }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "linear" }}
      />
      {children}
    </motion.div>
  );
}

function Button({ children, active, variant = "solid", className = "", ...props }) {
  const isOutline = variant === "outline";
  return (
    <motion.button
      {...props}
      whileHover={{ y: -2, scale: 1.025 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-[999px] px-4 py-2.5 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-4 sm:px-5 sm:py-3",
        active ? "text-white" : isOutline ? "bg-white text-[#112245] hover:bg-[#ECF2F7]" : "text-white hover:opacity-95",
        className
      )}
      style={{
        background: active || !isOutline ? KS.phantom : KS.white,
        border: isOutline ? `1px solid ${KS.slate}` : `1px solid ${KS.phantom}`,
        boxShadow: active ? "0 12px 28px rgba(17,34,69,0.18)" : "0 2px 8px rgba(17,34,69,0.08)",
      }}
    >
      {active && (
        <motion.span
          className="absolute inset-y-0 -left-8 w-8 rotate-12 bg-white/20"
          animate={{ x: [0, 180] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
        />
      )}
      <span className="relative z-10 inline-flex items-center">{children}</span>
    </motion.button>
  );
}

function SectionTitle({ eyebrow, title, subtitle, dark = false }) {
  return (
    <motion.div className="mx-auto max-w-4xl text-center" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
      <motion.div
        variants={fadeUp}
        className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] shadow-sm"
        style={{
          color: KS.keenGreen,
          background: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.86)",
          borderColor: dark ? "rgba(255,255,255,0.14)" : "rgba(32,201,160,0.22)",
        }}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.span animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.18, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
          <Sparkles className="h-3.5 w-3.5" />
        </motion.span>
        {eyebrow}
      </motion.div>
      <motion.h2
        variants={fadeUp}
        className={cn("tracking-[-0.04em]", dark ? "text-white" : "text-[#112245]")}
        style={{ fontSize: "clamp(32px, 4vw, 56px)", lineHeight: 1.04, fontWeight: 500 }}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeUp} className={cn("mt-5 text-base leading-8 md:text-lg", dark ? "text-white/70" : "text-[#2B3D65]")}>{subtitle}</motion.p>
      )}
      <AnimatedRail dark={dark} />
    </motion.div>
  );
}

function FeatureModal({ modal, onClose }) {
  if (!modal) return null;
  const Icon = modal.icon || Bot;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: "rgba(17,34,69,0.62)", backdropFilter: "blur(10px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 44, scale: 0.92, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 210, damping: 24 }}
          className={cn("relative max-h-[88vh] w-full max-w-4xl overflow-y-auto bg-white shadow-2xl", LAYOUT.cardRadius, LAYOUT.cardPadLoose)}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="relative mb-6 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] text-white" style={{ background: KS.phantom }}>
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: KS.greenDark }}>{modal.eyebrow || "Feature detail"}</div>
                <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#112245] md:text-4xl">{modal.title}</h3>
                {modal.subtitle && <p className="mt-2 text-sm leading-6 text-[#5B6A8A]">{modal.subtitle}</p>}
              </div>
            </div>
            <motion.button whileHover={{ rotate: 90, scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={onClose} className="rounded-full bg-[#ECF2F7] p-3 text-[#112245] transition hover:bg-[#D9DEE2]" aria-label="Close modal">
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          {modal.body && <p className="text-base leading-8 text-[#2B3D65]">{modal.body}</p>}

          {modal.sections && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {modal.sections.map((section) => (
                <div key={section.label} className={cn(LAYOUT.panelRadius, LAYOUT.panelPad)} style={{ background: section.tone === "risk" ? "#FFF7E6" : section.tone === "danger" ? "#FFF0EF" : "#EAF9F4", border: `1px solid ${section.tone === "risk" ? "#F1D99A" : section.tone === "danger" ? "#F0C9C6" : "#BFEBDD"}` }}>
                  <div className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: section.tone === "danger" ? KS.danger : KS.greenDark }}>{section.label}</div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#2B3D65]">{section.value}</p>
                </div>
              ))}
            </div>
          )}

          {modal.list && (
            <div className={cn("mt-6", LAYOUT.panelRadius, LAYOUT.panelPad)} style={{ background: KS.phantom }}>
              <div className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: KS.greenLight }}>{modal.listLabel || "Details"}</div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {modal.list.map((item) => (
                  <div key={item} className="rounded-[16px] bg-white/10 p-3 text-sm font-semibold leading-6 text-white ring-1 ring-white/10">
                    <CheckCircle2 className="mr-2 inline h-4 w-4" style={{ color: KS.keenGreen }} /> {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {modal.flow && (
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {modal.flow.map(([title, text], index) => (
                <div key={`${title}-${index}`} className="relative rounded-[22px] border bg-white p-4" style={{ borderColor: index % 2 === 0 ? "#BFEBDD" : "#C7D9FF", boxShadow: "0 10px 26px rgba(17,34,69,0.08)" }}>
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[10px] text-xs font-bold text-white" style={{ background: index % 2 === 0 ? KS.keenGreen : KS.codeBlue }}>{index + 1}</div>
                  <h4 className="text-sm font-bold tracking-[-0.03em] text-[#112245]">{title}</h4>
                  <p className="mt-2 text-xs leading-5 text-[#5B6A8A]">{text}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function openNodeModal(node, mode, setModal) {
  setModal({
    id: node.id,
    title: node.title,
    icon: node.icon,
    eyebrow: mode === "current" ? "Current system feature" : "Next-stage feature",
    body: node.body,
    sections: [
      { label: mode === "current" ? "Why it matters" : "Expected outcome", value: node.proof || node.outcome || "Not recorded." },
      { label: "Developer note", value: node.devNote || "Not recorded." },
    ],
  });
}

function FlowNode({ node, color, active, onClick }) {
  const Icon = node.icon || Bot;
  const theme = laneThemes[color] || laneThemes.data;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.025 }}
      whileTap={{ scale: 0.985 }}
      className={cn("group relative w-full overflow-hidden border text-left", LAYOUT.panelRadius, LAYOUT.panelPad, active && "scale-[1.015]")}
      style={{
        background: active ? KS.white : theme.tint,
        borderColor: active ? theme.accent : theme.border,
        boxShadow: active ? `0 18px 42px rgba(17,34,69,0.18), 0 0 0 4px ${theme.border}` : "0 8px 24px rgba(17,34,69,0.08)",
      }}
    >
      <div className="relative mb-4 flex items-start justify-between gap-3">
        <motion.div
          className="flex h-11 w-11 items-center justify-center rounded-[16px] shadow-sm"
          style={{ background: KS.white, color: theme.accent }}
          animate={{ rotate: active ? [0, 4, -4, 0] : 0, y: active ? [0, -2, 0] : 0 }}
          transition={{ duration: 2.4, repeat: active ? Infinity : 0, ease: "easeInOut" }}
        >
          <Icon className="h-5 w-5" />
        </motion.div>
        <motion.div animate={{ x: active ? [0, 4, 0] : 0 }} transition={{ duration: 1.4, repeat: active ? Infinity : 0 }}>
          <ChevronRight className="mt-2 h-4 w-4 text-[#8C98B0] transition group-hover:translate-x-1" />
        </motion.div>
      </div>
      <h3 className="relative text-base font-bold tracking-[-0.02em] text-[#112245]">{node.title}</h3>
      <p className="relative mt-2 line-clamp-3 text-xs leading-5 text-[#5B6A8A]">{node.body}</p>
      <div className="relative mt-4 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: theme.accent }}>Open story</div>
    </motion.button>
  );
}

function Lane({ lane, index, activeKey, setActiveKey, mode, setModal }) {
  const LaneIcon = lane.icon || Layers3;
  const theme = laneThemes[lane.color] || laneThemes.data;

  return (
    <motion.div className="relative" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} transition={{ delay: index * 0.06 }}>
      <Card className={cn("h-full bg-white/88 backdrop-blur", LAYOUT.cardRadius)}>
        <div className={LAYOUT.cardPad}>
          <div className="mb-5 flex items-center gap-3">
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-[16px] text-white"
              style={{ background: KS.phantom }}
              animate={{ boxShadow: ["0 0 0 rgba(32,201,160,0)", "0 0 28px rgba(32,201,160,0.28)", "0 0 0 rgba(32,201,160,0)"] }}
              transition={{ duration: 3, repeat: Infinity, delay: index * 0.25 }}
            >
              <LaneIcon className="h-5 w-5" />
            </motion.div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: theme.accent }}>Layer {index + 1} - {theme.chip}</div>
              <h3 className="text-lg font-bold tracking-[-0.03em] text-[#112245]">{lane.lane}</h3>
            </div>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {lane.nodes.map((node, nodeIndex) => {
              const key = `${mode}-${index}-${nodeIndex}`;
              return (
                <motion.div key={node.id || node.title} variants={fadeUp}>
                  <FlowNode
                    node={node}
                    color={lane.color}
                    active={activeKey === key}
                    onClick={() => {
                      setActiveKey(key);
                      openNodeModal(node, mode, setModal);
                    }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Card>
      {index < 4 && (
        <motion.div
          className="absolute -right-5 top-1/2 z-10 hidden -translate-y-1/2 rounded-full p-2 text-white shadow-lg xl:block"
          style={{ background: KS.phantom }}
          animate={{ x: [0, 5, 0], boxShadow: ["0 0 0 rgba(32,201,160,0)", "0 0 22px rgba(32,201,160,0.45)", "0 0 0 rgba(32,201,160,0)"] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.2 }}
        >
          <ArrowRight className="h-4 w-4" />
        </motion.div>
      )}
    </motion.div>
  );
}

function ProviderCards({ setModal }) {
  return (
    <div className={cn("mx-auto mt-12 grid max-w-7xl md:grid-cols-3", LAYOUT.gridGap)}>
      {providerOptions.map((option) => {
        const Icon = option.icon || BrainCircuit;
        return (
          <Card
            key={option.id}
            className={cn("bg-white/90", LAYOUT.cardRadius)}
            onClick={() => setModal({
              title: option.name,
              icon: option.icon,
              eyebrow: "Provider path",
              body: option.summary,
              sections: [
                { label: "Best for", value: option.bestFor },
                { label: "Risk", value: option.risk, tone: "risk" },
                { label: "Pattern", value: option.pattern },
              ],
            })}
          >
            <div className={LAYOUT.cardPad}>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[16px] text-white" style={{ background: KS.phantom }}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#112245]">{option.name}</h3>
              <p className="mt-3 text-sm leading-6 text-[#5B6A8A]">{option.summary}</p>
              <div className="mt-5 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: KS.greenDark }}>Open provider story</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function KillSwitchMatrix({ setModal }) {
  return (
    <div className={cn("mx-auto mt-12 grid max-w-7xl md:grid-cols-2 xl:grid-cols-4", LAYOUT.gridGap)}>
      {killSwitches.map((item) => {
        const Icon = item.icon || ShieldCheck;
        return (
          <Card
            key={item.id}
            className={cn("bg-white/92", LAYOUT.cardRadius)}
            onClick={() => setModal({
              title: item.title,
              icon: item.icon,
              eyebrow: "Kill switch",
              body: "Safety control for predictable degradation during incidents, outages, or unstable tool behavior.",
              sections: [
                { label: "Scope", value: item.scope },
                { label: "Trigger", value: item.trigger, tone: "risk" },
                { label: "Action", value: item.action },
                { label: "Property / Control", value: item.property },
                { label: "Owner", value: item.owner },
              ],
            })}
          >
            <div className={LAYOUT.cardPad}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[16px] text-white" style={{ background: KS.phantom }}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ background: "#FFF0EF", color: KS.danger, border: "1px solid #F0C9C6" }}>Safety</div>
              </div>
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#112245]">{item.title}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5B6A8A]">{item.action}</p>
              <div className="mt-5 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: KS.danger }}>Open kill switch</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function ScenarioFlowcharts({ setModal }) {
  const [activeScenario, setActiveScenario] = useState(0);
  const scenario = scenarioFlowcharts[activeScenario] || scenarioFlowcharts[0];

  return (
    <div className="mx-auto mt-12 max-w-7xl">
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {scenarioFlowcharts.map((item, index) => (
          <Button key={item.id} variant={activeScenario === index ? "solid" : "outline"} active={activeScenario === index} onClick={() => setActiveScenario(index)}>
            {item.title}
          </Button>
        ))}
      </div>

      <Card
        className={cn("bg-white/92", LAYOUT.cardRadius)}
        onClick={() => setModal({
          title: scenario.title,
          icon: Workflow,
          eyebrow: "Runtime flowchart",
          body: scenario.subtitle,
          flow: scenario.steps,
        })}
      >
        <div className={LAYOUT.cardPadLoose}>
          <div className="mb-8 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: KS.greenDark }}>Interactive flowchart</div>
            <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#112245] md:text-4xl">{scenario.title}</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#5B6A8A]">{scenario.subtitle}</p>
            <div className="mt-4 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: KS.codeBlue }}>Open expanded flow</div>
          </div>

          <motion.div key={activeScenario} className="grid gap-4 md:grid-cols-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {scenario.steps.map(([title, text], index) => (
              <motion.div key={`${title}-${index}`} className="relative" variants={fadeUp}>
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={cn("h-full border bg-white", LAYOUT.panelRadius, LAYOUT.panelPad)}
                  style={{ borderColor: index % 2 === 0 ? "#BFEBDD" : "#C7D9FF", boxShadow: "0 10px 26px rgba(17,34,69,0.08)" }}
                >
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-[12px] text-sm font-bold text-white" style={{ background: index % 2 === 0 ? KS.keenGreen : KS.codeBlue }}>{index + 1}</div>
                  <h4 className="text-base font-bold tracking-[-0.03em] text-[#112245]">{title}</h4>
                  <p className="mt-2 text-xs leading-5 text-[#5B6A8A]">{text}</p>
                </motion.div>
                {index < scenario.steps.length - 1 && (
                  <motion.div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-1 shadow md:block" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.12 }}>
                    <ArrowRight className="h-4 w-4" style={{ color: KS.phantom }} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Card>
    </div>
  );
}

function MigrationTimeline({ setModal }) {
  return (
    <div className="mx-auto mt-12 max-w-6xl">
      <div className="relative space-y-5">
        <div className="absolute left-6 top-0 hidden h-full w-px md:block" style={{ background: `linear-gradient(${KS.keenGreen}, rgba(255,255,255,0.12), transparent)` }} />
        {migrationPhases.map((phase, index) => (
          <motion.div key={phase.id} initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 140, damping: 20, delay: index * 0.08 }} className="relative flex gap-5">
            <motion.div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] text-[#112245] shadow-lg" style={{ background: KS.keenGreen }} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity, delay: index * 0.22 }}>
              <span className="font-bold">{index + 1}</span>
            </motion.div>
            <button
              className={cn("flex-1 border border-white/10 bg-white/8 text-left shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:bg-white/12", LAYOUT.cardRadius, LAYOUT.cardPad)}
              onClick={() => setModal({
                title: phase.title,
                icon: ClipboardCheck,
                eyebrow: phase.phase,
                body: phase.summary,
                listLabel: "Implementation checklist",
                list: phase.items,
              })}
            >
              <div className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: KS.greenLight }}>{phase.phase}</div>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">{phase.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">{phase.summary}</p>
              <div className="mt-4 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: KS.keenGreen }}>Open phase details</div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Technical Architecture Diagram ─── */

const diagramLayers = [
  {
    id: "channels",
    label: "Layer 1 — User / Channel Layer",
    color: laneThemes.channel.accent,
    bg: laneThemes.channel.tint,
    border: laneThemes.channel.border,
    boxes: [
      { id: "portal", label: "Service Portal", sub: "Primary UI", icon: Bot },
      { id: "teams", label: "Teams Bot", sub: "Future channel", icon: MessageSquareText },
      { id: "api", label: "Web App / API", sub: "Future channel", icon: Globe2 },
    ],
  },
  {
    id: "entry",
    label: "Layer 2 — ServiceNow Entry + State",
    color: laneThemes.servicenow.accent,
    bg: laneThemes.servicenow.tint,
    border: laneThemes.servicenow.border,
    boxes: [
      { id: "ajax", label: "ChatAgentAjax", sub: "Ajax bridge", icon: Cable },
      { id: "conv", label: "Conversation Table", sub: "Async state machine", icon: Database },
      { id: "worker", label: "ChatAgentAjaxWorker", sub: "Runtime controller", icon: Workflow },
    ],
  },
  {
    id: "provider",
    label: "Layer 3 — LLM Provider Router",
    color: laneThemes.provider.accent,
    bg: laneThemes.provider.tint,
    border: laneThemes.provider.border,
    boxes: [
      { id: "llmclient", label: "LLMClient", sub: "Current default", icon: BrainCircuit },
      { id: "bedrock", label: "Bedrock Spoke", sub: "ServiceNow-native", icon: Cloud },
      { id: "gateway", label: "External Gateway", sub: "Optional future", icon: Cable },
    ],
  },
  {
    id: "reasoning",
    label: "Layer 4 — Reasoning + Governance",
    color: "#5B4BDB",
    bg: laneThemes.ai.tint,
    border: laneThemes.ai.border,
    boxes: [
      { id: "supervisor", label: "Supervisor Agent", sub: "Intent classifier", icon: Network },
      { id: "orchestrator", label: "NowLLMOrchestrator", sub: "ReAct prompting", icon: BrainCircuit },
      { id: "guard", label: "GuardPolicyEvaluator", sub: "Risk gating", icon: ShieldCheck },
    ],
  },
  {
    id: "specialists",
    label: "Layer 5 — Specialist Agents",
    color: "#5B4BDB",
    bg: "#F5F3FF",
    border: "#DDD8FF",
    boxes: [
      { id: "itsm_agent", label: "ITSM Operator", sub: "Incidents / work notes", icon: ClipboardCheck },
      { id: "cmdb_agent", label: "CMDB Analyst", sub: "Dependencies / CSV", icon: GitBranch },
      { id: "kb_agent", label: "KB Assistant", sub: "Search / navigate", icon: Search },
      { id: "dev_agent", label: "Developer Operator", sub: "Architecture / debug", icon: Code2 },
      { id: "app_agent", label: "App Context Analyst", sub: "792 / Referral", icon: FileText },
      { id: "plan_agent", label: "Planning Coordinator", sub: "Composite workflows", icon: ClipboardCheck },
    ],
  },
  {
    id: "execution",
    label: "Layer 6 — Tool Execution",
    color: laneThemes.tool.accent,
    bg: laneThemes.tool.tint,
    border: laneThemes.tool.border,
    boxes: [
      { id: "toolrouter", label: "ToolRouter", sub: "Registry lookup + dispatch", icon: Route },
      { id: "itsm_tools", label: "ITSM Tools", sub: "incident table", icon: ClipboardCheck },
      { id: "cmdb_tools", label: "CMDB Tools", sub: "cmdb_ci / cmdb_rel_ci", icon: GitBranch },
      { id: "kb_tools", label: "KB / Nav Tools", sub: "kb_knowledge", icon: Search },
    ],
  },
  {
    id: "evidence",
    label: "Layer 7 — Evidence + Audit",
    color: laneThemes.data.accent,
    bg: laneThemes.data.tint,
    border: laneThemes.data.border,
    boxes: [
      { id: "records", label: "ServiceNow Records", sub: "System of record", icon: Database },
      { id: "csv", label: "CSV / Attachments", sub: "Exportable evidence", icon: FileText },
      { id: "telemetry", label: "Telemetry + Logs", sub: "Route / tool / latency", icon: Gauge },
      { id: "killswitch", label: "Kill Switches", sub: "8 safety controls", icon: ShieldCheck },
    ],
  },
];

const diagramConnections = [
  { from: "channels", to: "entry", label: "Submit prompt" },
  { from: "entry", to: "provider", label: "Route to provider" },
  { from: "provider", to: "reasoning", label: "LLM response" },
  { from: "reasoning", to: "specialists", label: "Delegate to specialist" },
  { from: "specialists", to: "execution", label: "Tool calls" },
  { from: "execution", to: "evidence", label: "Persist results" },
];

function TechArchitectureDiagram({ setModal }) {
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const [diagramView, setDiagramView] = useState("full");

  const currentOnlyLayers = ["channels", "entry", "reasoning", "execution", "evidence"];
  const visibleLayers = diagramView === "current"
    ? diagramLayers.filter((l) => currentOnlyLayers.includes(l.id))
    : diagramLayers;

  const visibleConnections = diagramView === "current"
    ? [
        { from: "channels", to: "entry", label: "Submit prompt" },
        { from: "entry", to: "reasoning", label: "LLM call" },
        { from: "reasoning", to: "execution", label: "Tool calls" },
        { from: "execution", to: "evidence", label: "Persist results" },
      ]
    : diagramConnections;

  return (
    <div className="mx-auto mt-12 max-w-7xl">
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {[
          { key: "full", label: "Full v2 Architecture" },
          { key: "current", label: "Current Architecture" },
        ].map((opt) => (
          <Button
            key={opt.key}
            variant={diagramView === opt.key ? "solid" : "outline"}
            active={diagramView === opt.key}
            onClick={() => setDiagramView(opt.key)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <Card className={cn("overflow-visible bg-white/94", LAYOUT.cardRadius)}>
        <div className={cn(LAYOUT.cardPadLoose, "overflow-x-auto")}>
          <div className="mb-6 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: KS.greenDark }}>
              {diagramView === "current" ? "Current state" : "Proposed v2"} technical architecture
            </div>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#112245] md:text-3xl">
              {diagramView === "current"
                ? "ServiceNow-native agent — current flow"
                : "KeenStack AI Agent v2 — layered architecture"}
            </h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-[#5B6A8A]">
              {diagramView === "current"
                ? "User prompt flows through the ServiceNow backend to LLM, tools, and back to the portal."
                : "Provider router, multi-agent routing, and kill switches layered onto the stable ServiceNow execution plane."}
            </p>
          </div>

          <div className="relative">
            {/* Layer rows with connector arrows between them */}
            {visibleLayers.map((layer, layerIdx) => {
              const isHovered = hoveredLayer === layer.id;
              const conn = visibleConnections.find((c) => c.from === layer.id);
              return (
                <React.Fragment key={layer.id}>
                <motion.div
                  className="relative"
                  style={{ zIndex: isHovered ? 10 : 1 }}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: layerIdx * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  onMouseEnter={() => setHoveredLayer(layer.id)}
                  onMouseLeave={() => setHoveredLayer(null)}
                >
                  <motion.div
                    className="rounded-[20px] border p-4 transition-all duration-200"
                    style={{
                      background: isHovered ? "white" : layer.bg,
                      borderColor: isHovered ? layer.color : layer.border,
                      boxShadow: isHovered
                        ? `0 12px 36px rgba(17,34,69,0.14), 0 0 0 2px ${layer.border}`
                        : "0 4px 16px rgba(17,34,69,0.06)",
                    }}
                  >
                    {/* Layer label bar */}
                    <div className="mb-3 flex items-center gap-3">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-[10px] text-xs font-bold text-white"
                        style={{ background: layer.color }}
                      >
                        {layerIdx + 1}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: layer.color }}>
                        {layer.label.replace(/Layer \d+/, `Layer ${layerIdx + 1}`)}
                      </span>
                    </div>

                    {/* Boxes in this layer */}
                    <div className={cn(
                      "grid gap-3",
                      layer.boxes.length <= 3 ? "md:grid-cols-3" :
                      layer.boxes.length <= 4 ? "md:grid-cols-4" :
                      "md:grid-cols-6"
                    )}>
                      {layer.boxes.map((box) => {
                        const BoxIcon = box.icon;
                        return (
                          <motion.button
                            key={box.id}
                            whileHover={{ y: -4, scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="rounded-[14px] border bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md"
                            style={{ borderColor: layer.border }}
                            onClick={() => {
                              const node = [...currentArchitecture, ...nextArchitecture]
                                .flatMap((l) => l.nodes)
                                .find((n) => n.title === box.label);
                              if (node) {
                                openNodeModal(node, diagramView === "current" ? "current" : "next", setModal);
                              } else {
                                setModal({
                                  title: box.label,
                                  icon: box.icon,
                                  eyebrow: layer.label,
                                  body: box.sub,
                                  sections: [
                                    { label: "Layer", value: layer.label },
                                    { label: "Role", value: box.sub },
                                  ],
                                });
                              }
                            }}
                          >
                            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-[10px]" style={{ background: layer.bg, color: layer.color }}>
                              <BoxIcon className="h-4.5 w-4.5" />
                            </div>
                            <div className="text-sm font-bold tracking-[-0.02em] text-[#112245]">{box.label}</div>
                            <div className="mt-0.5 text-[11px] leading-4 text-[#5B6A8A]">{box.sub}</div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                </motion.div>
                {conn && (
                  <div className="flex items-center justify-center py-2">
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="h-6 w-px"
                        style={{ background: layerIdx % 2 === 0 ? KS.keenGreen : KS.codeBlue }}
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div
                        animate={{ y: [0, 3, 0] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowRight
                          className="h-4 w-4 rotate-90"
                          style={{ color: layerIdx % 2 === 0 ? KS.keenGreen : KS.codeBlue }}
                        />
                      </motion.div>
                      <span
                        className="rounded-full border px-3 py-1 text-[11px] font-semibold"
                        style={{
                          color: KS.phantom,
                          background: "white",
                          borderColor: layerIdx % 2 === 0 ? KS.keenGreen : KS.codeBlue,
                        }}
                      >
                        {conn.label}
                      </span>
                      <motion.div
                        animate={{ y: [0, 3, 0] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowRight
                          className="h-4 w-4 rotate-90"
                          style={{ color: layerIdx % 2 === 0 ? KS.keenGreen : KS.codeBlue }}
                        />
                      </motion.div>
                      <motion.div
                        className="h-6 w-px"
                        style={{ background: layerIdx % 2 === 0 ? KS.keenGreen : KS.codeBlue }}
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                )}
                </React.Fragment>
              );
            })}

            {/* Return path annotation */}
            <motion.div
              className="mt-2 flex items-center justify-center gap-2 text-xs font-semibold"
              style={{ color: KS.phantom60 }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                animate={{ x: [0, -6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
              </motion.div>
              Conversation row updated → Portal polls → Renders final answer + evidence
              <motion.div
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </motion.div>
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t pt-6" style={{ borderColor: KS.slate }}>
            {[
              { color: laneThemes.channel.accent, label: "Channels" },
              { color: laneThemes.servicenow.accent, label: "ServiceNow" },
              { color: laneThemes.provider.accent, label: "Providers" },
              { color: "#5B4BDB", label: "Reasoning / Agents" },
              { color: laneThemes.tool.accent, label: "Execution" },
              { color: laneThemes.data.accent, label: "Evidence" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                <span className="text-xs font-semibold text-[#5B6A8A]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function SmokeTestCard({ test, index }) {
  return (
    <Card className={cn("bg-white/90", LAYOUT.panelRadius)}>
      <div className={LAYOUT.panelPad}>
        <div className="mb-3 flex items-center justify-between">
          <div className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "#EAF9F4", color: KS.greenDark, border: "1px solid #BFEBDD" }}>Test {index + 1}</div>
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
  const [modal, setModal] = useState(null);

  const architecture = view === "current" ? currentArchitecture : nextArchitecture;

  function switchView(nextView) {
    setView(nextView);
    setActiveKey(`${nextView}-0-0`);
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden text-[#112245]"
      style={{
        background: `radial-gradient(circle at top left, rgba(32,201,160,0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(21,60,168,0.16), transparent 34%), ${KS.polar}`,
        fontFamily: "Open Sans, Arial, sans-serif",
      }}
    >
      <FeatureModal modal={modal} onClose={() => setModal(null)} />

      <motion.header initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{ background: "rgba(255,255,255,0.78)", borderColor: "rgba(217,222,226,0.8)" }}>
        <div className={cn("mx-auto flex max-w-7xl flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between", LAYOUT.pageGutter)}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[16px] shadow-lg" style={{ background: KS.phantom }}>
              <img src={keenStackLogo} alt="KeenStack AI" className="h-12 w-12 object-cover" />
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.24em] text-[#112245]">KeenStack AI Agent</div>
              <div className="text-xs font-semibold text-[#5B6A8A]">Interactive architecture story</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => switchView("current")} active={view === "current"} variant={view === "current" ? "solid" : "outline"}>Current system</Button>
            <Button onClick={() => switchView("next")} active={view === "next"} variant={view === "next" ? "solid" : "outline"}>Next stage</Button>
            <Button variant="outline" onClick={() => setCompareMode(!compareMode)}><Layers3 className="mr-2 h-4 w-4" /> {compareMode ? "Hide compare" : "Compare"}</Button>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10">
        <section className={cn("mx-auto max-w-7xl", LAYOUT.pageGutter, LAYOUT.heroY)}>
          <div className={cn("grid items-center md:grid-cols-[1.05fr_0.95fr]", LAYOUT.gridGap)}>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold shadow-sm" style={{ color: KS.greenDark, border: `1px solid ${KS.greenLight}` }}>
                <Sparkles className="h-4 w-4" /> Architecture story for agent v2
              </div>
              <h1 className="leading-[0.96] tracking-[-0.06em] text-[#112245]" style={{ fontFamily: "Sora, Arial, sans-serif", fontSize: "clamp(52px, 7vw, 92px)", fontWeight: 300 }}>
                From working demo to
                <span className="block" style={{ color: KS.codeBlue, fontWeight: 500 }}>enterprise agent platform.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#2B3D65]">
                A guided, clickable story of the current ServiceNow-native agent and the next-stage architecture with stability, Bedrock Spoke, optional external gateway, multi-agent routing, and kill-switch safety controls.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className={cn("bg-white/86", LAYOUT.cardRadius)}>
                <div className={LAYOUT.cardPad}>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: KS.greenDark }}>Core principle</div>
                    <ShieldCheck className="h-5 w-5" style={{ color: KS.keenGreen }} />
                  </div>
                  <button
                    onClick={() => setModal({
                      title: "Core architecture principle",
                      icon: ShieldCheck,
                      eyebrow: "Mental model",
                      body: "ServiceNow remains the execution plane. The LLM decides, explains, plans, or delegates. Tools execute. Guard policy controls. Conversation table remembers.",
                      sections: [
                        { label: "Execution plane", value: "ServiceNow owns records, ACLs, tools, attachments, audit, and conversation state." },
                        { label: "Reasoning plane", value: "LLM providers and specialist agents decide, explain, or propose actions." },
                      ],
                    })}
                    className={cn("w-full text-left text-white transition hover:opacity-95", LAYOUT.panelRadius, LAYOUT.panelPad)}
                    style={{ background: KS.phantom }}
                  >
                    <p className="text-lg font-bold leading-8">ServiceNow remains the execution plane. The LLM decides, explains, plans, or delegates. Tools execute. Guard policy controls. Conversation table remembers.</p>
                    <div className="mt-4 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: KS.keenGreen }}>Open principle</div>
                  </button>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {[["Current", "LLMClient + tools"], ["Next", "Provider router + Bedrock"], ["Future", "Multi-agent gateway"]].map(([top, bottom]) => (
                      <div key={top} className={cn("rounded-[18px] text-center", LAYOUT.compactPad)} style={{ background: "#EAF9F4", border: "1px solid #BFEBDD" }}>
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
          <section className={cn("mx-auto max-w-7xl pb-10", LAYOUT.pageGutter)}>
            <Card className={cn("bg-white/90", LAYOUT.cardRadius)}>
              <div className={LAYOUT.cardPad}>
                <div className="mb-5 flex items-center gap-2 text-lg font-bold text-[#112245]"><Layers3 className="h-5 w-5" style={{ color: KS.keenGreen }} /> Quick comparison</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={cn(LAYOUT.panelRadius, LAYOUT.panelPad)} style={{ background: "#EAF9F4", border: "1px solid #BFEBDD" }}>
                    <h3 className="text-xl font-bold text-[#112245]">Current system</h3>
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-[#2B3D65]"><li>- Service Portal + async conversation worker</li><li>- LLM orchestration with governed ToolRouter</li><li>- ITSM, CMDB, KB, navigation, Planning Mode</li><li>- Developer Operator and 792 export context</li><li>- CSV/attachment evidence and raw tool call traceability</li></ul>
                  </div>
                  <div className={cn(LAYOUT.panelRadius, LAYOUT.panelPad)} style={{ background: "#EDF4FF", border: "1px solid #C7D9FF" }}>
                    <h3 className="text-xl font-bold text-[#112245]">Next stage</h3>
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-[#2B3D65]"><li>- Regression-tested stable core</li><li>- LLMProviderRouter with LLMClient / Bedrock Spoke / Gateway</li><li>- ServiceNow-native Bedrock path without blocking requests</li><li>- Optional external gateway for advanced orchestration</li><li>- Supervisor + specialist multi-agent architecture</li></ul>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        )}

        <section className={cn(LAYOUT.pageGutter, LAYOUT.sectionY)}>
          <SectionTitle
            eyebrow={view === "current" ? "Current state" : "Next stage"}
            title={view === "current" ? "Current system architecture" : "Next-stage architecture"}
            subtitle="Click any feature card to open the story, developer note, and outcome in a popup."
          />

          <div className={cn("mx-auto mt-12 grid max-w-[1800px] xl:grid-cols-5", LAYOUT.gridGap)}>
            {architecture.map((lane, index) => (
              <Lane key={lane.lane} lane={lane} index={index} activeKey={activeKey} setActiveKey={setActiveKey} mode={view} setModal={setModal} />
            ))}
          </div>
        </section>

        <section className={cn(LAYOUT.pageGutter, LAYOUT.sectionY)} style={{ background: "rgba(255,255,255,0.54)" }}>
          <SectionTitle eyebrow="Provider strategy" title="Provider paths behind one router" subtitle="Bedrock Spoke is a ServiceNow-native provider option. The provider path should sit behind an LLM Provider Router to avoid hardcoding." />
          <ProviderCards setModal={setModal} />
        </section>

        <section className={cn(LAYOUT.pageGutter, LAYOUT.sectionY)}>
          <SectionTitle eyebrow="Technical diagram" title="Architecture flowchart" subtitle="Layered view of the full v2 architecture. Toggle between current and proposed state. Click any component to open its story." />
          <TechArchitectureDiagram setModal={setModal} />
        </section>

        <section className={cn(LAYOUT.pageGutter, LAYOUT.sectionY)} style={{ background: "rgba(255,255,255,0.54)" }}>
          <SectionTitle eyebrow="Flowcharts" title="Detailed runtime flowcharts" subtitle="Switch between runtime stories, then open the selected flow in a popup." />
          <ScenarioFlowcharts setModal={setModal} />
        </section>

        <section className={cn(LAYOUT.pageGutter, LAYOUT.sectionY)}>
          <SectionTitle eyebrow="Kill switches" title="Safety controls and degradation paths" subtitle="Each safety control opens as a popup with scope, trigger, action, owner, and property/control." />
          <KillSwitchMatrix setModal={setModal} />
        </section>

        <section className={cn(LAYOUT.pageGutter, LAYOUT.sectionY)} style={{ background: "rgba(255,255,255,0.56)" }}>
          <SectionTitle eyebrow="Smoke tests" title="Basic checks for this story" subtitle="Lightweight tests for the interactive architecture story, popups, and missing-icon safety." />
          <div className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-2">
            {smokeTests.map((test, index) => <SmokeTestCard key={test.name} test={test} index={index} />)}
          </div>
        </section>

        <section className={cn("text-white", LAYOUT.pageGutter, LAYOUT.sectionY)} style={{ background: KS.phantom }}>
          <SectionTitle dark eyebrow="Migration path" title="Build sequence" subtitle="Practical build order: stabilize the core before adding provider and multi-agent complexity." />
          <MigrationTimeline setModal={setModal} />
        </section>
      </main>
    </div>
  );
}
