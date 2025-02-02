import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { Switch, FormControlLabel } from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';

const PlayButton = styled('button')({
  minWidth: 75,
  height: 75,
  borderRadius: '50%',
  background: `url('https://i.ibb.co/0RGGtmYQ/play1.png') no-repeat center center`,
  backgroundSize: 'cover',
  border: 'none',
  outline: 'none',
  '&:hover': {
    background: `url('https://i.ibb.co/4wkfRZpP/playhover.png') no-repeat center center`,
    backgroundSize: 'cover',
  },
});

const IOSSwitch = styled(Switch)(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#A445ED',
        opacity: 1,
        border: 0,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    width: 22,
    height: 22,
  },
  '& .MuiSwitch-track': {
    borderRadius: 13,
    backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

function App() {
  const [word, setWord] = useState('chess');
  const [definition, setDefinition] = useState(null);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputError, setInputError] = useState(false);

  const fetchDefinition = async () => {
    if (!word) {
      setInputError(true);
      setError({ emoji: "😡", title: "The search bar must not be empty !!!", message: "FILL THAT INPUT BAR!!!" });
      setDefinition(null);
      return;
    }
    setInputError(false);
    try {
      const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (response.data.title === "No Definitions Found") {
        setError({
          emoji: "😕",
          title: response.data.title,
          message: response.data.message,
        });
        setDefinition(null);
      } else {
        setDefinition(response.data[0]);
        setError(null);
      }
    } catch (error) {
      setError({
        emoji: "😕",
        title: "No Definitions Found",
        message: "Sorry pal, there was an error.",
      });
      setDefinition(null);
    }
  };

  useEffect(() => { fetchDefinition(); }, []);

  const handlePlayAudio = (audioUrl) => {
    if (!isPlaying) {
      setIsPlaying(true);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => setIsPlaying(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} style={{ fontFamily }}>
      <div className="max-w-3xl mx-auto p-6">
        <header className="flex justify-between items-center mb-8">
          <img src="https://i.ibb.co/YTdKsr2T/logo.png" alt="Logo" className="w-8 h-10" />
          <div className="flex items-center gap-4">
            <select 
              className={`p-2 rounded border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
            >
              <option value="sans-serif">Sans Serif</option>
              <option value="serif">Serif</option>
              <option value="monospace">Mono</option>
            </select>
            <FormControlLabel
              control={<IOSSwitch sx={{ m: 1 }} checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
              label={<DarkModeOutlinedIcon />}
            />
          </div>
        </header>

        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchDefinition()}
          className={`w-full p-4 rounded-2xl mb-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} ${inputError ? 'border-red-500' : 'border-red-500'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
          placeholder="Search for any word..."
        />
        {inputError && <p className="text-red-500 mb-4">Whoops... cannot be empty</p>}

        {error && (
          <div className="flex flex-col items-center justify-center text-center min-h-[50vh]">
            <div className="text-6xl mb-4">{error.emoji}</div>
            <h2 className="text-xl font-bold mb-2">{error.title}</h2>
            <p className="text-gray-500 max-w-md">{error.message}</p>
          </div>
        )}

        {definition && !error && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">{definition.word}</h1>
                <p className="text-purple-500">{definition.phonetic}</p>
              </div>
              {definition.phonetics?.[0]?.audio && (
                <PlayButton onClick={() => handlePlayAudio(definition.phonetics[0].audio)} disabled={isPlaying} />
              )}
            </div>

            {definition.meanings.map((meaning, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl italic">{meaning.partOfSpeech}</h2>
                  <div className={`flex-1 h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                </div>

                <div className="space-y-4">
                  <p className="text-gray-500">Meaning</p>
                  <ul className="list-disc pl-10 space-y-4">
                    {meaning.definitions.map((def, idx) => (
                      <li key={idx}>
                        <p>{def.definition}</p>
                        {def.example && <p className="text-gray-500 mt-2">"{def.example}"</p>}
                      </li>
                    ))}
                  </ul>

                  {meaning.synonyms?.length > 0 && (
                    <div className="flex gap-4 mt-4">
                      <span className="text-gray-500">Synonyms</span>
                      <span className="text-purple-500">{meaning.synonyms.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {definition.sourceUrls && (
              <div className={`pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className="text-gray-500 text-sm">
                  Source:{' '}
                  <a 
                    href={definition.sourceUrls[0]} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {definition.sourceUrls[0]}
                  </a>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
