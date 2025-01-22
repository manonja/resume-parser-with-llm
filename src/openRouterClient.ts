import axios, { AxiosError } from 'axios';

// Type Definitions
export interface WorkExperience {
    companyName: string;
    title: string;
    startDate: string;
    endDate: string;
    description: string;
}

interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface OpenAIChoice {
    index: number;
    message: OpenAIMessage;
    finish_reason: 'stop' | 'length' | 'content_filter' | null;
}

interface OpenAIResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: OpenAIChoice[];
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// Prompts
const SYSTEM_PROMPT = `You are an expert at analyzing resumes and extracting work experience information. 
Return the work experiences as a JSON array where each experience has these exact fields:
{
    "companyName": "string",
    "title": "string",
    "startDate": "YYYY-MM",
    "endDate": "YYYY-MM or Present",
    "description": "string"
}

Return ONLY the JSON array with no additional text or explanation.`;

const USER_PROMPT = (pdfText: string) => 
    `Extract all work experiences from this resume and return them as a JSON array:\n\n${pdfText}`;

export class OpenRouterClient {
    private readonly apiKey: string;
    private readonly baseUrl: string = 'https://api.openai.com';
    private readonly maxRetries = 3;
    private readonly timeout = 30000; // 30 seconds

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error('OpenAI API key is required');
        }
        this.apiKey = apiKey;
    }

    async analyzePdfContent(pdfText: string): Promise<WorkExperience[]> {
        let attempt = 0;
        
        while (attempt < this.maxRetries) {
            try {
                const response = await axios.post<OpenAIResponse>(
                    `${this.baseUrl}/v1/chat/completions`,
                    {
                        model: 'gpt-3.5-turbo-0125',
                        messages: [
                            {
                                role: 'system',
                                content: SYSTEM_PROMPT
                            },
                            {
                                role: 'user',
                                content: USER_PROMPT(pdfText)
                            }
                        ],
                        temperature: 0.3,
                        max_tokens: 2000
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: this.timeout
                    }
                );
    
                // Add debug logging
                console.log('Raw API Response:', response.data);
                console.log('Content:', response.data.choices[0]?.message?.content);
    
                const content = response.data.choices[0]?.message?.content;
                if (!content) {
                    throw new Error('Empty response from OpenAI');
                }
    
                return this.parseWorkExperiences(content);
    
            } catch (error) {
                // ...rest of the error handling
            }
        }
        throw new Error('Max retries exceeded');
    }
    
    private parseWorkExperiences(content: string): WorkExperience[] {
        try {
            // Add debug logging
            console.log('Parsing content:', content);
            
            const parsed = JSON.parse(content);    
            // Check if the parsed content has a 'workExperiences' property
            const experiences = Array.isArray(parsed) ? parsed : parsed.workExperiences;
            
            if (!Array.isArray(experiences)) {
                throw new Error('Invalid response format: expected array');
            }
    
            // Validate each experience
            experiences.forEach(this.validateWorkExperience);
            
            return experiences;
        } catch (error) {
            console.error('Error parsing work experiences:', error);
            throw new Error('Failed to parse work experiences from AI response');
        }
    }

    private validateWorkExperience(experience: WorkExperience) {
        const requiredFields: (keyof WorkExperience)[] = [
            'companyName', 
            'title', 
            'startDate', 
            'endDate', 
            'description'
        ];

        for (const field of requiredFields) {
            if (!experience[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate date formats
        const dateRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
        if (!dateRegex.test(experience.startDate) && experience.startDate !== 'Present') {
            throw new Error(`Invalid startDate format: ${experience.startDate}`);
        }
        if (!dateRegex.test(experience.endDate) && experience.endDate !== 'Present') {
            throw new Error(`Invalid endDate format: ${experience.endDate}`);
        }
    }

    private handleError(error: unknown): Error {
        if (error instanceof AxiosError) {
            const status = error.response?.status;
            const data = error.response?.data;
            
            switch (status) {
                case 401:
                    return new Error('Invalid API key');
                case 429:
                    return new Error('Rate limit exceeded');
                case 500:
                    return new Error('OpenAI server error');
                default:
                    return new Error(`API error: ${status} - ${JSON.stringify(data)}`);
            }
        }
        return error instanceof Error ? error : new Error('Unknown error occurred');
    }
}