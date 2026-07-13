(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode(".cdx-univer-datasource{--uds-border: #d8dde6;--uds-bg: #fbfcfe;--uds-panel: #ffffff;--uds-text: #152235;--uds-muted: #607089;--uds-accent: #1768ac;--uds-soft: #eaf3fb;--uds-danger: #b42318;border:1px solid var(--uds-border);border-radius:14px;background:radial-gradient(circle at top right,rgba(23,104,172,.08),transparent 28%),linear-gradient(180deg,#ffffff 0%,var(--uds-bg) 100%);color:var(--uds-text);padding:14px}.cdx-univer-datasource__top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}.cdx-univer-datasource__meta{display:flex;flex-direction:column;gap:4px}.cdx-univer-datasource__eyebrow{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--uds-accent)}.cdx-univer-datasource__title{font-size:16px;font-weight:700;line-height:1.3}.cdx-univer-datasource__subtitle{font-size:12px;color:var(--uds-muted)}.cdx-univer-datasource__status{margin-top:10px;min-height:18px;font-size:12px;color:var(--uds-muted)}.cdx-univer-datasource__status.is-error{color:var(--uds-danger)}.cdx-univer-datasource__section{margin-top:12px;padding:12px;border:1px solid #e7ebf2;border-radius:12px;background:var(--uds-panel)}.cdx-univer-datasource__section-title{margin-bottom:10px;font-size:12px;font-weight:700;color:var(--uds-muted)}.cdx-univer-datasource__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.cdx-univer-datasource__field{display:flex;flex-direction:column;gap:6px}.cdx-univer-datasource__field label{font-size:12px;color:var(--uds-muted)}.cdx-univer-datasource__input,.cdx-univer-datasource__select{min-height:34px;border:1px solid var(--uds-border);border-radius:10px;background:#fff;color:var(--uds-text);padding:0 10px;font-size:13px}.cdx-univer-datasource__actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.cdx-univer-datasource__button{-webkit-appearance:none;-moz-appearance:none;appearance:none;min-height:34px;border:1px solid #c8d7e8;border-radius:999px;background:#fff;color:var(--uds-text);padding:0 12px;font-size:12px;cursor:pointer}.cdx-univer-datasource__button:hover:not(:disabled){border-color:var(--uds-accent);background:var(--uds-soft)}.cdx-univer-datasource__button:disabled{opacity:.55;cursor:not-allowed}.cdx-univer-datasource__button.is-primary{border-color:var(--uds-accent);background:var(--uds-accent);color:#fff}.cdx-univer-datasource__summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.cdx-univer-datasource__metric{border:1px solid #e7ebf2;border-radius:10px;background:#fff;padding:10px}.cdx-univer-datasource__metric strong{display:block;font-size:11px;color:var(--uds-muted)}.cdx-univer-datasource__metric span{display:block;margin-top:4px;font-size:14px;font-weight:700}.cdx-univer-datasource__empty{border:1px dashed #d7e2ef;border-radius:10px;padding:16px;font-size:13px;color:var(--uds-muted);text-align:center}.cdx-univer-datasource__table-wrap{overflow-x:auto}.cdx-univer-datasource__table{width:100%;border-collapse:collapse;font-size:12px}.cdx-univer-datasource__table th,.cdx-univer-datasource__table td{border:1px solid #e4e9f1;padding:8px 10px;vertical-align:top;text-align:left;white-space:nowrap}.cdx-univer-datasource__table th{background:#f5f8fc;color:#41556f;font-weight:700}.cdx-univer-datasource__table td:first-child,.cdx-univer-datasource__table th:first-child{position:sticky;left:0;background:#fff}.cdx-univer-datasource__table th:first-child{background:#eef4fa}@media (max-width: 900px){.cdx-univer-datasource__grid,.cdx-univer-datasource__summary{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (max-width: 640px){.cdx-univer-datasource__top{flex-direction:column}.cdx-univer-datasource__grid,.cdx-univer-datasource__summary{grid-template-columns:1fr}}")),document.head.appendChild(e)}}catch(r){console.error("vite-plugin-css-injected-by-js",r)}})();
const v = "20260713-142540", y = "Univer 数据源", _ = "数据源验证", p = "未找到可访问的 Univer 数据源。", S = "当前查询没有返回任何行。", c = "请选择数据源", u = "请选择工作表";
function r(i) {
  return String(i ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function h(i) {
  const e = Number(i);
  return !Number.isFinite(e) || e <= 0 ? null : Math.floor(e);
}
function d(i, e) {
  const t = Number(i);
  return !Number.isFinite(t) || t < 0 ? e : Math.floor(t);
}
function l(i) {
  return `${i.note_id}:${i.block_index}`;
}
function f(i) {
  const e = i && typeof i == "object" ? i : {};
  return {
    noteId: h(e.noteId),
    query: typeof e.query == "string" ? e.query : "",
    selectedSourceKey: typeof e.selectedSourceKey == "string" ? e.selectedSourceKey : "",
    sheetKey: typeof e.sheetKey == "string" ? e.sheetKey : "",
    headerRow: d(e.headerRow, 0),
    field: typeof e.field == "string" ? e.field : "",
    keyword: typeof e.keyword == "string" ? e.keyword : "",
    match: ["contains", "prefix", "equals"].includes(String(e.match || "")) ? String(e.match) : "contains"
  };
}
class E {
  static get toolbox() {
    return {
      title: y,
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6.5C4 5.67157 4.67157 5 5.5 5H18.5C19.3284 5 20 5.67157 20 6.5V17.5C20 18.3284 19.3284 19 18.5 19H5.5C4.67157 19 4 18.3284 4 17.5V6.5Z" stroke="currentColor" stroke-width="1.6"/><path d="M8 5V19" stroke="currentColor" stroke-width="1.6"/><path d="M4 10H20" stroke="currentColor" stroke-width="1.6"/><path d="M11 14H16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M11 17H14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    };
  }
  static get isReadOnlySupported() {
    return !0;
  }
  static get sanitize() {
    return {
      noteId: !1,
      query: {},
      selectedSourceKey: !1,
      sheetKey: !1,
      headerRow: !1,
      field: {},
      keyword: {},
      match: !1
    };
  }
  constructor({ data: e, config: t, readOnly: s }) {
    this.config = t || {}, this.readOnly = !!s, this.data = f(e), this.sourceItems = [], this.readResult = null;
  }
  render() {
    const e = document.createElement("div");
    return e.className = "cdx-univer-datasource", e.innerHTML = `
      <div class="cdx-univer-datasource__top">
        <div class="cdx-univer-datasource__meta">
          <div class="cdx-univer-datasource__eyebrow">${_}</div>
          <div class="cdx-univer-datasource__title">Univer 数据源验证工具</div>
          <div class="cdx-univer-datasource__subtitle">build ${r(v)}</div>
        </div>
      </div>
      <div class="cdx-univer-datasource__status"></div>
      <div class="cdx-univer-datasource__section">
        <div class="cdx-univer-datasource__section-title">定位数据源</div>
        <div class="cdx-univer-datasource__grid">
          <div class="cdx-univer-datasource__field">
            <label>源笔记 ID</label>
            <input class="cdx-univer-datasource__input" data-role="note-id" type="number" min="1" placeholder="留空表示在可访问范围内搜索" />
          </div>
          <div class="cdx-univer-datasource__field">
            <label>搜索关键字</label>
            <input class="cdx-univer-datasource__input" data-role="source-query" type="text" placeholder="按笔记标题或表格标题过滤" />
          </div>
          <div class="cdx-univer-datasource__field">
            <label>数据源块</label>
            <select class="cdx-univer-datasource__select" data-role="source-select">
              <option value="">${c}</option>
            </select>
          </div>
          <div class="cdx-univer-datasource__field">
            <label>工作表</label>
            <select class="cdx-univer-datasource__select" data-role="sheet-select">
              <option value="">${u}</option>
            </select>
          </div>
        </div>
        <div class="cdx-univer-datasource__actions">
          <button type="button" class="cdx-univer-datasource__button is-primary" data-role="list">读取数据源列表</button>
          <button type="button" class="cdx-univer-datasource__button" data-role="open">打开源笔记</button>
        </div>
      </div>
      <div class="cdx-univer-datasource__section">
        <div class="cdx-univer-datasource__section-title">读取与筛选</div>
        <div class="cdx-univer-datasource__grid">
          <div class="cdx-univer-datasource__field">
            <label>表头行</label>
            <input class="cdx-univer-datasource__input" data-role="header-row" type="number" min="0" />
          </div>
          <div class="cdx-univer-datasource__field">
            <label>字段</label>
            <select class="cdx-univer-datasource__select" data-role="field-select">
              <option value="">全部字段</option>
            </select>
          </div>
          <div class="cdx-univer-datasource__field">
            <label>关键字</label>
            <input class="cdx-univer-datasource__input" data-role="keyword" type="text" placeholder="留空表示只读前几行" />
          </div>
          <div class="cdx-univer-datasource__field">
            <label>匹配方式</label>
            <select class="cdx-univer-datasource__select" data-role="match">
              <option value="contains">包含</option>
              <option value="prefix">前缀</option>
              <option value="equals">等于</option>
            </select>
          </div>
        </div>
        <div class="cdx-univer-datasource__actions">
          <button type="button" class="cdx-univer-datasource__button is-primary" data-role="read">验证读取与筛选</button>
        </div>
      </div>
      <div class="cdx-univer-datasource__section">
        <div class="cdx-univer-datasource__section-title">数据源摘要</div>
        <div class="cdx-univer-datasource__summary" data-role="summary"></div>
      </div>
      <div class="cdx-univer-datasource__section">
        <div class="cdx-univer-datasource__section-title">结果预览</div>
        <div data-role="rows"></div>
      </div>
    `, this.wrapper = e, this.statusEl = e.querySelector(".cdx-univer-datasource__status"), this.summaryEl = e.querySelector('[data-role="summary"]'), this.rowsEl = e.querySelector('[data-role="rows"]'), this.noteIdEl = e.querySelector('[data-role="note-id"]'), this.sourceQueryEl = e.querySelector('[data-role="source-query"]'), this.sourceSelectEl = e.querySelector('[data-role="source-select"]'), this.sheetSelectEl = e.querySelector('[data-role="sheet-select"]'), this.headerRowEl = e.querySelector('[data-role="header-row"]'), this.fieldSelectEl = e.querySelector('[data-role="field-select"]'), this.keywordEl = e.querySelector('[data-role="keyword"]'), this.matchEl = e.querySelector('[data-role="match"]'), this.listBtnEl = e.querySelector('[data-role="list"]'), this.readBtnEl = e.querySelector('[data-role="read"]'), this.openBtnEl = e.querySelector('[data-role="open"]'), this.noteIdEl.value = this.data.noteId != null ? String(this.data.noteId) : "", this.sourceQueryEl.value = this.data.query || "", this.headerRowEl.value = String(this.data.headerRow || 0), this.keywordEl.value = this.data.keyword || "", this.matchEl.value = this.data.match || "contains", this.readOnly ? ([this.noteIdEl, this.sourceQueryEl, this.sourceSelectEl, this.sheetSelectEl, this.headerRowEl, this.fieldSelectEl, this.keywordEl, this.matchEl].forEach((t) => {
      t && (t.disabled = !0);
    }), [this.listBtnEl, this.readBtnEl, this.openBtnEl].forEach((t) => {
      t && (t.disabled = !0);
    })) : (this.noteIdEl.addEventListener("input", () => {
      this.data.noteId = h(this.noteIdEl.value);
    }), this.sourceQueryEl.addEventListener("input", () => {
      this.data.query = this.sourceQueryEl.value;
    }), this.headerRowEl.addEventListener("input", () => {
      this.data.headerRow = d(this.headerRowEl.value, 0);
    }), this.keywordEl.addEventListener("input", () => {
      this.data.keyword = this.keywordEl.value;
    }), this.matchEl.addEventListener("change", () => {
      this.data.match = this.matchEl.value || "contains";
    }), this.sourceSelectEl.addEventListener("change", () => {
      this.data.selectedSourceKey = this.sourceSelectEl.value || "";
    }), this.sheetSelectEl.addEventListener("change", () => {
      this.data.sheetKey = this.sheetSelectEl.value || "";
    }), this.fieldSelectEl.addEventListener("change", () => {
      this.data.field = this.fieldSelectEl.value || "";
    }), this.listBtnEl.addEventListener("click", () => {
      this.loadSources({ silent: !1 });
    }), this.readBtnEl.addEventListener("click", () => {
      this.readSource({ silent: !1 });
    }), this.openBtnEl.addEventListener("click", async () => {
      const t = this.getSelectedSource();
      t && typeof this.config.openNoteById == "function" && await this.config.openNoteById(t.note_id);
    })), this.renderSummary(null), this.renderRows(null), this.config.runtimeAvailable === !1 ? this.setStatus("当前上下文不支持实时验证，仅显示已保存的数据源参数。", !1, !1) : this.loadSources({ silent: !0, autoRead: !0 }), e;
  }
  async loadSources(e = {}) {
    const t = e || {};
    if (typeof this.config.listSources != "function")
      return this.setStatus("listSources is not configured", !0, !t.silent), !1;
    this.setStatus("正在读取数据源列表...", !1, !1);
    try {
      const s = await this.config.listSources({
        note_id: this.data.noteId,
        q: this.data.query,
        limit: 50
      });
      return this.sourceItems = Array.isArray(s && s.items) ? s.items : [], this.renderSourceOptions(), this.setStatus(this.sourceItems.length ? `找到 ${this.sourceItems.length} 个可用数据源。` : p, !1, !t.silent), t.autoRead && this.getSelectedSource() ? await this.readSource({ silent: !0 }) : (this.renderSummary(null), this.renderRows(null)), !0;
    } catch (s) {
      return this.sourceItems = [], this.renderSourceOptions(), this.renderSummary(null), this.renderRows(null), this.setStatus(s && s.message ? s.message : "读取数据源列表失败", !0, !t.silent), !1;
    }
  }
  getSelectedSource() {
    const e = this.data.selectedSourceKey || "";
    return this.sourceItems.find((t) => l(t) === e) || this.sourceItems[0] || null;
  }
  renderSourceOptions() {
    const e = this.data.selectedSourceKey || "", t = [`<option value="">${c}</option>`];
    this.sourceItems.forEach((s) => {
      const a = l(s), o = `#${s.note_id} ${s.note_title || "(无标题)"} / block ${s.block_index} / ${s.sheet_name || "Sheet"}`;
      t.push(`<option value="${r(a)}"${a === e ? " selected" : ""}>${r(o)}</option>`);
    }), this.sourceSelectEl.innerHTML = t.join(""), !e && this.sourceItems[0] && (this.data.selectedSourceKey = l(this.sourceItems[0]), this.sourceSelectEl.value = this.data.selectedSourceKey);
  }
  async readSource(e = {}) {
    const t = e || {}, s = this.getSelectedSource();
    if (!s)
      return this.setStatus("请先选择一个数据源。", !0, !t.silent), !1;
    if (typeof this.config.readSource != "function")
      return this.setStatus("readSource is not configured", !0, !t.silent), !1;
    this.setStatus("正在读取数据源...", !1, !1);
    try {
      const a = await this.config.readSource({
        note_id: s.note_id,
        block_index: s.block_index,
        sheet_key: this.data.sheetKey,
        header_row: this.data.headerRow,
        field: this.data.field,
        q: this.data.keyword,
        match: this.data.match,
        case_insensitive: !0,
        limit: 20
      });
      this.readResult = a || null;
      const o = a && a.active_sheet ? a.active_sheet : null;
      return o && o.key && !this.data.sheetKey && (this.data.sheetKey = o.key), this.renderSheetOptions(), this.renderFieldOptions(), this.renderSummary(a), this.renderRows(a), this.setStatus(`读取成功，共匹配 ${Number(a && a.total) || 0} 行。`, !1, !t.silent), !0;
    } catch (a) {
      return this.readResult = null, this.renderSheetOptions(), this.renderFieldOptions(), this.renderSummary(null), this.renderRows(null), this.setStatus(a && a.message ? a.message : "读取数据源失败", !0, !t.silent), !1;
    }
  }
  renderSheetOptions() {
    const e = this.readResult && Array.isArray(this.readResult.sheets) ? this.readResult.sheets : [], t = this.data.sheetKey || (this.readResult && this.readResult.active_sheet ? this.readResult.active_sheet.key : ""), s = [`<option value="">${u}</option>`];
    e.forEach((a) => {
      s.push(`<option value="${r(a.key)}"${a.key === t ? " selected" : ""}>${r(a.name || a.key)}</option>`);
    }), this.sheetSelectEl.innerHTML = s.join(""), t && (this.sheetSelectEl.value = t);
  }
  renderFieldOptions() {
    const e = this.readResult && Array.isArray(this.readResult.columns) ? this.readResult.columns : [], t = ['<option value="">全部字段</option>'];
    e.forEach((s) => {
      t.push(`<option value="${r(s.key)}"${s.key === this.data.field ? " selected" : ""}>${r(s.label)}</option>`);
    }), this.fieldSelectEl.innerHTML = t.join("");
  }
  renderSummary(e) {
    if (!e || !e.source || !e.active_sheet) {
      this.summaryEl.innerHTML = '<div class="cdx-univer-datasource__empty">选择一个数据源后，这里会显示源笔记、数据块、工作表、行列规模等摘要。</div>';
      return;
    }
    const t = e.source, s = e.active_sheet, a = [
      { label: "源笔记", value: `#${t.note_id}` },
      { label: "数据块", value: String(t.block_index) },
      { label: "工作表", value: s.name || s.key },
      { label: "有效行数", value: String(s.used_row_count || 0) },
      { label: "有效列数", value: String(s.used_column_count || 0) },
      { label: "命中行数", value: String(e.total || 0) },
      { label: "表头行", value: String(s.header_row || 0) },
      { label: "源标题", value: t.title || "(未设置)" }
    ];
    this.summaryEl.innerHTML = a.map((o) => `
      <div class="cdx-univer-datasource__metric">
        <strong>${r(o.label)}</strong>
        <span>${r(o.value)}</span>
      </div>
    `).join("");
  }
  renderRows(e) {
    if (!e || !Array.isArray(e.columns) || !Array.isArray(e.rows)) {
      this.rowsEl.innerHTML = '<div class="cdx-univer-datasource__empty">读取结果会在这里显示。</div>';
      return;
    }
    if (!e.rows.length) {
      this.rowsEl.innerHTML = `<div class="cdx-univer-datasource__empty">${S}</div>`;
      return;
    }
    const t = ["<th>Row</th>"].concat(e.columns.map((a) => `<th>${r(a.label)}</th>`)).join(""), s = e.rows.map((a) => `<tr>${["<td>" + r(String(a.row_index)) + "</td>"].concat(e.columns.map((n) => `<td>${r(a.values && a.values[n.key] ? a.values[n.key] : "")}</td>`)).join("")}</tr>`).join("");
    this.rowsEl.innerHTML = `
      <div class="cdx-univer-datasource__table-wrap">
        <table class="cdx-univer-datasource__table">
          <thead><tr>${t}</tr></thead>
          <tbody>${s}</tbody>
        </table>
      </div>
    `;
  }
  setStatus(e, t, s) {
    const a = e || "";
    this.statusEl.textContent = a, this.statusEl.classList.toggle("is-error", !!(a && t)), a && s && typeof this.config.showMessage == "function" && this.config.showMessage(a, t ? "error" : "info");
  }
  save() {
    return {
      noteId: this.data.noteId,
      query: this.data.query || "",
      selectedSourceKey: this.data.selectedSourceKey || "",
      sheetKey: this.data.sheetKey || "",
      headerRow: d(this.data.headerRow, 0) || 0,
      field: this.data.field || "",
      keyword: this.data.keyword || "",
      match: this.data.match || "contains"
    };
  }
}
window.UniverDatasourceTool = E;
export {
  E as default
};
