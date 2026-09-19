# Intelligent Resource Optimization Engine

A real-time desktop system monitor and optimizer that tracks CPU and memory usage, analyzes running processes, and automatically frees up resources when things get heavy. It is build with a Python (FastAPI) backend and an Electron.js desktop UI.

---

## 🚀 Features

📊 Real-time Monitoring
Live CPU usage, memory usage, active process count, and system uptime
Auto-refreshing performance history charts (CPU & Memory, last 30 data points)
🧠 Intelligent Priority Analyzer
Automatically categorizes every running process as Critical, Warning, or Safe to End
Surfaces top recommendations, flags heavy processes that can safely be paused/closed
Built-in safety list protects core Windows system processes (e.g. svchost.exe, lsass.exe, services.exe, dwm.exe) so they can never be accidentally terminated from the app
🗂️ Process Manager
Searchable, live-updating table of all running processes with PID, name, CPU %, memory %, and status
One-click "End" for safe, non-critical processes, with a "Details" view for any process
Protected/critical processes only show "Details". There is no risk of ending something essential
⚙️ One-Click Optimization
Boost Performance : clears temporary files and optimizes system resources
Free Up Memory : triggers cleanup to free RAM
Balance Load : identifies and reports heavy processes for load balancing
🤖 Auto-Optimization
Toggle automatic optimization on/off
Set custom CPU and Memory usage thresholds
When usage crosses your threshold, the app automatically runs an optimization pass, no manual action needed

---

## 🛠 Tech Stack

### Backend
- Python
- Optimization Algorithms
- Resource Monitoring

### Frontend / UI
- Electron.js
- JavaScript
- HTML & CSS

---

## 📂 Project Structure

Intelligent-Resource-Optimization-Engine/
│
├── electron-ui/
│   ├── frontend/           # HTML, CSS, and renderer JS for the UI
│   ├── main.js             # Electron main process
│   ├── preload.js          # Secure bridge between main and renderer
│   ├── package.json
│   └── package-lock.json
│
├── python-backend/
│   ├── analyzer.py         # Process categorization logic
│   ├── monitor.py          # System metrics & process data collection
│   ├── optimizer.py        # Optimization actions (boost, clean balance, kill)
│   ├── app.py               # FastAPI server & API routes
│   └── requirements.txt
│
├── README.md
├── RUN.BAT                 # Convenience script to launch backend + UI
└── .gitignore


## ⚙️ Setup & Run

### 1. Start the backend
```bash
cd python-backend
pip install -r requirements.txt
python app.py
```
Keep this terminal running — the backend serves the API at `http://localhost:8000`.

### 2. Start the desktop app
In a **new** terminal:
```bash
cd electron-ui
npm install
npm start
```

> Both the backend and the Electron app need to be running at the same time for the app to work.

---

## 🧠 How It Works

| File | Role |
|---|---|
| `monitor.py` | Collects real-time CPU, memory, and process data |
| `analyzer.py` | Categorizes processes by risk/priority (Critical / Warning / Safe to End) |
| `optimizer.py` | Performs optimization actions and safely terminates processes |
| `app.py` | Exposes everything via a FastAPI backend the Electron UI talks to |
| `renderer.js` | Drives the dashboard UI, charts, and auto-optimization logic |

---

👩‍💻 Author
Urwa Jamil
GitHub: https://github.com/UrwaJamil
LinkedIn: www.linkedin.com/in/urwa-jamil-881454354