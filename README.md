## Spydus Cataloguing Assistant
The Spydus Cataloguing Assistant is a web-based tool designed to help library staff streamline the cataloguing process within the Spydus Library Management System (LMS). It features a modern, tabbed interface with two core functions: automatic MARC21 record generation and an AI-powered expert chat.

# Features

* **Generate MARC21 Records:** Easily create correctly formatted MARC21 bibliographic records by inputting basic item details. The tool uses a private knowledge base of Spydus cataloguing rules and MARC21 standards to ensure accuracy.
* **Ask the Expert:** Get instant, detailed answers to your cataloguing questions. The AI-powered chat references a comprehensive knowledge base of Spydus documentation to provide authoritative guidance.
* **Responsive Design:** Built with React and Tailwind CSS, the application provides a seamless experience on both desktop and mobile devices.

# How to Use
The app is a single-page application and does not require a complex setup. Simply open the app in a web browser to start.

**Generate Record**
1. Click the "Generate Record" tab.
2. In the text area, enter the item details you want to catalogue (e.g., title, author, publication date, subjects).
3. Click the "Generate Spydus Record" button.
4. The formatted MARC21 record will appear below, ready for you to copy and paste into your Spydus LMS.

**Ask the Expert**
1. Click the "Ask the Expert" tab.
2. Type your question about Spydus cataloguing into the text area. You can also use one of the suggested questions.
3. Click the "Ask the Expert" button.
4. The AI will provide a detailed answer based on the app's knowledge base.

# Technical Stack
* **Frontend:** React (JSX)
* **Styling:** Tailwind CSS
* **LLM Integration:** Generative AI API (e.g., Gemini API) for generating records and providing expert answers.
* **Authentication:** Firebase for user authentication.
