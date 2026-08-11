import './index.css';

const BUILD_VERSION = typeof __UNIVER_DATASOURCE_BUILD_VERSION__ !== 'undefined'
  ? __UNIVER_DATASOURCE_BUILD_VERSION__
  : 'dev';

const TOOLBOX_TITLE = 'Univer 数据源';
const EYEBROW_LABEL = '数据源验证';
const EMPTY_LIST_MESSAGE = '未找到可访问的 Univer 数据源。';
const EMPTY_ROWS_MESSAGE = '当前查询没有返回任何行。';
const SELECT_SOURCE_PLACEHOLDER = '请选择数据源';
const SELECT_SHEET_PLACEHOLDER = '请选择工作表';

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function toPositiveInt(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}

function toNonNegativeInt(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
}

function buildSourceKey(item) {
  return `${item.note_id}:${item.block_index}`;
}

function normalizeData(source) {
  const data = source && typeof source === 'object' ? source : {};
  const rawAssistCols = Array.isArray(data.allowedAssistColumns) ? data.allowedAssistColumns : [];
  return {
    noteId: toPositiveInt(data.noteId),
    query: typeof data.query === 'string' ? data.query : '',
    selectedSourceKey: typeof data.selectedSourceKey === 'string' ? data.selectedSourceKey : '',
    sheetKey: typeof data.sheetKey === 'string' ? data.sheetKey : '',
    headerRow: toNonNegativeInt(data.headerRow, 0),
    field: typeof data.field === 'string' ? data.field : '',
    keyword: typeof data.keyword === 'string' ? data.keyword : '',
    match: ['contains', 'prefix', 'equals'].includes(String(data.match || '')) ? String(data.match) : 'contains',
    allowedAssistColumns: rawAssistCols.filter((c) => typeof c === 'string' && c)
  };
}

function normalizeDatasourceConfig(source) {
  const raw = source && typeof source === 'object' ? source : {};
  const grants = raw.grants && typeof raw.grants === 'object' ? raw.grants : {};
  const users = Array.isArray(grants.users) ? grants.users : [];
  return {
    enabled: !!raw.enabled,
    permissionMode: String(raw.permissionMode || '') === 'extended' ? 'extended' : 'inherit',
    grants: {
      users: users
        .map((item) => toPositiveInt(item))
        .filter(Boolean)
    }
  };
}

function parseGrantUserIds(value) {
  return String(value == null ? '' : value)
    .split(/[\s,，;；]+/)
    .map((item) => toPositiveInt(item))
    .filter(Boolean);
}

function formatGrantUserIds(users) {
  return (Array.isArray(users) ? users : [])
    .map((item) => toPositiveInt(item))
    .filter(Boolean)
    .join(', ');
}

// Token crypto functions are provided by window.UniverTokenCrypto (defined in editorToolsShared.js)
// Fallback inline implementation if shared module is not loaded
function _getTokenCrypto() {
  if (typeof window !== 'undefined' && window.UniverTokenCrypto) {
    return window.UniverTokenCrypto;
  }
  // Inline fallback (should not happen in production)
  const SALT = 'univer-datasource-token-v1';
  async function derive(userId) {
    const enc = new TextEncoder();
    const km = await window.crypto.subtle.importKey('raw', enc.encode(SALT + ':' + userId), 'PBKDF2', false, ['deriveKey']);
    return window.crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode(SALT), iterations: 100000, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  return {
    encrypt: async (payload, userId) => {
      const key = await derive(userId);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const ct = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(payload)));
      const c = new Uint8Array(iv.length + new Uint8Array(ct).length); c.set(iv); c.set(new Uint8Array(ct), iv.length);
      let b = ''; c.forEach((x) => { b += String.fromCharCode(x); });
      return 'utk:' + btoa(b);
    },
    decrypt: null
  };
}

class UniverDatasourceTool {
  static get toolbox() {
    return {
      title: TOOLBOX_TITLE,
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6.5C4 5.67157 4.67157 5 5.5 5H18.5C19.3284 5 20 5.67157 20 6.5V17.5C20 18.3284 19.3284 19 18.5 19H5.5C4.67157 19 4 18.3284 4 17.5V6.5Z" stroke="currentColor" stroke-width="1.6"/><path d="M8 5V19" stroke="currentColor" stroke-width="1.6"/><path d="M4 10H20" stroke="currentColor" stroke-width="1.6"/><path d="M11 14H16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M11 17H14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  static get sanitize() {
    return {
      noteId: false,
      query: {},
      selectedSourceKey: false,
      sheetKey: false,
      headerRow: false,
      field: {},
      keyword: {},
      match: false
    };
  }

  constructor({ data, config, readOnly }) {
    this.config = config || {};
    this.readOnly = !!readOnly;
    this.data = normalizeData(data);
    this.sourceItems = [];
    this.readResult = null;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'cdx-univer-datasource';
    wrapper.innerHTML = `
      <div class="cdx-univer-datasource__top">
        <div class="cdx-univer-datasource__meta">
          <div class="cdx-univer-datasource__eyebrow">${EYEBROW_LABEL}</div>
          <div class="cdx-univer-datasource__title">Univer 数据源验证工具</div>
          <div class="cdx-univer-datasource__subtitle">build ${escapeHtml(BUILD_VERSION)}</div>
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
              <option value="">${SELECT_SOURCE_PLACEHOLDER}</option>
            </select>
          </div>
          <div class="cdx-univer-datasource__field">
            <label>工作表</label>
            <select class="cdx-univer-datasource__select" data-role="sheet-select">
              <option value="">${SELECT_SHEET_PLACEHOLDER}</option>
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
      <div class="cdx-univer-datasource__section" data-role="assist-config-section" style="display:none;">
        <div class="cdx-univer-datasource__section-title">录入助手列配置</div>
        <div class="cdx-univer-datasource__hint">勾选允许在录入工具中使用「录入助手」的列。用户在这些列输入时会自动搜索已有数据供选择。</div>
        <div class="cdx-univer-datasource__assist-columns" data-role="assist-columns"></div>
      </div>
      <div class="cdx-univer-datasource__section">
        <div class="cdx-univer-datasource__section-title">Token 生成</div>
        <div class="cdx-univer-datasource__hint">选择数据源后，点击下方按钮生成加密 Token。Token 可在录入工具中使用，自动填充数据源配置。生成时会同步将当前权限配置写入源笔记。</div>
        <div class="cdx-univer-datasource__actions">
          <button type="button" class="cdx-univer-datasource__button is-primary" data-role="generate-token">生成 Token 并复制</button>
        </div>
        <div class="cdx-univer-datasource__token-output" data-role="token-output"></div>
      </div>
      <div class="cdx-univer-datasource__section">
        <div class="cdx-univer-datasource__section-title">数据源摘要</div>
        <div class="cdx-univer-datasource__summary" data-role="summary"></div>
      </div>
      <div class="cdx-univer-datasource__section">
        <div class="cdx-univer-datasource__section-title">结果预览</div>
        <div data-role="rows"></div>
      </div>
    `;

    this.wrapper = wrapper;
    this.statusEl = wrapper.querySelector('.cdx-univer-datasource__status');
    this.summaryEl = wrapper.querySelector('[data-role="summary"]');
    this.rowsEl = wrapper.querySelector('[data-role="rows"]');
    this.noteIdEl = wrapper.querySelector('[data-role="note-id"]');
    this.sourceQueryEl = wrapper.querySelector('[data-role="source-query"]');
    this.sourceSelectEl = wrapper.querySelector('[data-role="source-select"]');
    this.sheetSelectEl = wrapper.querySelector('[data-role="sheet-select"]');
    this.headerRowEl = wrapper.querySelector('[data-role="header-row"]');
    this.fieldSelectEl = wrapper.querySelector('[data-role="field-select"]');
    this.keywordEl = wrapper.querySelector('[data-role="keyword"]');
    this.matchEl = wrapper.querySelector('[data-role="match"]');
    this.listBtnEl = wrapper.querySelector('[data-role="list"]');
    this.readBtnEl = wrapper.querySelector('[data-role="read"]');
    this.openBtnEl = wrapper.querySelector('[data-role="open"]');
    this.generateTokenBtnEl = wrapper.querySelector('[data-role="generate-token"]');
    this.tokenOutputEl = wrapper.querySelector('[data-role="token-output"]');
    this.assistConfigSectionEl = wrapper.querySelector('[data-role="assist-config-section"]');
    this.assistColumnsEl = wrapper.querySelector('[data-role="assist-columns"]');

    this.noteIdEl.value = this.data.noteId != null ? String(this.data.noteId) : '';
    this.sourceQueryEl.value = this.data.query || '';
    this.headerRowEl.value = String(this.data.headerRow || 0);
    this.keywordEl.value = this.data.keyword || '';
    this.matchEl.value = this.data.match || 'contains';

    if (!this.readOnly) {
      this.noteIdEl.addEventListener('input', () => { this.data.noteId = toPositiveInt(this.noteIdEl.value); });
      this.sourceQueryEl.addEventListener('input', () => { this.data.query = this.sourceQueryEl.value; });
      this.headerRowEl.addEventListener('input', () => { this.data.headerRow = toNonNegativeInt(this.headerRowEl.value, 0); });
      this.keywordEl.addEventListener('input', () => { this.data.keyword = this.keywordEl.value; });
      this.matchEl.addEventListener('change', () => { this.data.match = this.matchEl.value || 'contains'; });
      this.sourceSelectEl.addEventListener('change', () => { this.data.selectedSourceKey = this.sourceSelectEl.value || ''; });
      this.sheetSelectEl.addEventListener('change', () => { this.data.sheetKey = this.sheetSelectEl.value || ''; });
      this.fieldSelectEl.addEventListener('change', () => { this.data.field = this.fieldSelectEl.value || ''; });
      this.listBtnEl.addEventListener('click', () => { this.loadSources({ silent: false }); });
      this.readBtnEl.addEventListener('click', () => { this.readSource({ silent: false }); });
      this.generateTokenBtnEl.addEventListener('click', () => { this.generateToken({ silent: false }); });
      this.openBtnEl.addEventListener('click', async () => {
        const source = this.getSelectedSource();
        if (source && typeof this.config.openNoteById === 'function') {
          await this.config.openNoteById(source.note_id);
        }
      });
    } else {
      [this.noteIdEl, this.sourceQueryEl, this.sourceSelectEl, this.sheetSelectEl, this.headerRowEl, this.fieldSelectEl, this.keywordEl, this.matchEl].forEach((el) => {
        if (el) el.disabled = true;
      });
      [this.listBtnEl, this.readBtnEl, this.openBtnEl, this.generateTokenBtnEl].forEach((el) => {
        if (el) el.disabled = true;
      });
    }

    this.renderSummary(null);
    this.renderRows(null);
    if (this.config.runtimeAvailable === false) {
      this.setStatus('当前上下文不支持实时验证，仅显示已保存的数据源参数。', false, false);
    } else {
      this.loadSources({ silent: true, autoRead: true });
    }
    return wrapper;
  }

  async loadSources(options = {}) {
    const opts = options || {};
    if (typeof this.config.listSources !== 'function') {
      this.setStatus('listSources is not configured', true, !opts.silent);
      return false;
    }

    this.setStatus('正在读取数据源列表...', false, false);
    try {
      const response = await this.config.listSources({
        note_id: this.data.noteId,
        q: this.data.query,
        limit: 50
      });
      this.sourceItems = Array.isArray(response && response.items) ? response.items : [];
      this.renderSourceOptions();
      this.setStatus(this.sourceItems.length ? `找到 ${this.sourceItems.length} 个可用数据源。` : EMPTY_LIST_MESSAGE, false, !opts.silent);
      if (opts.autoRead && this.getSelectedSource()) {
        await this.readSource({ silent: true });
      } else {
        this.renderSummary(null);
        this.renderRows(null);
      }
      return true;
    } catch (error) {
      this.sourceItems = [];
      this.renderSourceOptions();
      this.renderSummary(null);
      this.renderRows(null);
      this.setStatus(error && error.message ? error.message : '读取数据源列表失败', true, !opts.silent);
      return false;
    }
  }

  getSelectedSource() {
    const selectedKey = this.data.selectedSourceKey || '';
    return this.sourceItems.find((item) => buildSourceKey(item) === selectedKey) || this.sourceItems[0] || null;
  }

  renderSourceOptions() {
    const selectedKey = this.data.selectedSourceKey || '';
    const options = [`<option value="">${SELECT_SOURCE_PLACEHOLDER}</option>`];
    this.sourceItems.forEach((item) => {
      const key = buildSourceKey(item);
      const label = `#${item.note_id} ${item.note_title || '(无标题)'} / block ${item.block_index} / ${item.sheet_name || 'Sheet'}`;
      options.push(`<option value="${escapeHtml(key)}"${key === selectedKey ? ' selected' : ''}>${escapeHtml(label)}</option>`);
    });
    this.sourceSelectEl.innerHTML = options.join('');
    if (!selectedKey && this.sourceItems[0]) {
      this.data.selectedSourceKey = buildSourceKey(this.sourceItems[0]);
      this.sourceSelectEl.value = this.data.selectedSourceKey;
    }
    this.syncDatasourceConfigFromSource(this.getSelectedSource());
  }

  async readSource(options = {}) {
    const opts = options || {};
    const source = this.getSelectedSource();
    if (!source) {
      this.setStatus('请先选择一个数据源。', true, !opts.silent);
      return false;
    }
    if (typeof this.config.readSource !== 'function') {
      this.setStatus('readSource is not configured', true, !opts.silent);
      return false;
    }

    this.setStatus('正在读取数据源...', false, false);
    try {
      const response = await this.config.readSource({
        note_id: source.note_id,
        block_index: source.block_index,
        sheet_key: this.data.sheetKey,
        header_row: this.data.headerRow,
        field: this.data.field,
        q: this.data.keyword,
        match: this.data.match,
        case_insensitive: true,
        limit: 20
      });
      this.readResult = response || null;
      this.syncDatasourceConfigFromSource(response && response.source ? response.source : null);
      const activeSheet = response && response.active_sheet ? response.active_sheet : null;
      if (activeSheet && activeSheet.key && !this.data.sheetKey) {
        this.data.sheetKey = activeSheet.key;
      }
      this.renderSheetOptions();
      this.renderFieldOptions();
      this.renderAssistColumnOptions();
      this.renderSummary(response);
      this.renderRows(response);
      this.setStatus(`读取成功，共匹配 ${Number(response && response.total) || 0} 行。`, false, !opts.silent);
      return true;
    } catch (error) {
      this.readResult = null;
      this.renderSheetOptions();
      this.renderFieldOptions();
      this.renderSummary(null);
      this.renderRows(null);
      this.setStatus(error && error.message ? error.message : '读取数据源失败', true, !opts.silent);
      return false;
    }
  }

  renderSheetOptions() {
    const sheets = this.readResult && Array.isArray(this.readResult.sheets) ? this.readResult.sheets : [];
    const selected = this.data.sheetKey || (this.readResult && this.readResult.active_sheet ? this.readResult.active_sheet.key : '');
    const options = [`<option value="">${SELECT_SHEET_PLACEHOLDER}</option>`];
    sheets.forEach((sheet) => {
      options.push(`<option value="${escapeHtml(sheet.key)}"${sheet.key === selected ? ' selected' : ''}>${escapeHtml(sheet.name || sheet.key)}</option>`);
    });
    this.sheetSelectEl.innerHTML = options.join('');
    if (selected) this.sheetSelectEl.value = selected;
  }

  renderFieldOptions() {
    const columns = this.readResult && Array.isArray(this.readResult.columns) ? this.readResult.columns : [];
    const options = ['<option value="">全部字段</option>'];
    columns.forEach((column) => {
      options.push(`<option value="${escapeHtml(column.key)}"${column.key === this.data.field ? ' selected' : ''}>${escapeHtml(column.label)}</option>`);
    });
    this.fieldSelectEl.innerHTML = options.join('');
  }

  renderAssistColumnOptions() {
    const columns = this.readResult && Array.isArray(this.readResult.columns) ? this.readResult.columns : [];
    if (!columns.length || !this.assistColumnsEl || !this.assistConfigSectionEl) return;
    this.assistConfigSectionEl.style.display = '';
    const selected = new Set(Array.isArray(this.data.allowedAssistColumns) ? this.data.allowedAssistColumns : []);
    this.assistColumnsEl.innerHTML = columns.map((col) => {
      const checked = selected.has(col.key) ? ' checked' : '';
      return `<label class="cdx-univer-datasource__assist-col-label"><input type="checkbox" data-role="assist-col-cb" data-col-key="${escapeAttr(col.key)}"${checked} /> ${escapeHtml(col.label || col.key)}</label>`;
    }).join('');
    // Bind checkbox change events
    this.assistColumnsEl.querySelectorAll('[data-role="assist-col-cb"]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const key = cb.getAttribute('data-col-key');
        const current = new Set(Array.isArray(this.data.allowedAssistColumns) ? this.data.allowedAssistColumns : []);
        if (cb.checked) { current.add(key); } else { current.delete(key); }
        this.data.allowedAssistColumns = Array.from(current);
      });
    });
  }

  renderSummary(result) {
    if (!result || !result.source || !result.active_sheet) {
      this.summaryEl.innerHTML = `<div class="cdx-univer-datasource__empty">选择一个数据源后，这里会显示源笔记、数据块、工作表、行列规模等摘要。</div>`;
      return;
    }
    const source = result.source;
    const sheet = result.active_sheet;
    const metrics = [
      { label: '源笔记', value: `#${source.note_id}` },
      { label: '数据块', value: String(source.block_index) },
      { label: '工作表', value: sheet.name || sheet.key },
      { label: '有效行数', value: String(sheet.used_row_count || 0) },
      { label: '有效列数', value: String(sheet.used_column_count || 0) },
      { label: '命中行数', value: String(result.total || 0) },
      { label: '表头行', value: String(sheet.header_row || 0) },
      { label: '源标题', value: source.title || '(未设置)' }
    ];
    this.summaryEl.innerHTML = metrics.map((item) => `
      <div class="cdx-univer-datasource__metric">
        <strong>${escapeHtml(item.label)}</strong>
        <span>${escapeHtml(item.value)}</span>
      </div>
    `).join('');
  }

  renderRows(result) {
    if (!result || !Array.isArray(result.columns) || !Array.isArray(result.rows)) {
      this.rowsEl.innerHTML = `<div class="cdx-univer-datasource__empty">读取结果会在这里显示。</div>`;
      return;
    }
    if (!result.rows.length) {
      this.rowsEl.innerHTML = `<div class="cdx-univer-datasource__empty">${EMPTY_ROWS_MESSAGE}</div>`;
      return;
    }
    const head = ['<th>Row</th>'].concat(result.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`)).join('');
    const body = result.rows.map((row) => {
      const cells = ['<td>' + escapeHtml(String(row.row_index)) + '</td>']
        .concat(result.columns.map((column) => `<td>${escapeHtml(row.values && row.values[column.key] ? row.values[column.key] : '')}</td>`))
        .join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    this.rowsEl.innerHTML = `
      <div class="cdx-univer-datasource__table-wrap">
        <table class="cdx-univer-datasource__table">
          <thead><tr>${head}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    `;
  }

  setStatus(message, isError, shouldToast) {
    const text = message || '';
    this.statusEl.textContent = text;
    this.statusEl.classList.toggle('is-error', !!(text && isError));
    if (text && shouldToast && typeof this.config.showMessage === 'function') {
      this.config.showMessage(text, isError ? 'error' : 'info');
    }
  }

  syncDatasourceConfigFromSource(source) {
    // 仅记录数据源的权限配置信息，用于生成Token时同步授权
    const datasource = normalizeDatasourceConfig(source && source.datasource);
    this._lastDatasourceConfig = datasource;
  }

  async generateToken(options = {}) {
    const opts = options || {};
    const source = this.getSelectedSource();
    if (!source) {
      this.setStatus('请先选择一个数据源。', true, !opts.silent);
      return false;
    }

    const userId = typeof this.config.getCurrentUserId === 'function' ? this.config.getCurrentUserId() : null;
    if (!userId) {
      this.setStatus('无法获取当前用户 ID，请确认已登录。', true, !opts.silent);
      return false;
    }

    // Step 1: 同步将权限配置写入源笔记（强制启用datasource并授权当前用户）
    if (typeof this.config.updateSourceConfig === 'function') {
      const currentDs = this._lastDatasourceConfig || normalizeDatasourceConfig(null);
      // Ensure current user is in grants list
      const grantUsers = new Set(Array.isArray(currentDs.grants.users) ? currentDs.grants.users : []);
      grantUsers.add(userId);
      this.setStatus('正在同步权限配置到源笔记...', false, false);
      try {
        await this.config.updateSourceConfig({
          note_id: source.note_id,
          block_index: source.block_index,
          datasource: {
            enabled: true,
            permissionMode: 'extended',
            grants: { users: Array.from(grantUsers) }
          }
        });
      } catch (error) {
        this.setStatus('同步权限配置失败: ' + (error && error.message ? error.message : '未知错误'), true, !opts.silent);
        return false;
      }
    }

    // Step 2: 加密打包Token
    const payload = {
      note_id: source.note_id,
      block_index: source.block_index,
      sheet_key: this.data.sheetKey || '',
      header_row: toNonNegativeInt(this.data.headerRow, 0) || 0,
      allowed_assist_columns: Array.isArray(this.data.allowedAssistColumns) ? this.data.allowedAssistColumns : []
    };

    this.setStatus('正在生成加密 Token...', false, false);
    try {
      let token = '';
      if (typeof this.config.createToken === 'function') {
        const result = await this.config.createToken(payload);
        token = typeof result === 'string' ? result : String((result && result.token) || '');
        if (!token) throw new Error('服务端未返回 Token');
      } else {
        const crypto = _getTokenCrypto();
        token = await crypto.encrypt(payload, userId);
      }
      // 复制到剪贴板
      try {
        await navigator.clipboard.writeText(token);
      } catch (_) {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = token;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      // 显示Token（截断显示）
      if (this.tokenOutputEl) {
        const display = token.length > 60 ? token.substring(0, 30) + '...' + token.substring(token.length - 20) : token;
        this.tokenOutputEl.innerHTML = `<div class="cdx-univer-datasource__token-text">${escapeHtml(display)}</div><div class="cdx-univer-datasource__token-hint">✅ Token 已复制到剪贴板</div>`;
      }
      this.setStatus('Token 已生成并复制到剪贴板。', false, !opts.silent);
      return true;
    } catch (error) {
      this.setStatus('生成 Token 失败: ' + (error && error.message ? error.message : '未知错误'), true, !opts.silent);
      return false;
    }
  }

  save() {
    return {
      noteId: this.data.noteId,
      query: this.data.query || '',
      selectedSourceKey: this.data.selectedSourceKey || '',
      sheetKey: this.data.sheetKey || '',
      headerRow: toNonNegativeInt(this.data.headerRow, 0) || 0,
      field: this.data.field || '',
      keyword: this.data.keyword || '',
      match: this.data.match || 'contains',
      allowedAssistColumns: Array.isArray(this.data.allowedAssistColumns) ? this.data.allowedAssistColumns : []
    };
  }
}

window.UniverDatasourceTool = UniverDatasourceTool;

export default UniverDatasourceTool;
