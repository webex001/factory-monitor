# factory-monitor

Live production-line monitoring for a hydraulic valve factory — a React +
TypeScript frontend, plus a mock backend standing in for Domin's real
DAQ → processing → PostgreSQL → REST API pipeline. Three screens: **Stations**
(live list + filters + CSV export), **Dashboard** (KPIs, a utilisation chart,
and a 24h status timeline), and **Floor map** (a shop-floor layout with a
station detail side panel).
