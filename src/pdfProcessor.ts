import pdfParse from 'pdf-parse';

// pdfProcessor.ts
export class PdfProcessor {
    async extractText(pdfBuffer: Buffer): Promise<string> {
        try {
            const data = await pdfParse(pdfBuffer, {
                pagerender: render_page
            });
            return this.cleanText(data.text);
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }

    private cleanText(text: string): string {
        return text
            .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
            .replace(/[\r\n]+/g, '\n')      // Normalize line breaks
            .trim();
    }
}

// Custom render function to better handle PDF layout
function render_page(pageData: any) {
    let render_options = {
        normalizeWhitespace: true,
        disableCombineTextItems: false
    };
    return pageData.getTextContent(render_options)
        .then(function(textContent: any) {
            let lastY, text = '';
            for (let item of textContent.items) {
                if (lastY == item.transform[5] || !lastY){
                    text += item.str;
                } else {
                    text += '\n' + item.str;
                }
                lastY = item.transform[5];
            }
            return text;
        });
}