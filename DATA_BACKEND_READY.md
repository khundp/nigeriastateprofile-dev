# Data and backend-ready structure

This project is set up for fast loading with cached JSON files.

## Frontend loading pattern

- `data/states.json` is the small landing-page summary used by the map and cards.
- `data/states/lagos.json` is the full state profile metadata.
- `data/charts/lagos.json` is loaded only on the Lagos profile page, so chart data does not slow down the landing page.

## Recommended backend flow

1. Admin updates content in Supabase, Strapi, Directus, or another CMS/database.
2. Backend validates and exports JSON files into the same structure.
3. The static frontend loads the JSON files from the CDN/web host.

This avoids live database calls for every visitor and keeps page load fast.

## JSON paths

```text
data/
  states.json
  states/
    lagos.json
  charts/
    lagos.json
```

## Future API export example

A backend endpoint or scheduled script can generate these files after every update:

```text
/api/admin/publish-state/lagos
  -> reads database
  -> writes data/states/lagos.json
  -> writes data/charts/lagos.json
  -> updates data/states.json
```
