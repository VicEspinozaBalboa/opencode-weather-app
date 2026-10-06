import * as readline from 'node:readline';

const createInterface = () => {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
};

export const askQuestion = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    const rl = createInterface();
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

export const askQuestionWithDefault = (question: string, defaultValue: string): Promise<string> => {
  return new Promise((resolve) => {
    const rl = createInterface();
    const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
    rl.question(prompt, (answer) => {
      rl.close();
      const trimmed = answer.trim();
      resolve(trimmed === '' ? defaultValue : trimmed);
    });
  });
};

export const askConfirmation = async (question: string): Promise<boolean> => {
  const answer = await askQuestion(`${question} (s/n): `);
  const normalized = answer.toLowerCase();
  return normalized === 's' || normalized === 'si' || normalized === 'sí' || normalized === 'y' || normalized === 'yes';
};

export const readLine = async (): Promise<string> => {
  const rl = createInterface();
  return new Promise((resolve) => {
    rl.question('', (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};
