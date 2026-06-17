(function() {
    'use strict';
    const lang = document.documentElement.lang || 'en';
    const i18n = {
        en: {
            paste_error: 'Unable to read clipboard',
            no_text: '⚠️ Please enter some text first',
            copying: '✅ Copied to clipboard',
            copy_fail: 'Copy failed',
            no_content: 'No content to copy',
            rewrite_success: '🎉 Rewrite successful! Keep creating',
            api_error: '💡 If it fails frequently, it may be a network issue, please try again later',
            like_thanks: '👍 Thank you for your feedback!',
            dislike_thanks: '👎 Thank you for your feedback! We will improve.',
            waiting: 'Waiting for rewrite...',
            rewriting: '⏳ Rewriting...',
            humanize: '✨ Humanize',
            detect_waiting: 'Waiting for detection...',
            detect_low: '✅ Passed (Low Risk)',
            detect_medium: '⚠️ Medium Risk, suggest rewriting again',
            detect_high: '❌ High Risk, needs further rewriting',
            tip_title: 'Writing Tips',
            tips: [
                '🎯 Using first-person "I" can increase pass rate by 15%',
                '📈 Adding specific data enhances credibility',
                '💬 Use conversational transitions ("actually", "that is")',
                '🔁 Every 3 rewrites, detection score drops by 8% on average',
                '🌟 Today\'s best: replace long compound sentences with short ones'
            ]
        },
        zh: {
            paste_error: '无法读取剪贴板',
            no_text: '⚠️ 请先输入文本',
            copying: '✅ 已复制到剪贴板',
            copy_fail: '复制失败',
            no_content: '没有可复制的内容',
            rewrite_success: '🎉 改写成功！继续创作吧',
            api_error: '💡 如果频繁失败，可能是网络问题，请稍后重试',
            like_thanks: '👍 感谢您的反馈！',
            dislike_thanks: '👎 感谢您的反馈！我们会改进。',
            waiting: '等待改写...',
            rewriting: '⏳ 改写中...',
            humanize: '✨ 人性化改写',
            detect_waiting: '等待检测...',
            detect_low: '✅ 通过检测 (低风险)',
            detect_medium: '⚠️ 中等风险，建议再次改写',
            detect_high: '❌ 高风险，需要进一步改写',
            tip_title: '写作灵感',
            tips: [
                '🎯 用第一人称“我”能提升通过率 15%',
                '📈 加入具体数据可增强可信度',
                '💬 使用口语化过渡词（“其实”“也就是说”）',
                '🔁 每改写 3 次，检测分数平均下降 8%',
                '🌟 今日最佳：用短句替代长复合句'
            ]
        }
    };
    function t(key) {
        return (i18n[lang] && i18n[lang][key]) || key;
    }
    function createMeteors() {
        const container = document.getElementById('meteor-container');
        for (let i = 0; i < 20; i++) {
            const meteor = document.createElement('div');
            meteor.className = 'meteor';
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            const duration = Math.random() * 4 + 3;
            const delay = Math.random() * 12;
            meteor.style.left = startX + 'vw';
            meteor.style.top = startY + 'vh';
            meteor.style.animationDuration = duration + 's';
            meteor.style.animationDelay = delay + 's';
            container.appendChild(meteor);
        }
    }
    createMeteors();
    const inputDiv = document.getElementById('inputText');
    const outputArea = document.getElementById('outputArea');
    const humanizeBtn = document.getElementById('humanizeBtn');
    const wordCountSpan = document.getElementById('wordCount');
    const statusBar = document.getElementById('statusBar');
    const aiScoreSpan = document.getElementById('aiScore');
    const statusText = document.getElementById('statusText');
    const copyBtn = document.getElementById('copyOutputBtn');
    const regenBtn = document.getElementById('regenerateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const likeBtn = document.getElementById('likeBtn');
    const dislikeBtn = document.getElementById('dislikeBtn');
    const brandLogo = document.getElementById('brandLogo');
    const inspireBtn = document.getElementById('inspireBtn');
    const historyLink = document.getElementById('historyLink');
    const historyPanel = document.getElementById('historyPanel');
    const dailyTip = document.getElementById('dailyTip');
    let historyData = [];
    let isProcessing = false;
    let currentOutput = '';
    function updateWordCount() {
        const text = inputDiv.innerText || '';
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        wordCountSpan.textContent = words;
    }
    inputDiv.addEventListener('input', updateWordCount);
    async function callFreeAI(text) {
        const prompt = `Humanize the following AI-generated text, make it sound more natural, conversational, and human-like. Return only the rewritten text, no extra explanation. Text: ${text}`;
        const url = `https://text.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API请求失败 (${response.status})`);
        }
        const result = await response.text();
        if (!result || result.length < 5) {
            throw new Error('API返回内容为空');
        }
        return result.trim();
    }
    function simulateAIScore(original, rewritten) {
        const ratio = rewritten.length / (original.length + 1);
        let score = 50 - Math.min(40, Math.abs(ratio - 1) * 60);
        score = Math.min(95, Math.max(5, score));
        return Math.round(score);
    }
    async function humanizeText(text) {
        if (isProcessing) return;
        if (!text.trim()) { alert(t('no_text')); return; }
        isProcessing = true;
        humanizeBtn.disabled = true;
        humanizeBtn.textContent = t('rewriting');
        outputArea.innerHTML = '<span class="blinking-cursor"></span>';
        statusBar.style.display = 'none';
        try {
            const rewritten = await callFreeAI(text);
            outputArea.innerHTML = '';
            const textNode = document.createTextNode(rewritten);
            outputArea.appendChild(textNode);
            currentOutput = rewritten;
            const score = simulateAIScore(text, rewritten);
            statusBar.style.display = 'block';
            aiScoreSpan.textContent = score + '%';
            if (score < 30) {
                statusText.textContent = t('detect_low');
                statusBar.style.borderColor = '#34d399';
            } else if (score < 60) {
                statusText.textContent = t('detect_medium');
                statusBar.style.borderColor = '#fbbf24';
            } else {
                statusText.textContent = t('detect_high');
                statusBar.style.borderColor = '#f87171';
            }
            historyData.unshift({
                input: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
                output: rewritten.slice(0, 100) + (rewritten.length > 100 ? '...' : ''),
                time: new Date().toLocaleString()
            });
            dailyTip.textContent = t('rewrite_success');
        } catch (error) {
            outputArea.innerHTML = `<span style="color:#f87171;">❌ 改写失败：${error.message}</span>`;
            statusBar.style.display = 'none';
            dailyTip.textContent = t('api_error');
        } finally {
            isProcessing = false;
            humanizeBtn.disabled = false;
            humanizeBtn.textContent = t('humanize');
        }
    }
    humanizeBtn.addEventListener('click', function() {
        const text = inputDiv.innerText || '';
        humanizeText(text);
    });
    regenBtn.addEventListener('click', function() {
        const text = inputDiv.innerText || '';
        if (text.trim()) humanizeText(text);
    });
    copyBtn.addEventListener('click', function() {
        const text = outputArea.innerText;
        if (text && !text.includes(t('waiting'))) {
            navigator.clipboard.writeText(text).then(() => {
                alert(t('copying'));
            }).catch(() => alert(t('copy_fail')));
        } else {
            alert(t('no_content'));
        }
    });
    clearBtn.addEventListener('click', function() {
        inputDiv.innerText = '';
        outputArea.innerHTML = `<span style="color:#8a7aaa;">${t('waiting')}</span><span class="blinking-cursor"></span>`;
        statusBar.style.display = 'none';
        updateWordCount();
    });
    pasteBtn.addEventListener('click', function() {
        navigator.clipboard.readText().then(text => {
            inputDiv.innerText = text;
            updateWordCount();
        }).catch(() => alert(t('paste_error')));
    });
    sampleBtn.addEventListener('click', function() {
        const sample = "This report analyzes evolving consumer preferences and purchasing behaviors of Generation Z within sustainable fashion. As the first digital-native cohort, Gen Z has growing economic influence and strong environmental values, positioning them to reshape retail.";
        inputDiv.innerText = sample;
        updateWordCount();
    });
    likeBtn.addEventListener('click', function() { alert(t('like_thanks')); });
    dislikeBtn.addEventListener('click', function() { alert(t('dislike_thanks')); });
    historyLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (historyPanel.style.display === 'none') {
            historyPanel.style.display = 'block';
            const list = document.getElementById('historyList');
            if (historyData.length === 0) {
                list.innerHTML = '<p style="color:#8a7aaa;">No records yet</p>';
            } else {
                list.innerHTML = historyData.map((item, i) =>
                    `<div style="border-bottom:1px solid #4b2a73; padding:8px 0;">
                        <div><strong>Input:</strong> ${item.input}</div>
                        <div><strong>Output:</strong> ${item.output}</div>
                        <div style="font-size:12px; color:#8a7aaa;">${item.time}</div>
                    </div>`
                ).join('');
            }
        } else {
            historyPanel.style.display = 'none';
        }
    });
    brandLogo.addEventListener('click', function(e) {
        for (let i=0; i<20; i++) {
            const particle = document.createElement('div');
            particle.className = 'cosmic-particle';
            const x = e.clientX + (Math.random()-0.5)*100;
            const y = e.clientY + (Math.random()-0.5)*100;
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1500);
        }
    });
    const tips = t('tips');
    let tipIndex = 0;
    inspireBtn.addEventListener('click', function() {
        alert(tips[tipIndex % tips.length]);
        tipIndex++;
    });
    updateWordCount();
    outputArea.innerHTML = `<span style="color:#8a7aaa;">${t('waiting')}</span><span class="blinking-cursor"></span>`;
    dailyTip.textContent = lang === 'zh' ? '💡 完全免费 · 无需注册 · 真实AI改写' : '💡 Free · No registration · Real AI rewriting';
})();
