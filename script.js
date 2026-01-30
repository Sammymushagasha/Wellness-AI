// ===== CONFIGURATION =====
const CONFIG = {
    // TODO: Add your Claude API key here when ready
    CLAUDE_API_KEY: 'YOUR_API_KEY_HERE', // ⚠️ REPLACE THIS WITH YOUR ACTUAL API KEY
    CLAUDE_API_URL: 'https://api.anthropic.com/v1/messages',
    CLAUDE_MODEL: 'claude-sonnet-4-20250514'
};

// ===== STATE MANAGEMENT =====
let conversationHistory = [];
let currentPage = 'chat';

// ===== DOM ELEMENTS =====
const navItems = document.querySelectorAll('.nav-item');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messagesArea = document.getElementById('messagesArea');
const emptyState = document.querySelector('.empty-state');
const chatContainer = document.querySelector('.chat-container');
const promptBubbles = document.querySelectorAll('.prompt-bubble');

// ===== NAVIGATION =====
navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all items
        navItems.forEach(nav => nav.classList.remove('active'));
        
        // Add active class to clicked item
        item.classList.add('active');
        
        // Get the page data attribute
        const page = item.dataset.page;
        currentPage = page;
        
        // Handle page switching (placeholder for now)
        console.log(`Switched to: ${page}`);
        
        // TODO: Add page switching logic here when you build other pages
        // For now, only chat is functional
        if (page !== 'chat') {
            alert(`${item.querySelector('.nav-title').textContent} - Coming soon!`);
        }
    });
});

// ===== INPUT HANDLING =====
messageInput.addEventListener('input', () => {
    // Enable send button only if there's text
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
    
    // Hide empty state and show chat container
    if (emptyState.style.display !== 'none') {
        emptyState.style.display = 'none';
        chatContainer.style.display = 'flex';
    }
    
    // Clear input
    messageInput.value = '';
    sendButton.disabled = true;
    
    // Add user message to chat
    addMessage(userMessage, 'user');
    
    // Add to conversation history
    conversationHistory.push({
        role: 'user',
        content: userMessage
    });
    
    // Show typing indicator
    const typingIndicator = addTypingIndicator();
    
    try {
        // Call Claude API
        const aiResponse = await callClaudeAPI(userMessage);
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Add AI response to chat
        addMessage(aiResponse, 'ai');
        
        // Add to conversation history
        conversationHistory.push({
            role: 'assistant',
            content: aiResponse
        });
        
    } catch (error) {
        // Remove typing indicator
        typingIndicator.remove();
        
        // Show error message
        addMessage('Sorry, I encountered an error. Please try again.', 'ai');
        console.error('Error calling Claude API:', error);
    }
}

// ===== ADD MESSAGE TO CHAT =====
function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.textContent = text;
    
    messageDiv.appendChild(bubbleDiv);
    messagesArea.appendChild(messageDiv);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return messageDiv;
}

// ===== TYPING INDICATOR =====
function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-bubble">
            <span style="opacity: 0.6;">Thinking...</span>
        </div>
    `;
    messagesArea.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return typingDiv;
}

// ===== CLAUDE API CALL =====
async function callClaudeAPI(userMessage) {
    // Check if API key is set
    if (CONFIG.CLAUDE_API_KEY === 'YOUR_API_KEY_HERE') {
        // Return a placeholder response for testing
        console.warn('⚠️ API Key not set. Using placeholder response.');
        return await simulateAIResponse(userMessage);
    }
    
    try {
        const response = await fetch(CONFIG.CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CONFIG.CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: CONFIG.CLAUDE_MODEL,
                max_tokens: 1000,
                messages: conversationHistory,
                system: `You are a compassionate and empathetic mental wellness AI assistant. 
                        Your role is to:
                        - Listen actively and validate feelings
                        - Provide supportive, non-judgmental responses
                        - Suggest helpful coping strategies when appropriate
                        - Encourage professional help for serious concerns
                        - Use warm, conversational language
                        - Keep responses concise but thoughtful
                        
                        Remember: You're here to support, not to diagnose or treat mental health conditions.`
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.content[0].text;
        
    } catch (error) {
        console.error('Claude API Error:', error);
        throw error;
    }
}

// ===== SIMULATE AI RESPONSE (for testing without API key) =====
async function simulateAIResponse(userMessage) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple response logic for testing
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety')) {
        return "I hear that you're feeling anxious. That's completely valid, and it's brave of you to share that. Would you like to try a quick breathing exercise, or would you prefer to talk more about what's on your mind?";
    }
    
    if (lowerMessage.includes('relax') || lowerMessage.includes('calm')) {
        return "I can help you relax. Let's try a simple breathing technique: Breathe in slowly for 4 counts, hold for 4, then exhale for 4. Would you like me to guide you through this, or would you prefer to try one of our calming mini-games?";
    }
    
    if (lowerMessage.includes('sleep')) {
        return "Sleep issues can be really challenging. Creating a calming bedtime routine can help. Would you like some suggestions for better sleep hygiene, or would you prefer to explore our relaxing videos and stretching exercises?";
    }
    
    if (lowerMessage.includes('talk')) {
        return "I'm here to listen. Take your time and share whatever feels right. What's been weighing on you?";
    }
    
    if (lowerMessage.includes('breathing')) {
        return "Great choice! Let's start with a simple 4-4-4 breathing pattern. I'll guide you: Breathe in for 4 counts... Hold for 4... Breathe out for 4. Ready to begin?";
    }
    
    if (lowerMessage.includes('affirmation')) {
        return "Positive affirmations can be powerful. Here's one for you: 'I am capable of handling whatever comes my way.' Would you like more affirmations, or would you prefer to create your own?";
    }
    
    // Default response
    return "Thank you for sharing that with me. I'm here to support you. How are you feeling right now, and what would be most helpful for you in this moment?";
}

// ===== INITIALIZATION =====
console.log('Wellness AI initialized!');
console.log('⚠️ Remember to add your Claude API key in the CONFIG object');
