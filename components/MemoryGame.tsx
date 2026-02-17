'use client'

import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Clock, RotateCcw, TrendingUp, Users, Award, BarChart3 } from 'lucide-react';

const DIFFICULTIES = {
  easy: { grid: 4, pairs: 8, name: '쉬움 (4×4)' },
  medium: { grid: 6, pairs: 18, name: '보통 (6×6)' },
  hard: { grid: 8, pairs: 32, name: '어려움 (8×8)' }
};

const EMOJIS = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎬', '🎵', '🎸', '🎹', '🎺', '🎻', '🎲', '🎰', '🎳', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🥊', '🥋', '⛳', '🏹', '🎣', '🥅', '🎄', '🎃', '🎁', '🎈', '🎀', '🎊', '🎉', '🎇', '🎆', '🌟', '⭐', '✨', '💫', '🌈', '☀️', '🌙', '⚡', '🔥', '💧', '❄️', '☁️', '🌸', '🌺', '🌻', '🌷', '🌹', '🏵️', '🌼', '💐', '🍀', '🌿', '🍁', '🍂', '🍃', '🌾', '🌱', '🌴', '🌲', '🌳', '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🥝', '🍅', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🌮', '🌯', '🥗', '🥘', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥛', '☕', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧃', '🧉', '🧊', '🥢', '🍽️', '🍴', '🥄', '🔪', '🏺', '🌍', '🌎', '🌏', '🗾', '🧭', '🏔️', '⛰️', '🌋', '🗻', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️', '🏟️', '🏛️', '🏗️', '🧱', '🏘️', '🏚️', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒'];

export default function MemoryGame() {
  const [view, setView] = useState('game');
  const [difficulty, setDifficulty] = useState('easy');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [nickname, setNickname] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [leaderboard, setLeaderboard] = useState({ easy: [], medium: [], hard: [] });
  const [personalHistory, setPersonalHistory] = useState({ easy: [], medium: [], hard: [] });

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    const savedNickname = localStorage.getItem('memoryGameNickname');
    
    if (savedNickname) setUserNickname(savedNickname);
    
    await loadSharedData();
    loadPersonalHistory();
    initializeGame(difficulty);
  };

  const loadSharedData = async () => {
  try {
    const easyData = localStorage.getItem('leaderboard_easy');
    const mediumData = localStorage.getItem('leaderboard_medium');
    const hardData = localStorage.getItem('leaderboard_hard');
    
    setLeaderboard({
      easy: easyData ? JSON.parse(easyData) : [],
      medium: mediumData ? JSON.parse(mediumData) : [],
      hard: hardData ? JSON.parse(hardData) : []
    });
  } catch (error) {
    console.log('Loading leaderboard:', error);
    setLeaderboard({ easy: [], medium: [], hard: [] });
  }
};

  const loadPersonalHistory = () => {
    const savedHistory = JSON.parse(localStorage.getItem('memoryGameHistory') || '{"easy":[],"medium":[],"hard":[]}');
    setPersonalHistory(savedHistory);
  };

 useEffect(() => {
  let timer: NodeJS.Timeout | undefined;
  if (isPlaying && !gameComplete) {
    timer = setInterval(() => setTime(t => t + 1), 1000);
  }
  return () => {
    if (timer) clearInterval(timer);
  };
}, [isPlaying, gameComplete]);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setGameComplete(true);
      setIsPlaying(false);
      setShowNameInput(true);
    }
  }, [matched, cards]);

  const calculateScore = (moves: number, time: number) => {
    const movesPenalty = moves * 50;
    const timePenalty = time * 2;
    const baseScore = 10000;
    return Math.max(0, baseScore - movesPenalty - timePenalty);
  };

  const initializeGame = (diff: string) => {
    const { pairs } = DIFFICULTIES[diff];
    const shuffled = EMOJIS.sort(() => Math.random() - 0.5);
    const selectedEmojis = shuffled.slice(0, pairs);
    const cardPairs = [...selectedEmojis, ...selectedEmojis];
    const shuffledCards = cardPairs
      .map((emoji, i) => ({ id: i, emoji, matched: false }))
      .sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);
    setIsPlaying(false);
    setGameComplete(false);
    setShowNameInput(false);
  };

  const handleCardClick = (index: number) => {
    if (!isPlaying) setIsPlaying(true);
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].emoji === cards[second].emoji) {
        setMatched([...matched, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const saveScore = async () => {
    if (!nickname.trim()) return;
    
    const score = calculateScore(moves, time);
    const newEntry = {
      nickname: nickname.trim(),
      moves,
      time,
      score,
      date: new Date().toISOString()
    };

try {
  const currentData = localStorage.getItem(`leaderboard_${difficulty}`);
  let currentLeaderboard = currentData ? JSON.parse(currentData) : [];
  
  currentLeaderboard = [...currentLeaderboard, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);
  
  localStorage.setItem(`leaderboard_${difficulty}`, JSON.stringify(currentLeaderboard));
  
  loadSharedData();
} catch (error) {
  console.error('Error saving score:', error);
}

    if (nickname.trim() === userNickname || !userNickname) {
      const savedHistory = JSON.parse(localStorage.getItem('memoryGameHistory') || '{"easy":[],"medium":[],"hard":[]}');
      savedHistory[difficulty] = [...savedHistory[difficulty], newEntry]
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      localStorage.setItem('memoryGameHistory', JSON.stringify(savedHistory));
      localStorage.setItem('memoryGameNickname', nickname.trim());
      
      setUserNickname(nickname.trim());
      setPersonalHistory(savedHistory);
    }
    
    setShowNameInput(false);
  };

  const changeDifficulty = (diff: string) => {
    setDifficulty(diff);
    initializeGame(diff);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초`;
  };

  const getUserRank = () => {
    const board = leaderboard[difficulty];
    const score = calculateScore(moves, time);
    const rank = board.filter(entry => entry.score > score).length + 1;
    const percentile = board.length > 0 ? Math.round((1 - rank / board.length) * 100) : 0;
    return { rank, percentile, total: board.length };
  };

  const getPersonalImprovement = () => {
    const history = personalHistory[difficulty];
    if (history.length === 0) return null;
    
    const avgMoves = history.reduce((sum, entry) => sum + entry.moves, 0) / history.length;
    const avgTime = history.reduce((sum, entry) => sum + entry.time, 0) / history.length;
    const movesImprovement = ((avgMoves - moves) / avgMoves * 100).toFixed(1);
    const timeImprovement = ((avgTime - time) / avgTime * 100).toFixed(1);
    
    return { movesImprovement, timeImprovement, games: history.length };
  };

  const gridSize = DIFFICULTIES[difficulty].grid;

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-8 h-8" />
              대시보드
            </h1>
            <button
              onClick={() => setView('game')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              게임으로 돌아가기
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex gap-2 justify-center">
              {Object.entries(DIFFICULTIES).map(([key, { name }]) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    difficulty === key
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                전체 순위
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {leaderboard[difficulty].slice(0, 50).map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      entry.nickname === userNickname ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`text-lg font-bold ${
                      index === 0 ? 'text-yellow-500' : 
                      index === 1 ? 'text-gray-400' : 
                      index === 2 ? 'text-orange-500' : 'text-gray-600'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}위`}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{entry.nickname}</div>
                      <div className="text-xs text-gray-500">
                        {formatTime(entry.time)} · {entry.moves}회 이동
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{entry.score.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">점수</div>
                    </div>
                  </div>
                ))}
                {leaderboard[difficulty].length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    아직 기록이 없습니다
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-purple-500" />
                  내 기록
                </h2>
                {userNickname ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">닉네임</div>
                      <div className="text-2xl font-bold text-gray-800">{userNickname}</div>
                    </div>
                    {personalHistory[difficulty].length > 0 && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">최고 점수</div>
                            <div className="text-2xl font-bold text-green-600">
                              {Math.max(...personalHistory[difficulty].map(e => e.score)).toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">플레이 횟수</div>
                            <div className="text-2xl font-bold text-blue-600">
                              {personalHistory[difficulty].length}회
                            </div>
                          </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600 mb-2">최고 기록</div>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-xs text-gray-500">최소 이동</div>
                              <div className="text-xl font-bold text-orange-600">
                                {Math.min(...personalHistory[difficulty].map(e => e.moves))}회
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">최단 시간</div>
                              <div className="text-xl font-bold text-orange-600">
                                {formatTime(Math.min(...personalHistory[difficulty].map(e => e.time)))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    게임을 완료하고 닉네임을 등록하세요
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  최근 플레이
                </h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {personalHistory[difficulty].slice(0, 10).map((entry, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-800">{entry.score.toLocaleString()}점</div>
                        <div className="text-xs text-gray-500">
                          {formatTime(entry.time)} · {entry.moves}회
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {personalHistory[difficulty].length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      아직 기록이 없습니다
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="hidden max-w-4xl mx-auto mb-4 bg-gray-200 rounded-lg p-3 text-center text-sm text-gray-500">
        광고 영역 (728x90)
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8" />
            카드 뒤집기 게임 - 기억력 테스트
          </h1>
          <p className="text-gray-600">당신의 순간 기억력을 테스트하세요!</p>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setView('dashboard')}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            대시보드
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex gap-2 justify-center flex-wrap">
            {Object.entries(DIFFICULTIES).map(([key, { name }]) => (
              <button
                key={key}
                onClick={() => changeDifficulty(key)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  difficulty === key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-1 text-blue-500" />
            <div className="text-2xl font-bold text-gray-800">{formatTime(time)}</div>
            <div className="text-xs text-gray-500">시간</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <RotateCcw className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <div className="text-2xl font-bold text-gray-800">{moves}</div>
            <div className="text-xs text-gray-500">이동 횟수</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
            <div className="text-2xl font-bold text-gray-800">
              {calculateScore(moves, time).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">현재 점수</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div 
            className="grid gap-2 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              maxWidth: `${gridSize * 80}px`
            }}
          >
            {cards.map((card, index) => {
              const isFlipped = flipped.includes(index) || matched.includes(index);
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  disabled={matched.includes(index)}
                  className="aspect-square rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  style={{
                    background: isFlipped 
                      ? '#ffffff'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    opacity: matched.includes(index) ? 0.3 : 1,
                    border: isFlipped ? '2px solid #e5e7eb' : 'none'
                  }}
                >
                  <div className="text-4xl">
                    {isFlipped ? card.emoji : '❓'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-center mb-4">
          <button
            onClick={() => initializeGame(difficulty)}
            className="bg-gray-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-all shadow-md"
          >
            <RotateCcw className="w-5 h-5 inline mr-2" />
            새 게임
          </button>
        </div>

        {showNameInput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">축하합니다!</h2>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{moves}</div>
                    <div className="text-xs text-gray-600">이동</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{formatTime(time)}</div>
                    <div className="text-xs text-gray-600">시간</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{calculateScore(moves, time).toLocaleString()}</div>
                    <div className="text-xs text-gray-600">점수</div>
                  </div>
                </div>
                
                {leaderboard[difficulty].length > 0 && (
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        상위 {getUserRank().percentile}% (전체 {getUserRank().total}명 중 {getUserRank().rank}위)
                      </span>
                    </div>
                  </div>
                )}

                {getPersonalImprovement() && (
                  <div className="mt-3 bg-white rounded-lg p-3">
                    <div className="flex items-center justify-center gap-2 text-sm mb-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-gray-700">개인 향상도</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">이동 횟수: </span>
                        <span className={getPersonalImprovement().movesImprovement > 0 ? 'text-green-600 font-semibold' : 'text-red-600'}>
                          {getPersonalImprovement().movesImprovement > 0 ? '▼' : '▲'} {Math.abs(getPersonalImprovement().movesImprovement)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">시간: </span>
                        <span className={getPersonalImprovement().timeImprovement > 0 ? 'text-green-600 font-semibold' : 'text-red-600'}>
                          {getPersonalImprovement().timeImprovement > 0 ? '▼' : '▲'} {Math.abs(getPersonalImprovement().timeImprovement)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      평균 대비 (총 {getPersonalImprovement().games}게임)
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden bg-gray-200 rounded-lg p-8 mb-6 text-sm text-gray-500">
                전면 광고 영역 (300x250)
              </div>

              <div className="mb-6">
                <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                  닉네임을 입력하세요
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && saveScore()}
                  placeholder={userNickname || "닉네임"}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  maxLength={20}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={saveScore}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-all"
                >
                  기록 저장
                </button>
                <button
                  onClick={() => {
                    setShowNameInput(false);
                    initializeGame(difficulty);
                  }}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-all"
                >
                  건너뛰기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden max-w-4xl mx-auto mt-4 bg-gray-200 rounded-lg p-3 text-center text-sm text-gray-500">
        광고 영역 (728x90)
      </div>
    </div>
  );
}