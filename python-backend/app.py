from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from monitor import SystemMonitor
from optimizer import SystemOptimizer
from analyzer import SystemAnalyzer

app = FastAPI(title="Intelligent Resource Optimizer API")

# Allow Electron to access (IMPORTANT!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

monitor = SystemMonitor()
optimizer = SystemOptimizer()
analyzer = SystemAnalyzer()

@app.get("/")
def root():
    return {"message": "Resource Optimizer API Running", "status": "active"}

@app.get("/api/system-metrics")
async def get_system_metrics():
    """Real-time CPU, Memory, Disk, Network data"""
    try:
        metrics = monitor.get_system_info()
        
        # Heavy processes count calculate karo
        heavy_count = 0
        processes = monitor.get_processes()
        for proc in processes[:50]:  # First 50 processes check karo
            if proc.get('cpu_percent', 0) > 30 or proc.get('memory_percent', 0) > 30:
                heavy_count += 1
        
        return JSONResponse(content={
            "success": True,
            "cpu": metrics["cpu"],
            "memory": metrics["memory"],
            "process_count": metrics["process_count"],
            "uptime": metrics["uptime"],
            "platform": metrics["platform"],
            "timestamp": metrics["timestamp"],
            "heavy_processes_count": heavy_count  # ✅ YEH ADD KARO
        })
    except Exception as e:
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)

@app.get("/api/processes")
async def get_processes():
    """Get all running processes"""
    try:
        processes = monitor.get_processes()
        analyzed = analyzer.analyze_processes(processes)
        return JSONResponse(content={
            "success": True,
            "processes": analyzed[:50]  # First 50 processes
        })
    except Exception as e:
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)

@app.post("/api/optimize")
async def optimize_system(data: dict):
    """Perform system optimization"""
    try:
        opt_type = data.get("type", "boost")
        
        if opt_type == "boost":
            result = optimizer.boost_performance()
        elif opt_type == "memory":
            result = optimizer.clean_memory()
        elif opt_type == "balance":
            result = optimizer.balance_load()
        else:
            return JSONResponse(content={"success": False, "message": "Invalid optimization type"})
        
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)

@app.post("/api/kill-process")
async def kill_process(data: dict):
    """Kill a specific process"""
    try:
        pid = data.get("pid")
        name = data.get("name", "")
        
        if not pid:
            return JSONResponse(content={"success": False, "message": "PID required"})
        
        result = optimizer.kill_process(pid, name)
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse(content={"status": "healthy", "service": "System Monitor API"})

if __name__ == "__main__":
    print("🚀 Starting Python Backend...")
    print("🌐 API: http://localhost:8000")
    print("📊 Endpoints:")
    print("  • GET  /api/system-metrics")
    print("  • GET  /api/processes")
    print("  • POST /api/optimize")
    print("  • POST /api/kill-process")
    print("  • GET  /api/health")
    print("\n⚠️  Keep this running, then start Electron app!")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)