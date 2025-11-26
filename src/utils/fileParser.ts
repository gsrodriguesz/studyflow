import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Use CDN for worker to avoid local serving issues with Vite
// This is more reliable than importing the worker file locally in some Vite configurations
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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
    },

    async convertPDFToImages(file: File): Promise<string[]> {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const images: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (!context) continue;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport } as any).promise;

            // Get base64 string (remove data:image/jpeg;base64, prefix)
            const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            images.push(base64);
        }

        return images;
    }
};
