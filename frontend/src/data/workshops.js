// Dummy workshops.  Each workshop contains metadata used across the app,
// including a simple quiz and a final quiz.  Trainers and students are
// linked by user id.
const workshops = [
  {
    id: 1,
    title: 'AI for Pharmacists',
    trainerId: 2,
    trainerName: 'Bob Smith',
    nextSession: '2025-08-01',
    description: 'Discover how artificial intelligence can transform pharmacy practice.',
    price: 'Free',
    ppt: '/placeholder.pdf',
    agenda: '1. Introduction to AI\n2. Case studies in drug discovery\n3. Hands‑on coding',
    students: [1, 3],
    questions: [
      {
        id: 1,
        question: 'What does AI stand for?',
        options: {
          A: 'Artificial Intelligence',
          B: 'Automated Integration',
          C: 'Analog Interface',
          D: 'Advanced Interaction'
        },
        answer: 'A'
      },
      {
        id: 2,
        question: 'Which company recently used AI to discover a new antibiotic?',
        options: {
          A: 'Pfizer',
          B: 'DeepMind',
          C: 'Novartis',
          D: 'OpenAI'
        },
        answer: 'B'
      }
    ],
    finalQuestions: [
      {
        id: 1,
        question: 'AI can help pharmacists by...',
        options: {
          A: 'Remembering every drug interaction',
          B: 'Making coffee',
          C: 'Replacing human empathy',
          D: 'None of the above'
        },
        answer: 'A'
      },
      {
        id: 2,
        question: 'What language will you learn in this workshop?',
        options: {
          A: 'Java',
          B: 'Python',
          C: 'C++',
          D: 'Hindi'
        },
        answer: 'B'
      }
    ],
    // New: sections for progressive learning.  Each section has its own
    // PPT, starter code and quiz.  Students must complete the quiz
    // correctly to progress.  Progress is stored on the client side.
    sections: [
      {
        id: 'python-basics',
        title: 'Python Basics',
        ppt: '/ppt/python_basics.pdf',
        code: 'print("Hello Healthcare AI")',
        quiz: [
          {
            id: 1,
            question: 'What does the print() function do in Python?',
            options: {
              A: 'Declares a variable',
              B: 'Outputs text to the console',
              C: 'Reads user input',
              D: 'Deletes a file'
            },
            answer: 'B',
            explanation: 'The print() function writes the specified message to the screen or other standard output.'
          },
          {
            id: 2,
            question: 'Which symbol is used to start a comment in Python?',
            options: {
              A: '//',
              B: '#',
              C: '/*',
              D: '<!--'
            },
            answer: 'B',
            explanation: 'In Python, the hash symbol (#) denotes a single-line comment.'
          }
        ]
      },
      {
        id: 'model-drug-discovery',
        title: 'AI Model 1: Drug Discovery',
        ppt: '/ppt/drug_discovery_ai.pdf',
        code: '# Placeholder example of a machine learning model\nfrom sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\n# ... load data and train ...',
        quiz: [
          {
            id: 1,
            question: 'AI-assisted drug discovery helps to…',
            options: {
              A: 'Speed up identification of candidate molecules',
              B: 'Prove the toxicity of water',
              C: 'Write prescriptions automatically',
              D: 'None of the above'
            },
            answer: 'A',
            explanation: 'AI screens huge compound libraries to identify promising molecules much faster than traditional methods.'
          },
          {
            id: 2,
            question: 'Which algorithm type is often used to predict continuous outcomes like drug efficacy?',
            options: {
              A: 'Regression models',
              B: 'Sorting algorithms',
              C: 'Compression algorithms',
              D: 'Search algorithms'
            },
            answer: 'A',
            explanation: 'Regression models are used for predicting continuous numerical values such as drug efficacy.'
          }
        ]
      },
      {
        id: 'model-interaction',
        title: 'AI Model 2: Drug Interaction Prediction',
        ppt: '/ppt/drug_interaction_ai.pdf',
        code: '# Placeholder example for drug interaction prediction\nimport pandas as pd\n# load and preprocess datasets ...\n# build interaction prediction model ...',
        quiz: [
          {
            id: 1,
            question: 'What is the goal of a drug interaction model?',
            options: {
              A: 'Determine how drugs taste',
              B: 'Predict adverse effects when drugs are taken together',
              C: 'Find cheaper packaging solutions',
              D: 'Evaluate marketing strategies'
            },
            answer: 'B',
            explanation: 'Drug interaction models aim to predict harmful effects when multiple drugs are taken simultaneously.'
          },
          {
            id: 2,
            question: 'Why are large datasets important for interaction prediction?',
            options: {
              A: 'They reduce computation time',
              B: 'They allow the model to learn from many known interactions',
              C: 'They make charts look prettier',
              D: 'They aren’t important'
            },
            answer: 'B',
            explanation: 'Training on large datasets with many known interactions helps models learn patterns for better predictions.'
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Data Science Basics',
    trainerId: 4,
    trainerName: 'Dave Wilson',
    nextSession: '2025-08-05',
    description: 'Learn the fundamentals of data science and statistics.',
    price: '$49',
    ppt: '/placeholder.pdf',
    agenda: '1. Statistics 101\n2. Data visualisation\n3. Building your first model',
    students: [1],
    questions: [
      {
        id: 1,
        question: 'Which of the following is a measure of central tendency?',
        options: {
          A: 'Mean',
          B: 'Variance',
          C: 'Standard deviation',
          D: 'None'
        },
        answer: 'A'
      },
      {
        id: 2,
        question: 'Pandas in Python is used for...',
        options: {
          A: 'Web development',
          B: 'Data manipulation',
          C: 'Game design',
          D: 'Mobile apps'
        },
        answer: 'B'
      }
    ],
    finalQuestions: [
      {
        id: 1,
        question: 'What is a DataFrame?',
        options: {
          A: 'A two-dimensional labelled data structure',
          B: 'A type of chart',
          C: 'A neural network',
          D: 'A database'
        },
        answer: 'A'
      },
      {
        id: 2,
        question: 'Which library is commonly used for plotting in Python?',
        options: {
          A: 'NumPy',
          B: 'Matplotlib',
          C: 'Requests',
          D: 'TensorFlow'
        },
        answer: 'B'
      }
    ]
  }
];

export default workshops;