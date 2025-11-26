import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Import worker directly to avoid CDN issues
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const FileParser = {
    async extractText(file: File): Promise<string> {
        const fileType = file.type;

        if (fileType === 'application/pdf') {
            return this.extractFromPDF(file);
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return this.extractFromDocx(file);
        } else {
            throw new Error('Unsupported file type. Please upload PDF or DOCX.');
        }
    },

    async extractFromPDF(file: File): Promise<string> {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    },

    async extractFromDocx(file: File): Promise<string> {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    }
};
