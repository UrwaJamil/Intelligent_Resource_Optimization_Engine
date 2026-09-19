// Intelligent Resource Optimizer Frontend
// Connects to Python FastAPI Backend

const API_BASE_URL = 'http://localhost:8000';

class ResourceOptimizerApp {
    constructor() {
        this.systemData = null;
        this.processes = [];
        this.settings = {
            autoOptimize: false,
            cpuThreshold: 80,
            memoryThreshold: 85,
            updateInterval: 2000
        };
        this.charts = {};
        this.dataHistory = { cpu: [], memory: [], time: [] };
        this.intervals = [];

        this.init();
    }

    async init() {
        console.log('🚀 Starting Resource Optimizer Frontend');
        console.log('🔗 Connecting to Python Backend:', API_BASE_URL);

        try {
            // Initialize UI
            this.initUI();

            // Initialize charts
            this.initCharts();

            // Setup event listeners
            this.setupEventListeners();

            // Load initial data
            await this.updateAllData();

            // Start auto-update
            this.startAutoUpdate();

            console.log('✅ Frontend initialized successfully');

        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Error', 'Failed to initialize app', 'error');
        }
    }

    initUI() {
        // Update current time every second
        setInterval(() => {
            document.getElementById('currentTime').textContent =
                new Date().toLocaleTimeString();
        }, 1000);

        // Update interval display
        document.getElementById('updateInterval').textContent =
            `${this.settings.updateInterval / 1000}s`;
    }

    initCharts() {
        const cpuCtx = document.getElementById('cpuChart');
        const memoryCtx = document.getElementById('memoryChart');

        if (!cpuCtx || !memoryCtx) {
            console.error('Canvas elements not found!');
            return;
        }

        // Set canvas dimensions explicitly
        const parentWidth = cpuCtx.parentElement.clientWidth;
        const parentHeight = cpuCtx.parentElement.clientHeight;

        // CPU Chart with FIXED configuration
        this.charts.cpu = new Chart(cpuCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'CPU Usage',
                    data: [],
                    borderColor: '#8EC9F8',
                    backgroundColor: 'rgba(142, 201, 248, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 2,
                    pointBackgroundColor: '#8EC9F8',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // CRITICAL: Allow stretching
                layout: {
                    padding: {
                        left: 5,
                        right: 5,
                        top: 5,
                        bottom: 5
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        min: 0,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: function (value) {
                                return value + '%';
                            },
                            stepSize: 20
                        },
                        border: {
                            display: false
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.02)',
                            display: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.5)',
                            maxTicksLimit: 8
                        },
                        border: {
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 300,
                    easing: 'easeOutQuart'
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                },
                elements: {
                    line: {
                        tension: 0.3
                    }
                }
            }
        });

        // Memory Chart with same configuration
        this.charts.memory = new Chart(memoryCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Memory Usage',
                    data: [],
                    borderColor: '#F69494',
                    backgroundColor: 'rgba(246, 148, 148, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 2,
                    pointBackgroundColor: '#F69494',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: 5,
                        right: 5,
                        top: 5,
                        bottom: 5
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        min: 0,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: function (value) {
                                return value + '%';
                            },
                            stepSize: 20
                        },
                        border: {
                            display: false
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.02)',
                            display: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.5)',
                            maxTicksLimit: 8
                        },
                        border: {
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 300,
                    easing: 'easeOutQuart'
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                },
                elements: {
                    line: {
                        tension: 0.3
                    }
                }
            }
        });

        console.log('📊 Charts initialized with fixed aspect ratio');
    }

    startAutoUpdate() {
        // Clear existing intervals
        this.intervals.forEach(clearInterval);
        this.intervals = [];

        // Set up auto-refresh
        const interval = setInterval(async () => {
            await this.updateAllData();
        }, this.settings.updateInterval);

        this.intervals.push(interval);
    }

    async updateAllData() {
        try {
            // Process table/Priority Analyzer have their own error handling and
            // DOM updates, so run them alongside the metrics fetch instead of
            // blocking one on the other.
            this.updateProcessTable();

            // Get system metrics
            const metricsResponse = await fetch(`${API_BASE_URL}/api/system-metrics`);
            if (!metricsResponse.ok) throw new Error('Failed to fetch system metrics');

            const metricsData = await metricsResponse.json();

            if (metricsData.success) {
                this.systemData = metricsData;
                this.updateSystemMetrics(metricsData);
                this.updateCharts(metricsData);

                // Check for auto-optimization
                this.checkAutoOptimization(metricsData);
            }

            // Update last updated time
            document.getElementById('lastUpdated').textContent =
                new Date().toLocaleTimeString();

        } catch (error) {
            console.error('Update error:', error);
            this.showNotification('Connection Error', 'Cannot connect to Python backend', 'error');
        }
    }

    updateSystemMetrics(data) {
        if (!data) return;

        // Update CPU
        const cpuEl = document.getElementById('cpuUsage');
        const cpuBar = document.getElementById('cpuBar');
        const cpuValue = data.cpu || 0;
        if (cpuEl) cpuEl.textContent = `${cpuValue.toFixed(1)}%`;
        if (cpuBar) {
            cpuBar.style.width = `${cpuValue}%`;
            cpuBar.style.transition = 'width 0.5s ease';
        }

        // Update Memory
        const memoryEl = document.getElementById('memoryUsage');
        const memoryBar = document.getElementById('memoryBar');
        const memoryValue = data.memory || 0;
        if (memoryEl) memoryEl.textContent = `${memoryValue.toFixed(1)}%`;
        if (memoryBar) {
            memoryBar.style.width = `${memoryValue}%`;
            memoryBar.style.transition = 'width 0.5s ease';
        }

        // Update other metrics
        document.getElementById('processCount').textContent = data.process_count || '0';
        document.getElementById('uptime').textContent = `${data.uptime || 0} min`;
        document.getElementById('platformInfo').textContent = data.platform || 'Unknown';

        // ✅ YEH NAYI LINE ADD KARO: Heavy Processes Count Update
        document.getElementById('heavyProcesses').textContent = data.heavy_processes_count || 0;

        // Update system status
        this.updateSystemStatus(data);
    }

    updateSystemStatus(data) {
        const cpu = parseFloat(data.cpu || 0);
        const memory = parseFloat(data.memory || 0);

        let status = 'Normal';
        let statusClass = 'normal';
        let color = '#85DB9F';

        if (cpu > 90 || memory > 90) {
            status = 'Critical';
            statusClass = 'critical';
            color = '#F69494';
        } else if (cpu > 80 || memory > 85) {
            status = 'Warning';
            statusClass = 'warning';
            color = '#f6d365';
        }

        document.getElementById('systemStatusText').textContent = status;
        document.querySelector('.status-dot').style.background = color;
        document.getElementById('systemStatusHeader').className = `system-status ${statusClass}`;
    }

    updateCharts(data) {
        if (!data || !this.charts.cpu || !this.charts.memory) {
            console.warn('Charts or data not available');
            return;
        }

        const now = new Date();
        const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        // Add to history
        this.dataHistory.cpu.push(parseFloat(data.cpu || 0));
        this.dataHistory.memory.push(parseFloat(data.memory || 0));
        this.dataHistory.time.push(timeLabel);

        // Keep last 30 points
        const maxPoints = 30;
        if (this.dataHistory.cpu.length > maxPoints) {
            this.dataHistory.cpu.shift();
            this.dataHistory.memory.shift();
            this.dataHistory.time.shift();
        }

        // Update charts smoothly
        try {
            this.charts.cpu.data.labels = [...this.dataHistory.time];
            this.charts.cpu.data.datasets[0].data = [...this.dataHistory.cpu];
            this.charts.cpu.update('none'); // 'none' for no animation during auto-update

            this.charts.memory.data.labels = [...this.dataHistory.time];
            this.charts.memory.data.datasets[0].data = [...this.dataHistory.memory];
            this.charts.memory.update('none');

        } catch (chartError) {
            console.error('Chart update error:', chartError);
        }
    }

    async updateProcessTable() {
        try {
            const tableBody = document.getElementById('processTableBody');
            // Only show the loading placeholder on the very first load — on
            // later refreshes, keep the existing rows until new data arrives
            // so the table doesn't flicker back to "Loading..." each cycle.
            if (this.processes.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="loading-text">
                            <i class="fas fa-spinner fa-spin"></i> Loading processes...
                        </td>
                    </tr>
                `;
            }

            const response = await fetch(`${API_BASE_URL}/api/processes`);
            if (!response.ok) throw new Error('Failed to fetch processes');

            const result = await response.json();

            if (result.success && result.processes.length > 0) {
                this.processes = result.processes;
                this.renderProcessTable(this.processes);
                this.updatePriorityAnalyzer(this.processes);
            } else {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="loading-text">
                            <i class="fas fa-exclamation-triangle"></i> No processes found
                        </td>
                    </tr>
                `;
            }

        } catch (error) {
            console.error('Process table error:', error);
            const tableBody = document.getElementById('processTableBody');
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="loading-text">
                        <i class="fas fa-exclamation-circle"></i> Error loading processes
                    </td>
                </tr>
            `;
        }
    }

    renderProcessTable(processes) {
        const tableBody = document.getElementById('processTableBody');
        if (!tableBody) return;

        let html = '';
        processes.forEach(process => {
            const cpu = parseFloat(process.cpu_percent || 0);
            const mem = parseFloat(process.memory_percent || 0);
            const pid = process.pid || 'N/A';
            const name = process.name || 'Unknown';

            // Categorization comes from the backend (analyzer.py's tags),
            // not recalculated here, so there's one source of truth.
            // The label is built from statusBadge rather than trusting the
            // backend's own status string, so the badge's dot (::before in
            // CSS) is always the only dot rendered — nothing from the
            // backend text can ever add a second one next to it.
            const tags = process.tags || [];
            const statusBadge = tags.includes('critical') ? 'critical' :
                tags.includes('heavy') ? 'warning' : 'normal';
            const status = statusBadge.charAt(0).toUpperCase() + statusBadge.slice(1);

            const cpuClass = `process-${statusBadge}`;
            const memClass = `process-${statusBadge}`;

            const protectedNames = [
                'system', 'system idle process', 'svchost.exe', 'lsass.exe',
                'services.exe', 'registry', 'csrss.exe', 'wininit.exe',
                'smss.exe', 'winlogon.exe', 'msmpeng.exe',
                'dwm.exe', 'fontdrvhost.exe', 'dllhost.exe', 'conhost.exe',
                'taskhostw.exe', 'sihost.exe', 'ctfmon.exe', 'explorer.exe',
                'spoolsv.exe', 'wlanext.exe', 'audiodg.exe'
            ];
            const isProtected = protectedNames.includes(name.toLowerCase());
            const canEnd = statusBadge !== 'critical' && !isProtected;

            const endButtonHtml = canEnd ? `
                            <button class="action-btn kill-btn" onclick="app.killProcess(${pid}, '${name.replace(/'/g, "\\'")}')">
                                <i class="fas fa-skull-crossbones"></i> End
                            </button>` : '';

            html += `
                <tr>
                    <td><code>${pid}</code></td>
                    <td><i class="fas fa-cube"></i> ${name}</td>
                    <td class="${cpuClass}">${cpu.toFixed(1)}%</td>
                    <td class="${memClass}">${mem.toFixed(1)}%</td>
                    <td><span class="status-badge ${statusBadge}">${status}</span></td>
                    <td>
                        <div class="process-actions">
                            ${endButtonHtml}
                            <button class="action-btn details-btn" onclick="app.showProcessDetails(${pid})">
                                <i class="fas fa-info-circle"></i> Details
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
    }

    updatePriorityAnalyzer(processes) {
        const criticalEl = document.getElementById('priorityCriticalCount');
        const warningEl = document.getElementById('priorityWarningCount');
        const safeEl = document.getElementById('prioritySafeCount');
        const listEl = document.getElementById('priorityRecommendations');
        if (!criticalEl || !warningEl || !safeEl || !listEl) return;

        // Same backend tags/can_kill used for the process table, so the
        // counters can never disagree with what the table is showing.
        const critical = processes.filter(p => (p.tags || []).includes('critical'));
        const heavy = processes.filter(p => (p.tags || []).includes('heavy'));
        const safeToEnd = processes.filter(p => p.can_kill && !(p.tags || []).includes('critical'));

        criticalEl.textContent = critical.length;
        warningEl.textContent = heavy.length;
        safeEl.textContent = safeToEnd.length;

        const notable = [...critical, ...heavy]
            .sort((a, b) => (parseFloat(b.cpu_percent || 0) + parseFloat(b.memory_percent || 0)) -
                            (parseFloat(a.cpu_percent || 0) + parseFloat(a.memory_percent || 0)))
            .slice(0, 5);

        if (notable.length === 0) {
            listEl.innerHTML = `<div class="priority-empty">No heavy or critical processes right now.</div>`;
            return;
        }

        listEl.innerHTML = notable.map(p => {
            const canPause = p.can_kill && !(p.tags || []).includes('critical');
            const tagClass = canPause ? 'pausable' : 'protected';
            const tagText = canPause ? 'Can be paused' : 'Protected';
            const cpu = parseFloat(p.cpu_percent || 0).toFixed(1);
            const mem = parseFloat(p.memory_percent || 0).toFixed(1);

            return `
                <div class="priority-rec-item">
                    <div class="priority-rec-info">
                        <span class="priority-rec-name"><i class="fas fa-cube"></i> ${p.name || 'Unknown'}</span>
                        <span class="priority-rec-detail">${p.status || ''} · CPU ${cpu}% · Mem ${mem}%</span>
                    </div>
                    <span class="priority-tag ${tagClass}">${tagText}</span>
                </div>
            `;
        }).join('');
    }

    async killProcess(pid, name) {
        if (!confirm(`End process "${name}" (PID: ${pid})?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/kill-process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pid, name })
            });

            const result = await response.json();

            this.showNotification(
                result.success ? 'Process Terminated' : 'Error',
                result.message || `Process ${name} terminated`,
                result.success ? 'success' : 'error'
            );

            if (result.success) {
                setTimeout(() => this.updateProcessTable(), 1000);
            }

        } catch (error) {
            console.error('Kill process error:', error);
            this.showNotification('Error', 'Failed to terminate process', 'error');
        }
    }

    showProcessDetails(pid) {
        const process = this.processes.find(p => p.pid === pid);
        if (process) {
            this.showNotification(
                'Process Details',
                `PID: ${pid}<br>Name: ${process.name}<br>CPU: ${process.cpu_percent}%<br>Memory: ${process.memory_percent}%<br>Status: ${process.status}`,
                'info'
            );
        }
    }

    setupEventListeners() {
        // Refresh buttons
        document.getElementById('refreshMonitor').addEventListener('click', () => {
            this.updateAllData();
            this.showNotification('Refreshed', 'System data updated', 'info');
        });

        document.getElementById('refreshProcesses').addEventListener('click', async () => {
            const icon = document.querySelector('#refreshProcesses i');
            if (icon) icon.classList.add('spinning');
            await this.updateProcessTable();
            if (icon) icon.classList.remove('spinning');
        });

        // Optimization buttons
        document.getElementById('boostBtn').addEventListener('click', () =>
            this.performOptimization('boost'));
        document.getElementById('memoryBtn').addEventListener('click', () =>
            this.performOptimization('memory'));
        document.getElementById('balanceBtn').addEventListener('click', () =>
            this.performOptimization('balance'));

        // Auto-optimization toggle
        document.getElementById('autoOptimize').addEventListener('change', (e) => {
            this.settings.autoOptimize = e.target.checked;
            localStorage.setItem('autoOptimize', this.settings.autoOptimize);
            this.showNotification('Auto-Optimization', this.settings.autoOptimize ? 'Enabled' : 'Disabled', 'info');
        });

        // Threshold sliders
        document.getElementById('cpuThreshold').addEventListener('input', (e) => {
            this.settings.cpuThreshold = parseInt(e.target.value);
            document.getElementById('cpuThresholdValue').textContent = `${this.settings.cpuThreshold}%`;
            localStorage.setItem('cpuThreshold', this.settings.cpuThreshold);
        });

        document.getElementById('memThreshold').addEventListener('input', (e) => {
            this.settings.memoryThreshold = parseInt(e.target.value);
            document.getElementById('memThresholdValue').textContent = `${this.settings.memoryThreshold}%`;
            localStorage.setItem('memoryThreshold', this.settings.memoryThreshold);
        });

        // Process search
        document.getElementById('processSearch').addEventListener('input', (e) => {
            this.filterProcessTable(e.target.value);
        });

        // Chart reset button
        const resetChartBtn = document.getElementById('resetChartZoom');
        if (resetChartBtn) {
            resetChartBtn.addEventListener('click', () => {
                this.resetCharts();
            });
        }

        // Load saved settings
        this.loadSettings();
    }

    resetCharts() {
        // Reset chart data (optional - you can keep history)
        this.dataHistory = { cpu: [], memory: [], time: [] };

        if (this.charts.cpu) {
            this.charts.cpu.data.labels = [];
            this.charts.cpu.data.datasets[0].data = [];
            this.charts.cpu.update();
        }

        if (this.charts.memory) {
            this.charts.memory.data.labels = [];
            this.charts.memory.data.datasets[0].data = [];
            this.charts.memory.update();
        }

        this.showNotification('Charts Reset', 'Performance history cleared', 'info');
    }

    loadSettings() {
        this.settings.autoOptimize = localStorage.getItem('autoOptimize') === 'true';
        this.settings.cpuThreshold = parseInt(localStorage.getItem('cpuThreshold')) || 80;
        this.settings.memoryThreshold = parseInt(localStorage.getItem('memoryThreshold')) || 85;

        document.getElementById('autoOptimize').checked = this.settings.autoOptimize;
        document.getElementById('cpuThreshold').value = this.settings.cpuThreshold;
        document.getElementById('memThreshold').value = this.settings.memoryThreshold;
        document.getElementById('cpuThresholdValue').textContent = `${this.settings.cpuThreshold}%`;
        document.getElementById('memThresholdValue').textContent = `${this.settings.memoryThreshold}%`;
    }

    async performOptimization(action) {
        const buttonMap = {
            'boost': 'boostBtn',
            'memory': 'memoryBtn',
            'balance': 'balanceBtn'
        };

        const buttonId = buttonMap[action];
        const button = document.getElementById(buttonId);
        if (!button) return;

        const originalHTML = button.innerHTML;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Optimizing...`;
        button.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/api/optimize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: action })
            });

            const result = await response.json();

            this.showNotification(
                result.success ? 'Optimization Complete' : 'Optimization Failed',
                result.message,
                result.success ? 'success' : 'error'
            );

            // Refresh data after optimization
            setTimeout(() => this.updateAllData(), 1000);

        } catch (error) {
            console.error('Optimization error:', error);
            this.showNotification('Error', 'Optimization failed', 'error');
        } finally {
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.disabled = false;
            }, 1000);
        }
    }

    checkAutoOptimization(data) {
        if (!this.settings.autoOptimize || !data) return;

        const cpu = parseFloat(data.cpu || 0);
        const memory = parseFloat(data.memory || 0);

        if (cpu > this.settings.cpuThreshold || memory > this.settings.memoryThreshold) {
            const lastAutoOptimize = localStorage.getItem('lastAutoOptimize');
            const now = Date.now();

            if (!lastAutoOptimize || (now - parseInt(lastAutoOptimize)) > 60000) {
                this.showNotification(
                    'Auto-Optimization',
                    `System resources high (CPU: ${cpu}%, Memory: ${memory}%). Auto-optimizing...`,
                    'warning'
                );

                setTimeout(async () => {
                    await this.performOptimization('boost');
                    localStorage.setItem('lastAutoOptimize', Date.now().toString());
                }, 2000);
            }
        }
    }

    filterProcessTable(searchTerm) {
        const rows = document.querySelectorAll('#processTable tbody tr');
        const term = searchTerm.toLowerCase();

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    }

    showNotification(title, message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${icons[type] || 'fa-info-circle'}"></i>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);



        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }


    cleanup() {
        this.intervals.forEach(clearInterval);
        console.log('🧹 App cleaned up');
    }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ResourceOptimizerApp();
});

// Cleanup on window close
window.addEventListener('beforeunload', () => {
    if (window.app && typeof window.app.cleanup === 'function') {
        window.app.cleanup();
    }
});