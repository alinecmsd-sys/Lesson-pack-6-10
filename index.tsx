import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
type VocabItem = {
  en: string;
  pt: string;
  tts: string;
};

type PhraseItem = {
  en: string;
  pt: string;
  tts: string;
  type?: 'affirmative' | 'negative' | 'interrogative';
};

type ExerciseItem = {
  id: string;
  scrambled: string[];
  answer: string; // Internal validation only
  translation: string;
  tts?: string;
};

type Lesson = {
  id: number;
  title: string;
  vocabulary: VocabItem[];
  phrases: PhraseItem[];
  exercises: ExerciseItem[];
};

// --- Data ---
const LESSON_DATA: Lesson[] = [
  {
    id: 6,
    title: "Lesson 6 – Opposite Adjectives",
    vocabulary: [
      { en: "Big", pt: "Grande", tts: "Big" }, { en: "Small", pt: "Pequeno", tts: "Small" },
      { en: "Deep", pt: "Fundo", tts: "Deep" }, { en: "Shallow", pt: "Raso", tts: "Shallow" },
      { en: "Heavy", pt: "Pesado", tts: "Heavy" }, { en: "Light", pt: "Leve", tts: "Light" },
      { en: "Fast", pt: "Rápido", tts: "Fast" }, { en: "Slow", pt: "Lento", tts: "Slow" },
      { en: "Hot", pt: "Quente", tts: "Hot" }, { en: "Cold", pt: "Frio", tts: "Cold" },
      { en: "Hard", pt: "Duro", tts: "Hard" }, { en: "Soft", pt: "Macio", tts: "Soft" },
      { en: "Tall", pt: "Alto", tts: "Tall" }, { en: "Short", pt: "Baixo", tts: "Short" },
      { en: "Wide", pt: "Largo", tts: "Wide" }, { en: "Narrow", pt: "Estreito", tts: "Narrow" },
      { en: "Strong", pt: "Forte", tts: "Strong" }, { en: "Weak", pt: "Fraco", tts: "Weak" },
      { en: "Clean", pt: "Limpo", tts: "Clean" }, { en: "Dirty", pt: "Sujo", tts: "Dirty" }
    ],
    phrases: [
      { en: "The box is big.", pt: "A caixa é grande.", tts: "The box is big.", type: 'affirmative' },
      { en: "The river is deep.", pt: "O rio é fundo.", tts: "The river is deep.", type: 'affirmative' },
      { en: "The car is fast.", pt: "O carro é rápido.", tts: "The car is fast.", type: 'affirmative' },
      { en: "The pillow is not hard.", pt: "O travesseiro não é duro.", tts: "The pillow is not hard.", type: 'negative' },
      { en: "The tea is not cold.", pt: "O chá não está frio.", tts: "The tea is not cold.", type: 'negative' },
      { en: "The room is not dirty.", pt: "O quarto não está sujo.", tts: "The room is not dirty.", type: 'negative' },
      { en: "Is the rock heavy?", pt: "A pedra é pesada?", tts: "Is the rock heavy?", type: 'interrogative' },
      { en: "Is the road wide?", pt: "A estrada é larga?", tts: "Is the road wide?", type: 'interrogative' },
      { en: "Is he strong?", pt: "Ele é forte?", tts: "Is he strong?", type: 'interrogative' }
    ],
    exercises: [
      { id: "l6e1", scrambled: ["is", "box", "The", "big"], answer: "The box is big", translation: "A caixa é grande." },
      { id: "l6e2", scrambled: ["not", "slow", "is", "He"], answer: "He is not slow", translation: "Ele não é lento." },
      { id: "l6e3", scrambled: ["dirty", "Is", "floor", "the"], answer: "Is the floor dirty", translation: "O chão está sujo?" },
      { id: "l6e4", scrambled: ["water", "is", "The", "cold"], answer: "The water is cold", translation: "A água está fria." },
      { id: "l6e5", scrambled: ["light", "feather", "is", "The"], answer: "The feather is light", translation: "A pena é leve." }
    ]
  },
  {
    id: 7,
    title: "Lesson 7 – Countries, Nationalities & Feelings",
    vocabulary: [
      { en: "Brazil", pt: "Brasil", tts: "Brazil" }, { en: "Brazilian", pt: "Brasileiro(a)", tts: "Brazilian" },
      { en: "USA", pt: "EUA", tts: "USA" }, { en: "American", pt: "Americano(a)", tts: "American" },
      { en: "Japan", pt: "Japão", tts: "Japan" }, { en: "Japanese", pt: "Japonês(a)", tts: "Japanese" },
      { en: "Italy", pt: "Itália", tts: "Italy" }, { en: "Italian", pt: "Italiano(a)", tts: "Italian" },
      { en: "France", pt: "França", tts: "France" }, { en: "French", pt: "Francês(a)", tts: "French" },
      { en: "Germany", pt: "Alemanha", tts: "Germany" }, { en: "German", pt: "Alemão(ã)", tts: "German" },
      { en: "Spain", pt: "Espanha", tts: "Spain" }, { en: "Spanish", pt: "Espanhol(a)", tts: "Spanish" },
      { en: "China", pt: "China", tts: "China" }, { en: "Chinese", pt: "Chinês(a)", tts: "Chinese" },
      { en: "Happy", pt: "Feliz", tts: "Happy" }, { en: "Sad", pt: "Triste", tts: "Sad" },
      { en: "Angry", pt: "Zangado", tts: "Angry" }, { en: "Tired", pt: "Cansado", tts: "Tired" },
      { en: "Hungry", pt: "Com fome", tts: "Hungry" }, { en: "Thirsty", pt: "Com sede", tts: "Thirsty" }
    ],
    phrases: [
      { en: "I am Brazilian.", pt: "Eu sou brasileiro.", tts: "I am Brazilian.", type: 'affirmative' },
      { en: "She is happy.", pt: "Ela está feliz.", tts: "She is happy.", type: 'affirmative' },
      { en: "They are from Japan.", pt: "Eles são do Japão.", tts: "They are from Japan.", type: 'affirmative' },
      { en: "He is not American.", pt: "Ele não é americano.", tts: "He is not American.", type: 'negative' },
      { en: "We are not tired.", pt: "Nós não estamos cansados.", tts: "We are not tired.", type: 'negative' },
      { en: "She is not sad.", pt: "Ela não está triste.", tts: "She is not sad.", type: 'negative' },
      { en: "Are you hungry?", pt: "Você está com fome?", tts: "Are you hungry?", type: 'interrogative' },
      { en: "Is he Italian?", pt: "Ele é italiano?", tts: "Is he Italian?", type: 'interrogative' },
      { en: "Are they thirsty?", pt: "Eles estão com sede?", tts: "Are they thirsty?", type: 'interrogative' }
    ],
    exercises: [
      { id: "l7e1", scrambled: ["from", "is", "He", "Spain"], answer: "He is from Spain", translation: "Ele é da Espanha." },
      { id: "l7e2", scrambled: ["Are", "happy", "you"], answer: "Are you happy", translation: "Você está feliz?" },
      { id: "l7e3", scrambled: ["not", "am", "I", "angry"], answer: "I am not angry", translation: "Eu não estou zangado." },
      { id: "l7e4", scrambled: ["French", "are", "They"], answer: "They are French", translation: "Eles são franceses." },
      { id: "l7e5", scrambled: ["tired", "Is", "she"], answer: "Is she tired", translation: "Ela está cansada?" }
    ]
  },
  {
    id: 8,
    title: "Lesson 8 – Prepositions of Place",
    vocabulary: [
      { en: "In", pt: "Dentro", tts: "In" }, { en: "On", pt: "Sobre/Em cima", tts: "On" },
      { en: "Under", pt: "Embaixo", tts: "Under" }, { en: "Behind", pt: "Atrás", tts: "Behind" },
      { en: "In front of", pt: "Na frente de", tts: "In front of" }, { en: "Next to", pt: "Ao lado de", tts: "Next to" },
      { en: "Between", pt: "Entre (dois)", tts: "Between" }, { en: "Above", pt: "Acima", tts: "Above" },
      { en: "Below", pt: "Abaixo", tts: "Below" },
      { en: "Table", pt: "Mesa", tts: "Table" }, { en: "Chair", pt: "Cadeira", tts: "Chair" },
      { en: "Box", pt: "Caixa", tts: "Box" }, { en: "Bed", pt: "Cama", tts: "Bed" },
      { en: "Car", pt: "Carro", tts: "Car" }, { en: "Tree", pt: "Árvore", tts: "Tree" },
      { en: "House", pt: "Casa", tts: "House" }, { en: "Dog", pt: "Cachorro", tts: "Dog" }
    ],
    phrases: [
      { en: "The cat is on the table.", pt: "O gato está em cima da mesa.", tts: "The cat is on the table.", type: 'affirmative' },
      { en: "The dog is in the house.", pt: "O cachorro está dentro da casa.", tts: "The dog is in the house.", type: 'affirmative' },
      { en: "The ball is under the chair.", pt: "A bola está embaixo da cadeira.", tts: "The ball is under the chair.", type: 'affirmative' },
      { en: "The car is not behind the tree.", pt: "O carro não está atrás da árvore.", tts: "The car is not behind the tree.", type: 'negative' },
      { en: "The shoes are not on the bed.", pt: "Os sapatos não estão sobre a cama.", tts: "The shoes are not on the bed.", type: 'negative' },
      { en: "He is not next to me.", pt: "Ele não está ao meu lado.", tts: "He is not next to me.", type: 'negative' },
      { en: "Where is the box?", pt: "Onde está a caixa?", tts: "Where is the box?", type: 'interrogative' },
      { en: "Is the bird above the house?", pt: "O pássaro está acima da casa?", tts: "Is the bird above the house?", type: 'interrogative' },
      { en: "What is in front of the car?", pt: "O que está na frente do carro?", tts: "What is in front of the car?", type: 'interrogative' }
    ],
    exercises: [
      { id: "l8e1", scrambled: ["is", "the", "Where", "dog"], answer: "Where is the dog", translation: "Onde está o cachorro?" },
      { id: "l8e2", scrambled: ["on", "book", "The", "is", "desk", "the"], answer: "The book is on the desk", translation: "O livro está sobre a escrivaninha." },
      { id: "l8e3", scrambled: ["under", "not", "is", "It", "bed", "the"], answer: "It is not under the bed", translation: "Não está embaixo da cama." },
      { id: "l8e4", scrambled: ["between", "is", "She", "us"], answer: "She is between us", translation: "Ela está entre nós." },
      { id: "l8e5", scrambled: ["car", "the", "Is", "garage", "in", "the"], answer: "Is the car in the garage", translation: "O carro está na garagem?" }
    ]
  },
  {
    id: 9,
    title: "Lesson 9 – Clothes & Seasons",
    vocabulary: [
      { en: "Shirt", pt: "Camisa", tts: "Shirt" }, { en: "Pants", pt: "Calças", tts: "Pants" },
      { en: "Dress", pt: "Vestido", tts: "Dress" }, { en: "Skirt", pt: "Saia", tts: "Skirt" },
      { en: "Shoes", pt: "Sapatos", tts: "Shoes" }, { en: "Hat", pt: "Chapéu", tts: "Hat" },
      { en: "Socks", pt: "Meias", tts: "Socks" }, { en: "Jacket", pt: "Jaqueta", tts: "Jacket" },
      { en: "Coat", pt: "Casaco", tts: "Coat" }, { en: "Gloves", pt: "Luvas", tts: "Gloves" },
      { en: "Spring", pt: "Primavera", tts: "Spring" }, { en: "Summer", pt: "Verão", tts: "Summer" },
      { en: "Autumn", pt: "Outono", tts: "Autumn" }, { en: "Winter", pt: "Inverno", tts: "Winter" }
    ],
    phrases: [
      { en: "I wear a coat in winter.", pt: "Eu uso casaco no inverno.", tts: "I wear a coat in winter.", type: 'affirmative' },
      { en: "She is wearing a red dress.", pt: "Ela está usando um vestido vermelho.", tts: "She is wearing a red dress.", type: 'affirmative' },
      { en: "My shoes are new.", pt: "Meus sapatos são novos.", tts: "My shoes are new.", type: 'affirmative' },
      { en: "He is not wearing a hat.", pt: "Ele não está usando chapéu.", tts: "He is not wearing a hat.", type: 'negative' },
      { en: "We do not wear gloves inside.", pt: "Nós não usamos luvas dentro de casa.", tts: "We do not wear gloves inside.", type: 'negative' },
      { en: "The socks are not dirty.", pt: "As meias não estão sujas.", tts: "The socks are not dirty.", type: 'negative' },
      { en: "What do you wear in winter?", pt: "O que você usa no inverno?", tts: "What do you wear in winter?", type: 'interrogative' },
      { en: "Do you like this shirt?", pt: "Você gosta desta camisa?", tts: "Do you like this shirt?", type: 'interrogative' },
      { en: "Where are my boots?", pt: "Onde estão minhas botas?", tts: "Where are my boots?", type: 'interrogative' }
    ],
    exercises: [
      { id: "l9e1", scrambled: ["wear", "do", "What", "in", "winter", "you"], answer: "What do you wear in winter", translation: "O que você usa no inverno?" },
      { id: "l9e2", scrambled: ["hat", "wearing", "is", "He", "a"], answer: "He is wearing a hat", translation: "Ele está usando um chapéu." },
      { id: "l9e3", scrambled: ["in", "hot", "It", "summer", "is"], answer: "It is hot in summer", translation: "Faz calor no verão." },
      { id: "l9e4", scrambled: ["my", "Where", "shoes", "are"], answer: "Where are my shoes", translation: "Onde estão meus sapatos?" },
      { id: "l9e5", scrambled: ["like", "You", "skirt", "this"], answer: "You like this skirt", translation: "Você gosta desta saia." }
    ]
  },
  {
    id: 10,
    title: "Lesson 10 – Daily Action Verbs",
    vocabulary: [
      { en: "To sleep", pt: "Dormir", tts: "To sleep" }, { en: "To sweep", pt: "Varrer", tts: "To sweep" },
      { en: "To eat", pt: "Comer", tts: "To eat" }, { en: "To drink", pt: "Beber", tts: "To drink" },
      { en: "To read", pt: "Ler", tts: "To read" }, { en: "To write", pt: "Escrever", tts: "To write" },
      { en: "To run", pt: "Correr", tts: "To run" }, { en: "To walk", pt: "Andar", tts: "To walk" },
      { en: "To cook", pt: "Cozinhar", tts: "To cook" }, { en: "To clean", pt: "Limpar", tts: "To clean" },
      { en: "To study", pt: "Estudar", tts: "To study" }, { en: "To play", pt: "Brincar/Jogar", tts: "To play" }
    ],
    phrases: [
      { en: "She is sleeping now.", pt: "Ela está dormindo agora.", tts: "She is sleeping now.", type: 'affirmative' },
      { en: "I am reading a book.", pt: "Eu estou lendo um livro.", tts: "I am reading a book.", type: 'affirmative' },
      { en: "They are eating lunch.", pt: "Eles estão almoçando.", tts: "They are eating lunch.", type: 'affirmative' },
      { en: "He is not running.", pt: "Ele não está correndo.", tts: "He is not running.", type: 'negative' },
      { en: "We are not watching TV.", pt: "Nós não estamos assistindo TV.", tts: "We are not watching TV.", type: 'negative' },
      { en: "The cat is not drinking milk.", pt: "O gato não está bebendo leite.", tts: "The cat is not drinking milk.", type: 'negative' },
      { en: "Are you cooking dinner?", pt: "Você está fazendo o jantar?", tts: "Are you cooking dinner?", type: 'interrogative' },
      { en: "Is he sweeping the floor?", pt: "Ele está varrendo o chão?", tts: "Is he sweeping the floor?", type: 'interrogative' },
      { en: "What are they studying?", pt: "O que eles estão estudando?", tts: "What are they studying?", type: 'interrogative' }
    ],
    exercises: [
      { id: "l10e1", scrambled: ["cooking", "She", "dinner", "is"], answer: "She is cooking dinner", translation: "Ela está fazendo o jantar." },
      { id: "l10e2", scrambled: ["are", "playing", "They", "soccer"], answer: "They are playing soccer", translation: "Eles estão jogando futebol." },
      { id: "l10e3", scrambled: ["not", "is", "He", "sleeping"], answer: "He is not sleeping", translation: "Ele não está dormindo." },
      { id: "l10e4", scrambled: ["reading", "you", "Are", "book", "a"], answer: "Are you reading a book", translation: "Você está lendo um livro?" },
      { id: "l10e5", scrambled: ["drinking", "am", "I", "water"], answer: "I am drinking water", translation: "Eu estou bebendo água." }
    ]
  }
];

// --- TTS Helper ---
const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};

// --- Components ---

const Sidebar = ({ activeLessonId, onSelect }: { activeLessonId: number, onSelect: (id: number) => void }) => {
  return (
    <div className="w-72 bg-slate-900 text-white flex-shrink-0 h-full flex flex-col shadow-xl z-20">
      <div className="p-8 border-b border-slate-800 bg-slate-950">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">English Pro</h1>
        <p className="text-xs text-slate-400 mt-2 font-medium tracking-wide">A1-A2 MASTERY COURSE</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
        {LESSON_DATA.map(lesson => (
          <button
            key={lesson.id}
            onClick={() => onSelect(lesson.id)}
            className={`group w-full text-left p-4 rounded-xl transition-all duration-300 relative overflow-hidden ${
              activeLessonId === lesson.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                : 'text-slate-400 hover:bg-slate-800 hover:text-indigo-300'
            }`}
          >
            <div className="flex items-center">
              <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold mr-3 transition-colors ${
                 activeLessonId === lesson.id ? 'bg-indigo-500/50 text-white' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'
              }`}>
                {lesson.id}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{lesson.title.split('–')[1]?.trim() || lesson.title}</div>
              </div>
            </div>
          </button>
        ))}
      </nav>
      <div className="p-4 bg-slate-950 text-center text-xs text-slate-600">
        v2.0 • Interactive Learning
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`px-8 py-4 font-semibold text-sm transition-all duration-300 relative ${
      active
        ? 'text-indigo-600'
        : 'text-gray-500 hover:text-gray-800'
    }`}
  >
    {children}
    {active && (
      <span className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full animate-fade-in" />
    )}
  </button>
);

const VocabCard = ({ item }: { item: VocabItem }) => (
  <div 
    onClick={() => speak(item.tts)}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center text-center aspect-[4/3] relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
       <span className="bg-indigo-50 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center text-xs">🔊</span>
    </div>
    <div className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{item.en}</div>
    <div className="text-sm font-medium text-slate-400 group-hover:text-slate-500">{item.pt}</div>
  </div>
);

const PhraseItemView = ({ item }: { item: PhraseItem }) => (
  <div 
    onClick={() => speak(item.tts)}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 cursor-pointer flex justify-between items-center group mb-3"
  >
    <div className="flex items-center gap-4">
      <div className={`w-1 h-12 rounded-full ${
        item.type === 'affirmative' ? 'bg-emerald-400' :
        item.type === 'negative' ? 'bg-rose-400' : 'bg-amber-400'
      }`}></div>
      <div>
        <div className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.en}</div>
        <div className="text-sm font-medium text-slate-400 mt-1">{item.pt}</div>
      </div>
    </div>
    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    </div>
  </div>
);

const ExerciseCard = ({ exercise }: { exercise: ExerciseItem }) => {
  const initialWords = useMemo(() => {
    const array = [...exercise.scrambled];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }, [exercise.scrambled]);

  const [availableWords, setAvailableWords] = useState<string[]>(initialWords);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  useEffect(() => {
    setAvailableWords(initialWords);
    setSelectedWords([]);
    setStatus('idle');
  }, [initialWords]);

  const handleSelectWord = (word: string, index: number) => {
    if (status === 'correct') return;
    const newAvailable = [...availableWords];
    newAvailable.splice(index, 1);
    setAvailableWords(newAvailable);
    setSelectedWords([...selectedWords, word]);
    setStatus('idle');
  };

  const handleDeselectWord = (word: string, index: number) => {
    if (status === 'correct') return;
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    setAvailableWords([...availableWords, word]);
    setStatus('idle');
  };

  const checkAnswer = () => {
    const userAnswer = selectedWords.join(' ');
    if (userAnswer === exercise.answer) {
      setStatus('correct');
      speak("Correct! " + (exercise.tts || exercise.answer));
    } else {
      setStatus('wrong');
      speak("Try again.");
    }
  };

  const reset = () => {
    setAvailableWords(initialWords);
    setSelectedWords([]);
    setStatus('idle');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 transition-all hover:shadow-md">
      <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Translate</span>
          <h3 className="text-lg font-medium text-slate-700 mt-1">{exercise.translation}</h3>
        </div>
        {status === 'correct' && <div className="text-2xl animate-bounce">🎉</div>}
      </div>

      <div className="p-6">
        {/* Answer Drop Area */}
        <div className={`min-h-[80px] p-4 border-2 border-dashed rounded-xl flex flex-wrap gap-3 mb-6 transition-all duration-300 ${
          status === 'correct' ? 'border-emerald-400 bg-emerald-50/50' : 
          status === 'wrong' ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-slate-50/50'
        }`}>
          {selectedWords.length === 0 && <span className="text-slate-400 text-sm self-center w-full text-center italic">Tap words to build the sentence...</span>}
          {selectedWords.map((word, idx) => (
            <button
              key={`${word}-${idx}`}
              onClick={() => handleDeselectWord(word, idx)}
              className="bg-white border-b-2 border-indigo-100 shadow-sm px-4 py-2 rounded-lg text-slate-800 font-semibold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all animate-fade-in text-lg"
            >
              {word}
            </button>
          ))}
        </div>

        {/* Word Bank */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {availableWords.map((word, idx) => (
            <button
              key={`${word}-${idx}`}
              onClick={() => handleSelectWord(word, idx)}
              className="bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 hover:-translate-y-0.5 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm border border-transparent hover:border-indigo-200"
            >
              {word}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
          <button onClick={reset} className="text-slate-400 hover:text-slate-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
            Reset
          </button>
          
          <div className="flex items-center gap-4">
             {status === 'wrong' && <span className="text-rose-500 font-bold text-sm animate-pulse">Try again</span>}
             {status === 'correct' && <span className="text-emerald-600 font-bold text-sm">Excellent!</span>}
             
            <button 
              onClick={checkAnswer}
              disabled={status === 'correct' || selectedWords.length === 0}
              className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 transition-all transform active:scale-95 ${
                status === 'correct' 
                  ? 'bg-emerald-500 cursor-default shadow-emerald-200' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300'
              }`}
            >
              {status === 'correct' ? 'Correct' : 'Check Answer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  const [activeLessonId, setActiveLessonId] = useState(6);
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'phrases' | 'exercises'>('vocabulary');

  const activeLesson = LESSON_DATA.find(l => l.id === activeLessonId) || LESSON_DATA[0];

  return (
    <div className="flex w-full h-full bg-slate-50 font-sans">
      <Sidebar activeLessonId={activeLessonId} onSelect={(id) => { setActiveLessonId(id); setActiveTab('vocabulary'); }} />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-indigo-600 -z-10 opacity-[0.03]"></div>
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10 px-8 pt-6 pb-0 shadow-sm">
          <div className="flex justify-between items-end mb-4">
             <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{activeLesson.title}</h2>
             <span className="text-sm font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{activeTab.toUpperCase()}</span>
          </div>
          
          <div className="flex space-x-2">
            <TabButton active={activeTab === 'vocabulary'} onClick={() => setActiveTab('vocabulary')}>Vocabulary</TabButton>
            <TabButton active={activeTab === 'phrases'} onClick={() => setActiveTab('phrases')}>Phrases</TabButton>
            <TabButton active={activeTab === 'exercises'} onClick={() => setActiveTab('exercises')}>Exercises</TabButton>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-5xl mx-auto pb-20">
            
            {activeTab === 'vocabulary' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-slide-up">
                {activeLesson.vocabulary.map((item, idx) => (
                  <VocabCard key={idx} item={item} />
                ))}
              </div>
            )}

            {activeTab === 'phrases' && (
              <div className="space-y-4 animate-slide-up max-w-3xl mx-auto">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                   <div className="text-indigo-500 mt-1">💡</div>
                   <div className="text-sm text-indigo-900">Click on any phrase to hear the pronunciation. Pay attention to the intonation of questions!</div>
                </div>
                {activeLesson.phrases.map((item, idx) => (
                  <PhraseItemView key={idx} item={item} />
                ))}
              </div>
            )}

            {activeTab === 'exercises' && (
              <div className="animate-slide-up max-w-3xl mx-auto">
                 <div className="mb-8 text-center">
                    <h3 className="text-xl font-bold text-slate-700">Practice Makes Perfect</h3>
                    <p className="text-slate-400">Rearrange the words to form correct sentences.</p>
                 </div>
                {activeLesson.exercises.map((item) => (
                  <ExerciseCard key={item.id} exercise={item} />
                ))}
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Styles for simple animations */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
            animation: fadeIn 0.3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);