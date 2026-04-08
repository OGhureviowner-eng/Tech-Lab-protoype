// IT Systems Diagnostics Data
const systemsData = {
    workstation: {
        name: "DEV-WKS-01",
        icon: "fas fa-desktop",
        type: "Workstation",
        steps: [
            { id: 1, title: "CPU Temperature", desc: "Verify <75°C idle, <90°C load", critical: true, value: "68°C" },
            { id: 2, title: "RAM Usage", desc: "Check <80% utilization, test modules", critical: false, value: "12GB/32GB" },
            { id: 3, title: "Disk Health", desc: "SMART status PASS, <90% full", critical: true, value: "✅ PASS" },
            { id: 4, title: "Network Connectivity", desc: "Ping gateway <5ms, no packet loss", critical: true, value: "1.2ms" },
            { id: 5, title: "Windows Updates", desc: "Verify fully patched, no pending", critical: true, value: "Up to date" },
            { id: 6, title: "Antivirus Status", desc: "Real-time protection enabled", critical: true, value: "Active" },
            { id: 7, title: "Event Logs", desc: "No critical errors past 24h", critical: false, value: "Clean" }
        ],
        details: { os: "Windows 11 Pro", ram: "32GB DDR4", cpu: "Intel i7-12700K", network: "1Gbps Ethernet" }
    },
    server: {
        name: "PROD-SRV-02",
        icon: "fas fa-server",
        type: "Application Server",
        steps: [
            { id: 1, title: "Service Status", desc: "All critical services running", critical: true, value: "All Active" },
            { id: 2, title: "Disk Space", desc: "Verify >20% free on all volumes", critical: true, value: "35% Free" },
            { id: 3, title: "CPU Load Average", desc: "<1.0 average past 15min", critical: true, value: "0.42" },
            { id: 4, title: "Backup Status", desc: "Last backup success <24h old", critical: true, value: "✅ 2h ago" },
            { id: 5, title: "Firewall Rules", desc: "Verify only approved ports open", critical: true, value: "Compliant" },
            { id: 6, title: "SSL Certificates", desc: "All certs valid >30 days", critical: false, value: "45 days left" }
        ],
        details: { os: "Windows Server 2022", ram: "128GB", cpu: "Dual Xeon Gold", network: "10Gbps" }
    },
    laptop: {
        name: "MGR-LAPTOP-03",
        icon: "fas fa-laptop",
        type: "Executive Laptop",
        steps: [
            { id: 1, title: "Battery Health", desc: "Capacity >85%, no swelling", critical: true, value: "92%" },
            { id: 2, title: "WiFi Signal", desc: "RSSI >-65dBm, stable connection", critical: true, value: "-52dBm" },
            { id: 3, title: "VPN Status", desc: "Corporate VPN connected", critical: true, value: "Connected" },
            { id: 4, title: "BitLocker", desc: "Drive encryption enabled", critical: true, value: "✅ Enabled" },
            { id: 5, title: "BIOS Password", desc: "Supervisor password set", critical: true, value: "Set" },
            { id: 6, title: "USB Restrictions", desc: "Unauthorized devices blocked", critical: false, value: "Compliant" }
        ],
        details: { os: "Windows 11 Enterprise", ram: "64GB", cpu: "Intel i9-13900H", network: "WiFi 6E" }
    },
    network: {
        name: "CORE-SWITCH-01",
        icon: "fas fa-network-wired",
        type: "Core Switch",
        steps: [
            { id: 1, title: "Uptime", desc: "Verify >30 days continuous", critical: true, value: "47 days" },
            { id: 2, title: "Port Errors", desc: "No CRC/FCS errors past 24h", critical: true, value: "0 errors" },
            { id: 3, title: "VLAN Status", desc: "All production VLANs active", critical: true, value: "All Active" },
            { id: 4, title: "Spanning Tree", desc: "No loops detected, root bridge", critical: true, value: "Root Bridge" },
            { id: 5, title: "Firmware", desc: "Latest stable version deployed", critical: false, value: "v16.12.5" }
        ],
        details: { model: "Cisco Catalyst 9300", ports: "48x1G + 4x10G", firmware: "16.12.5", poe: "740W" }
    }
};

// [SAME STATE AND FUNCTIONS AS BEFORE - JUST IT CONTEXT]
let currentSystem = null;
let currentStep = 0;
let startTime = null;
let completedSteps = 0;
let issuesFound = 0;
let performanceScore = 100;

const elements = {
    deviceList: document.getElementById('deviceList'),
    diagnosticPanel: document.getElementById('diagnosticPanel'),
    currentDevice: document.getElementById('currentDevice'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    completedCount: document.getElementById('completedCount'),
    issuesFound: document.getElementById('issuesFound'),
    timeSpent: document.getElementById('timeSpent'),
    performanceScore: document.getElementById('performanceScore'),
    activityLog: document.getElementById('activityLog'),
    stepIndicator: document.getElementById('stepIndicator'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    autoBtn: document.getElementById('autoBtn'),
    currentTime: document.getElementById('currentTime'),
    systemLoad: document.getElementById('systemLoad'),
    systemDetails: document.getElementById('systemDetails'),
    themeBtn: document.getElementById('themeBtn'),
    themePanel: document.querySelector('.theme-panel'),
    themeGrid: document.getElementById('themeGrid')
};

document.addEventListener('DOMContentLoaded', initLab);

function initLab() {
    renderDevices();
    renderThemes();
    updateClock();
    updateSystemLoad();
    setupEventListeners();
    loadCurrentTheme();
}

function renderDevices() {
    elements.deviceList.innerHTML = Object.entries(systemsData).map(([key, system]) => `
        <div class="device-item" data-system="${key}">
            <i class="${system.icon}"></i>
            <div>
                <div class="device-name">${system.name}</div>
                <div class="device-type">${system.type}</div>
            </div>
            <i class="fas fa-arrow-right" style="margin-left: auto; opacity: 0.5;"></i>
        </div>
    `).join('');
}

function renderThemes() {
    const themes = Array.from({length: 21}, (_, i) => i + 1);
    elements.themeGrid.innerHTML = themes.map(n => `
        <button class="theme-btn ${document.body.classList.contains(`theme-${n}`) ? 'active' : ''}" 
                data-theme="${n}" data-name="Theme ${n}">
        </button>
    `).join('');
}

function setupEventListeners() {
    document.querySelectorAll('.device-item').forEach(item => {
        item.addEventListener('click', (e) => selectSystem(e.currentTarget.dataset.system));
    });

    elements.prevBtn.addEventListener('click', () => navigateStep(-1));
    elements.nextBtn.addEventListener('click', () => navigateStep(1));
    elements.autoBtn.addEventListener('click', toggleAutoMode);

    elements.themeBtn.addEventListener('click', toggleThemePanel);
    document.getElementById('closeThemes').addEventListener('click', toggleThemePanel);
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', (e) => changeTheme(e.currentTarget.dataset.theme));
    });

    document.addEventListener('change', handleChecklistChange);
}

function selectSystem(systemKey) {
    currentSystem = systemsData[systemKey];
    currentStep = 0;
    startTime = Date.now();
    completedSteps = 0;
    issuesFound = 0;
    
    document.querySelectorAll('.device-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-system="${systemKey}"]`).classList.add('active');
    
    elements.currentDevice.textContent = currentSystem.name;
    renderSystemDetails();
    renderDiagnostic();
    
    logActivity(`🔍 Selected: ${currentSystem.name} (${currentSystem.type})`);
    updateProgress();
    updateMetrics();
}

function renderSystemDetails() {
    const details = currentSystem.details;
    elements.systemDetails.innerHTML = Object.entries(details).map(([key, value]) => 
        `<div class="detail-row"><span>${key.toUpperCase()}:</span><span>${value}</span></div>`
    ).join('');
}

function renderDiagnostic() {
    const steps = currentSystem.steps;
    elements.diagnosticPanel.innerHTML = `
        <div class="checklist">
            ${steps.map((step, index) => `
                <div class="checklist-item" data-step="${index}">
                    <input type="checkbox" id="step-${index}">
                    <div>
                        <div class="step-title ${step.critical ? 'critical' : ''}">
                            Step ${index + 1}: ${step.title}
                            ${step.critical ? '<span class="critical-badge">CRITICAL</span>' : ''}
                            <span class="step-value">${step.value}</span>
                        </div>
                        <div class="step-desc">${step.desc}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    elements.stepIndicator.textContent = `Step ${currentStep + 1} of ${steps.length}`;
}

function handleChecklistChange(e) {
    if (e.target.type !== 'checkbox') return;
    
    const stepIndex = parseInt(e.target.closest('.checklist-item').dataset.step);
    const step = currentSystem.steps[stepIndex];
    
    step.completed = e.target.checked;
    
    if (e.target.checked) {
        completedSteps++;
        if (step.critical) issuesFound = Math.max(0, issuesFound - 1);
        performanceScore = Math.min(100, performanceScore + 10);
        logActivity(`✅ ${step.title} - ${step.value}`);
    } else {
        completedSteps--;
        if (step.critical) issuesFound++;
        performanceScore = Math.max(0, performanceScore - 15);
        logActivity(`⚠️  ${step.title} - Reopened`);
    }
    
    updateProgress();
    updateMetrics();
}

function updateProgress() {
    const total = currentSystem.steps.length;
    const percent = (completedSteps / total) * 100;
    
    elements.progressFill.style.width = percent + '%';
    elements.progressText.textContent = `${completedSteps}/${total} Complete (${Math.round(percent)}%)`;
}

function updateMetrics() {
    elements.completedCount.textContent = completedSteps;
    elements.issuesFound.textContent = issuesFound;
    elements.performanceScore.textContent = performanceScore;
    
    const elapsed = Math.round((Date.now() - startTime) / 60000);
    elements.timeSpent.textContent = `${elapsed}m ${Math.round((Date.now() - startTime) / 1000) % 60}s`;
}

function logActivity(message) {
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    elements.activityLog.insertAdjacentHTML('afterbegin', `
        <div class="activity-item">
            <i class="fas fa-circle" style="font-size: 0.6rem; opacity: 0.6; color: var(--primary);"></i>
            <span>${time} ${message}</span>
        </div>
    `);
    
    Array.from(elements.activityLog.children).slice(8).forEach(el => el.remove());
}

function updateClock() {
    elements.currentTime.textContent = new Date().toLocaleString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    setTimeout(updateClock, 1000);
}

function updateSystemLoad() {
    const load = 8 + Math.random() * 12;
    elements.systemLoad.textContent = `CPU: ${load.toFixed(1)}%`;
    setTimeout(updateSystemLoad, 3000);
}

function navigateStep(direction) {
    const totalSteps = currentSystem.steps.length;
    currentStep = Math.max(0, Math.min(totalSteps - 1, currentStep + direction));
    elements.stepIndicator.textContent = `Step ${currentStep + 1} of ${totalSteps}`;
    
    const stepElement = document.querySelector(`[data-step="${currentStep}"]`);
    stepElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

let autoMode = false;
function toggleAutoMode() {
    autoMode = !autoMode;
    elements.autoBtn.innerHTML = autoMode ? '<i class="fas fa-pause"></i> Auto' : '<i class="fas fa-play"></i> Auto';
    
    if (autoMode) {
        autoRunDiagnostics();
    }
}

async function autoRunDiagnostics() {
    if (!autoMode || !currentSystem) return;
    
    for (let i = 0; i < currentSystem.steps.length; i++) {
        if (!autoMode) break;
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const checkbox = document.querySelector(`#step-${i}`);
        if (checkbox && !checkbox.checked) {
            checkbox.click();
        }
    }
    
    autoMode = false;
    elements.autoBtn.innerHTML = '<i class="fas fa-play"></i> Auto';
}

function resetAll() {
    completedSteps = 0;
    issuesFound = 0;
    performanceScore = 100;
    currentSystem.steps.forEach(step => step.completed = false);
    renderDiagnostic();
    updateProgress();
    updateMetrics();
    logActivity('🔄 Reset all diagnostics');
}

function printReport() {
    const totalSteps = currentSystem.steps.length;
    const passRate = Math.round((completedSteps / totalSteps) * 100);
    
    let reportHTML = `
        <h1>🖥️ CyberTech Lab - System Health Report</h1>
        <h2>${currentSystem.name} - ${currentSystem.type}</h2>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Overall Score:</strong> ${performanceScore}/100</p>
        <p><strong>Completion:</strong> ${completedSteps}/${totalSteps} (${passRate}%)</p>
        <p><strong>Issues Found:</strong> ${issuesFound}</p>
        
        <h3>Diagnostic Results</h3>
    `;
    
    currentSystem.steps.forEach(step => {
        const status = step.completed ? '✅ PASS' : '⚠️ FAIL';
        const color = step.completed ? '#10b981' : '#ef4444';
        reportHTML += `
            <div style="margin:20px 0;padding:20px;border-left:5px solid ${color};background:rgba(0,0,0,0.03);border-radius:8px;">
                <strong style="color:${color};">${step.title}</strong><br>
                ${step.desc}<br><small>Status: ${status} | Value: ${step.value}</small>
            </div>
        `;
    });
    
    const printWin = window.open('', '_blank');
    printWin.document.write(`
        <!DOCTYPE html>
        <html><head>
            <title>CyberTech Report - ${currentSystem.name}</title>
            <style>
                body{font-family:'Segoe UI',Tahoma,sans-serif;max-width:900px;margin:40px auto;padding:40px;line-height:1.6;background:#f8fafc;}
                h1{font-size:2.8em;color:#2563eb;margin-bottom:10px;font-weight:700;}
                h2{font-size:2em;color:#1e293b;margin-bottom:20px;}
                h3{font-size:1.4em;color:#2563eb;margin:40px 0 20px 0;}
            </style>
        </head><body>${reportHTML}</body></html>
    `);
    printWin.document.close();
    printWin.print();
}

function toggleThemePanel() {
    elements.themePanel.classList.toggle('active');
}

function changeTheme(themeNum) {
    document.body.className = `theme-${themeNum}`;
    localStorage.setItem('cybertech-theme', themeNum);
    
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-theme="${themeNum}"]`).classList.add('active');
    
    toggleThemePanel();
}

function loadCurrentTheme() {
    const saved = localStorage.getItem('cybertech-theme');
    if (saved) changeTheme(saved);
}

function runRemoteScan() {
    logActivity('🌐 Initiating remote network scan...');
    setTimeout(() => {
        logActivity('✅ Remote scan complete - 3 vulnerabilities found');
        issuesFound += 3;
        updateMetrics();
    }, 2000);
}
