import { config } from 'dotenv';
import { OpenRouterClient } from './openRouterClient';
import { PdfProcessor } from './pdfProcessor';
import * as fs from 'fs/promises';
import * as path from 'path';

// Load environment variables from .env file
config();

async function main() {
    // Check if PDF path is provided
    const pdfPath = process.argv[2];
    if (!pdfPath) {
        console.error('Please provide a path to a PDF file');
        console.error('Usage: npm run demo <path-to-pdf>');
        process.exit(1);
    }

    // Check if API key is provided
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error('Please set the OPENAI_API_KEY in your .env file');
        process.exit(1);
    }

    // Debug: Check API key format (only show first 10 chars)
    console.log('API Key format check:', apiKey.substring(0, 10) + '...');

    try {
        console.log('Reading PDF file...');
        const pdfBuffer = await fs.readFile(pdfPath);
        
        console.log('Extracting text from PDF...');
        const pdfProcessor = new PdfProcessor();
        const pdfText = await pdfProcessor.extractText(pdfBuffer);
        
        console.log('Analyzing text with OpenAI...');
        const openRouterClient = new OpenRouterClient(apiKey);
        const workExperiences = await openRouterClient.analyzePdfContent(pdfText);
        
        console.log('\nExtracted Work Experiences:');
        console.log(JSON.stringify(workExperiences, null, 2));
    } catch (error) {
        console.error('Error processing PDF:', error);
        process.exit(1);
    }
}

main(); 