# PDF Invoice Parser with LM Studio Integration

This application extracts text from PDF invoices and uses LM Studio's local AI model to analyze and extract relevant information. The application consists of a client-side interface for PDF processing and a Node.js server that handles communication with LM Studio.

## Architecture Overview

The application is built with the following components:

1. Frontend (HTML, JavaScript, CSS)
2. Backend (Node.js Express server)
3. LM Studio Integration (Local AI model server)

### Directory Structure
```
LmStudioAPI_Javascript/
├── index.html         # Main HTML interface
├── script.js          # Client-side JavaScript for PDF processing
├── style.css          # Styling
├── server.js          # Node.js proxy server
└── package.json       # Project dependencies
```

## Installation

```bash
npm install
```

To run the application:
```bash
npm start
```

## Setup and Installation

1. Configure LM Studio:
   - Open LM Studio
   - Load your preferred model
   - Go to Server tab
   - Set port to 8080
   - Enable CORS
   - Enable "Serve on Local Network"
   - Click "Start Server"

2. Access the application at `http://localhost:3000`

## How It Works

### 1. Frontend (index.html)

The frontend provides a simple interface with:
- File input for PDF selection
- "Extract Invoice" button
- Output area for displaying results

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Invoice Parser</title>
    <link rel="stylesheet" href="style.css">
    <!-- PDF.js library for PDF processing -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.min.js"></script>
</head>
<body>
    <div class="container">
        <h1>PDF Invoice Parser</h1>
        <input type="file" id="pdfFile" accept="application/pdf">
        <button onclick="parsePDF()">Extract Invoice</button>
        <pre id="output"></pre>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

### 2. PDF Processing (script.js)

The client-side JavaScript handles:
1. PDF file reading
2. Text extraction
3. Communication with the backend

Key components:

```javascript
// PDF.js initialization
pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js';

async function parsePDF() {
    // 1. Read PDF file
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function () {
        try {
            // 2. Process PDF
            const typedArray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
            
            // 3. Extract text from all pages
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items.map(item => item.str).join(' ');
                textContent += `Page ${i}: ${pageText}\n\n`;
            }

            // 4. Send to LM Studio API via proxy
            const response = await fetch("/v1/chat/completions", {...});
            
            // 5. Display results
            output.textContent = data.choices?.[0]?.message?.content;
            
        } catch (error) {
            // Error handling
        }
    };
}
```

### 3. Backend Server (server.js)

The Node.js server acts as a proxy between the frontend and LM Studio:

Key features:
- CORS handling
- Request proxying
- Error handling

```javascript
const app = express();

// CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Proxy configuration
const proxyOptions = {
    target: 'http://localhost:8080',
    changeOrigin: true,
    pathRewrite: {
        '^/v1': '/v1'
    }
};

app.use('/v1', createProxyMiddleware(proxyOptions));
```

## Data Flow

1. User selects a PDF file
2. Frontend (script.js):
   - Reads the PDF file
   - Extracts text using PDF.js
   - Sends text to backend
3. Backend (server.js):
   - Receives request
   - Proxies to LM Studio
4. LM Studio:
   - Processes text with AI model
   - Returns extracted information
5. Response flows back through:
   - Backend proxy
   - Frontend
   - Displayed to user

## Error Handling

The application includes comprehensive error handling for:
- PDF processing errors
- File reading errors
- API communication errors
- LM Studio connection issues

## Dependencies

- express: Web server framework
- cors: Cross-origin resource sharing
- http-proxy-middleware: API proxying
- pdf.js: PDF processing library

## Security Considerations

1. CORS is properly configured
2. Input validation for PDF files
3. Error messages are user-friendly but not overly detailed
4. Proxy server prevents direct exposure of LM Studio

## Troubleshooting

Common issues and solutions:

1. "Method Not Allowed" error:
   - Ensure LM Studio is running
   - Check port 8080 is correct
   - Verify CORS is enabled

2. PDF processing errors:
   - Check PDF.js version compatibility
   - Ensure PDF is not corrupted
   - Verify file permissions

3. Connection issues:
   - Confirm both servers are running
   - Check port availability
   - Verify network connectivity

## Future Improvements

Potential enhancements:
1. Support for batch processing
2. Custom model configuration
3. Enhanced error reporting
4. Progress indicators
5. Result formatting options
6. PDF preview functionality
