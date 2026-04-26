/* Knowledge Graph — D3 force layout with card nodes */

const GRAPH_DATA = {
  nodes: [
    {
      id: "agent-arch", label: "Agent 架构", icon: "🤖",
      desc: "ReAct · Plan-and-Execute · Multi-Agent",
      color: "#58a6ff", type: "root",
      posts: [
        { title: "ReAct Agent 详解", date: "2026-04-27", tags: ["ReAct", "论文"] },
        { title: "LangGraph 实战", date: "2026-04-27", tags: ["工程"] },
      ]
    },
    {
      id: "llm-core", label: "LLM 基础", icon: "🧠",
      desc: "Transformer · 提示工程 · 微调",
      color: "#bc8cff", type: "root",
      posts: [
        { title: "Attention 机制图解", date: "2026-04-27", tags: ["原理"] },
        { title: "Chain-of-Thought 提示技巧", date: "2026-04-27", tags: ["提示工程"] },
      ]
    },
    {
      id: "engineering", label: "工程实践", icon: "🛠️",
      desc: "RAG · Tool Use · Memory · Eval",
      color: "#3fb950", type: "root",
      posts: [
        { title: "RAG 系统设计", date: "2026-04-27", tags: ["RAG", "工程"] },
        { title: "Agent 评估框架", date: "2026-04-27", tags: ["评估"] },
      ]
    },
    {
      id: "papers", label: "论文笔记", icon: "📄",
      desc: "顶会精读 · 综述 · 复现",
      color: "#ffa657", type: "root",
      posts: [
        { title: "Toolformer 精读", date: "2026-04-27", tags: ["论文", "Tool Use"] },
        { title: "AutoGPT 架构分析", date: "2026-04-27", tags: ["论文"] },
      ]
    },
    {
      id: "react", label: "ReAct", icon: "⚡", desc: "推理 + 行动交替",
      color: "#58a6ff", type: "child", parent: "agent-arch", posts: []
    },
    {
      id: "multiagent", label: "Multi-Agent", icon: "🔗", desc: "协作 · 竞争 · 分工",
      color: "#58a6ff", type: "child", parent: "agent-arch", posts: []
    },
    {
      id: "rag", label: "RAG", icon: "🗂️", desc: "检索增强生成",
      color: "#3fb950", type: "child", parent: "engineering", posts: []
    },
    {
      id: "tooluse", label: "Tool Use", icon: "🔧", desc: "函数调用 · MCP",
      color: "#3fb950", type: "child", parent: "engineering", posts: []
    },
    {
      id: "memory", label: "Memory", icon: "💾", desc: "短期 · 长期 · 外部存储",
      color: "#3fb950", type: "child", parent: "engineering", posts: []
    },
  ],
  links: [
    { source: "agent-arch",  target: "react" },
    { source: "agent-arch",  target: "multiagent" },
    { source: "engineering", target: "rag" },
    { source: "engineering", target: "tooluse" },
    { source: "engineering", target: "memory" },
    { source: "llm-core",    target: "agent-arch" },
    { source: "llm-core",    target: "engineering" },
    { source: "papers",      target: "agent-arch" },
    { source: "papers",      target: "llm-core" },
  ]
};

const W = 180, H = 90;   // card size
const CW = 150, CH = 78; // child card size

function initGraph() {
  const container = document.getElementById("graph-canvas");
  if (!container) return;

  const width  = container.clientWidth;
  const height = container.clientHeight;

  const svg = d3.select("#graph-canvas")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%");

  // Gradient defs
  const defs = svg.append("defs");
  GRAPH_DATA.nodes.forEach(n => {
    const grad = defs.append("linearGradient")
      .attr("id", `grad-${n.id}`)
      .attr("x1","0%").attr("y1","0%").attr("x2","100%").attr("y2","100%");
    grad.append("stop").attr("offset","0%").attr("stop-color", n.color).attr("stop-opacity",.3);
    grad.append("stop").attr("offset","100%").attr("stop-color", n.color).attr("stop-opacity",.05);
  });

  // Zoom layer
  const g = svg.append("g");
  svg.call(
    d3.zoom()
      .scaleExtent([0.3, 2.5])
      .on("zoom", (event) => g.attr("transform", event.transform))
  );

  const simulation = d3.forceSimulation(GRAPH_DATA.nodes)
    .force("link", d3.forceLink(GRAPH_DATA.links)
      .id(d => d.id)
      .distance(d => d.source.type === "root" && d.target.type === "root" ? 280 : 200)
      .strength(.6)
    )
    .force("charge", d3.forceManyBody().strength(-600))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide().radius(120));

  // Links
  const link = g.append("g").attr("class", "links")
    .selectAll("path")
    .data(GRAPH_DATA.links)
    .join("path")
    .attr("fill", "none")
    .attr("stroke", d => {
      const src = GRAPH_DATA.nodes.find(n => n.id === (d.source.id || d.source));
      return src ? src.color : "#30363d";
    })
    .attr("stroke-width", d => (d.source.type === "root" || d.target?.type === "root") ? 1.5 : 1)
    .attr("stroke-opacity", .35)
    .attr("stroke-dasharray", d => {
      const tgt = GRAPH_DATA.nodes.find(n => n.id === (d.target.id || d.target));
      return tgt?.type === "child" ? "5,4" : "none";
    });

  // Node groups
  const node = g.append("g").attr("class", "nodes")
    .selectAll("g")
    .data(GRAPH_DATA.nodes)
    .join("g")
    .attr("class", d => `node-group ${d.type}`)
    .call(
      d3.drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on("end",  (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
    );

  // Card foreignObject
  node.append("foreignObject")
    .attr("width",  d => d.type === "child" ? CW : W)
    .attr("height", d => d.type === "child" ? CH : H)
    .attr("x", d => d.type === "child" ? -CW/2 : -W/2)
    .attr("y", d => d.type === "child" ? -CH/2 : -H/2)
    .append("xhtml:div")
    .attr("class", d => `node-card ${d.type === "child" ? "child" : ""}`)
    .style("border-color", d => d.color + "55")
    .html(d => `
      <div class="icon">${d.icon}</div>
      <div class="label">${d.label}</div>
      <div class="desc">${d.desc}</div>
      ${d.posts?.length ? `<div class="count">${d.posts.length} 篇文章</div>` : ""}
    `)
    .on("click", (event, d) => {
      event.stopPropagation();
      openPanel(d);
      // Highlight
      d3.selectAll(".node-card").classed("active", false);
      d3.select(event.currentTarget).classed("active", true);
    })
    .on("mouseenter", function(event, d) {
      d3.select(this).style("border-color", d.color);
    })
    .on("mouseleave", function(event, d) {
      if (!d3.select(this).classed("active"))
        d3.select(this).style("border-color", d.color + "55");
    });

  // Glow circle behind root nodes
  node.filter(d => d.type === "root")
    .insert("circle", "foreignObject")
    .attr("r", 95)
    .attr("fill", d => `url(#grad-${d.id})`)
    .attr("stroke", "none");

  simulation.on("tick", () => {
    link.attr("d", d => {
      const sx = d.source.x, sy = d.source.y;
      const tx = d.target.x, ty = d.target.y;
      const mx = (sx + tx) / 2;
      const my = (sy + ty) / 2 - Math.abs(tx - sx) * .15;
      return `M${sx},${sy} Q${mx},${my} ${tx},${ty}`;
    });
    node.attr("transform", d => `translate(${d.x},${d.y})`);
  });

  // Click outside to deselect
  svg.on("click", () => {
    d3.selectAll(".node-card").classed("active", false)
      .each(function(d) { d3.select(this).style("border-color", d.color + "55"); });
    closePanel();
  });
}

// ── Side panel ──
function openPanel(node) {
  const panel = document.getElementById("side-panel");
  document.getElementById("panel-icon").textContent  = node.icon;
  document.getElementById("panel-title").textContent = node.label;
  document.getElementById("panel-desc").textContent  = node.desc;

  const body = document.getElementById("panel-posts");
  if (node.posts && node.posts.length) {
    body.innerHTML = `
      <div class="panel-section-title">相关文章</div>
      ${node.posts.map(p => `
        <a class="post-card" href="#">
          <div class="post-title">${p.title}</div>
          <div class="post-meta">
            ${p.date}
            ${p.tags.map(t => `<span class="tag">${t}</span>`).join("")}
          </div>
        </a>
      `).join("")}
    `;
  } else {
    body.innerHTML = `<p style="color:var(--text-muted);font-size:.82rem;">暂无文章，敬请期待。</p>`;
  }

  panel.classList.add("open");
}

function closePanel() {
  document.getElementById("side-panel").classList.remove("open");
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("graph-canvas")) {
    initGraph();
  }
  const closeBtn = document.getElementById("panel-close");
  if (closeBtn) closeBtn.addEventListener("click", (e) => { e.stopPropagation(); closePanel(); });
});
