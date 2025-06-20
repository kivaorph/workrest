// 语言配置
const translations = {
    zh: {
        title: '健康提醒助手',
        start: '开始',
        stop: '停止',
        interval: '时间间隔（分钟）',
        customTask: '输入自定义任务...',
        add: '添加',
        reminder: '该休息了！',
        completed: '已完成',
        tasks: {
            water: '喝水',
            stand: '起身站立',
            stairs: '爬楼梯',
            eyes: '远眺休息'
        },
        mainTitle: '健康提醒助手',
        timerTitle: '定时设置',
        taskTitle: '提醒任务',
        customTaskLabel: '自定义任务',
        footerSlogan: '保持健康，从定时提醒开始'
    },
    en: {
        title: 'Health Reminder',
        start: 'Start',
        stop: 'Stop',
        interval: 'Interval (minutes)',
        customTask: 'Enter custom task...',
        add: 'Add',
        reminder: 'Time for a break!',
        completed: 'Completed',
        tasks: {
            water: 'Drink Water',
            stand: 'Stand Up',
            stairs: 'Take Stairs',
            eyes: 'Eye Rest'
        },
        mainTitle: 'Health Reminder',
        timerTitle: 'Timer Settings',
        taskTitle: 'Tasks',
        customTaskLabel: 'Custom Task',
        footerSlogan: 'Stay healthy, start with regular reminders'
    }
};

// 当前语言
let currentLang = 'zh';

// 计时器相关变量
let timer = null;
let endTime = 0; // 新增：用于存储计时器的结束时间
let timeRemaining = 0;
let selectedTask = '';

// 更新页面内容
function updateContent() {
    const lang = translations[currentLang];
    document.title = lang.title;
    const startBtnSpan = document.querySelector('#startTimer span');
    if (startBtnSpan) startBtnSpan.textContent = lang.start; else console.warn('#startTimer span 不存在');
    const stopBtnSpan = document.querySelector('#stopTimer span');
    if (stopBtnSpan) stopBtnSpan.textContent = lang.stop; else console.warn('#stopTimer span 不存在');
    const intervalLabel = document.querySelector('label[for="intervalInput"]');
    if (intervalLabel) intervalLabel.textContent = lang.interval; else console.warn('label[for="intervalInput"] 不存在');
    const customTaskInput = document.querySelector('#customTask');
    if (customTaskInput) customTaskInput.placeholder = lang.customTask; else console.warn('#customTask 不存在');
    const addCustomTaskSpan = document.querySelector('#addCustomTask span');
    if (addCustomTaskSpan) addCustomTaskSpan.textContent = lang.add; else console.warn('#addCustomTask span 不存在');
    const reminderModalH3 = document.querySelector('#reminderModal h3');
    if (reminderModalH3) reminderModalH3.textContent = lang.reminder; else console.warn('#reminderModal h3 不存在');
    const completeTaskSpan = document.querySelector('#completeTask span');
    if (completeTaskSpan) completeTaskSpan.textContent = lang.completed; else console.warn('#completeTask span 不存在');
    // 更新任务按钮文本
    const taskButtons = document.querySelectorAll('.task-btn span');
    if (taskButtons[0]) taskButtons[0].textContent = lang.tasks.water; else console.warn('.task-btn span[0] 不存在');
    if (taskButtons[1]) taskButtons[1].textContent = lang.tasks.stand; else console.warn('.task-btn span[1] 不存在');
    if (taskButtons[2]) taskButtons[2].textContent = lang.tasks.stairs; else console.warn('.task-btn span[2] 不存在');
    if (taskButtons[3]) taskButtons[3].textContent = lang.tasks.eyes; else console.warn('.task-btn span[3] 不存在');
    // 动态切换语言按钮文字
    const langBtnSpan = document.querySelector('#languageToggle span');
    if (langBtnSpan) langBtnSpan.textContent = currentLang === 'zh' ? 'English' : '中文';
    const mainTitle = document.getElementById('mainTitle');
    if (mainTitle) mainTitle.innerHTML = '<i class="fas fa-heartbeat mr-2"></i>' + lang.mainTitle;
    const timerTitle = document.getElementById('timerTitle');
    if (timerTitle) timerTitle.textContent = lang.timerTitle;
    const taskTitle = document.getElementById('taskTitle');
    if (taskTitle) taskTitle.textContent = lang.taskTitle;
    const customTaskLabel = document.getElementById('customTaskLabel');
    if (customTaskLabel) customTaskLabel.textContent = lang.customTaskLabel;
    const footerSlogan = document.getElementById('footerSlogan');
    if (footerSlogan) footerSlogan.textContent = lang.footerSlogan;
}

// 格式化时间
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 更新计时器显示
function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timerDisplay');
    const timeRemainingElement = document.getElementById('timeRemaining');
    timeRemainingElement.textContent = formatTime(timeRemaining);
    timerDisplay.classList.remove('hidden');
}

// 注册Service Worker
async function registerServiceWorker() {
    try {
        // 注册时使用相对路径，适配GitHub Pages子目录
        const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
        console.log('Service Worker 注册成功:', registration);
        return registration;
    } catch (error) {
        console.error('Service Worker 注册失败:', error);
        return null;
    }
}

// 请求通知权限
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            alert('请允许通知权限以接收提醒');
            return false;
        }
        return true;
    } catch (error) {
        console.error('通知权限请求失败:', error);
        return false;
    }
}

// 显示系统通知
async function showSystemNotification(task) {
    console.log('showSystemNotification 被调用，任务:', task);
    console.log('通知权限:', Notification.permission);
    
    if (Notification.permission === 'granted') {
        try {
            console.log('准备获取 Service Worker 注册');
            const registration = await navigator.serviceWorker.ready;
            console.log('Service Worker 已就绪:', registration);
            
            console.log('准备显示通知');
            await registration.showNotification('健康提醒', {
                body: task,
                icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965879.png',
                badge: 'https://cdn-icons-png.flaticon.com/512/2965/2965879.png',
                tag: 'health-reminder',
                requireInteraction: true,
                actions: [
                    {
                        action: 'complete',
                        title: '已完成'
                    }
                ],
                vibrate: [200, 100, 200], // 添加震动效果
                silent: false // 确保声音可以播放
            });
            console.log('系统通知显示成功');
        } catch (error) {
            console.error('Service Worker 通知失败，尝试使用普通通知:', error);
            // 如果Service Worker通知失败，使用普通通知
            try {
                new Notification('健康提醒', {
                    body: task,
                    icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965879.png',
                    requireInteraction: true
                });
                console.log('普通通知显示成功');
            } catch (fallbackError) {
                console.error('普通通知也失败:', fallbackError);
            }
        }
    } else {
        console.log('通知权限未授予，无法显示系统通知');
    }
}

// 显示提醒
async function showReminder() {
    console.log('showReminder 被调用');
    const task = selectedTask || translations[currentLang].tasks.water;
    console.log('任务内容:', task);
    
    // 显示系统通知
    console.log('准备显示系统通知，权限状态:', Notification.permission);
    await showSystemNotification(task);
    
    // 同时显示网页内的提醒
    const modal = document.getElementById('reminderModal');
    const taskMessage = document.getElementById('taskMessage');
    taskMessage.textContent = task;
    modal.classList.remove('hidden');
    console.log('网页弹窗已显示');
    
    // 播放提示音
    try {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
        await audio.play();
        console.log('提示音播放成功');
    } catch (error) {
        console.error('播放提示音失败:', error);
    }
}

// 开始计时器
async function startTimer() {
    console.log('startTimer 被调用');
    clearInterval(timer); // 防止多次启动
    const intervalInput = document.getElementById('intervalInput');
    const minutes = parseInt(intervalInput.value);
    console.log('输入的分钟数:', minutes);
    
    if (isNaN(minutes) || minutes < 1 || minutes > 120) {
        alert('请输入1-120之间的分钟数');
        return;
    }

    // 请求通知权限，但不阻止计时器启动
    console.log('当前通知权限:', Notification.permission);
    if (Notification.permission !== 'granted') {
        console.log('尝试请求通知权限');
        const hasPermission = await requestNotificationPermission();
        console.log('通知权限请求结果:', hasPermission);
    }

    // 设置结束时间
    endTime = Date.now() + minutes * 60 * 1000;
    
    document.getElementById('startTimer').classList.add('hidden');
    document.getElementById('stopTimer').classList.remove('hidden');
    
    // 立即执行一次，避免延迟1秒才显示
    timerTick();

    console.log('准备启动定时器');
    timer = setInterval(timerTick, 1000);
    console.log('定时器已启动');
}

// 计时器核心逻辑
function timerTick() {
    const remainingMilliseconds = endTime - Date.now();
    timeRemaining = Math.max(0, Math.round(remainingMilliseconds / 1000));
    
    updateTimerDisplay();
    
    console.log('倒计时:', timeRemaining);

    if (remainingMilliseconds <= 0) {
        console.log('计时结束，弹出提醒');
        showReminder();
        clearInterval(timer); // 计时结束，停止计时器
    }
}

// 停止计时器
function stopTimer() {
    clearInterval(timer);
    timer = null;
    document.getElementById('startTimer').classList.remove('hidden');
    document.getElementById('stopTimer').classList.add('hidden');
    document.getElementById('timerDisplay').classList.add('hidden');
}

// 完成任务
function completeTask() {
    const modal = document.getElementById('reminderModal');
    modal.classList.add('hidden');
    
    // 直接调用startTimer开始新的一个周期
    startTimer();
}

// 选择任务
function selectTask(task, event) {
    selectedTask = task;
    document.querySelectorAll('.task-btn').forEach(btn => {
        btn.classList.remove('border-primary-500');
    });
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('border-primary-500');
    } else if (this) {
        this.classList.add('border-primary-500');
    }
}

// 添加自定义任务
function addCustomTask() {
    const input = document.getElementById('customTask');
    const task = input.value.trim();
    
    if (task) {
        selectedTask = task;
        input.value = '';
        document.querySelectorAll('.task-btn').forEach(btn => {
            btn.classList.remove('border-primary-500');
        });
    }
}

// 初始化页面和事件监听
document.addEventListener('DOMContentLoaded', async () => {
    // 注册Service Worker
    if ('serviceWorker' in navigator) {
        await registerServiceWorker();
    }

    updateContent();
    // 默认选择第一个任务
    document.querySelector('.task-btn').classList.add('border-primary-500');
    selectedTask = document.querySelector('.task-btn span').textContent;

    // 确保开始按钮显示，停止按钮隐藏
    document.getElementById('startTimer').classList.remove('hidden');
    document.getElementById('stopTimer').classList.add('hidden');
    document.getElementById('timerDisplay').classList.add('hidden');

    // 事件监听器
    document.getElementById('startTimer').addEventListener('click', startTimer);
    document.getElementById('stopTimer').addEventListener('click', stopTimer);
    document.getElementById('addCustomTask').addEventListener('click', addCustomTask);
    document.getElementById('completeTask').addEventListener('click', completeTask);
    // 为所有任务按钮绑定点击事件
    document.querySelectorAll('.task-btn').forEach(btn => {
        btn.addEventListener('click', function(event) {
            selectTask.call(this, this.querySelector('span').textContent, event);
        });
    });

    // 主动请求通知权限
    if ("Notification" in window) {
        if (Notification.permission === 'default') {
            await requestNotificationPermission();
        }
    }
}); 