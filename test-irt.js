// Test IRT implementation
const LEVEL_DIFFICULTY = {
  'A1': -2.0,
  'A2': -1.0,
  'B1': 0.0,
  'B2': 1.0,
  'C1': 2.0,
  'C2': 3.0
};

const DISCRIMINATION = 1.0;

function irtProbability(theta, difficulty, discrimination = DISCRIMINATION) {
  return 1 / (1 + Math.exp(-discrimination * (theta - difficulty)));
}

function fisherInformation(theta, difficulty, discrimination = DISCRIMINATION) {
  const p = irtProbability(theta, difficulty, discrimination);
  return discrimination * discrimination * p * (1 - p);
}

function estimateAbilityMLE(answers) {
  if (answers.length === 0) return 0;

  let theta = 0;
  const maxIterations = 20;
  const tolerance = 0.01;

  for (let iter = 0; iter < maxIterations; iter++) {
    let firstDerivative = 0;
    let secondDerivative = 0;

    answers.forEach(answer => {
      const difficulty = LEVEL_DIFFICULTY[answer.level];
      const p = irtProbability(theta, difficulty);
      const w = fisherInformation(theta, difficulty);

      if (answer.isCorrect) {
        firstDerivative += DISCRIMINATION * (1 - p);
        secondDerivative -= w;
      } else {
        firstDerivative -= DISCRIMINATION * p;
        secondDerivative -= w;
      }
    });

    if (Math.abs(secondDerivative) < 0.0001) break;
    const delta = firstDerivative / secondDerivative;
    theta -= delta;

    theta = Math.max(-3, Math.min(3, theta));

    if (Math.abs(delta) < tolerance) break;
  }

  return theta;
}

function thetaToLevel(theta) {
  if (theta < -1.5) return 'A1';
  if (theta < -0.5) return 'A2';
  if (theta < 0.5) return 'B1';
  if (theta < 1.5) return 'B2';
  if (theta < 2.5) return 'C1';
  return 'C2';
}

// Test scenarios
console.log('Testing IRT Implementation\n');

// Scenario 1: Beginner (gets A1 correct, A2 wrong)
const beginnerAnswers = [
  { level: 'A1', isCorrect: true },
  { level: 'A1', isCorrect: true },
  { level: 'A1', isCorrect: true },
  { level: 'A2', isCorrect: false },
  { level: 'A2', isCorrect: false }
];
const beginnerTheta = estimateAbilityMLE(beginnerAnswers);
console.log(`Beginner: theta=${beginnerTheta.toFixed(2)}, level=${thetaToLevel(beginnerTheta)}`);

// Scenario 2: Intermediate (gets B1 mostly correct)
const intermediateAnswers = [
  { level: 'B1', isCorrect: true },
  { level: 'B1', isCorrect: true },
  { level: 'A2', isCorrect: true },
  { level: 'B2', isCorrect: false },
  { level: 'B1', isCorrect: true }
];
const intermediateTheta = estimateAbilityMLE(intermediateAnswers);
console.log(`Intermediate: theta=${intermediateTheta.toFixed(2)}, level=${thetaToLevel(intermediateTheta)}`);

// Scenario 3: Advanced (gets B2/C1 correct)
const advancedAnswers = [
  { level: 'B1', isCorrect: true },
  { level: 'B2', isCorrect: true },
  { level: 'B2', isCorrect: true },
  { level: 'C1', isCorrect: true },
  { level: 'C1', isCorrect: false }
];
const advancedTheta = estimateAbilityMLE(advancedAnswers);
console.log(`Advanced: theta=${advancedTheta.toFixed(2)}, level=${thetaToLevel(advancedTheta)}`);

// Scenario 4: True A1 level (correct A1, wrong A2)
const trueA1Answers = [
  { level: 'A1', isCorrect: true },
  { level: 'A1', isCorrect: true },
  { level: 'A2', isCorrect: false },
  { level: 'A2', isCorrect: false },
  { level: 'A1', isCorrect: true }
];
const trueA1Theta = estimateAbilityMLE(trueA1Answers);
console.log(`True A1: theta=${trueA1Theta.toFixed(2)}, level=${thetaToLevel(trueA1Theta)}`);

// Scenario 5: True C1 level (mixed performance)
const trueC1Answers = [
  { level: 'B1', isCorrect: true },
  { level: 'B2', isCorrect: true },
  { level: 'C1', isCorrect: true },
  { level: 'C1', isCorrect: true },
  { level: 'C2', isCorrect: false },
  { level: 'C2', isCorrect: false },
  { level: 'C1', isCorrect: true }
];
const trueC1Theta = estimateAbilityMLE(trueC1Answers);
console.log(`True C1: theta=${trueC1Theta.toFixed(2)}, level=${thetaToLevel(trueC1Theta)}`);

console.log('\n✓ IRT tests complete');
