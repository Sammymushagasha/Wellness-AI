# Wellness AI - Mental Wellness Chatbot

A beautiful, calming web application that provides mental wellness support through AI chat, relaxing mini-games, calming videos, and guided stretching exercises.

## 🎨 Features

- **AI Chat**: Empathetic AI assistant powered by Claude
- **Mini Games**: Relaxing stress-relief activities (Coming Soon)
- **Calm Videos**: Soothing visual content (Coming Soon)
- **Stretching**: Guided body movements (Coming Soon)
- **Mood Tracker**: Track your emotional wellbeing (Coming Soon)

## 📁 File Structure

```
wellness-ai/
├── index.html      # Main HTML structure
├── styles.css      # All styling and animations
├── script.js       # JavaScript logic and API calls
└── README.md       # This file
```

## 🚀 Quick Start

### Option 1: Local Development
1. Download all files to a folder
2. Open `index.html` in your browser
3. The app will work with simulated responses (no API key needed for testing)

### Option 2: With Claude API
1. Get your API key from https://console.anthropic.com/
2. Open `script.js`
3. Find line 3: `CLAUDE_API_KEY: 'YOUR_API_KEY_HERE'`
4. Replace `'YOUR_API_KEY_HERE'` with your actual API key
5. Open `index.html` in your browser

## 🔑 Adding Your Claude API Key

In `script.js`, update this section:

```javascript
const CONFIG = {
    CLAUDE_API_KEY: 'sk-ant-api03-...', // ⚠️ PUT YOUR KEY HERE
    CLAUDE_API_URL: 'https://api.anthropic.com/v1/messages',
    CLAUDE_MODEL: 'claude-sonnet-4-20250514'
};
```

## 🎯 How It Works

### Without API Key (Default)
- App shows the beautiful UI
- You can type messages and click suggested prompts
- You'll get simulated AI responses for testing
- Perfect for hackathon demos without API setup

### With API Key
- Replace the placeholder in `script.js`
- App connects to real Claude API
- Get actual empathetic AI responses
- Full conversation context maintained

## 🌐 Deployment (For Hackathon)

### Deploy to Vercel:
1. Push code to GitHub
2. Go to vercel.com
3. Import your repository
4. Add environment variable:
   - Key: `CLAUDE_API_KEY`
   - Value: Your actual API key
5. Deploy!

**Important**: Don't commit your API key to GitHub! Use environment variables.

## 💡 Current Features

✅ **Working Now:**
- Beautiful split-screen layout
- Navigation menu (highlights on click)
- Empty state with suggested prompts
- Message input with send button
- Simulated AI responses (without API)
- Smooth animations and transitions
- Responsive design

🚧 **Coming Next** (for your hackathon):
- Mini games (breathing exercises, coloring, etc.)
- Video player for calming content
- Stretching guide with animations
- Mood tracking functionality

## 🎨 Design Features

- **Font**: DejaVu Serif for logo (elegant, calming)
- **Colors**: Soft lavender and purple gradients
- **Effects**: Glassmorphism, floating blobs, smooth transitions
- **UX**: Claude-inspired layout with sidebar navigation

## 🐛 Troubleshooting

### "API Key not set" in console
- This is normal! The app works without an API key using simulated responses
- Add your real API key when ready

### CORS errors
- If deploying, use Vercel/Netlify (they handle CORS)
- For local development, some browsers may block API calls
- Consider using a simple backend proxy if needed

### Buttons not working
- Check browser console (F12) for errors
- Make sure all files are in the same folder
- Ensure `script.js` is properly linked in HTML

## 📝 Notes for Hackathon

- Start with the simulated responses - they work perfectly for demos
- Add your API key later when you're ready to go live
- The UI is fully functional and looks professional
- Easy to extend with more features (games, videos, etc.)

## 🔐 Security Note

**Never commit API keys to GitHub!** For production:
1. Use environment variables
2. Add `.env` to `.gitignore`
3. Use Vercel's environment variables feature

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🎓 Built For

This project is designed for a hackathon - clean, functional, and impressive!

---

**Need help?** Check the console (F12) for helpful logs and warnings.

**API Key Ready?** Just update `script.js` and you're good to go!
