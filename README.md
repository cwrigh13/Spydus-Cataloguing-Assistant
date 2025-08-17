# Spydus Cataloguing Assistant

A React application that helps librarians generate MARC21 catalogue records and get expert advice on Spydus cataloguing using Google's Gemini AI.

## Features

- **Generate MARC21 Records**: Input library item details and get properly formatted MARC21 catalogue records
- **Ask the Expert**: Get professional advice on Spydus cataloguing, item maintenance, and MARC21 standards
- **Modern UI**: Clean, responsive interface with tabbed navigation
- **Copy to Clipboard**: Easy copying of generated records

## Setup

1. **Install frontend dependencies**:
   ```bash
   npm install
   ```

2. **Install backend dependencies**:
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Configure Gemini API**:
   - Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Copy `server/.env.example` to `server/.env`
   - Add your API key to `server/.env`:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     PORT=3001
     ```

4. **Start both frontend and backend**:
   ```bash
   npm run dev:full
   ```
   
   Or run them separately:
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend  
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## Usage

### Generate Record Tab
1. Enter library item details in the text area
2. Click "Generate Spydus Record" 
3. Copy the generated MARC21 record using the copy button

### Ask the Expert Tab
1. Enter your cataloguing question
2. Click "Ask the Expert"
3. Get professional advice based on Spydus and MARC21 standards

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)
- Google Gemini AI API

## Project Structure

```
├── src/                 # Frontend React app
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles with Tailwind
├── server/              # Backend API proxy
│   ├── server.js        # Express server with Gemini API proxy
│   ├── package.json     # Backend dependencies
│   ├── .env.example     # Environment variables template
│   └── .gitignore       # Backend git ignore
├── index.html           # HTML template
├── package.json         # Frontend dependencies and scripts
├── tailwind.config.js   # Tailwind configuration
├── vite.config.js       # Vite configuration
└── postcss.config.js    # PostCSS configuration
```

## Security Features

The app uses a secure backend proxy architecture:
1. **API key protection** - Your Gemini API key stays secure on the backend server
2. **Rate limiting** - Built-in protection against API abuse (100 requests per 15 minutes per IP)
3. **CORS protection** - Controlled access from frontend domains
4. **Environment variables** - API key stored in `.env` file (never committed to git)

## API Configuration

1. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to `server/.env` file (copy from `server/.env.example`)
3. The backend proxy handles all API communication securely

## Deployment

### GitHub Pages
The app is automatically deployed to GitHub Pages at: https://cwrigh13.github.io/Spydus-Cataloguing-Assistant/

Status: Deploying via GitHub Actions

**Note:** The GitHub Pages version shows the UI but requires local setup for AI functionality since API keys cannot be exposed in client-side code.

### Local Development
For full functionality including AI features:
1. Clone this repository
2. Follow the setup instructions above
3. Run `npm run dev:full` to start both frontend and backend

### Manual Deployment
To deploy manually:
```bash
npm run build
npm run deploy
```

## Notes

- The Firebase authentication code has been removed as it wasn't being used
- The clipboard functionality uses the modern Clipboard API with fallback to the deprecated `execCommand`
- The app includes retry logic with exponential backoff for API calls
- GitHub Pages deployment shows UI only - AI features require local backend setup