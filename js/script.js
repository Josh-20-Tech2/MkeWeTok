const inputEl = document.getElementById('input');
const languageSelect = document.getElementById('languageSelect');
const translateBtn = document.getElementById('translateBtn');
const translateSpinner = document.getElementById('translateSpinner');
const translateBtnText = document.getElementById('translateBtnText');
const outputBox = document.getElementById('translatedOutput');
const outputText = document.getElementById('outputText');
const outputLangBadge = document.getElementById('outputLangBadge');
const statusMsg = document.getElementById('statusMsg');

const LANGUAGE_NAMES = {
    en: 'English', es: 'Spanish', fr: 'French', de: 'German',
    zh: 'Chinese (Simplified)', ja: 'Japanese', ar: 'Arabic',
    hi: 'Hindi', pt: 'Portuguese', ru: 'Russian', it: 'Italian', ko: 'Korean'
};

const SPEECH_LANG_MAP = {
    en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
    zh: 'zh-CN', ja: 'ja-JP', ar: 'ar-SA', hi: 'hi-IN',
    pt: 'pt-PT', ru: 'ru-RU', it: 'it-IT', ko: 'ko-KR'
};

function showStatus(message, type = 'info') {
    statusMsg.textContent = message;
    statusMsg.className = 'status-text text-center mt-2 ' +
        (type === 'success' ? 'text-success' : type === 'error' ? 'text-danger' : 'text-muted');
}

async function translateText() {
    const text = inputEl.value.trim();
    if (!text) {
        showStatus('Please type something first.', 'error');
        return;
    }
    const targetLang = languageSelect.value;
    translateSpinner.style.display = 'inline-block';
    translateBtnText.textContent = 'Translating...';
    translateBtn.disabled = true;
    outputBox.classList.remove('show');
    showStatus('');

    try {
        const response = await fetch(
            'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' +
            targetLang + '&dt=t&q=' + encodeURIComponent(text),
            { mode: 'cors' }
        );
        if (!response.ok) throw new Error('Translation service error');
        const data = await response.json();
        const translated = data[0].map(item => item[0]).join('');
        outputText.textContent = translated;
        outputLangBadge.textContent = 'Translated to ' + (LANGUAGE_NAMES[targetLang] || targetLang);
        outputBox.classList.add('show');
        showStatus('Translation complete!', 'success');
    } catch (err) {
        console.error(err);
        showStatus('Translation failed. Check your connection and try again.', 'error');
    } finally {
        translateSpinner.style.display = 'none';
        translateBtnText.textContent = 'Translate';
        translateBtn.disabled = false;
    }
}

function speakText() {
    // Prefer the translated output text; fall back to input if no translation yet
    const translatedText = outputText.textContent.trim();
    const inputText = inputEl.value.trim();
    const text = translatedText || inputText;

    if (!text) {
        showStatus('Please type something and translate first.', 'error');
        return;
    }
    if (!('speechSynthesis' in window)) {
        showStatus('Speech synthesis is not supported in this browser.', 'error');
        return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = languageSelect.value;
    utterance.lang = SPEECH_LANG_MAP[targetLang] || 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => showStatus('Speaking in ' + (LANGUAGE_NAMES[targetLang] || targetLang) + '...', 'success');
    utterance.onend = () => showStatus('Finished speaking.', 'info');
    utterance.onerror = () => showStatus('Loading.......', 'error');
    window.speechSynthesis.speak(utterance);
}

function copyTranslation() {
    const text = outputText.textContent.trim();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => { btn.innerHTML = original; }, 1200);
    });
}

inputEl.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        translateText();
    }
});

translateBtn.addEventListener('click', translateText);
showStatus('Type text, pick a language, then translate or speak.', 'info');
