class SystemAnalyzer:
    def __init__(self):
        self.thresholds = {
            "cpu_critical": 90,
            "cpu_warning": 80,
            "memory_critical": 90,
            "memory_warning": 85
        }
    
    def analyze_processes(self, processes):
        """Analyze and categorize processes"""
        if not processes:
            return []
        
        analyzed = []
        for process in processes:
            # Add tags based on resource usage
            tags = []
            
            if process['cpu_percent'] > 70 or process['memory_percent'] > 70:
                tags.append("critical")
                status = "Critical"
            elif process['cpu_percent'] > 30 or process['memory_percent'] > 30:
                tags.append("heavy")
                status = "Warning"
            else:
                tags.append("normal")
                status = "Normal"
            
            # System or user process
            if process.get('user', '').lower() == 'system':
                tags.append("system")
            else:
                tags.append("user")
            
            # Create analyzed process object
            analyzed.append({
                **process,
                "tags": tags,
                "status": status,
                "can_kill": "system" not in tags and process['pid'] > 10
            })
        
        return analyzed
    
    def check_alerts(self, system_info):
        """Check for system alerts"""
        alerts = []
        
        if system_info['cpu'] > self.thresholds['cpu_critical']:
            alerts.append({
                "type": "critical",
                "title": "CPU Critical",
                "message": f"CPU usage critically high: {system_info['cpu']}%",
                "icon": "🔥"
            })
        elif system_info['cpu'] > self.thresholds['cpu_warning']:
            alerts.append({
                "type": "warning",
                "title": "CPU Warning",
                "message": f"CPU usage high: {system_info['cpu']}%",
                "icon": "⚠️"
            })
        
        if system_info['memory'] > self.thresholds['memory_critical']:
            alerts.append({
                "type": "critical",
                "title": "Memory Critical",
                "message": f"Memory usage critically high: {system_info['memory']}%",
                "icon": "💥"
            })
        elif system_info['memory'] > self.thresholds['memory_warning']:
            alerts.append({
                "type": "warning",
                "title": "Memory Warning",
                "message": f"Memory usage high: {system_info['memory']}%",
                "icon": "⚠️"
            })
        
        return alerts