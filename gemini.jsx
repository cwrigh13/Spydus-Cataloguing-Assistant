import { useState } from 'react';
import { Book, Loader2, ClipboardCheck, LibraryBig, MessageSquare, Download, Printer } from 'lucide-react';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import ReactMarkdown from 'react-markdown';

// The main application component
export default function App() {
    // State for the user's input, the catalogue record output, and UI state
    const [itemInput, setItemInput] = useState('');
    const [catalogueOutput, setCatalogueOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // State for the new "Ask me anything" feature
    const [askInput, setAskInput] = useState('');
    const [askOutput, setAskOutput] = useState('');
    const [isAsking, setIsAsking] = useState(false);

    // State for the tabbed layout
    const [activeTab, setActiveTab] = useState('generate');

    // Initialize Firebase and authenticate
    const initializeFirebase = async () => {
        try {
            const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : '';
            if (initialAuthToken) {
                await signInWithCustomToken(auth, initialAuthToken);
            } else {
                console.error('No custom auth token available.');
            }
        } catch (error) {
            console.error('Error during Firebase initialization or sign-in:', error);
        }
    };

    // Function to call the Gemini API and generate the catalogue record
    const generateCatalogueRecord = async (prompt) => {
        // Implement exponential backoff for retries
        const maxRetries = 5;
        let retries = 0;
        let delay = 1000; // 1 second

        while (retries < maxRetries) {
            try {
                const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
                const payload = { contents: chatHistory };
                const apiKey = "";
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
                console.log('API call initiated with payload:', payload);

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    console.error(`API call failed with status: ${response.status}, text: ${await response.text()}`);
                    throw new Error(`API call failed with status: ${response.status}`);
                }

                const result = await response.json();
                console.log('API call successful, result:', result);

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    return result.candidates[0].content.parts[0].text;
                } else {
                    console.error('Unexpected API response structure:', result);
                    throw new Error('Unexpected API response structure.');
                }
            } catch (error) {
                console.error(`Attempt ${retries + 1} failed:`, error);
                if (retries < maxRetries - 1) {
                    console.log(`Retrying in ${delay / 1000} seconds...`);
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2;
                }
            }
            retries++;
        }
        throw new Error('Failed to generate content after multiple retries.');
    };

    // Handler for the catalogue button click
    const handleCatalogue = async () => {
        // Guard against empty input
        if (!itemInput.trim()) {
            setCatalogueOutput('Please enter some item details to get started.');
            return;
        }

        // Set loading state and clear previous output
        setIsLoading(true);
        setCatalogueOutput('');
        setIsCopied(false);

        const cataloguePrompt = `Create a MARC21 catalogue record for a library item. The item information is provided below.
Adhere to the following rules for formatting:
* **TAG 020 (ISBN):** Include the ISBN.
* **TAG 082 (Dewey):** Include the Dewey Decimal number.
* **TAG 100/110 (Author):** Add the author(s).
* **TAG 245 (Main title):** Use descriptive wording. If it's a Library of Things item, include the collection name in brackets.
* **TAG 250 (Edition):** Specify the edition.
* **TAG 264 (Publication, etc.):** Provide the place, manufacturer/distributor, and year.
* **TAG 300 (Physical description):** Describe the number of pages/pieces, other physical details, and dimensions.
* **TAG 336, 337, 338 (RDA):** Use these tags to describe the item's content, media, and carrier type. For most objects, use:
    * 336 #atactile three dimensional form#btcf#2rdacontent
    * 337 #aunmediated#bn#2rdamedia
    * 338 #aobject#br#2rdacarrier
* **TAG 500 (Notes):** Add general notes.
* **TAG 504 (Bibliography):** Indicate if the item includes a bibliography or index.
* **TAG 520 (Summary):** Provide a summary with keywords.
* **TAG 600/650/690 (Subject headings):** The first subject heading for a "Library of Things" item must be "Library of Things."
* **TAG 856 (Electronic location):** Provide a placeholder URL for the image: "https://georgesriver.spydus.com/itemphotos/toys/{BRN}.jpg".

If a piece of information is missing from the item details, mark the corresponding field as "Not Provided". Do not include any conversational text, just the formatted record.

Here is the information for the new library item:
${itemInput}`;

        try {
            const result = await generateCatalogueRecord(cataloguePrompt);
            setCatalogueOutput(result);
        } catch (error) {
            console.error('An error occurred:', error);
            setCatalogueOutput('An error occurred while generating the catalogue record. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for the copy button click
    const handleCopy = () => {
        if (catalogueOutput) {
            try {
                const tempTextarea = document.createElement('textarea');
                tempTextarea.value = catalogueOutput;
                document.body.appendChild(tempTextarea);
                tempTextarea.select();
                document.execCommand('copy');
                document.body.removeChild(tempTextarea);

                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        }
    };

    // Handler for the "Ask me anything" button click
    const handleAsk = async () => {
        if (!askInput.trim()) {
            setAskOutput('Please enter a question to get started.');
            return;
        }
        setIsAsking(true);
        setAskOutput('');

        const askPrompt = `You are an expert Spydus cataloguer. Answer the following question based on your extensive knowledge of Spydus cataloguing, item maintenance, and MARC21 standards. Be professional and authoritative.
    Question: ${askInput}
    `;

        try {
            const result = await generateCatalogueRecord(askPrompt);
            setAskOutput(result);
        } catch (error) {
            console.error('An error occurred:', error);
            setAskOutput('An error occurred while getting the answer. Please try again.');
        } finally {
            setIsAsking(false);
        }
    };

    // Handler for downloading the Q&A as a text file
    const handleDownload = () => {
        if (!askInput.trim() || !askOutput.trim()) return;
        
        const content = `# Spydus Cataloguing Assistant - Q&A

## Question:
${askInput}

## Answer:
${askOutput}

---
Generated by Spydus Cataloguing Assistant
Date: ${new Date().toLocaleDateString()}`;

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spydus-qa-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Handler for printing the Q&A
    const handlePrint = () => {
        if (!askInput.trim() || !askOutput.trim()) return;
        
        const printWindow = window.open('', '_blank');
        const printContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Spydus Cataloguing Assistant - Q&A</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            border-bottom: 2px solid #007582;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #007582;
            margin: 0;
            font-size: 24px;
        }
        .question {
            background-color: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #007582;
            margin-bottom: 20px;
        }
        .question h2 {
            margin-top: 0;
            color: #007582;
            font-size: 18px;
        }
        .answer {
            margin-bottom: 30px;
        }
        .answer h2 {
            color: #007582;
            font-size: 18px;
            margin-bottom: 15px;
        }
        .footer {
            border-top: 1px solid #ddd;
            padding-top: 15px;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Spydus Cataloguing Assistant</h1>
        <p>Expert Q&A Session</p>
    </div>
    
    <div class="question">
        <h2>Question:</h2>
        <p>${askInput.replace(/\n/g, '<br>')}</p>
    </div>
    
    <div class="answer">
        <h2>Answer:</h2>
        <div>${askOutput.replace(/\n/g, '<br>')}</div>
    </div>
    
    <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p>Spydus Cataloguing Assistant</p>
    </div>
</body>
</html>`;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    return (
        <div className="bg-[#E2F2F2] min-h-screen p-4 sm:p-8 flex items-center justify-center font-sans text-gray-800">
            <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-10 w-full max-w-2xl">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-8 border-b-2 border-teal-700 pb-4">
                    <LibraryBig className="w-12 h-12 text-[#007582]" />
                    <h1 className="text-3xl sm:text-4xl font-bold text-[#007582] leading-tight">Spydus Cataloguing Assistant</h1>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b-2 border-gray-200">
                    <button
                        onClick={() => setActiveTab('generate')}
                        className={`flex-1 text-center py-3 px-4 text-lg font-medium border-b-2 transition-colors duration-200 ease-in-out
              ${activeTab === 'generate' ? 'border-[#007582] text-[#007582]' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}
                    >
                        Generate Record
                    </button>
                    <button
                        onClick={() => setActiveTab('ask')}
                        className={`flex-1 text-center py-3 px-4 text-lg font-medium border-b-2 transition-colors duration-200 ease-in-out
              ${activeTab === 'ask' ? 'border-[#007582] text-[#007582]' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}
                    >
                        Ask the Expert
                    </button>
                </div>

                {/* Tab Content - Generate Record */}
                {activeTab === 'generate' && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-[#007582] mb-4">Generate MARC21 Record</h2>
                        <div className="mb-6">
                            <label htmlFor="itemInput" className="block text-lg font-medium text-gray-700 mb-2">
                                Enter Library Item Details:
                            </label>
                            <textarea
                                id="itemInput"
                                value={itemInput}
                                onChange={(e) => setItemInput(e.target.value)}
                                className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007582] focus:border-[#007582] transition-all text-sm resize-none"
                                placeholder="E.g., Title: Researching and writing history: a guide for local historians. Author: D. P Dymond. Publisher: Carnegie Publishing. Publication date: 2016. Subjects: Historiography Great Britain, Local history Methodology."
                            />
                        </div>
                        <div className="flex flex-col space-y-4 mb-8">
                            <button
                                onClick={handleCatalogue}
                                disabled={isLoading}
                                className="flex-1 flex items-center justify-center space-x-2 bg-[#007582] hover:bg-[#00A5A5] text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <Book size={20} />
                                )}
                                <span>{isLoading ? 'Cataloguing...' : 'Generate Spydus Record'}</span>
                            </button>
                        </div>
                        {catalogueOutput && (
                            <div className="mt-8 border-t pt-6">
                                <div className="flex justify-between items-center mb-3">
                                    <h2 className="text-xl font-bold text-[#007582]">Generated Catalogue Record:</h2>
                                    <button
                                        onClick={handleCopy}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-lg transition-colors flex items-center space-x-2"
                                        title="Copy to clipboard"
                                    >
                                        <ClipboardCheck size={18} className={`${isCopied ? 'text-green-600' : ''}`} />
                                        <span className="text-sm">{isCopied ? 'Copied!' : 'Copy'}</span>
                                    </button>
                                </div>
                                <pre className="bg-[#E2F2F2] border border-[#00A5A5] rounded-lg p-4 text-sm whitespace-pre-wrap break-words overflow-x-auto font-mono text-gray-700 leading-relaxed shadow-inner">
                                    {catalogueOutput}
                                </pre>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Content - Ask me anything */}
                {activeTab === 'ask' && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-[#007582] mb-4">Ask me anything about Spydus Cataloguing</h2>
                        <div className="mb-4">
                            <label htmlFor="askInput" className="block text-lg font-medium text-gray-700 mb-2">
                                Your Question:
                            </label>
                            <textarea
                                id="askInput"
                                value={askInput}
                                onChange={(e) => setAskInput(e.target.value)}
                                className="w-full h-24 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007582] focus:border-[#007582] transition-all text-sm resize-none"
                                placeholder="E.g., How do I merge duplicate bibliographic records?"
                            />
                        </div>
                        <div className="flex items-center space-x-4 mb-4">
                            <button
                                onClick={handleAsk}
                                disabled={isAsking}
                                className="flex-1 flex items-center justify-center space-x-2 bg-[#5DBFC0] hover:bg-[#9AD3D4] text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                            >
                                {isAsking ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <MessageSquare size={20} />
                                )}
                                <span>{isAsking ? 'Thinking...' : 'Ask the Expert'}</span>
                            </button>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-md font-semibold text-gray-700 mb-2">Suggested questions:</h3>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                                <li>What is the process for creating a new record from a template?</li>
                                <li>How do I handle non-book materials like a Digital Tool Library item?</li>
                                <li>Explain how to use the 'Select/Change' feature to modify multiple records at once.</li>
                            </ul>
                        </div>
                        {askOutput && (
                            <div className="mt-4 border-t pt-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Answer:</h3>
                                <div className="bg-[#E2F2F2] border border-[#00A5A5] rounded-lg p-4 text-sm text-gray-700 leading-relaxed shadow-inner prose prose-sm max-w-none">
                                    <ReactMarkdown>{askOutput}</ReactMarkdown>
                                </div>
                                <div className="flex justify-end space-x-2 mt-4">
                                    <button
                                        onClick={handleDownload}
                                        className="bg-[#007582] hover:bg-[#00A5A5] text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm"
                                        title="Download as markdown file"
                                    >
                                        <Download size={16} />
                                        <span>Download</span>
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="bg-[#5DBFC0] hover:bg-[#9AD3D4] text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm"
                                        title="Print Q&A"
                                    >
                                        <Printer size={16} />
                                        <span>Print</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
