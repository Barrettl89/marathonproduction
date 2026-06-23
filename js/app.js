  // Date display
  const d = new Date();
  document.getElementById('dateDisplay').textContent =
    d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });

  // Tab switching
  function showTab(id) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + id).classList.add('active');
    document.querySelector('[data-tab="' + id + '"]')?.classList.add('active');
    // close nav on mobile
    document.getElementById('sideNav').classList.remove('open');
    window.scrollTo(0, 0);
  }

  // Mobile nav toggle
  function toggleNav() {
    document.getElementById('sideNav').classList.toggle('open');
  }

  // Add panel toggle
  function toggleAddPanel(id) {
    document.getElementById(id).classList.toggle('open');
  }

  // Generic table filter
  function filterTable(tableId, query) {
    const q = query.toLowerCase();
    const rows = document.querySelectorAll('#' + tableId + ' tbody tr');
    rows.forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  }

  // ── Add row helpers ──
  function makeRow(cells) {
    return '<tr>' + cells.map(c => '<td>' + c + '</td>').join('') + '</tr>';
  }

  function pill(text, type) {
    return '<span class="pill pill-' + type + '">' + text + '</span>';
  }

  function formVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function inputsFromPanel(panelId) {
    const inputs = document.querySelectorAll('#' + panelId + ' input, #' + panelId + ' select');
    return Array.from(inputs).map(i => i.value.trim() || '—');
  }

  // ── FINANCE CONTACTS DATA ──

  function renderFinanceTable(data) {
    const tbody = document.getElementById('fc-tbody');
    tbody.innerHTML = '';
    data.forEach((row, i) => {
      const emailCell  = row.email   ? `<a class="fc-email-link"   href="mailto:${row.email}">${row.email}</a>` : '—';
      const phoneCell  = row.phone   ? `<a class="fc-phone-link"   href="tel:${row.phone}">${row.phone}</a>`    : '—';
      const siteCell   = row.website ? `<a class="fc-website-link" href="https://${row.website}" target="_blank">${row.website}</a>` : '—';
      const notesCell  = row.notes   ? `<span class="fc-notes">${row.notes}</span>` : '—';
      tbody.insertAdjacentHTML('beforeend', `
        <tr id="fc-row-${i}">
          <td><span class="fc-source-name">${row.source || '—'}</span></td>
          <td>${row.contact || '—'}</td>
          <td>${emailCell}</td>
          <td>${phoneCell}</td>
          <td>${siteCell}</td>
          <td>${notesCell}</td>
          <td class="fc-action-cell">
            <button class="btn-edit" onclick="editFinanceContact(${i})">✏️ Edit</button>
            <button class="btn-delete-fc" onclick="deleteFinanceContact(${i})">✕</button>
          </td>
        </tr>`);
    });
    document.getElementById('fc-count').textContent = data.length + ' records';
  }

  function toggleFinanceAdd() {
    const panel = document.getElementById('finance-add');
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
      closeFinancePanel();
    } else {
      clearFinanceForm();
      document.getElementById('fc-panel-title').textContent = 'Add Flooring Source';
      document.getElementById('fc-save-btn').textContent = 'Save Contact';
      document.getElementById('fc-edit-index').textContent = '';
      panel.classList.add('open');
      document.getElementById('fc-toggle-btn').textContent = '✕ Close';
    }
  }

  function closeFinancePanel() {
    document.getElementById('finance-add').classList.remove('open');
    document.getElementById('fc-toggle-btn').textContent = '+ Add Flooring Source';
    document.querySelectorAll('#fc-tbody tr').forEach(r => r.classList.remove('fc-editing'));
  }

  function clearFinanceForm() {
    ['fc-source','fc-contact','fc-email','fc-phone','fc-website','fc-notes']
      .forEach(id => { document.getElementById(id).value = ''; });
  }

  function saveFinanceContact() {
    const idxEl = document.getElementById('fc-edit-index');
    const newRow = {
      source:  document.getElementById('fc-source').value.trim(),
      contact: document.getElementById('fc-contact').value.trim(),
      email:   document.getElementById('fc-email').value.trim(),
      phone:   document.getElementById('fc-phone').value.trim(),
      website: document.getElementById('fc-website').value.trim().replace(/^https?:\/\//,''),
      notes:   document.getElementById('fc-notes').value.trim(),
    };
    if (!newRow.source) { alert('Flooring Source name is required.'); return; }

    if (idxEl.textContent !== '') {
      financeData[parseInt(idxEl.textContent)] = newRow;
    } else {
      financeData.push(newRow);
    }
    renderFinanceTable(financeData);
    closeFinancePanel();
  }

  function editFinanceContact(i) {
    const row = financeData[i];
    document.getElementById('fc-source').value  = row.source;
    document.getElementById('fc-contact').value = row.contact;
    document.getElementById('fc-email').value   = row.email;
    document.getElementById('fc-phone').value   = row.phone;
    document.getElementById('fc-website').value = row.website;
    document.getElementById('fc-notes').value   = row.notes;
    document.getElementById('fc-edit-index').textContent = i;
    document.getElementById('fc-panel-title').textContent = 'Edit — ' + (row.source || 'Contact');
    document.getElementById('fc-save-btn').textContent = 'Update Contact';
    document.getElementById('finance-add').classList.add('open');
    document.getElementById('fc-toggle-btn').textContent = '✕ Close';
    // Highlight row
    document.querySelectorAll('#fc-tbody tr').forEach(r => r.classList.remove('fc-editing'));
    const rowEl = document.getElementById('fc-row-' + i);
    if (rowEl) rowEl.classList.add('fc-editing');
    // Scroll to form
    document.getElementById('finance-add').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function deleteFinanceContact(i) {
    if (!confirm('Delete "' + financeData[i].source + '"?')) return;
    financeData.splice(i, 1);
    renderFinanceTable(financeData);
  }

  function filterFinanceTable(q) {
    q = q.toLowerCase();
    document.querySelectorAll('#fc-tbody tr').forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  }

  // Init finance table on load
  renderFinanceTable(financeData);

  // ── DEALER LICENSE DATA ──

  let dlStateFilter = '';

  function renderDealerTable(data) {
    const tbody = document.getElementById('dl-tbody');
    tbody.innerHTML = '';
    let visible = 0;
    data.forEach((row, i) => {
      if (dlStateFilter && row.state !== dlStateFilter) return;
      visible++;
      const flooringPill = row.flooring
        ? `<span class="pill ${flooringPillColor(row.flooring)}" style="font-size:9px;">${row.flooring}</span>`
        : '<span style="color:var(--subtext);font-size:11px;">—</span>';
      const gmEmailCell  = row.gmEmail  ? `<a class="fc-email-link" href="mailto:${row.gmEmail}">${row.gmEmail}</a>`    : '—';
      const mgrEmailCell = row.mgrEmail ? `<a class="fc-email-link" href="mailto:${row.mgrEmail}">${row.mgrEmail}</a>` : '—';
      const phoneCell    = row.phone    ? `<a class="fc-phone-link" href="tel:${row.phone}">${row.phone}</a>`           : '—';

      // License lookup link — TX/NM use TDHCA, OK has no state portal so link to search
      let licenseCell = '—';
      if (row.rbi) {
        let url = '';
        if (row.state === 'TX' || row.state === 'NM') {
          url = `https://www.tdhca.state.tx.us/mh/apps/SearchLicenseInfo.aspx`;
        } else if (row.state === 'OK') {
          url = `https://www.ok.gov/ohcs/Manufactured_Housing/`;
        }
        if (url) {
          licenseCell = `<a href="${url}" target="_blank" rel="noopener" class="license-lookup-btn" title="Look up license for ${row.retailer}">🔍 View</a>`;
        }
      }

      tbody.insertAdjacentHTML('beforeend', `
        <tr id="dl-row-${i}">
          <td style="font-size:11px;font-weight:600;color:var(--subtext);white-space:nowrap;">${row.rbi || '—'}</td>
          <td>${flooringPill}</td>
          <td style="font-weight:600;color:var(--white);font-size:12px;">${row.retailer}</td>
          <td style="font-size:11px;color:var(--subtext);">${row.dba || '—'}</td>
          <td>${row.city || '—'}</td>
          <td><span class="pill ${row.state === 'TX' ? 'pill-blue' : row.state === 'OK' ? 'pill-orange' : 'pill-gray'}" style="font-size:9px;">${row.state || '—'}</span></td>
          <td>${licenseCell}</td>
          <td>${row.gm || '—'}</td>
          <td>${gmEmailCell}</td>
          <td style="font-size:11px;">${row.mgr || '—'}</td>
          <td>${phoneCell}</td>
          <td>${mgrEmailCell}</td>
          <td class="fc-action-cell">
            <button class="btn-edit" onclick="editDealerRecord(${i})">✏️ Edit</button>
            <button class="btn-delete-fc" onclick="deleteDealerRecord(${i})">✕</button>
          </td>
        </tr>`);
    });
    document.getElementById('dl-count').textContent = visible + ' of ' + data.length + ' records';
  }

  function flooringPillColor(f) {
    if (!f) return 'pill-gray';
    if (f.includes('21st'))    return 'pill-blue';
    if (f.includes('Triad'))   return 'pill-orange';
    if (f.includes('CASH'))    return 'pill-green';
    if (f.includes('First'))   return 'pill-yellow';
    if (f.includes('Auto'))    return 'pill-gray';
    if (f.includes('Affiliates')) return 'pill-blue';
    return 'pill-gray';
  }

  function toggleDealerAdd() {
    const panel = document.getElementById('dealer-add');
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
      closeDealerPanel();
    } else {
      clearDealerForm();
      document.getElementById('dl-panel-title').textContent = 'Add Dealer';
      document.getElementById('dl-save-btn').textContent = 'Save Dealer';
      document.getElementById('dl-edit-index').textContent = '';
      panel.classList.add('open');
      document.getElementById('dl-toggle-btn').textContent = '✕ Close';
    }
  }

  function closeDealerPanel() {
    document.getElementById('dealer-add').classList.remove('open');
    document.getElementById('dl-toggle-btn').textContent = '+ Add Dealer';
    document.querySelectorAll('#dl-tbody tr').forEach(r => r.classList.remove('fc-editing'));
  }

  function clearDealerForm() {
    ['dl-rbi','dl-flooring','dl-retailer','dl-dba','dl-city','dl-gm','dl-gm-email','dl-mgr','dl-phone','dl-mgr-email']
      .forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('dl-state').value = '';
    document.getElementById('dl-license-type').value = 'Manufactured Housing - License Detail';
  }

  function saveDealerRecord() {
    const idxEl = document.getElementById('dl-edit-index');
    const newRow = {
      rbi:         document.getElementById('dl-rbi').value.trim(),
      flooring:    document.getElementById('dl-flooring').value.trim(),
      retailer:    document.getElementById('dl-retailer').value.trim(),
      dba:         document.getElementById('dl-dba').value.trim(),
      city:        document.getElementById('dl-city').value.trim(),
      state:       document.getElementById('dl-state').value,
      gm:          document.getElementById('dl-gm').value.trim(),
      gmEmail:     document.getElementById('dl-gm-email').value.trim(),
      mgr:         document.getElementById('dl-mgr').value.trim(),
      phone:       document.getElementById('dl-phone').value.trim(),
      mgrEmail:    document.getElementById('dl-mgr-email').value.trim(),
    };
    if (!newRow.retailer) { alert('Retailer Name is required.'); return; }
    if (idxEl.textContent !== '') {
      dealerData[parseInt(idxEl.textContent)] = newRow;
    } else {
      dealerData.push(newRow);
    }
    dealerData.sort((a, b) => a.retailer.localeCompare(b.retailer));
    renderDealerTable(dealerData);
    closeDealerPanel();
  }

  function editDealerRecord(i) {
    const row = dealerData[i];
    document.getElementById('dl-rbi').value         = row.rbi;
    document.getElementById('dl-flooring').value    = row.flooring;
    document.getElementById('dl-retailer').value    = row.retailer;
    document.getElementById('dl-dba').value         = row.dba;
    document.getElementById('dl-city').value        = row.city;
    document.getElementById('dl-state').value       = row.state;
    document.getElementById('dl-gm').value          = row.gm;
    document.getElementById('dl-gm-email').value    = row.gmEmail;
    document.getElementById('dl-mgr').value         = row.mgr;
    document.getElementById('dl-phone').value       = row.phone;
    document.getElementById('dl-mgr-email').value   = row.mgrEmail;
    document.getElementById('dl-edit-index').textContent = i;
    document.getElementById('dl-panel-title').textContent = 'Edit — ' + (row.retailer || 'Dealer');
    document.getElementById('dl-save-btn').textContent = 'Update Dealer';
    document.getElementById('dealer-add').classList.add('open');
    document.getElementById('dl-toggle-btn').textContent = '✕ Close';
    document.querySelectorAll('#dl-tbody tr').forEach(r => r.classList.remove('fc-editing'));
    const rowEl = document.getElementById('dl-row-' + i);
    if (rowEl) rowEl.classList.add('fc-editing');
    document.getElementById('dealer-add').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function deleteDealerRecord(i) {
    if (!confirm('Delete "' + dealerData[i].retailer + '"?')) return;
    dealerData.splice(i, 1);
    renderDealerTable(dealerData);
  }

  function filterDealerTable(q) {
    q = q.toLowerCase();
    document.querySelectorAll('#dl-tbody tr').forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  }

  function filterDealerByState(state) {
    dlStateFilter = state;
    renderDealerTable(dealerData);
  }

  // Sort alphabetically by retailer name
  dealerData.sort((a, b) => a.retailer.localeCompare(b.retailer));

  // Init dealer table on load
  renderDealerTable(dealerData);

  // ── SERIAL NUMBER LOG DATA ──

  // Generate remaining placeholders 436–999 as single-section MY27
  for (let n = 436; n <= 999; n++) {
    const p = String(n).padStart(4, '0');
    serialData.push({soid:'', serial:`01-BRK${p}-27`, model:'', boxsize:'', dealer:'', customer:'', notes:'', serialized:''});
  }

  // ── Parse serial number to extract num, suffix, year ──
  function parseSerial(s) {
    // formats: 01-BRK0417AB-27, 01-BRK0417A-27, 01-BRK0417-27, BRK0197
    const m = s.match(/BRK(\d+)([AB])?(?:-(\d+))?/i);
    if (!m) return { num: 0, suffix: '', year: '26' };
    return { num: parseInt(m[1]), suffix: (m[2] || '').toUpperCase(), year: m[3] || '26' };
  }

  function getModelYear(serial) {
    const { year } = parseSerial(serial);
    return year === '27' ? '27' : '26';
  }

  function getSection(serial) {
    const { suffix } = parseSerial(serial);
    if (suffix === 'A') return 'A';
    if (suffix === 'B') return 'B';
    return 'Single';
  }

  // ── Get next serial number for new entry ──
  function getNextSerial(sectionType) {
    // Find highest BRK number
    let maxNum = 0;
    serialData.forEach(r => {
      const { num } = parseSerial(r.serial);
      if (num > maxNum) maxNum = num;
    });
    const nextNum = maxNum + 1;
    const paddedNum = String(nextNum).padStart(4, '0');
    const myYear = nextNum >= 417 ? '27' : '26';
    if (sectionType === 'A') return `01-BRK${paddedNum}A-${myYear}`;
    if (sectionType === 'B') return `01-BRK${paddedNum}B-${myYear}`;
    return `01-BRK${paddedNum}-${myYear}`;
  }

  // ── Ensure all records have serialized field ──
  serialData.forEach(r => { if (r.serialized === undefined) r.serialized = ''; });

  // ── Render serial table ──
  let snYearFilter = '';
  let snSectionFilter = '';
  let snEditingIndex = -1;

  function fmtBoxsize(b) {
    if (!b) return '—';
    const widthMap = {'13.8':"13'8\"", '15':"15'", '17':"17'", '12':"12'", '28':"28'", '32':"32'"};
    return b.replace(/^([^x]+)x(\d+)$/, (_, w, l) => (widthMap[w] || w+"'") + " x " + l + "'");
  }

  function renderSerialTable(data) {
    const tbody = document.getElementById('sn-tbody');
    tbody.innerHTML = '';
    let visible = 0;
    data.forEach((row, i) => {
      const my = getModelYear(row.serial);
      const section = getSection(row.serial);
      if (snYearFilter && my !== snYearFilter) return;
      if (snSectionFilter === 'single' && section !== 'Single') return;
      if (snSectionFilter === 'double' && section === 'Single') return;
      visible++;

      const myPill = my === '27'
        ? `<span class="pill pill-green" style="font-size:9px;">MY27</span>`
        : `<span class="pill pill-blue"  style="font-size:9px;">MY26</span>`;

      const secPill = section === 'Single'
        ? `<span class="pill pill-gray"   style="font-size:9px;">Single</span>`
        : section === 'A'
          ? `<span class="pill pill-orange" style="font-size:9px;">Double A</span>`
          : `<span class="pill pill-yellow" style="font-size:9px;">Double B</span>`;

      const isEmpty = !row.model && !row.dealer;
      const dateDisplay = row.serialized ? `<span style="color:var(--green);font-size:11px;">${row.serialized}</span>` : '<span style="color:var(--subtext);font-size:10px;">—</span>';

      if (snEditingIndex === i) {
        // ── INLINE EDIT ROW ──
        tbody.insertAdjacentHTML('beforeend', `
          <tr id="sn-row-${i}" class="sn-editing">
            <td style="font-weight:700;color:var(--white);font-size:12px;white-space:nowrap;font-family:monospace;">${row.serial}</td>
            <td>
              <select class="sn-inline-input" id="sne-my" style="min-width:64px;">
                <option value="26" ${my === '26' ? 'selected' : ''}>MY26</option>
                <option value="27" ${my === '27' ? 'selected' : ''}>MY27</option>
                <option value="28">MY28</option>
                <option value="29">MY29</option>
              </select>
            </td>
            <td>${secPill}</td>
            <td><input class="sn-inline-input" id="sne-soid"       value="${esc(row.soid)}"     placeholder="SOID"></td>
            <td><input class="sn-inline-input" id="sne-model"      value="${esc(row.model)}"    placeholder="Model"></td>
            <td><input class="sn-inline-input" id="sne-boxsize"    value="${esc(row.boxsize)}"  placeholder="16x76"></td>
            <td><input class="sn-inline-input sn-inline-date" type="date" id="sne-serialized" value="${esc(row.serialized)}"></td>
            <td><input class="sn-inline-input" id="sne-dealer"     value="${esc(row.dealer)}"   placeholder="Dealer"></td>
            <td><input class="sn-inline-input" id="sne-customer"   value="${esc(row.customer)}" placeholder="Customer"></td>
            <td><input class="sn-inline-input" id="sne-notes"      value="${esc(row.notes)}"    placeholder="Notes"></td>
            <td class="fc-action-cell" style="white-space:nowrap;">
              <button class="btn-save-inline" onclick="saveInlineSerial(${i})">✓ Save</button>
              <button class="btn-cancel-inline" onclick="cancelInlineSerial()">✕</button>
            </td>
          </tr>`);
      } else {
        // ── READ ROW ──
        tbody.insertAdjacentHTML('beforeend', `
          <tr id="sn-row-${i}" ${isEmpty ? 'style="opacity:0.4;"' : ''}>
            <td style="font-weight:700;color:var(--white);font-size:12px;white-space:nowrap;font-family:monospace;">${row.serial}</td>
            <td>${myPill}</td>
            <td>${secPill}</td>
            <td style="font-size:11px;color:var(--subtext);">${row.soid || '—'}</td>
            <td>${row.model || '—'}</td>
            <td style="font-size:11px;">${fmtBoxsize(row.boxsize)}</td>
            <td>${dateDisplay}</td>
            <td style="font-size:11px;">${row.dealer || '—'}</td>
            <td style="font-size:11px;">${row.customer || '—'}</td>
            <td style="font-size:10px;color:var(--subtext);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${esc(row.notes)}">${row.notes || '—'}</td>
            <td class="fc-action-cell">
              <button class="btn-edit" onclick="editSerialEntry(${i})">✏️ Edit</button>
            </td>
          </tr>`);
      }
    });
    document.getElementById('sn-count').textContent = visible + ' of ' + data.length + ' entries';
  }

  function esc(s) {
    return (s || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function editSerialEntry(i) {
    snEditingIndex = i;
    renderSerialTable(serialData);
    // Scroll the editing row into view
    const row = document.getElementById('sn-row-' + i);
    if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Focus first editable field
    setTimeout(() => {
      const f = document.getElementById('sne-soid');
      if (f) f.focus();
    }, 100);
  }

  function saveInlineSerial(i) {
    const newMY = document.getElementById('sne-my').value;
    // Rewrite the year suffix in the serial number: replace trailing -XX with -newMY
    let serial = serialData[i].serial;
    serial = serial.replace(/-(\d{2})$/, `-${newMY}`);
    // Also handle serials without a year suffix (legacy BRKxxxx format) — append year
    if (!serial.match(/-\d{2}$/)) serial = serial + `-${newMY}`;
    serialData[i].serial     = serial;
    serialData[i].soid       = document.getElementById('sne-soid').value.trim();
    serialData[i].model      = document.getElementById('sne-model').value.trim();
    serialData[i].boxsize    = document.getElementById('sne-boxsize').value.trim();
    serialData[i].serialized = document.getElementById('sne-serialized').value;
    serialData[i].dealer     = document.getElementById('sne-dealer').value.trim();
    serialData[i].customer   = document.getElementById('sne-customer').value.trim();
    serialData[i].notes      = document.getElementById('sne-notes').value.trim();
    snEditingIndex = -1;
    renderSerialTable(serialData);
  }

  function cancelInlineSerial() {
    snEditingIndex = -1;
    renderSerialTable(serialData);
  }

  function toggleSerialAdd() {
    const panel = document.getElementById('serial-add');
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
      closeSerialPanel();
    } else {
      document.getElementById('sn-panel-title').textContent = 'Add Serial Entry';
      document.getElementById('sn-save-btn').textContent = 'Save Entry';
      document.getElementById('sn-edit-index').textContent = '';
      const section = document.getElementById('sn-section').value;
      const stype = section === 'A' ? 'A' : section === 'B' ? 'B' : 'single';
      const next = getNextSerial(stype);
      document.getElementById('sn-serial').value = next;
      document.getElementById('sn-next-hint').textContent = '↑ Auto-assigned — next in sequence';
      ['sn-soid','sn-model','sn-boxsize','sn-dealer','sn-customer','sn-notes'].forEach(id => {
        document.getElementById(id).value = '';
      });
      document.getElementById('sn-serialized-form').value = '';
      panel.classList.add('open');
      document.getElementById('sn-toggle-btn').textContent = '✕ Close';
    }
  }

  document.getElementById('sn-section').addEventListener('change', function() {
    if (!document.getElementById('serial-add').classList.contains('open')) return;
    if (document.getElementById('sn-edit-index').textContent !== '') return;
    const v = this.value;
    const next = getNextSerial(v === 'A' ? 'A' : v === 'B' ? 'B' : 'single');
    document.getElementById('sn-serial').value = next;
  });

  function closeSerialPanel() {
    document.getElementById('serial-add').classList.remove('open');
    document.getElementById('sn-toggle-btn').textContent = '+ Add Entry';
  }

  function saveSerialEntry() {
    const idxEl = document.getElementById('sn-edit-index');
    const newRow = {
      serial:     document.getElementById('sn-serial').value.trim(),
      soid:       document.getElementById('sn-soid').value.trim(),
      model:      document.getElementById('sn-model').value.trim(),
      boxsize:    document.getElementById('sn-boxsize').value.trim(),
      serialized: document.getElementById('sn-serialized-form').value,
      dealer:     document.getElementById('sn-dealer').value.trim(),
      customer:   document.getElementById('sn-customer').value.trim(),
      notes:      document.getElementById('sn-notes').value.trim(),
    };
    if (!newRow.serial) { alert('Serial number is required.'); return; }
    serialData.push(newRow);
    renderSerialTable(serialData);
    closeSerialPanel();
  }

  function filterSerialTable(q) {
    q = q.toLowerCase();
    document.querySelectorAll('#sn-tbody tr').forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  }

  function filterSerialByYear(y) {
    snYearFilter = y;
    renderSerialTable(serialData);
  }

  function filterSerialBySection(s) {
    snSectionFilter = s;
    renderSerialTable(serialData);
  }

  // Init serial table on load
  renderSerialTable(serialData);

  // ── CONFIRMED ORDERS DATA ──


  // ── POPULATE DROPDOWNS ── (called after modelData and dealerData are defined)
  function populateOrderDropdowns() {
    // Model dropdown (col D) — from modelData
    const modelSel = document.getElementById('co-model');
    modelSel.innerHTML = '<option value="">— Select Model —</option>';
    modelData.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.model;
      opt.textContent = m.model;
      opt.dataset.box = m.box;
      modelSel.appendChild(opt);
    });

    // Dealer dropdown (col H) — from dealerData sorted alphabetically
    const dealerSel = document.getElementById('co-dealer');
    dealerSel.innerHTML = '<option value="">— Select Dealer —</option>';
    [...dealerData].sort((a,b) => a.retailer.localeCompare(b.retailer)).forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.retailer;
      opt.textContent = d.retailer + (d.dba ? ` (${d.dba})` : '') + (d.city ? ` — ${d.city}` : '');
      dealerSel.appendChild(opt);
    });

    // Finance dropdown (col J) — Cash Buyer + Marathon Homes Financing + financeData sources
    const finSel = document.getElementById('co-flooring');
    finSel.innerHTML = `
      <option value="">— Select —</option>
      <option value="Cash Buyer">💵 Cash Buyer</option>
      <option value="Marathon Homes Financing">🏠 Marathon Homes Financing</option>
      <option disabled>──────────────</option>`;
    financeData.forEach(f => {
      if (!f.source) return;
      const opt = document.createElement('option');
      opt.value = f.source;
      opt.textContent = f.source + (f.contact ? ` — ${f.contact}` : '');
      finSel.appendChild(opt);
    });
  }

  function coModelChanged() {
    const sel = document.getElementById('co-model');
    const opt = sel.options[sel.selectedIndex];
    if (!opt || !opt.dataset.box) { 
      document.getElementById('co-width').value = '';
      document.getElementById('co-length').value = '';
      document.getElementById('co-sections').value = '';
      return;
    }
    const box = opt.dataset.box; // e.g. "32 X 76"
    const parts = box.split(/\s*[Xx]\s*/);
    const w = parts[0] || '';
    const l = parts[1] || '';
    const secs = parseInt(w) >= 28 ? '2' : '1';
    document.getElementById('co-width').value   = w;
    document.getElementById('co-length').value  = l;
    document.getElementById('co-sections').value = secs;
  }

  function coStockRsoChanged() {
    const v = document.getElementById('co-stockrso').value;
    document.getElementById('co-customer-group').style.display = (v === 'RSO') ? '' : 'none';
    if (v !== 'RSO') document.getElementById('co-customer').value = '';
  }

  // ── RENDER ORDERS TABLE ──
  let coTypeFilter = '';
  let coSRFilter = '';
  let coSearchFilter = '';
  let coEditIndex = -1;

  function renderOrderTable() {
    const tbody = document.getElementById('co-tbody');
    tbody.innerHTML = '';
    let visible = 0;
    const visibleRows = [];

    ordersData.forEach((row, i) => {
      if (!isInActivePeriod(row.date)) return;
      if (coTypeFilter && row.type !== coTypeFilter) return;
      if (coSRFilter === 'RSO'   && row.stockrso !== 'RSO')   return;
      if (coSRFilter === 'Stock' && row.stockrso !== 'Stock') return;
      if (coSearchFilter) {
        const haystack = (row.model + row.dealer + row.customer + row.flooring + row.notes + row.id).toLowerCase();
        if (!haystack.includes(coSearchFilter)) return;
      }
      visible++;
      visibleRows.push(row);

      const typePill = row.type === 'HUD' ? 'pill-blue'
        : row.type === 'Park Model' || row.type === 'PM' ? 'pill-orange'
        : row.type === 'Workforce' || row.type === 'WF' ? 'pill-green'
        : 'pill-gray';

      const srLabel = row.stockrso === 'RSO'
        ? `<span class="pill pill-yellow" style="font-size:9px;">RSO</span>${row.customer ? ' <span style="font-size:11px;">' + row.customer + '</span>' : ''}`
        : row.stockrso ? `<span class="pill pill-gray" style="font-size:9px;">${row.stockrso}</span>` : '—';

      const flooringPill = row.flooring === 'Cash Buyer'
        ? `<span class="pill pill-green" style="font-size:9px;">💵 Cash</span>`
        : row.flooring === 'Marathon Homes Financing'
          ? `<span class="pill pill-blue" style="font-size:9px;">🏠 MH Fin.</span>`
          : row.flooring
            ? `<span class="pill pill-orange" style="font-size:9px;">${row.flooring}</span>`
            : '—';

      const dateDisplay = row.date
        ? new Date(row.date + 'T12:00:00').toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})
        : '—';

      tbody.insertAdjacentHTML('beforeend', `
        <tr id="co-row-${i}">
          <td style="font-size:11px;white-space:nowrap;">${dateDisplay}</td>
          <td><span class="pill ${typePill}" style="font-size:9px;">${row.type}</span></td>
          <td style="font-size:11px;color:var(--subtext);font-family:monospace;">${row.id || '—'}</td>
          <td style="font-weight:600;color:var(--white);font-size:12px;">${row.model}</td>
          <td style="font-size:11px;">${row.width}'</td>
          <td style="font-size:11px;">${row.length}'</td>
          <td style="text-align:center;"><span class="pill ${row.sections==='2'?'pill-blue':'pill-gray'}" style="font-size:9px;">${row.sections}</span></td>
          <td style="font-size:11px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${row.dealer}">${row.dealer}</td>
          <td>${srLabel}</td>
          <td>${flooringPill}</td>
          <td style="font-size:10px;color:var(--subtext);max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${row.notes}">${row.notes || '—'}</td>
          <td class="fc-action-cell no-print">
            <button class="btn-edit" onclick="editOrder(${i})">✏️ Edit</button>
          </td>
        </tr>`);
    });

    document.getElementById('co-count').textContent = visible + ' of ' + ordersData.length + ' orders';

    // Update stats based on visible rows only
    document.getElementById('co-stat-total').textContent  = visibleRows.length;
    document.getElementById('co-stat-floors').textContent = visibleRows.reduce((sum, r) => sum + (parseInt(r.sections) || 0), 0);
    document.getElementById('co-stat-hud').textContent    = visibleRows.filter(r => r.type === 'HUD').length;
    document.getElementById('co-stat-pm').textContent     = visibleRows.filter(r => r.type === 'Park Model' || r.type === 'PM').length;
    document.getElementById('co-stat-wf').textContent     = visibleRows.filter(r => r.type === 'Workforce' || r.type === 'WF').length;
    document.getElementById('co-stat-rso').textContent    = visibleRows.filter(r => r.stockrso === 'RSO').length;
    document.getElementById('co-stat-stock').textContent  = visibleRows.filter(r => r.stockrso === 'Stock').length;

    // Update period label in stat card
    const periodNames = { '':'All time', cw:'This Week', lw:'Last Week', cm:'This Month', lm:'Last Month', ytd:'Year to Date' };
    document.getElementById('co-stat-period').textContent = periodNames[coPeriod] || 'Custom Range';
  }

  function toggleOrderAdd() {
    const panel = document.getElementById('orders-add');
    const isOpen = panel.classList.contains('open');
    if (isOpen) { closeOrderPanel(); return; }
    clearOrderForm();
    document.getElementById('co-panel-title').textContent = 'New Confirmed Order';
    document.getElementById('co-save-btn').textContent = 'Save Order';
    document.getElementById('co-edit-index').textContent = '';
    panel.classList.add('open');
    document.getElementById('co-toggle-btn').textContent = '✕ Close';
  }

  function closeOrderPanel() {
    document.getElementById('orders-add').classList.remove('open');
    document.getElementById('co-toggle-btn').textContent = '+ Add Order';
  }

  function clearOrderForm() {
    document.getElementById('co-date').value = '';
    document.getElementById('co-buildtype').value = '';
    document.getElementById('co-id').value = '';
    document.getElementById('co-model').value = '';
    document.getElementById('co-width').value = '';
    document.getElementById('co-length').value = '';
    document.getElementById('co-sections').value = '';
    document.getElementById('co-dealer').value = '';
    document.getElementById('co-stockrso').value = '';
    document.getElementById('co-customer').value = '';
    document.getElementById('co-customer-group').style.display = 'none';
    document.getElementById('co-flooring').value = '';
    document.getElementById('co-notes').value = '';
  }

  function saveOrder() {
    const idxEl = document.getElementById('co-edit-index');
    const sr = document.getElementById('co-stockrso').value;
    const newRow = {
      date:     document.getElementById('co-date').value,
      type:     document.getElementById('co-buildtype').value,
      id:       document.getElementById('co-id').value.trim(),
      model:    document.getElementById('co-model').value,
      width:    document.getElementById('co-width').value,
      length:   document.getElementById('co-length').value,
      sections: document.getElementById('co-sections').value,
      dealer:   document.getElementById('co-dealer').value,
      stockrso: sr,
      customer: sr === 'RSO' ? document.getElementById('co-customer').value.trim() : '',
      flooring: document.getElementById('co-flooring').value,
      notes:    document.getElementById('co-notes').value.trim(),
    };
    if (!newRow.model) { alert('Please select a model.'); return; }
    if (idxEl.textContent !== '') {
      ordersData[parseInt(idxEl.textContent)] = newRow;
    } else {
      ordersData.push(newRow);
    }
    renderOrderTable();
    closeOrderPanel();
  }

  function editOrder(i) {
    const row = ordersData[i];
    document.getElementById('co-date').value      = row.date;
    document.getElementById('co-buildtype').value = row.type;
    document.getElementById('co-id').value        = row.id;
    document.getElementById('co-model').value     = row.model;
    document.getElementById('co-width').value     = row.width;
    document.getElementById('co-length').value    = row.length;
    document.getElementById('co-sections').value  = row.sections;
    document.getElementById('co-dealer').value    = row.dealer;
    document.getElementById('co-stockrso').value  = row.stockrso;
    document.getElementById('co-customer').value  = row.customer;
    document.getElementById('co-customer-group').style.display = row.stockrso === 'RSO' ? '' : 'none';
    document.getElementById('co-flooring').value  = row.flooring;
    document.getElementById('co-notes').value     = row.notes;
    document.getElementById('co-edit-index').textContent = i;
    document.getElementById('co-panel-title').textContent = 'Edit — ' + row.model + ' / ' + (row.dealer || 'order');
    document.getElementById('co-save-btn').textContent = 'Update Order';
    document.getElementById('orders-add').classList.add('open');
    document.getElementById('co-toggle-btn').textContent = '✕ Close';
    document.getElementById('orders-add').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ── DATE PERIOD HELPERS ──
  let coPeriod = '';
  let coDateFrom = null;
  let coDateTo = null;

  function getDateRange(period) {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    const dow = now.getDay(); // 0=Sun
    let from, to;
    if (period === 'cw') {
      const diff = dow === 0 ? 6 : dow - 1; // Mon start
      from = new Date(y, m, d - diff);
      to   = new Date(y, m, d - diff + 6);
    } else if (period === 'lw') {
      const diff = dow === 0 ? 6 : dow - 1;
      from = new Date(y, m, d - diff - 7);
      to   = new Date(y, m, d - diff - 1);
    } else if (period === 'cm') {
      from = new Date(y, m, 1);
      to   = new Date(y, m + 1, 0);
    } else if (period === 'lm') {
      from = new Date(y, m - 1, 1);
      to   = new Date(y, m, 0);
    } else if (period === 'ytd') {
      from = new Date(y, 0, 1);
      to   = new Date(y, m, d);
    }
    return { from, to };
  }

  function fmtDate(d) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function setOrderPeriod(btn, period) {
    coPeriod = period;
    coDateFrom = null;
    coDateTo = null;
    document.getElementById('co-date-from').value = '';
    document.getElementById('co-date-to').value = '';
    document.querySelectorAll('.co-period-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const banner = document.getElementById('co-report-banner');
    const label  = document.getElementById('co-report-label');
    const range  = document.getElementById('co-report-range');

    if (period) {
      const { from, to } = getDateRange(period);
      const labels = { cw:'This Week', lw:'Last Week', cm:'This Month', lm:'Last Month', ytd:'Year to Date' };
      label.textContent = '📅 ' + labels[period];
      range.textContent = fmtDate(from) + ' → ' + fmtDate(to);
      banner.style.display = 'flex';
    } else {
      banner.style.display = 'none';
    }
    renderOrderTable();
  }

  function applyCustomDateRange() {
    const f = document.getElementById('co-date-from').value;
    const t = document.getElementById('co-date-to').value;
    if (!f && !t) return;
    coDateFrom = f ? new Date(f + 'T00:00:00') : null;
    coDateTo   = t ? new Date(t + 'T23:59:59') : null;
    coPeriod = '';
    document.querySelectorAll('.co-period-btn').forEach(b => b.classList.remove('active'));

    const banner = document.getElementById('co-report-banner');
    const label  = document.getElementById('co-report-label');
    const range  = document.getElementById('co-report-range');
    label.textContent = '📅 Custom Range';
    range.textContent = (f ? fmtDate(new Date(f+'T12:00:00')) : '…') + ' → ' + (t ? fmtDate(new Date(t+'T12:00:00')) : '…');
    banner.style.display = 'flex';
    renderOrderTable();
  }

  function clearCustomDateRange() {
    coDateFrom = null;
    coDateTo   = null;
    document.getElementById('co-date-from').value = '';
    document.getElementById('co-date-to').value = '';
    document.getElementById('co-report-banner').style.display = 'none';
    renderOrderTable();
  }

  function isInActivePeriod(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr + 'T12:00:00');
    if (coDateFrom || coDateTo) {
      if (coDateFrom && d < coDateFrom) return false;
      if (coDateTo   && d > coDateTo)   return false;
      return true;
    }
    if (!coPeriod) return true;
    const { from, to } = getDateRange(coPeriod);
    from.setHours(0,0,0,0);
    to.setHours(23,59,59,999);
    return d >= from && d <= to;
  }

  function filterOrderTable(q) {
    coSearchFilter = q.toLowerCase();
    renderOrderTable();
  }

  function filterOrderByType(t) {
    coTypeFilter = t;
    renderOrderTable();
  }

  function filterOrderByStockRso(s) {
    coSRFilter = s;
    renderOrderTable();
  }

  // ── GET CURRENTLY VISIBLE ROWS ──
  function getVisibleOrders() {
    return ordersData.filter(row => {
      if (!isInActivePeriod(row.date)) return false;
      if (coTypeFilter && row.type !== coTypeFilter) return false;
      if (coSRFilter === 'RSO'   && row.stockrso !== 'RSO')   return false;
      if (coSRFilter === 'Stock' && row.stockrso !== 'Stock') return false;
      if (coSearchFilter) {
        const h = (row.model+row.dealer+row.customer+row.flooring+row.notes+row.id).toLowerCase();
        if (!h.includes(coSearchFilter)) return false;
      }
      return true;
    });
  }

  // ── PRINT REPORT ──
  function printOrderReport() {
    const rows = getVisibleOrders();
    const periodLabel = document.getElementById('co-report-label').textContent || 'All Orders';
    const periodRange = document.getElementById('co-report-range').textContent || '';

    const tableRows = rows.map(r => {
      const date = r.date ? new Date(r.date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—';
      return `<tr>
        <td>${date}</td>
        <td>${r.type}</td>
        <td>${r.id||'—'}</td>
        <td><strong>${r.model}</strong></td>
        <td>${r.width}'</td>
        <td>${r.length}'</td>
        <td>${r.sections}</td>
        <td>${r.dealer}</td>
        <td>${r.stockrso}${r.customer?' — '+r.customer:''}</td>
        <td>${r.flooring||'—'}</td>
        <td>${r.notes||'—'}</td>
      </tr>`;
    }).join('');

    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Marathon Homes — Confirmed Orders Report</title>
      <style>
        @page { size: landscape; margin: 10mm; }
        body { font-family: Arial, sans-serif; font-size: 9px; color: #111; }
        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 3px solid #8DC63F; padding-bottom: 8px; }
        .header h1 { font-size: 16px; margin: 0; }
        .header h1 span { color: #8DC63F; }
        .meta { font-size: 10px; color: #555; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #272727; color: white; padding: 5px 6px; text-align: left; font-size: 9px; }
        td { padding: 4px 6px; border-bottom: 1px solid #e5e5e5; vertical-align: middle; }
        tr:nth-child(even) td { background: #f9f9f9; }
        .footer { margin-top: 12px; font-size: 9px; color: #888; text-align: right; }
        .summary { display: flex; gap: 20px; margin-bottom: 12px; }
        .sum-box { background: #f4f4f4; border: 1px solid #ddd; border-radius: 6px; padding: 6px 14px; text-align: center; }
        .sum-val { font-size: 18px; font-weight: 800; color: #272727; }
        .sum-lbl { font-size: 9px; color: #888; }
      </style></head><body>
      <div class="header">
        <div>
          <h1>Marathon <span>Homes</span> — Confirmed Orders Report</h1>
          <div class="meta">${periodLabel} &nbsp;|&nbsp; ${periodRange} &nbsp;|&nbsp; Printed ${new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}</div>
        </div>
      </div>
      <div class="summary">
        <div class="sum-box"><div class="sum-val">${rows.length}</div><div class="sum-lbl">Total</div></div>
        <div class="sum-box"><div class="sum-val">${rows.filter(r=>r.type==='HUD').length}</div><div class="sum-lbl">HUD</div></div>
        <div class="sum-box"><div class="sum-val">${rows.filter(r=>r.type==='Park Model'||r.type==='PM').length}</div><div class="sum-lbl">Park Model</div></div>
        <div class="sum-box"><div class="sum-val">${rows.filter(r=>r.type==='Workforce'||r.type==='WF').length}</div><div class="sum-lbl">Workforce</div></div>
        <div class="sum-box"><div class="sum-val">${rows.filter(r=>r.stockrso==='RSO').length}</div><div class="sum-lbl">RSO</div></div>
        <div class="sum-box"><div class="sum-val">${rows.filter(r=>r.stockrso==='Stock').length}</div><div class="sum-lbl">Stock</div></div>
      </div>
      <table>
        <thead><tr>
          <th>Date</th><th>Type</th><th>ID</th><th>Model</th>
          <th>Width</th><th>Length</th><th>Sec.</th>
          <th>Dealer</th><th>Stock/RSO</th><th>Flooring</th><th>Notes</th>
        </tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="footer">Marathon Homes Operations Portal &nbsp;|&nbsp; ${rows.length} records</div>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }

  // ── EXPORT EXCEL ──
  function exportOrdersExcel() {
    const rows = getVisibleOrders();
    const periodLabel = document.getElementById('co-report-label').textContent || 'All Orders';

    const headers = ['Date','Build Type','ID','Model','Width','Length','Sections','Dealer','Stock/RSO','Customer','Flooring','Notes'];
    const data = rows.map(r => [
      r.date ? new Date(r.date+'T12:00:00').toLocaleDateString('en-US') : '',
      r.type, r.id, r.model, r.width+"'", r.length+"'", r.sections,
      r.dealer, r.stockrso, r.customer, r.flooring, r.notes
    ]);

    // Build CSV
    const escape = v => '"' + String(v||'').replace(/"/g,'""') + '"';
    const csv = [
      ['Marathon Homes — Confirmed Orders Report'].map(escape).join(','),
      [periodLabel + ' | ' + (document.getElementById('co-report-range').textContent||'')].map(escape).join(','),
      [],
      headers.map(escape).join(','),
      ...data.map(row => row.map(escape).join(','))
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'marathon_orders_' + (coPeriod || 'export') + '_' + new Date().toISOString().slice(0,10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Init — populate dropdowns then render (called at end of script after all data is defined)
  // See bottom of script for actual call

  // Deprecate old addScheduleUnit — replaced by production schedule system

  // ══════════════════════════════════════════════════
  // PRODUCTION SCHEDULE DATA
  // Columns: pro, id, dealer, serial, model, width, length, sf, floors, offline, status, ship
  // Status: Complete | Yard | Rework | Unreleased | (blank=scheduled)
  // ══════════════════════════════════════════════════

  // ── PS FILTER STATE ──
  let psSearch='', psMonthFilter='', psStatusFilter='', psEditIndex=-1;

  function fmtPsDate(d) {
    if(!d) return '—';
    if(/^\d{4}-\d{2}-\d{2}$/.test(d)){
      const[y,m,day]=d.split('-');
      return `${+m}/${+day}/${y.slice(2)}`;
    }
    return d;
  }

  function psStatusColor(s) {
    const sl=(s||'').toLowerCase();
    if(sl==='complete')                return 'pill-green';
    if(sl==='send mco')                return 'pill-blue';
    if(sl==='yard')                    return 'pill-yellow';
    if(sl==='rework')                  return 'pill-orange';
    if(sl==='unreleased')              return 'pill-red';
    if(sl==='schedule shipment')       return 'pill-blue';
    if(sl==='shipment scheduled')      return 'pill-blue';
    if(sl==='scheduled to production') return 'pill-gray';
    return 'pill-gray';
  }

  function psStatusPill(s, i) {
    const statuses = [
      'Unreleased',
      'Scheduled to Production',
      'Rework',
      'Yard',
      'Schedule Shipment',
      'Shipment Scheduled',
      'Send MCO',
      'Complete',
    ];
    const color = psStatusColor(s);
    const opts = statuses.map(v =>
      `<option value="${v}" ${v===s?'selected':''}>${v}</option>`
    ).join('');
    return `<select class="pill ${color}" style="font-size:9px;font-weight:700;border:none;cursor:pointer;padding:2px 4px;border-radius:4px;background:transparent;"
      onchange="psQuickStatus(${i},this.value)">${opts}</select>`;
  }

  function psQuickStatus(i, val) {
    psData[i].status = val;
    renderProdTable();
    renderReworkTable();
    renderYardTable();
    renderShipTable();
  }

  function renderProdTable() {
    const tbody=document.getElementById('ps-tbody');
    if(!tbody) return;
    tbody.innerHTML='';
    let visible=0,homes=0,totalFloors=0,complete=0,yard=0,rework=0,shippedFloors=0,scheduled=0,unreleased=0,doubleHomes=0,singleHomes=0,doubleFloors=0,singleFloors=0;
    let lastMonth='';

    psData.forEach((row,i)=>{
      // Month grouping — extract YYYY-MM only so all days in same month share one divider
      const mo = row.offline && /^\d{4}-\d{2}-\d{2}$/.test(row.offline)
        ? new Date(row.offline+'T12:00:00').toLocaleString('en-US',{month:'long',year:'numeric'}) : '';

      // Filters
      if(psMonthFilter && mo.toLowerCase().indexOf(psMonthFilter.toLowerCase())<0) return;
      if(psStatusFilter && (row.status||'').toLowerCase()!==psStatusFilter.toLowerCase()) return;
      if(psSearch){
        const h=(row.pro+row.id+row.dealer+row.serial+row.model+row.status).toLowerCase();
        if(!h.includes(psSearch)) return;
      }

      visible++;
      // A/B split homes count as 0.5 each so two halves = 1 home
      const isHalf = /[AB]-\d{2}$/.test(row.serial);
      homes += isHalf ? 0.5 : 1;
      if(isHalf){
        doubleHomes+=0.5;
        doubleFloors+=1; // each half = 1 floor, so A+B together = 2
      } else {
        singleHomes+=1;
        singleFloors+=row.floors;
      }
      totalFloors+=row.floors;
      const sl=(row.status||'').toLowerCase();
      if(sl==='complete') complete++;
      if(sl==='yard') yard+=row.floors;
      else if(sl==='rework') rework+=row.floors;
      else if(sl==='unreleased') unreleased+=row.floors;
      else if(sl==='' || sl==='scheduled to production' || sl==='schedule shipment' || sl==='shipment scheduled') scheduled+=row.floors;
      if(row.ship && row.ship.match(/^\d{4}-\d{2}-\d{2}$/)) shippedFloors+=row.floors;

      // Month divider
      if(mo && mo!==lastMonth){
        lastMonth=mo;
        tbody.insertAdjacentHTML('beforeend',`
          <tr style="background:var(--darker);pointer-events:none;">
            <td colspan="13" style="padding:8px 14px 5px;font-size:10px;font-weight:800;letter-spacing:.1em;color:var(--green);text-transform:uppercase;border-bottom:1px solid var(--border);">
              📅 ${mo}
            </td>
          </tr>`);
      }

      const isUnrel = (row.status||'').toLowerCase()==='unreleased';
      const bg = isUnrel ? 'background:rgba(239,68,68,.06);' : '';

      const o2s = (row.offline && row.ship && /^\d{4}-\d{2}-\d{2}$/.test(row.offline) && /^\d{4}-\d{2}-\d{2}$/.test(row.ship))
        ? Math.round((new Date(row.ship) - new Date(row.offline)) / 86400000) : null;

      if(psEditIndex===i){
        tbody.insertAdjacentHTML('beforeend',`
          <tr id="ps-row-${i}" class="sn-editing">
            <td><input class="sn-inline-input" id="pse-pro"    value="${row.pro}"    style="width:55px;"></td>
            <td><input class="sn-inline-input" id="pse-id"     value="${row.id}"     style="width:55px;"></td>
            <td><input class="sn-inline-input" id="pse-dealer" value="${row.dealer}" style="min-width:130px;"></td>
            <td><input class="sn-inline-input" id="pse-customer" value="${row.customer||''}" style="min-width:100px;"></td>
            <td><input class="sn-inline-input" id="pse-serial" value="${row.serial}" style="min-width:130px;font-family:monospace;font-size:10px;"></td>
            <td><input class="sn-inline-input" id="pse-model"  value="${row.model}"  style="width:80px;font-weight:700;"></td>
            <td style="font-size:11px;">${row.width}</td>
            <td style="font-size:11px;">${row.length}</td>
            <td style="text-align:right;font-size:11px;">${row.sf||''}</td>
            <td style="text-align:center;"><span class="pill ${row.floors===2?'pill-blue':'pill-gray'}" style="font-size:9px;">${row.floors}</span></td>
            <td><select class="sn-inline-input" id="pse-ttvog" style="width:65px;"><option ${(row.ttvog||'T&T')==='T&T'?'selected':''}>T&T</option><option ${row.ttvog==='VOG'?'selected':''}>VOG</option></select></td>
            <td><input class="sn-inline-input sn-inline-date" type="date" id="pse-offline" value="${row.offline}"></td>
            <td><input class="sn-inline-input sn-inline-date" type="date" id="pse-tagdate" value="${row.tagDate||''}"></td>
            <td><input class="sn-inline-input sn-inline-date" type="date" id="pse-ship" value="${row.ship}"></td>
            <td><input class="sn-inline-input sn-inline-date" type="date" id="pse-mco"  value="${row.mco||''}"></td>
            <td>
              <select class="sn-inline-input" id="pse-status" style="width:110px;">
                <option value="">Scheduled</option>
                <option ${row.status==='Complete'?'selected':''}>Complete</option>
                <option ${row.status==='Yard'?'selected':''}>Yard</option>
                <option ${row.status==='Rework'?'selected':''}>Rework</option>
                <option ${row.status==='Unreleased'?'selected':''}>Unreleased</option>
              </select>
            </td>
            <td style="text-align:center;font-size:11px;color:var(--subtext);">${o2s!==null?o2s:'—'}</td>
            <td class="fc-action-cell no-print" style="white-space:nowrap;">
              <button class="btn-save-inline" onclick="savePsInline(${i})">✓</button>
              <button class="btn-cancel-inline" onclick="cancelPsEdit()">✕</button>
            </td>
          </tr>`);
      } else {
        tbody.insertAdjacentHTML('beforeend',`
          <tr id="ps-row-${i}" style="${bg}">
            <td style="font-family:monospace;font-size:11px;font-weight:700;color:${isUnrel?'#EF4444':row.pro?'var(--green)':'var(--subtext)'}">${row.pro||'—'}</td>
            <td style="font-size:11px;color:var(--subtext);">${row.id}</td>
            <td style="font-size:11px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${row.dealer}">${row.dealer}</td>
            <td style="font-size:11px;color:var(--subtext);white-space:nowrap;">${row.customer||'—'}</td>
            <td style="font-family:monospace;font-size:10px;white-space:nowrap;">${row.serial}</td>
            <td style="font-weight:600;color:var(--white);font-size:12px;">${row.model}</td>
            <td style="font-size:11px;text-align:center;">${row.width}</td>
            <td style="font-size:11px;text-align:center;">${row.length}</td>
            <td style="text-align:right;font-size:11px;">${row.sf?row.sf.toLocaleString():''}</td>
            <td style="text-align:center;"><span class="pill ${row.floors===2?'pill-blue':'pill-gray'}" style="font-size:9px;">${row.floors}</span></td>
            <td style="text-align:center;"><span class="pill ${(row.ttvog||'T&T')==='VOG'?'pill-green':'pill-yellow'}" style="font-size:9px;">${row.ttvog||'T&T'}</span></td>
            <td style="font-size:11px;white-space:nowrap;">${fmtPsDate(row.offline)}</td>
            <td style="font-size:11px;white-space:nowrap;">${fmtPsDate(row.tagDate)}</td>
            <td style="font-size:11px;white-space:nowrap;">${fmtPsDate(row.ship)}</td>
            <td style="font-size:11px;white-space:nowrap;color:${row.mco?'var(--green)':'var(--subtext)'};">${row.mco?fmtPsDate(row.mco):'—'}</td>
            <td>${psStatusPill(row.status, i)}</td>
            <td style="text-align:center;font-size:11px;color:${o2s!==null&&o2s>30?'#EF4444':'var(--subtext)'};">${o2s!==null?o2s:'—'}</td>
            <td class="fc-action-cell no-print">
              <button class="btn-edit" onclick="editPsRow(${i})">✏️ Edit</button>
            </td>
          </tr>`);
      }
    });

    const pct = n => totalFloors > 0 ? (n/totalFloors*100).toFixed(1)+'%' : '0%';
    document.getElementById('ps-stat-total').textContent      = homes % 1 === 0 ? homes : homes.toFixed(1);
    document.getElementById('ps-stat-floors').textContent     = totalFloors;
    document.getElementById('ps-stat-shipped').textContent    = shippedFloors;
    document.getElementById('ps-stat-double').textContent     = doubleFloors;
    document.getElementById('ps-stat-double-pct').textContent = (doubleHomes % 1 === 0 ? doubleHomes : doubleHomes.toFixed(1)) + ' homes · ' + pct(doubleFloors);
    document.getElementById('ps-stat-single').textContent     = singleFloors;
    document.getElementById('ps-stat-single-pct').textContent = singleHomes + ' homes · ' + pct(singleFloors);
    document.getElementById('ps-stat-scheduled').textContent  = scheduled;
    document.getElementById('ps-stat-unreleased').textContent = unreleased;
    document.getElementById('ps-stat-yard').textContent       = yard;
    document.getElementById('ps-stat-rework').textContent     = rework;
    document.getElementById('ps-count').textContent           = visible+' rows';
  }

  function editPsRow(i) {
    psEditIndex=i; renderProdTable();
    const r=document.getElementById('ps-row-'+i);
    if(r) r.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(()=>{const f=document.getElementById('pse-pro');if(f)f.focus();},120);
  }

  function savePsInline(i) {
    psData[i].pro    = document.getElementById('pse-pro').value.trim();
    psData[i].id     = document.getElementById('pse-id').value.trim();
    psData[i].dealer   = document.getElementById('pse-dealer').value.trim();
    psData[i].customer = document.getElementById('pse-customer').value.trim();
    psData[i].ttvog    = document.getElementById('pse-ttvog').value;
    psData[i].serial   = document.getElementById('pse-serial').value.trim();
    psData[i].model  = document.getElementById('pse-model').value.trim();
    psData[i].offline= document.getElementById('pse-offline').value;
    psData[i].tagDate= document.getElementById('pse-tagdate').value;
    psData[i].status = document.getElementById('pse-status').value;
    psData[i].ship   = document.getElementById('pse-ship').value;
    psData[i].mco    = document.getElementById('pse-mco').value;
    psEditIndex=-1; renderProdTable();
  }

  function cancelPsEdit() { psEditIndex=-1; renderProdTable(); }

  function filterProdTable(q)  { psSearch=q.toLowerCase(); renderProdTable(); }
  function filterProdByMonth(m) { psMonthFilter=m; renderProdTable(); }
  function filterProdByStatus(s){ psStatusFilter=s; renderProdTable(); }

  function toggleProdAdd() {
    const panel=document.getElementById('ps-add');
    if(panel.classList.contains('open')){closeProdPanel();return;}
    panel.classList.add('open');
    document.getElementById('ps-toggle-btn').textContent='✕ Close';
  }
  function closeProdPanel() {
    document.getElementById('ps-add').classList.remove('open');
    document.getElementById('ps-toggle-btn').textContent='+ Add Unit';
  }

  function saveProdUnit() {
    const row={
      pro:     document.getElementById('ps-pro').value.trim(),
      id:      document.getElementById('ps-soid').value.trim(),
      dealer:  document.getElementById('ps-dealer').value,
      serial:  document.getElementById('ps-serial').value.trim(),
      model:   document.getElementById('ps-model').value,
      width:   document.getElementById('ps-width').value,
      length:  document.getElementById('ps-length').value,
      sf:      parseInt(document.getElementById('ps-sf')||0),
      floors:  parseInt(document.getElementById('ps-floors')||1),
      offline: document.getElementById('ps-offline').value,
      status:  document.getElementById('ps-status').value,
      ship:    document.getElementById('ps-shipdate').value,
    };
    psData.push(row);
    renderProdTable();
    closeProdPanel();
  }

  function psSyncModel() {
    const sel=document.getElementById('ps-model');
    const opt=sel.options[sel.selectedIndex];
    if(!opt||!opt.dataset.box) return;
    const parts=opt.dataset.box.split(/\s*[Xx]\s*/);
    const wMap={'14':"13'8\"", '16':"15'", '18':"17'", '11.8':"11'8\"", '15':"15'", '17':"17'", '28':"13'8\"", '32':"15'"};
    document.getElementById('ps-width').value  = wMap[parts[0]]||(parts[0]+"'");
    document.getElementById('ps-length').value = parts[1]?parts[1]+"'":'';
  }

  function populatePsDropdowns() {
    const ms=document.getElementById('ps-model');
    if(ms){
      ms.innerHTML='<option value="">— Select Model —</option>';
      modelData.forEach(m=>{
        const o=document.createElement('option');
        o.value=m.model; o.textContent=m.model; o.dataset.box=m.box;
        ms.appendChild(o);
      });
    }
    const ds=document.getElementById('ps-dealer');
    if(ds){
      ds.innerHTML='<option value="">— Select Dealer —</option>';
      [...dealerData].sort((a,b)=>a.retailer.localeCompare(b.retailer)).forEach(d=>{
        const o=document.createElement('option');
        o.value=d.retailer; o.textContent=d.retailer+(d.city?' — '+d.city:'');
        ds.appendChild(o);
      });
    }
  }

  function addScheduleUnit() {}  // no-op (legacy)


  function addScheduleUnit() {}  // no-op

  // ── REWORK / YARD / SHIPPING — rendered from psData ──

  let rwSearch='', ydSearch='', shSearch='';

  function fmtD(d) {
    if(!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return '—';
    const [y,m,day]=d.split('-');
    return `${+m}/${+day}/${y.slice(2)}`;
  }

  function renderReworkTable() {
    const tbody=document.getElementById('rework-tbody');
    if(!tbody) return;
    const rows=psData.filter(r=>(r.status||'').toLowerCase()==='rework');
    const filtered=rows.filter(r=>{
      if(!rwSearch) return true;
      return (r.pro+r.id+r.dealer+r.serial+r.model).toLowerCase().includes(rwSearch);
    });
    tbody.innerHTML=filtered.map(r=>`
      <tr>
        <td style="font-family:monospace;font-size:11px;font-weight:700;color:var(--green);">${r.pro||'—'}</td>
        <td style="font-size:11px;color:var(--subtext);">${r.id}</td>
        <td style="font-size:11px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${r.dealer}">${r.dealer}</td>
        <td style="font-family:monospace;font-size:10px;white-space:nowrap;">${r.serial}</td>
        <td style="font-weight:600;color:var(--white);font-size:12px;">${r.model}</td>
        <td style="font-size:11px;text-align:center;">${r.width}</td>
        <td style="font-size:11px;text-align:center;">${r.length}</td>
        <td style="text-align:right;font-size:11px;">${r.sf?r.sf.toLocaleString():''}</td>
        <td style="text-align:center;"><span class="pill pill-orange" style="font-size:9px;">${r.floors}</span></td>
        <td style="font-size:11px;white-space:nowrap;">${fmtD(r.offline)}</td>
      </tr>`).join('');
    const el=document.getElementById('rework-count');
    if(el) el.textContent=filtered.length+' units';
  }

  function filterReworkTable(q){ rwSearch=q.toLowerCase(); renderReworkTable(); }

  function renderYardTable() {
    const tbody=document.getElementById('yard-tbody');
    if(!tbody) return;
    const today=new Date();
    const rows=psData.filter(r=>(r.status||'').toLowerCase()==='yard');
    const filtered=rows.filter(r=>{
      if(!ydSearch) return true;
      return (r.pro+r.id+r.dealer+r.serial+r.model).toLowerCase().includes(ydSearch);
    });
    tbody.innerHTML=filtered.map(r=>{
      const days = r.offline && /^\d{4}-\d{2}-\d{2}$/.test(r.offline)
        ? Math.round((today - new Date(r.offline)) / 86400000) : null;
      return `
      <tr>
        <td style="font-family:monospace;font-size:11px;font-weight:700;color:var(--green);">${r.pro||'—'}</td>
        <td style="font-size:11px;color:var(--subtext);">${r.id}</td>
        <td style="font-size:11px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${r.dealer}">${r.dealer}</td>
        <td style="font-family:monospace;font-size:10px;white-space:nowrap;">${r.serial}</td>
        <td style="font-weight:600;color:var(--white);font-size:12px;">${r.model}</td>
        <td style="font-size:11px;text-align:center;">${r.width}</td>
        <td style="font-size:11px;text-align:center;">${r.length}</td>
        <td style="text-align:right;font-size:11px;">${r.sf?r.sf.toLocaleString():''}</td>
        <td style="text-align:center;"><span class="pill pill-yellow" style="font-size:9px;">${r.floors}</span></td>
        <td style="font-size:11px;white-space:nowrap;">${fmtD(r.offline)}</td>
        <td style="text-align:center;font-size:11px;color:${days!==null&&days>30?'#EF4444':'var(--subtext)'};">${days!==null?days:'—'}</td>
      </tr>`;
    }).join('');
    const el=document.getElementById('yard-count');
    if(el) el.textContent=filtered.length+' units';
  }

  function filterYardTable(q){ ydSearch=q.toLowerCase(); renderYardTable(); }

  function renderShipTable() {
    const tbody=document.getElementById('ship-tbody');
    if(!tbody) return;
    const rows=psData.filter(r=>r.ship && /^\d{4}-\d{2}-\d{2}$/.test(r.ship));
    const filtered=rows.filter(r=>{
      if(!shSearch) return true;
      return (r.pro+r.id+r.dealer+r.serial+r.model+r.ship).toLowerCase().includes(shSearch);
    });
    tbody.innerHTML=filtered.map(r=>{
      const o2s=(r.offline && /^\d{4}-\d{2}-\d{2}$/.test(r.offline))
        ? Math.round((new Date(r.ship)-new Date(r.offline))/86400000) : null;
      return `
      <tr>
        <td style="font-family:monospace;font-size:11px;font-weight:700;color:var(--green);">${r.pro||'—'}</td>
        <td style="font-size:11px;color:var(--subtext);">${r.id}</td>
        <td style="font-size:11px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${r.dealer}">${r.dealer}</td>
        <td style="font-family:monospace;font-size:10px;white-space:nowrap;">${r.serial}</td>
        <td style="font-weight:600;color:var(--white);font-size:12px;">${r.model}</td>
        <td style="font-size:11px;text-align:center;">${r.width}</td>
        <td style="font-size:11px;text-align:center;">${r.length}</td>
        <td style="text-align:right;font-size:11px;">${r.sf?r.sf.toLocaleString():''}</td>
        <td style="text-align:center;"><span class="pill pill-blue" style="font-size:9px;">${r.floors}</span></td>
        <td style="font-size:11px;white-space:nowrap;">${fmtD(r.offline)}</td>
        <td style="font-size:11px;white-space:nowrap;font-weight:600;color:var(--green);">${fmtD(r.ship)}</td>
        <td style="text-align:center;font-size:11px;color:${o2s!==null&&o2s>30?'#EF4444':'var(--subtext)'};">${o2s!==null?o2s:'—'}</td>
      </tr>`;
    }).join('');
    // Stats
    const totalEl=document.getElementById('ship-stat-total');
    const floorEl=document.getElementById('ship-stat-floors');
    if(totalEl) totalEl.textContent=filtered.length;
    if(floorEl) floorEl.textContent=filtered.reduce((s,r)=>s+r.floors,0);
    const el=document.getElementById('ship-count');
    if(el) el.textContent=filtered.length+' units';
  }

  function filterShipTable(q){ shSearch=q.toLowerCase(); renderShipTable(); }

  function addAcctRecord() {
    const vals = inputsFromPanel('acct-add');
    const [serial, invoice, dealer, amount, mco, date] = vals;
    const mcoColor = mco === 'Sent' ? 'green' : mco === 'Hold' ? 'red' : 'yellow';
    document.getElementById('acct-tbody').insertAdjacentHTML('beforeend',
      makeRow([serial, invoice, dealer, amount ? '$' + parseFloat(amount).toLocaleString() : '—', date, pill('MCO ' + mco, mcoColor)]));
    toggleAddPanel('acct-add');
  }

  // ── MODEL LIST DATA ──
  // displayWidth conversion: 14→13'8", 16→15'8", 18→17'8", 28→13'8", 32→30'
  const displayWidthMap = {
    '14':   "13'8\"",
    '16':   "15'",
    '18':   "17'",
    '28':   "13'8\"",
    '32':   "30'",
    '11.8': "11'8\"",
    '15':   "15'",
  };

  function getDisplaySize(boxSize) {
    // boxSize e.g. "14 X 56" or "11.8 X 34"
    const m = boxSize.match(/^([\d.]+)\s*[Xx]\s*([\d.]+)$/);
    if (!m) return boxSize;
    const w = displayWidthMap[m[1]] || m[1] + "'";
    return `${w} × ${m[2]}'`;
  }

  function getSection(boxSize) {
    const w = parseFloat(boxSize);
    return (w >= 28) ? 'Double' : 'Single';
  }


  let modelSearchFilter = '';
  let modelSectionFilter = '';
  let modelWidthFilter = '';
  let modelEditingIndex = -1;

  function renderModelTable() {
    const tbody = document.getElementById('model-tbody');
    tbody.innerHTML = '';
    let visible = 0;
    let lastGroup = '';

    // Sort: HUD singles → HUD doubles → Park Models → Workforce, each by sqft
    const typeOrder = {'HUD-Single':0,'HUD-Double':1,'Park Model':2,'Workforce':3};
    const sorted = modelData.map((row, i) => {
      const sec = getSection(row.box);
      const grp = (row.type === 'HUD' || !row.type) ? ('HUD-' + sec) : (row.type);
      return {...row, _i: i, _grp: grp, _sqft: parseInt(row.sqft)||0};
    }).sort((a,b) => {
      const og = (typeOrder[a._grp]??99) - (typeOrder[b._grp]??99);
      return og !== 0 ? og : a._sqft - b._sqft;
    });

    sorted.forEach(({_i: i, _grp: grp, ...row}) => {
      row = modelData[i]; // use original reference for edits to work correctly
      const section = getSection(row.box);
      const displaySize = getDisplaySize(row.box);
      const boxW = row.box.split(/\s*[Xx]\s*/)[0];
      const displayW = displayWidthMap[boxW] || (boxW + "'");
      const grpKey = (row.type === 'HUD' || !row.type) ? ('HUD-' + section) : (row.type);

      if (modelSearchFilter && !row.model.toLowerCase().includes(modelSearchFilter)) return;
      if (modelSectionFilter && section !== modelSectionFilter) return;
      if (modelWidthFilter && displayW !== modelWidthFilter) return;

      visible++;

      // Group divider
      if (grpKey !== lastGroup) {
        lastGroup = grpKey;
        const groupLabels = {
          'HUD-Single':  '🏠 HUD — Single Section',
          'HUD-Double':  '🏡 HUD — Double Section',
          'Park Model':  '🌲 Park Models',
          'Workforce':   '🔧 Workforce',
        };
        const groupColors = {
          'HUD-Single':  'var(--green)',
          'HUD-Double':  '#60A5FA',
          'Park Model':  '#F97316',
          'Workforce':   '#A3E635',
        };
        tbody.insertAdjacentHTML('beforeend', `
          <tr style="background:var(--darker);pointer-events:none;">
            <td colspan="10" style="padding:10px 16px 6px;font-size:10px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${groupColors[grpKey]||'var(--green)'};border-bottom:1px solid var(--border);">
              ${groupLabels[grpKey]||grpKey}
            </td>
          </tr>`);
      }

      const bedNum = parseInt(row.bed);
      const bedColor = bedNum <= 2 ? 'pill-gray' : bedNum === 3 ? 'pill-blue' : 'pill-green';
      const maxSqft = 2280;
      const pct = Math.round((parseInt(row.sqft) / maxSqft) * 100);

      if (modelEditingIndex === i) {
        // ── INLINE EDIT ROW ──
        tbody.insertAdjacentHTML('beforeend', `
          <tr id="ml-row-${i}" class="sn-editing">
            <td><input class="sn-inline-input" id="mle-model"   value="${esc(row.model)}"  placeholder="Model" style="font-weight:700;min-width:100px;"></td>
            <td>
              <select class="sn-inline-input" id="mle-type" style="width:100px;">
                <option value="HUD"        ${(row.type||'HUD')==='HUD'        ?'selected':''}>HUD</option>
                <option value="Park Model" ${(row.type||'')==='Park Model'?'selected':''}>Park Model</option>
                <option value="Workforce"  ${(row.type||'')==='Workforce' ?'selected':''}>Workforce</option>
              </select>
            </td>
            <td><input class="sn-inline-input" id="mle-code"    value="${esc(row.code)}"   placeholder="Code"  style="font-family:monospace;width:80px;"></td>
            <td><span class="pill ${section === 'Single' ? 'pill-gray' : 'pill-blue'}" style="font-size:9px;">${section}</span></td>
            <td>
              <input class="sn-inline-input" id="mle-box" value="${esc(row.box)}" placeholder="e.g. 32 X 76" style="width:100px;"
                oninput="document.getElementById('mle-disp').textContent=getDisplaySize(this.value);">
              <div style="font-size:10px;color:var(--green);margin-top:3px;" id="mle-disp">${displaySize}</div>
            </td>
            <td style="font-size:11px;color:var(--subtext);white-space:nowrap;">${getDisplaySize(row.totalBox || row.box)}</td>
            <td style="white-space:nowrap;">
              <input class="sn-inline-input" id="mle-bed"  value="${esc(row.bed)}"  placeholder="Bed"  style="width:36px;display:inline-block;">
              <span style="color:var(--subtext);margin:0 2px;font-size:11px;">bd /</span>
              <input class="sn-inline-input" id="mle-bath" value="${esc(row.bath)}" placeholder="Ba"   style="width:36px;display:inline-block;">
              <span style="color:var(--subtext);margin-left:2px;font-size:11px;">ba</span>
            </td>
            <td><input class="sn-inline-input" id="mle-sqft"  value="${esc(row.sqft)}"  placeholder="Sq Ft" style="width:70px;"></td>
            <td><input class="sn-inline-input" id="mle-notes" value="${esc(row.notes)}" placeholder="Notes" style="min-width:150px;"></td>
            <td class="fc-action-cell" style="white-space:nowrap;">
              <button class="btn-save-inline" onclick="saveInlineModel(${i})">✓ Save</button>
              <button class="btn-cancel-inline" onclick="cancelInlineModel()">✕</button>
            </td>
          </tr>`);
      } else {
        // ── READ ROW ──
        tbody.insertAdjacentHTML('beforeend', `
          <tr id="ml-row-${i}">
            <td><span style="font-weight:800;font-size:13px;color:var(--white);letter-spacing:0.02em;">${row.model}</span></td>
            <td><span class="pill ${(row.type||'HUD')==='HUD'?'pill-blue':(row.type)==='Park Model'?'pill-orange':'pill-green'}" style="font-size:9px;">${row.type||'HUD'}</span></td>
            <td style="font-size:11px;color:var(--subtext);font-family:monospace;">${row.code}</td>
            <td><span class="pill ${section === 'Single' ? 'pill-gray' : 'pill-blue'}" style="font-size:9px;">${section}</span></td>
            <td style="font-weight:600;color:var(--text);white-space:nowrap;">${displaySize}</td>
            <td style="font-size:11px;color:var(--subtext);white-space:nowrap;">${getDisplaySize(row.totalBox || row.box)}</td>
            <td><span class="pill ${bedColor}" style="font-size:10px;">${row.bed} bd / ${row.bath} ba</span></td>
            <td>
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:12px;font-weight:600;color:var(--white);min-width:42px;">${parseInt(row.sqft).toLocaleString()}</span>
                <div style="flex:1;min-width:60px;height:4px;background:var(--border);border-radius:2px;overflow:hidden;">
                  <div style="width:${pct}%;height:100%;background:var(--green);border-radius:2px;"></div>
                </div>
              </div>
            </td>
            <td style="font-size:11px;color:var(--subtext);font-style:${row.notes ? 'normal' : 'italic'};">${row.notes || '—'}</td>
            <td class="fc-action-cell" style="white-space:nowrap;">
              <button class="btn-edit" onclick="editModelRow(${i})" style="margin-bottom:4px;">✏️ Edit</button><br>
              ${row.salesPrint
                ? `<button class="btn-sales-print" onclick="openSalesPDF(${i})">📄 Sales Print</button>
                   <button class="btn-upload-print" onclick="triggerPDFUpload(${i})" style="margin-top:3px;font-size:10px;padding:3px 8px;">↩ Replace</button>`
                : `<button class="btn-upload-print" onclick="triggerPDFUpload(${i})">⬆ Upload PDF</button>`
              }
            </td>
          </tr>`);
      }
    });

    document.getElementById('model-count').textContent = visible + ' of ' + modelData.length + ' models';
  }

  function editModelRow(i) {
    modelEditingIndex = i;
    renderModelTable();
    const row = document.getElementById('ml-row-' + i);
    if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => { const f = document.getElementById('mle-model'); if (f) f.focus(); }, 100);
  }

  function saveInlineModel(i) {
    modelData[i].model = document.getElementById('mle-model').value.trim();
    modelData[i].type  = document.getElementById('mle-type').value;
    modelData[i].code  = document.getElementById('mle-code').value.trim();
    modelData[i].box   = document.getElementById('mle-box').value.trim();
    modelData[i].bed   = document.getElementById('mle-bed').value.trim();
    modelData[i].bath  = document.getElementById('mle-bath').value.trim();
    modelData[i].sqft  = document.getElementById('mle-sqft').value.trim();
    modelData[i].notes = document.getElementById('mle-notes').value.trim();
    modelEditingIndex = -1;
    renderModelTable();
  }

  function cancelInlineModel() {
    modelEditingIndex = -1;
    renderModelTable();
  }

  function filterModelTable(q) {
    modelSearchFilter = q.toLowerCase();
    renderModelTable();
  }

  function filterModelBySection(s) {
    modelSectionFilter = s;
    renderModelTable();
  }

  function filterModelByWidth(w) {
    modelWidthFilter = w;
    renderModelTable();
  }

  // Init model table on load
  renderModelTable();

  // ── SALES PRINT PDF SYSTEM ──

  // Hidden file input container (one reusable input)
  const _pdfInput = document.createElement('input');
  _pdfInput.type = 'file';
  _pdfInput.accept = 'application/pdf';
  _pdfInput.style.display = 'none';
  document.body.appendChild(_pdfInput);

  let _pdfUploadTarget = -1;

  function triggerPDFUpload(i) {
    _pdfUploadTarget = i;
    _pdfInput.value = '';
    _pdfInput.click();
  }

  _pdfInput.addEventListener('change', function() {
    const file = this.files[0];
    if (!file || _pdfUploadTarget < 0) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      modelData[_pdfUploadTarget].salesPrint = e.target.result; // store as data URL
      modelData[_pdfUploadTarget].salesPrintName = file.name;
      _pdfUploadTarget = -1;
      renderModelTable();
    };
    reader.readAsDataURL(file);
  });

  // Store blob URLs so we can revoke them
  let _currentBlobURL = null;
  let _currentPrintBlobURL = null;

  function openSalesPDF(i) {
    const row = modelData[i];
    if (!row.salesPrint) return;

    // Revoke previous blob URLs to free memory
    if (_currentBlobURL) { URL.revokeObjectURL(_currentBlobURL); _currentBlobURL = null; }
    if (_currentPrintBlobURL) { URL.revokeObjectURL(_currentPrintBlobURL); _currentPrintBlobURL = null; }

    // Convert data URL to blob, then create blob URL with #zoom=FitH
    // This forces the PDF to fill the viewer width regardless of page size
    fetch(row.salesPrint)
      .then(r => r.blob())
      .then(blob => {
        _currentBlobURL = URL.createObjectURL(blob);
        _currentPrintBlobURL = URL.createObjectURL(blob);

        document.getElementById('pdf-modal-title').textContent = row.model + ' — Sales Print';
        document.getElementById('pdf-frame').src = _currentBlobURL + '#zoom=FitH&scrollbar=0&toolbar=1&navpanes=0';

        document.getElementById('pdf-modal').style.display = 'block';
        document.body.style.overflow = 'hidden';
      });
  }

  function closePdfModal() {
    document.getElementById('pdf-modal').style.display = 'none';
    document.getElementById('pdf-frame').src = '';
    document.body.style.overflow = '';
    if (_currentBlobURL) { URL.revokeObjectURL(_currentBlobURL); _currentBlobURL = null; }
    if (_currentPrintBlobURL) { URL.revokeObjectURL(_currentPrintBlobURL); _currentPrintBlobURL = null; }
  }

  function printSalesPDF() {
    if (!_currentPrintBlobURL) return;
    // Open in a new tab — browser's native PDF viewer handles landscape + full-page print reliably
    const tab = window.open(_currentPrintBlobURL, '_blank');
    if (tab) {
      tab.addEventListener('load', () => {
        try { tab.print(); } catch(e) {}
      });
    }
  }

  // Close modal on backdrop click
  document.getElementById('pdf-modal').addEventListener('click', function(e) {
    if (e.target === this) closePdfModal();
  });

  // Close modal on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closePdfModal();
  });

  function filterByMonth(month) {
    const rows = document.querySelectorAll('#sched-table tbody tr');
    rows.forEach(r => {
      if (!month) { r.style.display = ''; return; }
      r.style.display = r.textContent.includes(month) ? '' : 'none';
    });
  }

  // ── ALL INITS — called here so all data arrays are defined first ──
  populateOrderDropdowns();
  renderOrderTable();
  populatePsDropdowns();
  renderProdTable();
  renderFinanceTable(financeData);
  renderDealerTable(dealerData);
  renderSerialTable(serialData);
  renderModelTable();
  populateAcctDropdowns();
  renderAcctTable();
  renderReworkTable();
  renderYardTable();
  renderShipTable();
