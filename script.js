// Initialize PDF.js
// We need to explicitly set the worker source
pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js';

async function parsePDF() {
    const fileInput = document.getElementById('pdfFile');
    const output = document.getElementById('output');

    if (!fileInput.files.length) {
        alert("Please select a PDF file.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function () {
        try {
            const typedArray = new Uint8Array(this.result);
            
            // Load the PDF file
            const loadingTask = pdfjsLib.getDocument({ data: typedArray });
            const pdf = await loadingTask.promise;
            
            let textContent = "";

            // Get text from each page
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items.map(item => item.str).join(' ');
                textContent += `Page ${i}: ${pageText}\n\n`;
            }

            // Send to LM Studio API
            try {
                const response = await fetch("http://localhost:3000/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "local-model",
                        messages: [{ role: "user", content: `Extract invoice details: ${textContent}` }],
                        temperature: 0.7
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error.message || 'Unknown error occurred');
                }

                output.textContent = data.choices?.[0]?.message?.content || "No response from the model";
            } catch (error) {
                console.error('API Error:', error);
                output.textContent = `Error: ${error.message}. Make sure LM Studio is running on port 8080.`;
            }
        } catch (error) {
            console.error('PDF Error:', error);
            output.textContent = `Error processing PDF: ${error.message}`;
        }
    };

    reader.onerror = function (error) {
        console.error('File Error:', error);
        output.textContent = `Error reading file: ${error.message}`;
    };

    reader.readAsArrayBuffer(file);
}
