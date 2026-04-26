'use strict';

// ── Data ──────────────────────────────────────────────────────────────────────
const NODES = [
  {
    id: 'agent-arch', x: -220, y: -160, w: 240, h: 140,
    icon: '🤖', label: 'Agent 架构', color: '#e8f0fe',
    border: '#4a90d9',
    desc: 'ReAct · Plan-and-Execute\nMulti-Agent · Tool Use',
    posts: [
      { title: 'ReAct Agent 详解', date: '2026-04-27', tags: ['ReAct', '论文'] },
      { title: 'LangGraph 实战', date: '2026-04-27', tags: ['工程'] },
    ]
  },
  {
    id: 'llm-core', x: 200, y: -280, w: 220, h: 130,
    icon: '🧠', label: 'LLM 基础', color: '#f3e8ff',
    border: '#9b59b6',
    desc: 'Transformer · 提示工程\n微调 · RLHF',
    posts: [
      { title: 'Attention 机制图解', date: '2026-04-27', tags: ['原理'] },
      { title: 'Chain-of-Thought 提示技巧', date: '2026-04-27', tags: ['提示工程'] },
    ]
  },
  {
    id: 'engineering', x: 200, y: 60, w: 240, h: 140,
    icon: '🛠️', label: '工程实践', color: '#e8f8f0',
    border: '#27ae60',
    desc: 'RAG · Memory · Evaluation\nMCP · 部署',
    posts: [
      { title: 'RAG 系统设计', date: '2026-04-27', tags: ['RAG', '工程'] },
      { title: 'Agent 评估框架', date: '2026-04-27', tags: ['评估'] },
    ]
  },
  {
    id: 'papers', x: -220, y: 100, w: 220, h: 130,
    icon: '📄', label: '论文笔记', color: '#fff8e8',
    border: '#e67e22',
    desc: '顶会精读 · 综述 · 复现\nNeurIPS · ICML · ACL',
    posts: [
      { title: 'Toolformer 精读', date: '2026-04-27', tags: ['论文', 'Tool Use'] },
      { title: 'AutoGPT 架构分析', date: '2026-04-27', tags: ['论文'] },
    ]
  },
  {
    id: 'react-node', x: -460, y: -260, w: 180, h: 100,
    icon: '⚡', label: 'ReAct', color: '#e8f0fe',
    border: '#4a90d9',
    desc: '推理与行动交替\n思维链 + 工具调用',
    posts: []
  },
  {
    id: 'multiagent', x: -460, y: -100, w: 180, h: 100,
    icon: '🔗', label: 'Multi-Agent', color: '#e8f0fe',
    border: '#4a90d9',
    desc: '协作 · 竞争 · 分工\nCrew AI · AutoGen',
    posts: []
  },
  {
    id: 'rag-node', x: 480, y: -80, w: 180, h: 100,
    icon: '🗂️', label: 'RAG', color: '#e8f8f0',
    border: '#27ae60',
    desc: '检索增强生成\nVector DB · Reranker',
    posts: []
  },
  {
    id: 'memory-node', x: 480, y: 80, w: 180, h: 100,
    icon: '💾', label: 'Memory', color: '#e8f8f0',
    border: '#27ae60',
    desc: '短期 · 长期 · 外部存储\nEM · MemGPT',
    posts: []
  },
];

const EDGES = [
  { from: 'llm-core',    to: 'agent-arch' },
  { from: 'llm-core',    to: 'engineering' },
  { from: 'papers',      to: 'llm-core' },
  { from: 'papers',      to: 'agent-arch' },
  { from: 'agent-arch',  to: 'react-node' },
  { from: 'agent-arch',  to: 'multiagent' },
  { from: 'engineering', to: 'rag-node' },
  { from: 'engineering', to: 'memory-node' },
];

// ── State ─────────────────────────────────────────────────────────────────────
let camera = { x: 0, y: 0, zoom: 1 };
let drag   = { active: false, node: null, startX: 0, startY: 0, camX: 0, camY: 0 };
let selected = null;
let dpr = window.devicePixelRatio || 1;
let W, H;

// ── Canvas setup ──────────────────────────────────────────────────────────────
function setup() {
  const el = document.getElementById('obs-canvas');
  if (!el) return;
  W = el.clientWidth;
  H = el.clientHeight;
  el.width  = W * dpr;
  el.height = H * dpr;
  el.style.width  = W + 'px';
  el.style.height = H + 'px';
  const ctx = el.getContext('2d');
  ctx.scale(dpr, dpr);

  // center view
  camera.x = W / 2;
  camera.y = H / 2;

  bindEvents(el, ctx);
  loop(el, ctx);
}

// ── Main loop ─────────────────────────────────────────────────────────────────
function loop(el, ctx) {
  draw(ctx);
  requestAnimationFrame(() => loop(el, ctx));
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function draw(ctx) {
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#f7f7f5';
  ctx.fillRect(0, 0, W, H);

  drawGrid(ctx);

  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.zoom, camera.zoom);

  drawEdges(ctx);
  drawNodes(ctx);

  ctx.restore();
}

function drawGrid(ctx) {
  const spacing = 28 * camera.zoom;
  const ox = ((camera.x % spacing) + spacing) % spacing;
  const oy = ((camera.y % spacing) + spacing) % spacing;

  ctx.fillStyle = '#d0cfc8';
  for (let x = ox; x < W; x += spacing) {
    for (let y = oy; y < H; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawEdges(ctx) {
  EDGES.forEach(e => {
    const a = NODES.find(n => n.id === e.from);
    const b = NODES.find(n => n.id === e.to);
    if (!a || !b) return;

    const ax = a.x + a.w / 2, ay = a.y + a.h / 2;
    const bx = b.x + b.w / 2, by = b.y + b.h / 2;

    // exit/enter points on card edges
    const [ex, ey] = edgePoint(a, bx, by);
    const [fx, fy] = edgePoint(b, ax, ay);

    ctx.save();
    ctx.strokeStyle = '#b0afa8';
    ctx.lineWidth = 1.5 / camera.zoom;
    ctx.setLineDash([6 / camera.zoom, 4 / camera.zoom]);
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(ex, ey);

    // gentle cubic bezier
    const dx = fx - ex, dy = fy - ey;
    const cx1 = ex + dx * 0.45, cy1 = ey;
    const cx2 = fx - dx * 0.45, cy2 = fy;
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, fx, fy);
    ctx.stroke();

    // arrowhead
    drawArrow(ctx, fx, fy, fx - cx2 * 0.01, fy - cy2 * 0.01, cx2, cy2);

    ctx.restore();
  });
}

function edgePoint(node, tx, ty) {
  const cx = node.x + node.w / 2;
  const cy = node.y + node.h / 2;
  const dx = tx - cx, dy = ty - cy;
  const sx = node.w / 2, sy = node.h / 2;
  const scaleX = Math.abs(dx) > 0 ? sx / Math.abs(dx) : Infinity;
  const scaleY = Math.abs(dy) > 0 ? sy / Math.abs(dy) : Infinity;
  const scale  = Math.min(scaleX, scaleY);
  return [cx + dx * scale, cy + dy * scale];
}

function drawArrow(ctx, tx, ty, _x, _y, cx2, cy2) {
  // direction from last control point to tip
  const dx = tx - cx2, dy = ty - cy2;
  const len = Math.sqrt(dx*dx + dy*dy) || 1;
  const ux = dx/len, uy = dy/len;
  const size = 8 / camera.zoom;
  ctx.save();
  ctx.setLineDash([]);
  ctx.fillStyle = '#b0afa8';
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - ux*size + uy*size*0.5, ty - uy*size - ux*size*0.5);
  ctx.lineTo(tx - ux*size - uy*size*0.5, ty - uy*size + ux*size*0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawNodes(ctx) {
  NODES.forEach(n => {
    const isSelected = selected && selected.id === n.id;
    const r = 14;

    // shadow
    ctx.save();
    ctx.shadowColor = isSelected ? n.border : 'rgba(0,0,0,.12)';
    ctx.shadowBlur  = isSelected ? 20 : 10;
    ctx.shadowOffsetY = 3;

    // card fill
    ctx.beginPath();
    roundRect(ctx, n.x, n.y, n.w, n.h, r);
    ctx.fillStyle = n.color;
    ctx.fill();
    ctx.restore();

    // border
    ctx.save();
    ctx.beginPath();
    roundRect(ctx, n.x, n.y, n.w, n.h, r);
    ctx.strokeStyle = isSelected ? n.border : n.border + '99';
    ctx.lineWidth   = isSelected ? 2.5 / camera.zoom : 1.5 / camera.zoom;
    ctx.stroke();
    ctx.restore();

    // top color bar
    ctx.save();
    ctx.beginPath();
    roundRect(ctx, n.x, n.y, n.w, 5, [r, r, 0, 0]);
    ctx.fillStyle = n.border;
    ctx.fill();
    ctx.restore();

    // icon + label
    const fs = Math.max(8, Math.min(16, 14));
    ctx.save();
    ctx.font = `bold ${fs}px -apple-system, "PingFang SC", sans-serif`;
    ctx.fillStyle = '#1a1a1a';
    ctx.textBaseline = 'top';

    const iconSize = 18;
    ctx.font = `${iconSize}px serif`;
    ctx.fillText(n.icon, n.x + 14, n.y + 16);

    ctx.font = `bold ${fs}px -apple-system, "PingFang SC", sans-serif`;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(n.label, n.x + 14 + iconSize + 6, n.y + 18);
    ctx.restore();

    // desc lines
    ctx.save();
    ctx.font = `${Math.max(7, Math.min(12, 11))}px -apple-system, "PingFang SC", sans-serif`;
    ctx.fillStyle = '#555';
    const lines = n.desc.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, n.x + 14, n.y + 44 + i * 16);
    });
    ctx.restore();

    // post count badge
    if (n.posts && n.posts.length > 0) {
      ctx.save();
      const bw = 56, bh = 18;
      const bx = n.x + n.w - bw - 10, by = n.y + n.h - bh - 10;
      ctx.beginPath();
      roundRect(ctx, bx, by, bw, bh, 9);
      ctx.fillStyle = n.border + '22';
      ctx.fill();
      ctx.strokeStyle = n.border + '66';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.font = `600 10px -apple-system, "PingFang SC", sans-serif`;
      ctx.fillStyle = n.border;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${n.posts.length} 篇`, bx + bw/2, by + bh/2);
      ctx.restore();
    }
  });
}

function roundRect(ctx, x, y, w, h, r) {
  if (typeof r === 'number') r = [r, r, r, r];
  ctx.moveTo(x + r[0], y);
  ctx.lineTo(x + w - r[1], y);
  ctx.arcTo(x+w, y,     x+w, y+h,   r[1]);
  ctx.lineTo(x + w, y + h - r[2]);
  ctx.arcTo(x+w, y+h,   x,   y+h,   r[2]);
  ctx.lineTo(x + r[3], y + h);
  ctx.arcTo(x,   y+h,   x,   y,     r[3]);
  ctx.lineTo(x, y + r[0]);
  ctx.arcTo(x,   y,     x+w, y,     r[0]);
}

// ── Hit test ──────────────────────────────────────────────────────────────────
function worldPos(clientX, clientY, el) {
  const rect = el.getBoundingClientRect();
  return {
    x: (clientX - rect.left - camera.x) / camera.zoom,
    y: (clientY - rect.top  - camera.y) / camera.zoom,
  };
}

function hitNode(wx, wy) {
  // reverse order so top-rendered node wins
  for (let i = NODES.length - 1; i >= 0; i--) {
    const n = NODES[i];
    if (wx >= n.x && wx <= n.x + n.w && wy >= n.y && wy <= n.y + n.h) return n;
  }
  return null;
}

// ── Events ────────────────────────────────────────────────────────────────────
function bindEvents(el, ctx) {
  // pointer down
  el.addEventListener('pointerdown', e => {
    const { x, y } = worldPos(e.clientX, e.clientY, el);
    const hit = hitNode(x, y);
    drag.active = true;
    drag.node   = hit;
    drag.startX = e.clientX;
    drag.startY = e.clientY;
    drag.camX   = camera.x;
    drag.camY   = camera.y;
    if (hit) { drag.nodeStartX = hit.x; drag.nodeStartY = hit.y; }
    el.setPointerCapture(e.pointerId);
    el.style.cursor = hit ? 'grabbing' : 'grabbing';
  });

  el.addEventListener('pointermove', e => {
    if (!drag.active) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (drag.node) {
      drag.node.x = drag.nodeStartX + dx / camera.zoom;
      drag.node.y = drag.nodeStartY + dy / camera.zoom;
    } else {
      camera.x = drag.camX + dx;
      camera.y = drag.camY + dy;
    }
  });

  el.addEventListener('pointerup', e => {
    const moved = Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY);
    if (moved < 5 && drag.node) {
      // click — open panel
      selected = drag.node;
      openPanel(drag.node);
    } else if (moved < 5 && !drag.node) {
      selected = null;
      closePanel();
    }
    drag.active = false;
    drag.node   = null;
    el.style.cursor = 'default';
  });

  // wheel zoom
  el.addEventListener('wheel', e => {
    e.preventDefault();
    const rect  = el.getBoundingClientRect();
    const mx    = e.clientX - rect.left;
    const my    = e.clientY - rect.top;
    const delta = e.deltaY < 0 ? 1.1 : 0.91;
    const newZ  = Math.min(3, Math.max(0.2, camera.zoom * delta));
    camera.x = mx - (mx - camera.x) * (newZ / camera.zoom);
    camera.y = my - (my - camera.y) * (newZ / camera.zoom);
    camera.zoom = newZ;
  }, { passive: false });

  // cursor
  el.addEventListener('mousemove', e => {
    if (drag.active) return;
    const { x, y } = worldPos(e.clientX, e.clientY, el);
    el.style.cursor = hitNode(x, y) ? 'pointer' : 'grab';
  });

  // resize
  window.addEventListener('resize', () => {
    W = el.clientWidth; H = el.clientHeight;
    el.width  = W * dpr; el.height = H * dpr;
    el.style.width = W+'px'; el.style.height = H+'px';
    const c2 = el.getContext('2d');
    c2.scale(dpr, dpr);
  });
}

// ── Panel ─────────────────────────────────────────────────────────────────────
function openPanel(node) {
  const panel = document.getElementById('side-panel');
  document.getElementById('panel-icon').textContent  = node.icon;
  document.getElementById('panel-title').textContent = node.label;
  document.getElementById('panel-desc').textContent  = node.desc.replace(/\n/g, ' · ');

  const body = document.getElementById('panel-posts');
  if (node.posts && node.posts.length) {
    body.innerHTML = `
      <div class="panel-section-title">相关文章</div>
      ${node.posts.map(p => `
        <a class="post-card" href="#">
          <div class="post-title">${p.title}</div>
          <div class="post-meta">${p.date} ${p.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        </a>
      `).join('')}
    `;
  } else {
    body.innerHTML = `<p style="color:#999;font-size:.82rem;margin-top:.5rem;">暂无文章，敬请期待。</p>`;
  }
  panel.classList.add('open');
}

function closePanel() {
  document.getElementById('side-panel').classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  setup();
  const btn = document.getElementById('panel-close');
  if (btn) btn.addEventListener('click', e => { e.stopPropagation(); selected = null; closePanel(); });

  // fit button
  const fit = document.getElementById('btn-fit');
  if (fit) fit.addEventListener('click', () => {
    camera.x = W / 2; camera.y = H / 2; camera.zoom = 1;
  });
});
