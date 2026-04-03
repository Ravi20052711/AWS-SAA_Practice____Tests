import fs from 'fs';
import https from 'https';
import path from 'path';

const REPO_URL = 'https://raw.githubusercontent.com/Iamrushabhshahh/AWS-Certified-Solutions-Architect-Associate-SAA-C03-Exam-Dump-With-Solution/main/AWS%20SAA-03%20Solution.txt';
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'data', 'questions.json');

const parseQuestions = (text) => {
    // Basic regex logic to find question blocks.
    // The text seems to be separated by "-------------------------------------------------------"
    const blocks = text.split(/---+/);
    
    let questions = [];
    
    blocks.forEach((block, index) => {
        // Strip block
        let content = block.trim();
        if (!content) return;
        
        // Find question number indicating the start, like "1]" or "2]"
        const qMatch = content.match(/^(\d+)[\]\.]\s*(.*?)(\n\s*ans-|\n\s*Correct answer|\n\s*[A-E]\.|\n\s*General line:|\n\s*Keywords:|$)/is);
        
        if (qMatch) {
            let id = qMatch[1];
            let questionText = qMatch[2].trim();
            
            // Extract answer options if available
            // In the text, correct answer might be identified. Let's look for correct answer:
            // "ans- " or "[A-E] " 
            const ansMatch = content.match(/(ans-|Correct answer [A-E]:|[A-E]\.)\s*(.*?)(?=\n\n|\n-|\n[A-Z][a-z]|$)/s);
            let correctAnswerStr = "";
            if (ansMatch) {
                correctAnswerStr = ansMatch[2].trim();
            } else {
                // Sometime the answer is the remainder of the block
                correctAnswerStr = content.replace(qMatch[0], "").trim();
            }

            // Clean question text of any leading/trailing garbage
            let explanation = content.replace(qMatch[1] + "] " + questionText, "").trim();

            if (questionText.length > 10 && correctAnswerStr.length > 2) {
                questions.push({
                    id: parseInt(id),
                    question: questionText,
                    correctAnswer: correctAnswerStr,
                    explanation: explanation
                });
            }
        }
    });

    // Generate distractors
    questions.forEach((q, idx) => {
        let distractors = [];
        let attempts = 0;
        
        while (distractors.length < 3 && attempts < 50) {
            let randIdx = Math.floor(Math.random() * questions.length);
            let cand = questions[randIdx].correctAnswer;
            if (randIdx !== idx && !distractors.includes(cand) && cand !== q.correctAnswer && cand.length < 300) {
                distractors.push(cand);
            }
            attempts++;
        }
        
        // If could not find 3, add generic ones
        while (distractors.length < 3) {
            distractors.push("Generic distractor option " + (distractors.length + 1));
        }

        // Shuffle options
        let options = [q.correctAnswer, ...distractors];
        options.sort(() => Math.random() - 0.5);

        q.options = options;
    });

    return questions;
};

const fetchAndParse = () => {
    console.log(`Fetching questions from ${REPO_URL}...`);
    https.get(REPO_URL, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`Parsing dataset...`);
            const questions = parseQuestions(data);
            
            // Generate output dir if not exist
            const outDir = path.dirname(OUTPUT_FILE);
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }
            
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(questions, null, 2));
            console.log(`Successfully generated ${questions.length} questions to ${OUTPUT_FILE}`);
        });
    }).on("error", (err) => {
        console.error("Error: " + err.message);
    });
};

fetchAndParse();
