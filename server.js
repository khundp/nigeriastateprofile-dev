require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { parse } = require('csv-parse/sync');

const app = express();
const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const DB_DIR = path.join(ROOT, 'db');
const DB_FILE = path.join(DB_DIR, 'portal-db.json');
fs.mkdirSync(DB_DIR, { recursive: true });

const upload = multer({ dest: path.join(ROOT, 'uploads'), limits: { fileSize: 5 * 1024 * 1024 } });

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '2mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false
}));

function today() {
  return new Date().toISOString().slice(0, 10);
}

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function createInitialDb() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const db = {
    admins: [{ username, password_hash: bcrypt.hashSync(password, 10) }],
    states: [],
    chart_indicators: []
  };

  const statesFile = path.join(DATA, 'states.json');
  const states = readJson(statesFile, []);
  db.states = states.map(s => ({
    slug: s.slug,
    name: s.name,
    zone: s.zone || '',
    capital: s.capital || '',
    summary: s.summary || 'View state profile indicators, maps and development insights.',
    image: s.image || `assets/state-images/${s.slug}.jpg`,
    availableProfile: !!s.availableProfile,
    updated_at: s.updated_at || today(),
    hero_metrics: s.hero_metrics || {}
  }));

  const chartsDir = path.join(DATA, 'charts');
  if (fs.existsSync(chartsDir)) {
    for (const file of fs.readdirSync(chartsDir).filter(f => f.endsWith('.json'))) {
      const chart = readJson(path.join(chartsDir, file), null);
      if (!chart || !chart.groups) continue;
      Object.entries(chart.groups).forEach(([group, rows]) => {
        rows.forEach(r => db.chart_indicators.push({
          state_slug: chart.state || path.basename(file, '.json'),
          group_name: group,
          indicator: r[0],
          state_value: Number(r[1]),
          nigeria_value: Number(r[2]),
          peer_value: Number(r[3]),
          year: String(r[4] || '')
        }));
      });
    }
  }
  return db;
}

function loadDb() {
  if (!fs.existsSync(DB_FILE)) writeJson(DB_FILE, createInitialDb());
  return readJson(DB_FILE, createInitialDb());
}

function saveDb(db) {
  writeJson(DB_FILE, db);
}

function requireAuth(req, res, next) {
  if (req.session.admin) return next();
  res.redirect('/admin/login.html');
}

function publish() {
  const db = loadDb();
  fs.mkdirSync(path.join(DATA, 'states'), { recursive: true });
  fs.mkdirSync(path.join(DATA, 'charts'), { recursive: true });

  const states = [...db.states].sort((a, b) => a.name.localeCompare(b.name));
  const summary = states.map(s => ({
    slug: s.slug,
    name: s.name,
    zone: s.zone,
    image: s.image || `assets/state-images/${s.slug}.jpg`,
    availableProfile: !!s.availableProfile,
    summary: s.summary || 'View state profile indicators, maps and development insights.'
  }));
  writeJson(path.join(DATA, 'states.json'), summary);

  for (const s of states) {
    const hero = s.hero_metrics || {};
    writeJson(path.join(DATA, 'states', `${s.slug}.json`), {
      slug: s.slug,
      name: s.name,
      zone: s.zone,
      capital: s.capital || '',
      updated_at: s.updated_at || today(),
      summary: s.summary || '',
      hero_metrics: { ...hero, zone: s.zone }
    });

    const rows = db.chart_indicators
      .filter(r => r.state_slug === s.slug)
      .sort((a, b) => `${a.group_name}`.localeCompare(`${b.group_name}`));
    const groups = {};
    rows.forEach(r => {
      (groups[r.group_name] ||= []).push([r.indicator, r.state_value, r.nigeria_value, r.peer_value, r.year]);
    });
    writeJson(path.join(DATA, 'charts', `${s.slug}.json`), { state: s.slug, updated_at: today(), groups });
  }
}

loadDb();

app.get('/admin', requireAuth, (req, res) => res.sendFile(path.join(ROOT, 'admin', 'index.html')));

app.post('/admin/login', (req, res) => {
  const db = loadDb();
  const user = db.admins.find(a => a.username === (req.body.username || ''));
  if (user && bcrypt.compareSync(req.body.password || '', user.password_hash)) {
    req.session.admin = user.username;
    return res.redirect('/admin');
  }
  res.status(401).send('Invalid username or password. Go back and try again.');
});

app.get('/admin/logout', (req, res) => req.session.destroy(() => res.redirect('/admin/login.html')));

app.get('/api/admin/states', requireAuth, (req, res) => {
  const db = loadDb();
  res.json({ states: [...db.states].sort((a, b) => a.name.localeCompare(b.name)) });
});

function csvEscape(value) {
  const s = value === undefined || value === null ? '' : String(value);
  return /[\",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}


app.get('/api/admin/chart-data', requireAuth, (req, res) => {
  const db = loadDb();
  const rows = db.chart_indicators
    .map(r => ({
      state: r.state_slug,
      group: r.group_name,
      indicator: r.indicator,
      state_value: r.state_value,
      nigeria_value: r.nigeria_value,
      peer_value: r.peer_value,
      year: r.year
    }))
    .sort((a, b) => `${a.state}|${a.group}|${a.indicator}|${a.year}`.localeCompare(`${b.state}|${b.group}|${b.indicator}|${b.year}`));
  res.json({ rows });
});

function titleCaseSlug(slug) {
  return String(slug || '')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

app.get('/api/admin/export-chart-csv', requireAuth, (req, res) => {
  const db = loadDb();
  const selectedState = (req.query.state || '').trim();
  const rows = db.chart_indicators
    .filter(r => !selectedState || r.state_slug === selectedState)
    .sort((a, b) => `${a.state_slug}|${a.group_name}|${a.indicator}`.localeCompare(`${b.state_slug}|${b.group_name}|${b.indicator}`));

  const header = ['state', 'group', 'indicator', 'state_value', 'nigeria_value', 'peer_value', 'year'];
  const csvRows = [header.join(',')];
  rows.forEach(r => csvRows.push([
    r.state_slug,
    r.group_name,
    r.indicator,
    r.state_value,
    r.nigeria_value,
    r.peer_value,
    r.year
  ].map(csvEscape).join(',')));

  const filename = selectedState ? `${selectedState}_chart_indicators_current.csv` : 'all_chart_indicators_current.csv';
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvRows.join('\n'));
});

app.post('/api/admin/state', requireAuth, (req, res) => {
  const db = loadDb();
  const s = req.body;
  const idx = db.states.findIndex(x => x.slug === s.slug);
  if (idx === -1) return res.status(404).send('State not found');
  db.states[idx] = {
    ...db.states[idx],
    name: s.name,
    zone: s.zone,
    capital: s.capital,
    summary: s.summary,
    availableProfile: true,
    updated_at: today(),
    hero_metrics: s.hero_metrics || {}
  };
  saveDb(db);
  publish();
  res.json({ ok: true });
});

app.post('/api/admin/upload-csv', requireAuth, upload.single('csv'), (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No CSV uploaded');
    const text = fs.readFileSync(req.file.path, 'utf8');
    const rows = parse(text, { columns: true, skip_empty_lines: true, trim: true });
    const db = loadDb();
    const states = [...new Set(rows.map(r => String(r.state || '').trim().toLowerCase()).filter(Boolean))];
    for (const slug of states) {
      if (!db.states.some(s => s.slug === slug)) {
        db.states.push({
          slug,
          name: titleCaseSlug(slug),
          zone: '',
          capital: '',
          summary: 'View state profile indicators, maps and development insights.',
          image: `assets/state-images/${slug}.jpg`,
          availableProfile: false,
          updated_at: today(),
          hero_metrics: {}
        });
      }
    }
    db.chart_indicators = db.chart_indicators.filter(r => !states.includes(r.state_slug));
    rows.forEach(r => {
      const slug = String(r.state || '').trim().toLowerCase();
      if (!slug) return;
      db.chart_indicators.push({
        state_slug: slug,
        group_name: r.group,
        indicator: r.indicator,
        state_value: Number(r.state_value),
        nigeria_value: Number(r.nigeria_value ?? r.nigeria_val),
        peer_value: Number(r.peer_value),
        year: String(r.year || '')
      });
    });
    saveDb(db);
    publish();
    res.json({ ok: true, count: rows.length });
  } catch (e) {
    res.status(400).send(e.message);
  } finally {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
  }
});

app.post('/api/admin/publish', requireAuth, (req, res) => {
  publish();
  res.json({ ok: true });
});

app.use('/admin', express.static(path.join(ROOT, 'admin')));
app.use('/templates', express.static(path.join(ROOT, 'templates')));
app.use(express.static(ROOT));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Portal running at http://localhost:${port} | Admin: http://localhost:${port}/admin`));
