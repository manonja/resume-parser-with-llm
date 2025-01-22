import { OpenRouterClient, WorkExperience } from './openRouterClient';
import { PdfProcessor } from './pdfProcessor';

export class ResumeAnalyzer {
    private openRouterClient: OpenRouterClient;
    private pdfProcessor: PdfProcessor;
    private readonly maxFileSize = 10 * 1024 * 1024; // 10MB limit

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error('API key is required');
        }
        this.openRouterClient = new OpenRouterClient(apiKey);
        this.pdfProcessor = new PdfProcessor();
    }

    async processResume(pdfBuffer: Buffer): Promise<WorkExperience[]> {
        try {
            // Validate input
            if (!Buffer.isBuffer(pdfBuffer)) {
                throw new Error('Invalid input: expected Buffer');
            }

            // Check file size
            if (pdfBuffer.length > this.maxFileSize) {
                throw new Error('PDF file too large (max 10MB)');
            }

            // Extract text from PDF
            const pdfText = await this.pdfProcessor.extractText(pdfBuffer);
            console.log('Extracted PDF text sample:', pdfText.slice(0, 500)); // First 500 chars


            // Validate extracted text
            if (!pdfText || pdfText.trim().length === 0) {
                throw new Error('No text content found in PDF');
            }

            // Analyze text with OpenRouter
            const experiences = await this.openRouterClient.analyzePdfContent(pdfText);

            // Validate response
            if (!Array.isArray(experiences) || experiences.length === 0) {
                throw new Error('No work experiences found in the resume');
            }

            return experiences;

        } catch (error) {
            if (error instanceof Error) {
                console.error('Error processing resume:', error.message);
                throw error;
            }
            // Handle unknown errors
            console.error('Unknown error processing resume:', error);
            throw new Error('Failed to process resume');
        }
    }

    // Helper method to validate work experience data
    private validateWorkExperience(experience: WorkExperience): boolean {
        return !!(
            experience.companyName &&
            experience.title &&
            experience.startDate &&
            experience.endDate &&
            experience.description
        );
    }
}