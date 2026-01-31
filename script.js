// ===== CONFIGURATION =====
const CONFIG = {
    // Use local proxy instead of direct API call (fixes CORS)
    CLAUDE_API_URL: 'http://localhost:3000/api/messages',
    CLAUDE_MODEL: 'claude-sonnet-4-20250514'
    // Note: API key is now in proxy-server.js for security
};

// ===== MOOD CLASSIFICATION SYSTEM =====
const MOOD_KEYWORDS = {
    anxious: {
        keywords: ['anxious', 'anxiety', 'worried', 'nervous', 'panic', 'stressed', 'overwhelmed', 'tense'],
        slang: ['freaking out', 'losing it', 'cant breathe', 'tweaking', 'buggin', 'trippin'],
        severity: 'high',
        recommendedFeatures: ['breathing', 'mini-game', 'calming-video']
    },
    sad: {
        keywords: ['sad', 'depressed', 'down', 'unhappy', 'lonely', 'empty', 'hopeless', 'crying'],
        slang: ['feeling like crap', 'in my feels', 'big sad', 'down bad', 'not vibing'],
        severity: 'medium',
        recommendedFeatures: ['affirmations', 'uplifting-video', 'journal']
    },
    angry: {
        keywords: ['angry', 'mad', 'furious', 'frustrated', 'irritated', 'annoyed', 'rage'],
        slang: ['pissed', 'ticked off', 'heated', 'salty', 'pressed', 'tilted'],
        severity: 'high',
        recommendedFeatures: ['breathing', 'stretch', 'mini-game']
    },
    tired: {
        keywords: ['tired', 'exhausted', 'drained', 'sleepy', 'fatigue', 'burned out', 'weary'],
        slang: ['dead', 'zombified', 'running on fumes', 'cant even', 'wiped', 'gassed'],
        severity: 'medium',
        recommendedFeatures: ['stretch', 'calming-video', 'breathing']
    },
    restless: {
        keywords: ['restless', 'cant sleep', 'insomnia', 'awake', 'tossing', 'cant relax'],
        slang: ['cant sleep for shit', 'up all night', 'brain wont shut up', 'wired'],
        severity: 'medium',
        recommendedFeatures: ['breathing', 'calming-video', 'stretch']
    },
    positive: {
        keywords: ['good', 'great', 'happy', 'excited', 'calm', 'peaceful', 'relaxed', 'better'],
        slang: ['vibing', 'feeling it', 'im good', 'chillin', 'blessed', 'living'],
        severity: 'low',
        recommendedFeatures: ['affirmations', 'mini-game', 'journal']
    }
};

// ===== STATE MANAGEMENT =====
let conversationHistory = [];
let currentPage = 'chat';
let currentMood = null;
let streamingMessage = null;
let useTensorFlow = false;
let aiMode = 'regular';
let pendingBreatherConsent = false;

// ===== DOM ELEMENTS =====
const navItems = document.querySelectorAll('.nav-item');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messagesArea = document.getElementById('messagesArea');
const emptyState = document.querySelector('.empty-state');
const chatContainer = document.querySelector('.chat-container');
const promptBubbles = document.querySelectorAll('.prompt-bubble');
const modeOptions = document.querySelectorAll('.mode-option');

// ===== CRISIS SUPPORT DETECTION =====
const CRISIS_KEYWORDS = [
    'suicide', 'suicidal', 'kill myself', 'killing myself', 'end my life', 'end it all',
    'self harm', 'self-harm', 'hurt myself', 'harm myself', 'cut myself', 'cutting',
    'overdose', 'take my life',
    'shoot someone', 'shooting', 'mass shooting', 'school shooting',
    'stab someone', 'stabbing',
    'burn it down', 'set fire', 'start a fire', 'big fire', 'arson',
    'bomb', 'blow up'
];

function isCrisisMessage(text) {
    const normalized = text.toLowerCase();
    return CRISIS_KEYWORDS.some(keyword => normalized.includes(keyword));
}

function getCrisisResponse() {
    return [
        "Hey, I’m really glad you told me. You matter, and I’m here with you.",
        "If you’re in the U.S., you can call or text 988 to reach the Suicide & Crisis Lifeline—it's free, 24/7. If you’re in immediate danger, call 911.",
        "If you’re outside the U.S., I can help find a local crisis number. You don’t have to go through this alone."
    ].join('\n\n');
}

// ===== BREATHER INTENT + CONSENT =====
const BREATHER_KEYWORDS = [
    'breather', 'take a breather', 'breathe', 'breathing', 'breathing exercise',
    'breathing exercises', 'box breathing', 'deep breath', 'calm down', 'slow down'
];

const AFFIRMATIVE_KEYWORDS = [
    'yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'please', 'do it', 'sounds good',
    'let\'s do it', 'i want that', 'open it', 'go ahead', 'im down', 'i\'m down'
];

const NEGATIVE_KEYWORDS = ['no', 'not now', 'nope', 'nah', 'later', 'don\'t', 'do not'];

function isBreatherTrigger(text) {
    const normalized = text.toLowerCase();
    return BREATHER_KEYWORDS.some(keyword => normalized.includes(keyword));
}

function isAffirmative(text) {
    const normalized = text.toLowerCase();
    return AFFIRMATIVE_KEYWORDS.some(keyword => normalized.includes(keyword));
}

function isNegative(text) {
    const normalized = text.toLowerCase();
    return NEGATIVE_KEYWORDS.some(keyword => normalized.includes(keyword));
}

function openBreatherTab() {
    showSystemMessage('Opening Take a Breather...');
    setTimeout(() => {
        window.location.href = 'physical.html';
    }, 300);
}

// ===== SLANG NORMALIZATION =====
const SLANG_DICTIONARY = {
    'cant': "can't", 'wont': "won't", 'dont': "don't", 'isnt': "isn't",
    'im': "i'm", 'ive': "i've", 'id': "i'd", 'ill': "i'll",
    'ur': 'your', 'u': 'you', 'r': 'are', 'y': 'why',
    'rn': 'right now', 'idk': "i don't know", 'tbh': 'to be honest',
    'ngl': 'not gonna lie', 'fr': 'for real', 'lowkey': 'kind of',
    'highkey': 'really', 'af': 'very', 'omg': 'oh my god',
    'wtf': 'what the heck', 'fml': 'having a hard time',
    'smh': 'shaking my head', 'lol': 'laughing', 'lmao': 'laughing'
};

function normalizeSlang(text) {
    let normalized = text.toLowerCase();
    
    Object.keys(SLANG_DICTIONARY).forEach(slang => {
        const regex = new RegExp(`\\b${slang}\\b`, 'gi');
        normalized = normalized.replace(regex, SLANG_DICTIONARY[slang]);
    });
    
    return normalized;
}

// ===== MOOD CLASSIFICATION (HYBRID APPROACH) =====
async function classifyMood(text) {
    if (useTensorFlow && window.tensorFlowClassifier && window.tensorFlowClassifier.isReady) {
        console.log('🧠 Using TensorFlow classification...');
        
        const tfResult = await window.tensorFlowClassifier.classify(text);
        
        if (tfResult && tfResult.confidence > 0.4) {
            console.log(`✅ TensorFlow detected: ${tfResult.mood} (${(tfResult.confidence * 100).toFixed(1)}% confidence)`);
            
            return {
                mood: tfResult.mood,
                score: tfResult.confidence * 10,
                severity: tfResult.confidence > 0.7 ? 'high' : 'medium',
                features: tfResult.features,
                method: 'tensorflow',
                confidence: tfResult.confidence
            };
        } else {
            console.log('⚠️ TensorFlow confidence too low, using keyword fallback');
        }
    }
    
    console.log('📝 Using keyword-based classification...');
    return classifyMoodKeyword(text);
}

// ===== KEYWORD-BASED MOOD CLASSIFICATION =====
function classifyMoodKeyword(text) {
    const normalizedText = normalizeSlang(text);
    let detectedMoods = [];
    
    Object.keys(MOOD_KEYWORDS).forEach(mood => {
        const moodData = MOOD_KEYWORDS[mood];
        let score = 0;
        
        moodData.keywords.forEach(keyword => {
            if (normalizedText.includes(keyword)) {
                score += 2;
            }
        });
        
        moodData.slang.forEach(slang => {
            if (normalizedText.includes(slang)) {
                score += 3;
            }
        });
        
        if (score > 0) {
            detectedMoods.push({
                mood: mood,
                score: score,
                severity: moodData.severity,
                features: moodData.recommendedFeatures,
                method: 'keyword'
            });
        }
    });
    
    detectedMoods.sort((a, b) => b.score - a.score);
    
    if (detectedMoods.length > 0) {
        console.log(`✅ Keyword detected: ${detectedMoods[0].mood}`);
        return detectedMoods[0];
    }
    
    console.log('⚪ No mood detected');
    return null;
}

// ===== NAVIGATION =====
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        const page = item.dataset.page;
        currentPage = page;
        
        console.log(`Switched to: ${page}`);
        
        const isLink = item.tagName.toLowerCase() === 'a' || item.hasAttribute('href');
        if (page !== 'chat' && !isLink) {
            alert(`${item.querySelector('.nav-title').textContent} - Coming soon!`);
        }
    });
});

// ===== MODE SELECTOR =====
modeOptions.forEach(option => {
    option.addEventListener('click', () => {
        modeOptions.forEach(btn => btn.classList.remove('active'));
        option.classList.add('active');
        aiMode = option.dataset.mode || 'regular';
        showSystemMessage(`Mode set to ${aiMode === 'friendly' ? 'Simplistic AI' : 'Regular AI'}`);
    });
});

// ===== INPUT HANDLING =====
messageInput.addEventListener('input', () => {
    sendButton.disabled = messageInput.value.trim() === '';
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !sendButton.disabled) {
        sendMessage();
    }
});

sendButton.addEventListener('click', () => {
    if (!sendButton.disabled) {
        sendMessage();
    }
});


// ===== PROMPT BUBBLES =====
promptBubbles.forEach(bubble => {
    bubble.addEventListener('click', () => {
        const promptText = bubble.textContent;
        messageInput.value = promptText;
        sendButton.disabled = false;
        sendMessage();
    });
});

// ===== SEND MESSAGE FUNCTION =====
async function sendMessage() {
    const userMessage = messageInput.value.trim();
    
    if (!userMessage) return;
    
    if (emptyState.style.display !== 'none') {
        emptyState.style.display = 'none';
        chatContainer.style.display = 'flex';
    }
    
    messageInput.value = '';
    sendButton.disabled = true;
    
    addMessage(userMessage, 'user');

    if (isCrisisMessage(userMessage)) {
        const crisisText = getCrisisResponse();
        addMessage(crisisText, 'ai');
        conversationHistory.push({
            role: 'user',
            content: userMessage
        });
        conversationHistory.push({
            role: 'assistant',
            content: crisisText
        });
        return;
    }

    if (pendingBreatherConsent && isAffirmative(userMessage)) {
        const confirmText = 'Got it. Opening the Take a Breather tab now.';
        addMessage(confirmText, 'ai');
        conversationHistory.push({
            role: 'user',
            content: userMessage
        });
        conversationHistory.push({
            role: 'assistant',
            content: confirmText
        });
        pendingBreatherConsent = false;
        openBreatherTab();
        return;
    }

    if (pendingBreatherConsent && isNegative(userMessage)) {
        const declineText = 'No problem. We can do that anytime you want.';
        addMessage(declineText, 'ai');
        conversationHistory.push({
            role: 'user',
            content: userMessage
        });
        conversationHistory.push({
            role: 'assistant',
            content: declineText
        });
        pendingBreatherConsent = false;
        return;
    }

    if (isBreatherTrigger(userMessage)) {
        const offerText = 'Want me to open the Take a Breather tab for you?';
        addMessage(offerText, 'ai');
        conversationHistory.push({
            role: 'user',
            content: userMessage
        });
        conversationHistory.push({
            role: 'assistant',
            content: offerText
        });
        pendingBreatherConsent = true;
        return;
    }

    const moodAnalysis = await classifyMood(userMessage);
    if (moodAnalysis) {
        currentMood = moodAnalysis;
        console.log('Detected mood:', moodAnalysis);
    }
    
    conversationHistory.push({
        role: 'user',
        content: userMessage
    });
    
    const typingIndicator = addTypingIndicator();
    
    try {
        await streamClaudeAPI(userMessage, typingIndicator);
    } catch (error) {
        typingIndicator.remove();
        
        let errorMessage = 'Sorry, I encountered an error. ';
        
        if (error.message.includes('Failed to fetch') && error.message.includes('localhost:3000')) {
            errorMessage = '⚠️ Proxy server not running!\n\n';
            errorMessage += 'Please start the proxy server first:\n';
            errorMessage += '1. Open terminal in your project folder\n';
            errorMessage += '2. Run: node proxy-server.js\n';
            errorMessage += '3. Then refresh this page and try again';
        } else if (error.message.includes('401')) {
            errorMessage += 'API authentication failed. Check your API key in proxy-server.js';
        } else if (error.message.includes('429')) {
            errorMessage += 'Too many requests. Wait 60 seconds and try again.';
        } else {
            errorMessage += error.message;
        }
        
        addMessage(errorMessage, 'ai');
        console.error('Error:', error);
    }
}

// ===== ADD MESSAGE TO CHAT =====
function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.style.whiteSpace = 'pre-wrap';
    bubbleDiv.textContent = text;
    
    messageDiv.appendChild(bubbleDiv);
    messagesArea.appendChild(messageDiv);
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return messageDiv;
}

// ===== TYPING INDICATOR =====
function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-bubble">
            <div class="lottie-typing" aria-hidden="true"></div>
        </div>
    `;
    messagesArea.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const lottieHost = typingDiv.querySelector('.lottie-typing');
    if (lottieHost) {
        if (customElements.get('dotlottie-wc')) {
            const player = document.createElement('dotlottie-wc');
            player.setAttribute('src', 'https://lottie.host/7fc059bc-5224-4809-ab12-e22744f954e2/3QgPg6eN8d.lottie');
            player.setAttribute('autoplay', '');
            player.setAttribute('loop', '');
            player.style.width = '90px';
            player.style.height = '36px';
            lottieHost.appendChild(player);
        }
    }

    return typingDiv;
}

// ===== CREATE STREAMING MESSAGE =====
function createStreamingMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai';
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.textContent = '';
    
    messageDiv.appendChild(bubbleDiv);
    messagesArea.appendChild(messageDiv);
    
    return bubbleDiv;
}

// ===== FEATURE RECOMMENDATION SYSTEM =====
function getFeatureRecommendation(mood) {
    if (!mood || !mood.features) return '';
    
    const feature = mood.features[0];
    
    const recommendations = {
        'breathing': "Would you like to try a calming breathing exercise? It can help reduce anxiety quickly.",
        'mini-game': "How about a quick mini-game to help shift your focus?",
        'calming-video': "I have some calming videos that might help you relax. Want to check them out?",
        'stretch': "Some gentle stretches might help release that tension. Should I guide you through some?",
        'affirmations': "Would you like some positive affirmations to lift your spirits?",
        'uplifting-video': "I can show you some uplifting content. Would that help?",
        'journal': "Would you like to write about how you're feeling in your journal?"
    };
    
    return recommendations[feature] || '';
}

// ===== ENHANCED SYSTEM PROMPT =====
function getSystemPrompt() {
    let moodContext = '';
    if (currentMood) {
        const featureRec = getFeatureRecommendation(currentMood);
        moodContext = `\n\nCURRENT USER MOOD: ${currentMood.mood} (severity: ${currentMood.severity})
RECOMMENDED FEATURES: ${currentMood.features.join(', ')}
SUGGESTED GUIDANCE: ${featureRec}

When responding, subtly guide the user toward trying one of these features: ${currentMood.features.join(', ')}.
Use natural, conversational language to suggest these options without being pushy.`;
    }
    
    const crisisPrompt = `CRISIS SAFETY RULE:
If the user mentions suicide, self-harm, or wanting to die (even joking), respond immediately with:
1) A brief, warm, uplifting message.
2) Direct help info: If in the U.S., call/text 988. If in immediate danger, call 911.
3) Offer to help find local resources if outside the U.S.
Be calm, kind, and non-judgmental. Do not debate or minimize.`;

    const basePrompt = aiMode === 'friendly'
        ? `You are a close friend texting with the user. Be extremely friendly, casual, and expressive.
YOUR ROLE:
- Talk like a real friend in a text thread (short, warm messages)
- Use friendly reactions like "No way", "tell me about that", "how could she do that"
- Ask natural follow-up questions and keep the conversation flowing
- Avoid professional or clinical tone
- Keep responses concise (1-3 sentences) but caring
- Match the user's slang and texting style without overdoing it`
        : `You are a compassionate and empathetic mental wellness AI assistant specialized in therapeutic conversations.

YOUR ROLE:
- Listen actively and validate feelings with empathy
- Provide supportive, non-judgmental responses
- Recognize casual language, slang, and abbreviations naturally
- Gently guide users toward helpful wellness features when appropriate
- Keep responses concise (2-4 sentences) but warm and personal
 - Use a friendly, conversational tone like a supportive friend
 - Do not use emojis`;

    return `${basePrompt}
${crisisPrompt}

AVAILABLE WELLNESS FEATURES YOU CAN RECOMMEND:
1. Breathing exercises - For anxiety, stress, panic
2. Mini-games - For distraction, mood shifting, restlessness
3. Calming videos - For relaxation, sleep preparation
4. Stretch guides - For physical tension, fatigue
5. Affirmations - For low mood, negative thoughts
6. Uplifting videos - For sadness, loneliness
7. Journal - For processing emotions, reflection

GUIDELINES:
- When suggesting features, frame them as gentle options, not commands
- Use phrases like "Would you like to try...", "How about...", "I can show you..."
- If user declines a suggestion, support their choice and offer alternatives
- NEVER diagnose or treat mental health conditions
- Encourage professional help for serious concerns
- Match the user's communication style (casual, formal, etc.)
${moodContext}

Remember: You're a supportive companion helping users feel heard and guiding them to helpful resources.`;
}

// ===== STREAMING CLAUDE API (USING PROXY) =====
async function streamClaudeAPI(userMessage, typingIndicator) {
    console.log('📡 Calling proxy server...');
    
    try {
        const response = await fetch(CONFIG.CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // No API key needed - proxy handles it
            },
            body: JSON.stringify({
                model: CONFIG.CLAUDE_MODEL,
                max_tokens: 1000,
                messages: conversationHistory,
                system: getSystemPrompt()
            })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Proxy Error ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        const fullText = data.content[0].text;
        
        typingIndicator.remove();
        
        const messageBubble = createStreamingMessage();
        
        await typewriterEffect(messageBubble, fullText);
        
        conversationHistory.push({
            role: 'assistant',
            content: fullText
        });
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ===== TYPEWRITER EFFECT FOR STREAMING =====
async function typewriterEffect(element, text, speed = 20) {
    element.textContent = '';
    
    for (let i = 0; i < text.length; i++) {
        element.textContent += text[i];
        chatContainer.scrollTop = chatContainer.scrollHeight;
        await new Promise(resolve => setTimeout(resolve, speed));
    }
}

// ===== HELPER FUNCTION TO SHOW SYSTEM MESSAGES =====
function showSystemMessage(text) {
    const systemDiv = document.createElement('div');
    systemDiv.className = 'system-message';
    systemDiv.textContent = text;
    
    if (messagesArea) {
        messagesArea.appendChild(systemDiv);
        
        setTimeout(() => {
            systemDiv.style.opacity = '0';
            systemDiv.style.transition = 'opacity 0.3s';
            setTimeout(() => systemDiv.remove(), 300);
        }, 5000);
    }
}

// ===== TENSORFLOW INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing app...');
    
    if (window.tensorFlowClassifier) {
        console.log('🧠 TensorFlow classifier found, initializing...');
        
        showSystemMessage('🧠 Loading AI mood detection... (10-15 seconds)');
        
        const success = await window.tensorFlowClassifier.initialize();
        
        if (success) {
            useTensorFlow = true;
            console.log('✅ Using TensorFlow for mood classification');
            showSystemMessage('✅ Advanced mood detection ready!');
        } else {
            useTensorFlow = false;
            console.log('⚠️ Falling back to keyword-based classification');
            showSystemMessage('⚠️ Using basic mood detection');
        }
    } else {
        console.log('📝 TensorFlow not available, using keyword-based classification');
    }
});

// ===== INITIALIZATION =====
console.log('🧠 Enhanced Wellness AI initialized!');
console.log('✅ Mood classification active');
console.log('✅ Slang recognition enabled');
console.log('✅ Streaming responses ready');
console.log('✅ Feature recommendation system online');
console.log('🔄 Using proxy server at', CONFIG.CLAUDE_API_URL);
