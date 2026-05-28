# Local database and admin backend

This version adds a small Node.js admin backend with SQLite for local testing.

## What the admin can do

- Log in with username and password.
- Edit state profile fields such as name, zone, capital, summary and headline metrics.
- Upload chart indicators by CSV.
- Publish database content back into the JSON files already used by the portal.

## Run locally

```bash
npm install
cp .env.example .env
npm start
```

Open:

```text
Public portal: http://localhost:3000
Admin panel:   http://localhost:3000/admin
```

Default login from `.env.example`:

```text
Username: admin
Password: ChangeMe123!
```

Change the password before using the project outside your computer.

## CSV upload format

Use this header:

```csv
state,group,indicator,state_value,nigeria_value,peer_value,year
```

Example:

```csv
lagos,human,Multidimensional Poverty (%),29.4,62.9,35.7,2022
```

A template is included at:

```text
templates/lagos_chart_indicators_template.csv
```

## How publishing works

The admin edits the SQLite database, then regenerates:

```text
data/states.json
data/states/<state>.json
data/charts/<state>.json
```

The existing frontend can continue loading JSON quickly without calling the database for every visitor.

## Later Hostinger hosting

Two good options:

1. Keep this Node.js backend and deploy it on a Hostinger plan that supports Node.js apps.
2. Convert the backend database from SQLite to MySQL for production hosting.

For production, do not use the default `.env` password, set a strong `SESSION_SECRET`, and use HTTPS.


## CSV export/download

In the admin page, use **Download current CSV for selected state** to export the current chart/indicator data for the selected state. Edit the downloaded CSV by adding, removing, or changing rows, then upload it again using **Upload CSV and publish**.

The CSV controls chart indicators only, using these columns:

```csv
state,group,indicator,state_value,nigeria_value,peer_value,year
```

Uploading a CSV replaces the chart indicator rows for the state values included in the `state` column.
