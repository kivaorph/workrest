// 多语言字典
const translations = {
    zh: {
        pageTitle: "健康提醒助手",
        mainTitle: "健康提醒助手",
        focusModeWarning: "如无法弹出通知，请关闭windows专注模式",
        browserWarning: "请从微信中使用浏览器打开，不要直接使用微信打开（支持chrome、夸克等，不要使用edge浏览器）",
        toggleLanguage: "English",
        timerTitle: "定时设置",
        intervalLabel: "时间间隔（分钟）",
        start: "开始",
        stop: "停止",
        taskTitle: "提醒任务",
        taskWater: "喝水",
        taskStand: "起身站立",
        taskStairs: "爬楼梯",
        taskEyes: "远眺休息",
        customTaskLabel: "自定义任务",
        customTaskPlaceholder: "输入自定义任务...",
        add: "添加",
        reminderTitle: "该休息了！",
        completed: "已完成",
        usageInstructions: "使用说明：1. 输入提醒的时间间隔（1-120分钟），点击\"开始\"按钮；2. 选择或自定义健康任务；3. 到点后会自动弹窗和系统通知提醒你活动；4. 点击\"已完成\"关闭提醒，计时器会自动重启。",
        footerSlogan: "保持健康，从定时提醒开始"
    },
    en: {
        pageTitle: "Health Reminder",
        mainTitle: "Health Reminder",
        focusModeWarning: "If notifications can't pop up, please turn off Windows Focus Assist",
        browserWarning: "Please open in browser from WeChat, do not use WeChat's built-in browser (Chrome, Quark supported, do not use Edge)",
        toggleLanguage: "中文",
        timerTitle: "Timer Settings",
        intervalLabel: "Interval (minutes)",
        start: "Start",
        stop: "Stop",
        taskTitle: "Tasks",
        taskWater: "Drink Water",
        taskStand: "Stand Up",
        taskStairs: "Take Stairs",
        taskEyes: "Eye Rest",
        customTaskLabel: "Custom Task",
        customTaskPlaceholder: "Enter custom task...",
        add: "Add",
        reminderTitle: "Time for a break!",
        completed: "Completed",
        usageInstructions: "Instructions: 1. Enter reminder interval (1-120 min) and click \"Start\"; 2. Select or add a health task; 3. When time is up, a popup and system notification will remind you; 4. Click \"Completed\" to close the reminder and restart the timer.",
        footerSlogan: "Stay healthy, start with regular reminders"
    }
};

// 当前语言，优先读取本地存储
let currentLang = localStorage.getItem('lang') || 'zh';

// 更新所有带 data-translate 的文本
function updateContent() {
    const langDict = translations[currentLang];
    // 普通文本
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (langDict[key]) el.textContent = langDict[key];
    });
    // placeholder
    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const key = el.getAttribute('data-translate-placeholder');
        if (langDict[key]) el.placeholder = langDict[key];
    });
    // 网页标题
    if (langDict.pageTitle) document.title = langDict.pageTitle;
}

// 语言切换按钮
const langBtn = document.getElementById('languageToggle');
if (langBtn) {
    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'zh' ? 'en' : 'zh';
        localStorage.setItem('lang', currentLang);
        updateContent();
    });
}

// 页面加载时自动切换
updateContent();

// 下面是原有的定时器、任务、通知等功能（保持不变）
// ... 你可以把原有 main.js 里除多语言相关外的所有代码粘贴到这里 ...

// ========== 以下为原有功能代码 ==========

// 计时器相关变量
let timer = null;
let endTime = 0; // 新增：用于存储计时器的结束时间
let timeRemaining = 0;
let selectedTask = "";

// 格式化时间
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
}

// 更新计时器显示
function updateTimerDisplay() {
    const timerDisplay = document.getElementById("timerDisplay");
    const timeRemainingElement = document.getElementById("timeRemaining");
    timeRemainingElement.textContent = formatTime(timeRemaining);
    timerDisplay.classList.remove("hidden");
}

// 注册Service Worker
async function registerServiceWorker() {
    try {
        // 注册时使用相对路径，适配GitHub Pages子目录
        const registration = await navigator.serviceWorker.register("./sw.js", { scope: "./" });
        console.log("Service Worker 注册成功:", registration);
        return registration;
    } catch (error) {
        console.error("Service Worker 注册失败:", error);
        return null;
    }
}

// 请求通知权限
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            alert("请允许通知权限以接收提醒");
            return false;
        }
        return true;
    } catch (error) {
        console.error("通知权限请求失败:", error);
        return false;
    }
}

// 显示系统通知
async function showSystemNotification(task) {
    if (Notification.permission === "granted") {
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(translations[currentLang].mainTitle, {
                body: task,
                icon: "https://cdn-icons-png.flaticon.com/512/2965/2965879.png",
                badge: "https://cdn-icons-png.flaticon.com/512/2965/2965879.png",
                tag: "health-reminder",
                requireInteraction: true,
                actions: [
                    {
                        action: "complete",
                        title: translations[currentLang].completed
                    }
                ],
                vibrate: [200, 100, 200],
                silent: false
            });
        } catch (error) {
            try {
                new Notification(translations[currentLang].mainTitle, {
                    body: task,
                    icon: "https://cdn-icons-png.flaticon.com/512/2965/2965879.png",
                    requireInteraction: true
                });
            } catch (fallbackError) {
                console.error("普通通知也失败:", fallbackError);
            }
        }
    }
}

// 显示提醒
async function showReminder() {
    const task = selectedTask || translations[currentLang].taskWater;
    await showSystemNotification(task);
    const modal = document.getElementById("reminderModal");
    const taskMessage = document.getElementById("taskMessage");
    taskMessage.textContent = task;
    modal.classList.remove("hidden");
}

// 启动计时器
async function startTimer() {
    if (timer) return;
    const intervalInput = document.getElementById("intervalInput");
    let interval = parseInt(intervalInput.value, 10);
    if (isNaN(interval) || interval < 1 || interval > 120) {
        alert("请输入1-120之间的分钟数");
        return;
    }
    timeRemaining = interval * 60;
    endTime = Date.now() + timeRemaining * 1000;
    updateTimerDisplay();
    timer = setInterval(timerTick, 1000);
    document.getElementById("startTimer").classList.add("hidden");
    document.getElementById("stopTimer").classList.remove("hidden");
}

// 计时器每秒更新
function timerTick() {
    timeRemaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
    updateTimerDisplay();
    if (timeRemaining <= 0) {
        stopTimer(false);
        showReminder();
    }
}

// 停止计时器
function stopTimer(reset = true) {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    if (reset) {
        timeRemaining = 0;
        updateTimerDisplay();
    }
    document.getElementById("startTimer").classList.remove("hidden");
    document.getElementById("stopTimer").classList.add("hidden");
}

// 完成任务
function completeTask() {
    document.getElementById("reminderModal").classList.add("hidden");
    startTimer();
}

// 选择任务
function selectTask(task, event) {
    selectedTask = task;
    document.querySelectorAll(".task-btn").forEach(btn => btn.classList.remove("border-primary-500"));
    if (event && event.currentTarget) event.currentTarget.classList.add("border-primary-500");
}

// 添加自定义任务
function addCustomTask() {
    const input = document.getElementById("customTask");
    const value = input.value.trim();
    if (value) {
        selectedTask = value;
        input.value = "";
        document.querySelectorAll(".task-btn").forEach(btn => btn.classList.remove("border-primary-500"));
    }
}

// 事件绑定
document.getElementById("startTimer").addEventListener("click", startTimer);
document.getElementById("stopTimer").addEventListener("click", () => stopTimer(true));
document.getElementById("completeTask").addEventListener("click", completeTask);
document.querySelectorAll(".task-btn").forEach(btn => {
    btn.addEventListener("click", function (e) {
        const key = btn.getAttribute("data-task-key");
        selectTask(translations[currentLang][key], e);
    });
});
document.getElementById("addCustomTask").addEventListener("click", addCustomTask);

// Service Worker 注册
if ("serviceWorker" in navigator) {
    registerServiceWorker();
}