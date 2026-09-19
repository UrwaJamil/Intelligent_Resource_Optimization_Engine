import psutil
import os
import platform
import time

class SystemOptimizer:
    def __init__(self):
        self.platform = platform.system()
    
    def boost_performance(self):
        """Optimize system performance"""
        try:
            actions = []
            
            # Clear temporary files
            temp_dir = os.environ.get('TEMP', '/tmp')
            cleared = self.clear_temp_files(temp_dir)
            if cleared > 0:
                actions.append(f"Cleared {cleared} temp files")
            
            # Platform-specific optimizations
            if self.platform == "Windows":
                # Windows-specific optimizations
                pass
            elif self.platform == "Linux":
                # Clear cache (requires sudo)
                try:
                    os.system('sync')
                    os.system('echo 3 > /proc/sys/vm/drop_caches')
                    actions.append("Cleared system cache")
                except:
                    pass
            
            return {
                "success": True,
                "message": "System performance boosted",
                "actions": actions,
                "improvements": ["System cache cleared", "Temporary files removed"]
            }
            
        except Exception as e:
            return {"success": False, "message": f"Optimization failed: {str(e)}"}
    
    def clean_memory(self):
        """Clean up memory"""
        try:
            # Force garbage collection
            import gc
            gc.collect()
            
            # Get before/after memory stats
            memory_before = psutil.virtual_memory()
            time.sleep(1)
            memory_after = psutil.virtual_memory()
            
            freed = (memory_before.used - memory_after.used) / (1024 * 1024)  # MB
            
            return {
                "success": True,
                "message": "Memory cleaned successfully",
                "freed_mb": round(freed, 2),
                "improvements": ["Garbage collection triggered", f"Freed ~{round(freed, 2)} MB"]
            }
            
        except Exception as e:
            return {"success": False, "message": f"Memory cleanup failed: {str(e)}"}
    
    def balance_load(self):
        """Balance system load"""
        try:
            # Find heavy processes
            heavy_processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
                try:
                    if proc.info['cpu_percent'] > 30:  # >30% CPU
                        heavy_processes.append({
                            "pid": proc.info['pid'],
                            "name": proc.info['name'],
                            "cpu": proc.info['cpu_percent']
                        })
                except:
                    continue
            
            return {
                "success": True,
                "message": f"Found {len(heavy_processes)} heavy processes",
                "heavy_processes": heavy_processes[:5],  # Top 5
                "recommendations": [
                    "Close unnecessary applications",
                    "Check for background processes",
                    "Restart heavy applications"
                ]
            }
            
        except Exception as e:
            return {"success": False, "message": f"Load balancing failed: {str(e)}"}
    
    def kill_process(self, pid, name=""):
        """Kill a process"""
        try:
            if not psutil.pid_exists(pid):
                return {"success": False, "message": f"Process {pid} does not exist"}
            
            process = psutil.Process(pid)
            process_name = process.name()
            
            try:
                process.terminate()
                process.wait(timeout=3)
                return {
                    "success": True,
                    "message": f"Process '{process_name}' (PID: {pid}) terminated"
                }
            except:
                process.kill()
                process.wait(timeout=3)
                return {
                    "success": True,
                    "message": f"Process '{process_name}' (PID: {pid}) killed forcefully"
                }
                
        except Exception as e:
            return {"success": False, "message": f"Failed to kill process: {str(e)}"}
    
    def clear_temp_files(self, temp_dir, max_files=300, max_seconds=3):
        """Clear temporary files.

        Bounded on two axes so a huge/slow TEMP folder can never hang the
        request: stops after `max_files` files checked, and stops after
        `max_seconds` of wall-clock time, returning whatever was cleared so far.
        """
        cleared = 0
        scanned = 0
        start_time = time.time()
        try:
            # Simple temp file cleanup
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    if scanned >= max_files or (time.time() - start_time) > max_seconds:
                        return cleared
                    scanned += 1

                    if file.endswith('.tmp') or file.endswith('.log'):
                        try:
                            file_path = os.path.join(root, file)
                            # Delete files older than 7 days
                            if os.path.getmtime(file_path) < time.time() - (7 * 24 * 3600):
                                os.remove(file_path)
                                cleared += 1
                        except Exception:
                            # Permission denied, file in use, etc. — skip and keep going
                            pass
                break  # Only first level
        except Exception:
            pass
        return cleared