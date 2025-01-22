# Resume Work Experience Extractor 🚀

Automatically extract work experience details from PDF resumes using OpenAI's GPT API. Perfect for HR teams, recruiters, or anyone who needs to process resume information quickly and accurately.

## Features ✨

* PDF text extraction with high accuracy
* Intelligent work experience parsing using OpenAI
* Structured JSON output for easy integration
* Robust error handling and retry mechanisms
* TypeScript support for type safety

## Quick Start 🏃‍♂️

1. Clone the repository:
    ```bash
    git clone git@github.com:manonja/resume-parser-with-llm
    cd wwr-resume-autofill
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file with your OpenAI API key:
    ```bash
    OPENAI_API_KEY=your_api_key_here
    ```

4. Run the demo:
    ```bash
    npm run demo path/to/resume.pdf
    ```

## Output Format 📝

The tool extracts work experiences in the following format:

```json
[
  {
    "companyName": "Example Corp",
    "title": "Senior Developer",
    "startDate": "2020-01",
    "endDate": "Present",
    "description": "Led development of..."
  }
]
```

## Development 🛠️

This project uses:
* TypeScript for type safety
* OpenAI GPT-3.5 Turbo for AI processing
* Pre-commit hooks for code quality
* Comprehensive error handling

### Setting Up Development Environment

1. Install dev dependencies:
    ```bash
    npm install --save-dev husky lint-staged prettier typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint
    ```

2. Set up pre-commit hooks:
    ```bash
    npm run prepare
    ```

3. Run linting:
    ```bash
    npm run lint
    ```

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

No Licence


