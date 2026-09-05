import psutil
import platform
import time
from datetime import datetime

class SystemMonitor:
    def __init__(self):
        self.start_time = time.time()
    
    def get_system_info(self):
        """Get real-time system metrics with robust error handling"""
        try:
            # Get CPU usage with retry logic
            cpu_percent = 0
            try:
                # First try with interval
                cpu_percent = psutil.cpu_percent(interval=0.3)
            except Exception as cpu_err:
                print(f"CPU interval error: {cpu_err}")
                try:
                    # Fallback to immediate reading
                    cpu_percent = psutil.cpu_percent(interval=None)
                except:
                    cpu_percent = 0
            
            # Get Memory usage
            memory_percent = 0
            memory_total = 0
            memory_used = 0
            try:
                memory = psutil.virtual_memory()
                memory_percent = memory.percent
                memory_total = memory.total
                memory_used = memory.used
            except Exception as mem_err:
                print(f"Memory error: {mem_err}")
            
            # Get Disk usage (for Windows, use C: drive)
            disk_percent = 0
            try:
                if platform.system() == "Windows":
                    disk = psutil.disk_usage('C:\\')
                else:
                    disk = psutil.disk_usage('/')
                disk_percent = disk.percent
            except Exception as disk_err:
                print(f"Disk error: {disk_err}")
            
            # Get Network stats
            network_sent = 0
            network_recv = 0
            try:
                net_io = psutil.net_io_counters()
                network_sent = net_io.bytes_sent
                network_recv = net_io.bytes_recv
            except Exception as net_err:
                print(f"Network error: {net_err}")
            
            # Get System Uptime
            uptime_minutes = 0
            try:
                boot_time = psutil.boot_time()
                uptime_seconds = time.time() - boot_time
                uptime_minutes = int(uptime_seconds // 60)
            except Exception as uptime_err:
                print(f"Uptime error: {uptime_err}")
            
            # Get Process Count - more reliable method
            process_count = 0
            heavy_processes_count = 0
            try:
                # Try to get actual process count
                process_count = len(psutil.pids())
                
                # Count heavy processes (CPU > 10%)
                for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
                    try:
                        if proc.info['cpu_percent'] and proc.info['cpu_percent'] > 10:
                            heavy_processes_count += 1
                    except:
                        continue
            except Exception as proc_err:
                print(f"Process count error: {proc_err}")
            
            # Get CPU cores
            cpu_cores = 0
            cpu_logical = 0
            try:
                cpu_cores = psutil.cpu_count(logical=False) or 0
                cpu_logical = psutil.cpu_count(logical=True) or 0
            except:
                pass
            
            return {
                "cpu": round(cpu_percent, 1),
                "cpu_cores": cpu_cores,
                "cpu_logical": cpu_logical,
                
                "memory": round(memory_percent, 1),
                "memory_total": memory_total,
                "memory_used": memory_used,
                "memory_free": memory_total - memory_used if memory_total > 0 else 0,
                
                "disk": round(disk_percent, 1),
                "disk_total": disk.total if 'disk' in locals() else 0,
                "disk_used": disk.used if 'disk' in locals() else 0,
                "disk_free": disk.free if 'disk' in locals() else 0,
                
                "network_sent": network_sent,
                "network_recv": network_recv,
                
                "process_count": process_count,
                "heavy_processes_count": heavy_processes_count,
                "uptime": uptime_minutes,
                "platform": platform.platform(),
                "hostname": platform.node(),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"⚠️ Critical monitoring error: {e}")
            # Return minimal real data without dummy values
            try:
                # Get at least platform info
                return {
                    "cpu": psutil.cpu_percent(interval=0.1) if hasattr(psutil, 'cpu_percent') else 0,
                    "memory": psutil.virtual_memory().percent if hasattr(psutil, 'virtual_memory') else 0,
                    "process_count": len(psutil.pids()) if hasattr(psutil, 'pids') else 0,
                    "heavy_processes_count": 0,
                    "uptime": 0,
                    "platform": platform.platform(),
                    "timestamp": datetime.now().isoformat()
                }
            except:
                # Absolute fallback - NO DUMMY DATA
                return {
                    "cpu": 0,
                    "memory": 0,
                    "process_count": 0,
                    "heavy_processes_count": 0,
                    "uptime": 0,
                    "platform": "Unknown",
                    "timestamp": datetime.now().isoformat()
                }
    
    def get_processes(self):
        """Get all running processes with better error handling"""
        processes = []
        try:
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'status', 'username']):
                try:
                    pinfo = proc.info
                    # Ensure we have valid values
                    processes.append({
                        "pid": pinfo.get('pid', 0),
                        "name": pinfo.get('name', 'Unknown'),
                        "cpu_percent": pinfo.get('cpu_percent', 0.0),
                        "memory_percent": pinfo.get('memory_percent', 0.0),
                        "status": pinfo.get('status', 'unknown'),
                        "user": pinfo.get('username', 'SYSTEM') or "SYSTEM"
                    })
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    continue
                except Exception as proc_err:
                    print(f"Process info error: {proc_err}")
                    continue
            
            # Sort by CPU usage (highest first)
            processes.sort(key=lambda x: x['cpu_percent'], reverse=True)
            return processes
            
        except Exception as e:
            print(f"❌ Process monitoring error: {e}")
            # Return empty list, NOT dummy data
            return []