# TripTick API Setup Guide

## Complete .env Configuration

Create a `.env` file in your project root with the following variables:

```bash
# AI Providers (in cost-effectiveness order)
EXPO_PUBLIC_VIBECODE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY=your_openai_api_key_here
EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY=your_claude_api_key_here
EXPO_PUBLIC_VIBECODE_XAI_API_KEY=your_grok_api_key_here

# Optional: Destination Images
EXPO_PUBLIC_PEXELS_API_KEY=your_pexels_api_key_here
```

## API Provider Comparison

| Provider | Cost per 1K tokens | Model | Quality | Setup |
|----------|-------------------|-------|---------|-------|
| **DeepSeek** | $0.0007 | deepseek-chat | High | [platform.deepseek.com](https://platform.deepseek.com) |
| **OpenAI** | $0.0015 | gpt-3.5-turbo | High | [platform.openai.com](https://platform.openai.com/api-keys) |
| **Claude** | $0.003 | claude-3-5-sonnet | Very High | [console.anthropic.com](https://console.anthropic.com) |
| **Grok** | $0.10 | grok-beta | Good | [console.x.ai](https://console.x.ai) |

## Setup Instructions

### 1. DeepSeek (Recommended - Most Cost-Effective)
1. Visit [platform.deepseek.com](https://platform.deepseek.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

### 2. OpenAI
1. Visit [platform.openai.com](https://platform.openai.com/api-keys)
2. Sign in to your account
3. Go to API Keys section
4. Create a new secret key
5. Copy the key to your `.env` file

### 3. Anthropic Claude
1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign up for an account
3. Navigate to API Keys
4. Create a new key
5. Copy the key to your `.env` file

### 4. Grok (X.AI)
1. Visit [console.x.ai](https://console.x.ai)
2. Sign up for an account
3. Go to API Keys section
4. Generate a new API key
5. Copy the key to your `.env` file

### 5. Pexels (Optional - for destination images)
1. Visit [pexels.com/api](https://pexels.com/api)
2. Sign up for a free account
3. Get your API key
4. Add to `.env` file

## How It Works

The app automatically tries providers in cost-effective order:

1. **DeepSeek** (cheapest) → 2. **OpenAI** → 3. **Claude** → 4. **Grok** (fallback)

If one provider fails (rate limit, invalid key, etc.), it automatically tries the next one.

## Cost Optimization

- **Token limits**: All requests limited to 1000 tokens max
- **Message truncation**: Only last 10 messages sent for context
- **Concise prompts**: Optimized for shorter responses
- **Automatic fallback**: Seamless provider switching

## Troubleshooting

### "API key not configured" error
- Check that your `.env` file is in the project root
- Ensure variable names are exactly as shown above
- Restart the app after adding keys

### "Invalid API key" error
- Verify your API key is correct
- Check if your account has sufficient credits
- Ensure the key has the right permissions

### Rate limit errors
- The app will automatically try the next provider
- Wait a few minutes and try again
- Consider upgrading your API plan

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- API keys are only used client-side for demo purposes
- For production, use a backend proxy

## Example .env File

```bash
# Copy this template and replace with your actual keys
EXPO_PUBLIC_VIBECODE_DEEPSEEK_API_KEY=sk-1234567890abcdef...
EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY=sk-1234567890abcdef...
EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY=sk-ant-1234567890abcdef...
EXPO_PUBLIC_VIBECODE_XAI_API_KEY=xai-1234567890abcdef...
EXPO_PUBLIC_PEXELS_API_KEY=1234567890abcdef...
```
