# Translation Feature Setup Guide

This guide explains how to set up and configure the Gemini API-based translation feature for Bengali ↔ English translations.

## Features

- **Real-time Translation**: Translate article content between Bengali and English
- **Two-way Translation**: Translate from BN to EN or EN to BN
- **Smart Integration**: Translation widgets built into the article edit form
- **Error Handling**: Comprehensive error messages and validation
- **UI Feedback**: Loading states, success/error messages, copy functionality

## Prerequisites

1. **Gemini API Key**: Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **PHP 7.4+**: For backend API integration
3. **Environment Variables**: Add GEMINI_API_KEY to your server configuration

## Setup Instructions

### Step 1: Get Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Configure Server Environment

#### Option A: Using .env file (for development)

Create or update your `.env` file in the project root:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

#### Option B: Server Environment Variables

Set the environment variable directly on your server:

```bash
export GEMINI_API_KEY="your_actual_api_key_here"
```

#### Option C: Docker/Container

Add to your docker-compose.yml or Dockerfile:

```yaml
environment:
  - GEMINI_API_KEY=your_actual_api_key_here
```

### Step 3: Verify Frontend Configuration

The frontend is already configured to use the translation API:

- API endpoint: `/api/translate.php`
- Component: `TranslationWidget` in article editor pages
- Integration points:
  - Article Edit: Bengali content → English translation
  - Article Edit: English content → Bengali translation

## API Endpoints

### POST /api/translate.php

Translates text between Bengali and English using Google Gemini API.

**Request Parameters:**

```json
{
  "text": "আমাদের ওয়েব অ্যাপ অত্যন্ত দুর্দান্ত।",
  "source_lang": "bn",
  "target_lang": "en"
}
```

**Response (Success):**

```json
{
  "success": true,
  "translation": "Our web app is extremely amazing.",
  "source_lang": "bn",
  "target_lang": "en"
}
```

**Response (Error):**

```json
{
  "error": "Translation service not configured"
}
```

**Parameters:**

| Parameter    | Type   | Required | Description                                  |
| ------------ | ------ | -------- | -------------------------------------------- |
| text         | string | Yes      | Text to translate (max 5000 characters)      |
| source_lang  | string | Yes      | Source language: "bn" or "en"                |
| target_lang  | string | Yes      | Target language: "bn" or "en"                |

**Status Codes:**

| Code | Meaning           | Description                                |
| ---- | ----------------- | ------------------------------------------ |
| 200  | OK                | Translation successful                    |
| 400  | Bad Request       | Missing/invalid parameters                 |
| 405  | Method Not Allowed| Only POST requests allowed                 |
| 500  | Server Error      | API key not configured or API error       |

## Usage Guide

### In Article Editor

1. **Translate Bengali Content to English:**
   - Write or paste Bengali text in the Bengali content editor
   - Click the "Translate to English" button
   - The translated English text will appear in a preview box
   - Click "Use Translation" to insert it into the English content editor
   - Or click the copy icon to copy it manually

2. **Translate English Content to Bengali:**
   - Write or paste English text in the English content editor
   - Click the "Translate to Bengali" button
   - The translated Bengali text will appear in a preview box
   - Click "Use Translation" to insert it into the Bengali content editor
   - Or click the copy icon to copy it manually

### Component Props

```typescript
interface TranslationWidgetProps {
  text: string;                    // Text to translate
  onTranslate: (translation: string, targetLang: "bn" | "en") => void;
  currentLang?: "bn" | "en";       // Current language (default: "bn")
  disabled?: boolean;               // Disable translation button
  buttonLabel?: string;             // Custom button text
}
```

## Security Considerations

### API Key Protection

⚠️ **Important**: Never commit the `GEMINI_API_KEY` to version control.

1. **Environment Variables**: Store the key in environment variables only
2. **Server-side Only**: The key is used only on the backend (PHP)
3. **.gitignore**: Ensure `.env` is in `.gitignore`
4. **API Restrictions**: Use Google API Console to restrict key usage:
   - Restrict to HTTP referrers (your domain)
   - Restrict to specific APIs (only Generative Language API)
   - Set usage limits and quotas

### Input Validation

- Text is limited to 5000 characters
- Only Bengali (bn) and English (en) languages are supported
- Source and target languages must be different
- All inputs are validated server-side

### Error Handling

- Sensitive error details are not exposed to frontend
- API errors are logged server-side only
- Client receives user-friendly error messages

## Monitoring & Troubleshooting

### Check API Key Configuration

```php
<?php
$api_key = getenv('GEMINI_API_KEY');
if (empty($api_key)) {
    echo "API Key not configured";
} else {
    echo "API Key is configured";
}
?>
```

### Common Issues

1. **"Translation service not configured"**
   - Ensure `GEMINI_API_KEY` environment variable is set
   - Restart your web server after setting the variable

2. **"Invalid response from translation service"**
   - Check that your API key is valid
   - Verify API usage limits haven't been exceeded
   - Check Google Cloud Console for API errors

3. **Timeout errors**
   - Translation service has a 30-second timeout
   - Very long texts (near 5000 chars) may timeout
   - Try translating shorter chunks

4. **403 Forbidden errors**
   - API key may be restricted by referrer
   - Check Google API Console restrictions
   - Verify the key has Generative Language API access

### Monitoring Usage

1. Visit [Google API Dashboard](https://console.developers.google.com/)
2. Select your project
3. Go to APIs & Services → Enabled APIs & services
4. Click on "Generative Language API"
5. View usage metrics and quotas

## Performance Notes

- Translation typically takes 2-5 seconds
- Each translation counts as one API request
- Translations are not cached (each request goes to Gemini)
- Consider adding rate limiting for production use

## Examples

### Frontend API Usage

```typescript
import { api } from "../../api";

// Translate Bengali to English
const result = await api.translateText(
  "আমাদের ওয়েব অ্যাপ অত্যন্ত দুর্দান্ত।",
  "bn",
  "en"
);

if (result.success) {
  console.log(result.translation); // Output: "Our web app is extremely amazing."
}
```

### Backend PHP Usage

```php
<?php
$data = json_decode(file_get_contents('php://input'), true);

$result = [
    'text' => $data['text'],
    'source_lang' => $data['source_lang'],
    'target_lang' => $data['target_lang']
];

// API key is retrieved from environment
$api_key = getenv('GEMINI_API_KEY');
?>
```

## Support & Resources

- [Google Generative AI Documentation](https://ai.google.dev/docs)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [API Rate Limits](https://ai.google.dev/docs/gemini_api_overview)

## Next Steps

1. Obtain your Gemini API key
2. Set the `GEMINI_API_KEY` environment variable
3. Test the translation feature in the article editor
4. Monitor API usage in Google Cloud Console
