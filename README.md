# AI Placement Predictor — Institutional Career Readiness & Upskilling Engine

A production-ready, explainable AI analytics platform built for **Innovate Chennai Hackathon 2026**. Designed specifically for students and Training & Placement Officers (TPOs) to decode employability DNA, diagnose specific skill deficits, auto-generate personalized phased career roadmaps, and equip placement departments with actionable batch-wide cohort telemetry.

---

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Brand Indigo `#4f46e5`, Status Green `#16a34a`, Status Amber `#d97706`, Status Red `#dc2626`, and Cyber Glassmorphism)
- **Data Visualization**: Recharts (Radial Gauges, SHAP Feature Contribution Bar Charts, Multi-line Trend Curves, Department Distribution Bars)
- **Icons**: Lucide React
- **Networking & Cache**: Axios + `@tanstack/react-query` (with normalized error interceptor)
- **State Management**: React Context (`StudentContext`) — *strictly zero localStorage*
- **Data Ingestion**: PapaParse (CSV Drag-and-Drop + Interactive Preview)
- **Routing**: React Router DOM v6

---

## Project Structure

```
ai-placement-predictor/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── assets/
    │   └── sample_students.csv
    ├── components/
    │   ├── common/
    │   │   ├── Navbar.jsx
    │   │   ├── ErrorBanner.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   └── StatusBadge.jsx
    │   ├── student/
    │   │   ├── CsvUploadPanel.jsx
    │   │   ├── ProfileInputForm.jsx
    │   │   ├── PlacementProbabilityGauge.jsx
    │   │   ├── FactorContributionChart.jsx
    │   │   ├── PredictedRolesCard.jsx
    │   │   └── UpskillingRoadmap.jsx
    │   └── tpo/
    │       ├── DepartmentReadinessCards.jsx
    │       ├── CohortVulnerabilityTable.jsx
    │       └── SkillDeficitHeatmap.jsx
    ├── context/
    │   └── StudentContext.jsx
    ├── hooks/
    │   ├── usePredictPlacement.js
    │   ├── useTpoAnalytics.js
    │   └── useUpskillingRoadmap.js
    ├── pages/
    │   ├── StudentDiagnostics.jsx
    │   └── TpoDashboard.jsx
    ├── services/
    │   ├── api.js
    │   ├── predictionService.js
    │   ├── roadmapService.js
    │   └── tpoService.js
    └── utils/
        ├── readiness.js
        ├── validators.js
        └── mockData.js
```

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Backend URL
Set `VITE_API_BASE_URL` in `.env` (defaults to `http://localhost:8000`):
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## API Contract Specifications

The application connects to 3 endpoints defined in Section 5 / Part C:

1. **POST `/api/predict`**: Accepts student profile dimensions and returns placement probability (0-100%), readiness status (`Ready`, `Near-Ready`, `Needs Training`), SHAP factor contributions (`readable_string`), and target role mappings.
2. **POST `/api/roadmap`**: Dynamically returns structured 3-phase recommendations with estimated time-to-completion, target skills, and actionable milestones.
3. **GET `/api/tpo/analytics`**: Returns department-wide readiness percentages, vulnerable cohort filters (`<60%`), and the department $\times$ skill deficit matrix.

*Note: All endpoints seamlessly fallback to realistic mock data whenever the backend server is offline, allowing complete UI inspection out of the box.*
