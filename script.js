
        // Sentences Array by Difficulty
        const sentences = {
            easy: [
                "The cat sat on the mat.",
                "I love to eat pizza.",
                "The sun is shining bright today.",
                "Dogs are loyal and friendly pets.",
                "She likes to read books every day.",
                "The sky is blue and beautiful.",
                "I enjoy walking in the park.",
                "Water is essential for life.",
                "Music makes me feel happy.",
                "The moon shines at night.",
                "Birds sing in the morning.",
                "Ice cream is my favorite dessert.",
                "Trees provide us with oxygen.",
                "The ocean is vast and deep.",
                "Flowers bloom in the spring."
            ],
            medium: [
                "The quick brown fox jumps over the lazy dog.",
                "Practice makes perfect when learning new skills.",
                "Technology has transformed the way we communicate.",
                "Reading books expands your knowledge and imagination.",
                "Exercise regularly to maintain a healthy lifestyle.",
                "Success comes to those who never give up.",
                "Learning a new language opens many opportunities.",
                "Time management is crucial for productivity.",
                "Creativity is intelligence having fun with ideas.",
                "The journey of a thousand miles begins with one step.",
                "Knowledge is power when applied with wisdom.",
                "Every challenge is an opportunity to grow stronger.",
                "Dreams become reality through hard work and dedication.",
                "Nature provides beauty and peace to our souls.",
                "Innovation drives progress in every field of life."
            ],
            hard: [
                "Sophisticated algorithms enable artificial intelligence to process complex data structures efficiently.",
                "Quantum mechanics revolutionized our understanding of subatomic particle behavior and energy states.",
                "Entrepreneurship requires resilience, innovation, and strategic thinking to navigate market uncertainties.",
                "Photosynthesis converts solar energy into chemical energy through intricate biochemical processes.",
                "Globalization has interconnected economies, cultures, and political systems across continents.",
                "Neuroscience explores the intricate connections between brain structure and cognitive functions.",
                "Cryptocurrency utilizes blockchain technology to facilitate decentralized financial transactions securely.",
                "Archaeological discoveries provide invaluable insights into ancient civilizations and their cultures.",
                "Sustainable development balances economic growth with environmental conservation and social equity.",
                "Philosophical discourse examines fundamental questions about existence, knowledge, and morality.",
                "Biotechnology innovations are transforming healthcare through personalized medicine and gene therapy.",
                "Renaissance art reflected humanism and rediscovered classical principles of beauty and proportion.",
                "Machine learning algorithms analyze patterns in massive datasets to make predictive decisions.",
                "Astrophysics investigates celestial phenomena using advanced telescopes and mathematical models.",
                "Cybersecurity protocols protect digital infrastructure from sophisticated malicious attacks constantly."
            ]
        };

        // Global Variables
        let currentSentence = '';
        let currentDifficulty = 'medium';
        let startTime = null;
        let timerInterval = null;
        let isTestActive = false;
        let totalTypedChars = 0;
        let correctChars = 0;
        let currentCharIndex = 0;

        // Audio Context for Sound Effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // DOM Elements
        const sentenceDisplay = document.getElementById('sentenceDisplay');
        const typingInput = document.getElementById('typingInput');
        const timerDisplay = document.getElementById('timer');
        const wpmDisplay = document.getElementById('wpm');
        const accuracyDisplay = document.getElementById('accuracy');
        const progressBar = document.getElementById('progressBar');
        const resultsSection = document.getElementById('resultsSection');
        const finalWpmDisplay = document.getElementById('finalWpm');
        const finalAccuracyDisplay = document.getElementById('finalAccuracy');
        const finalTimeDisplay = document.getElementById('finalTime');
        const restartBtn = document.getElementById('restartBtn');
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        const themeToggle = document.getElementById('themeToggle');
        const bgAnimation = document.getElementById('bgAnimation');
        const leaderboardList = document.getElementById('leaderboardList');

        // Initialize Background Particles
        function createParticles() {
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                particle.style.width = Math.random() * 5 + 2 + 'px';
                particle.style.height = particle.style.width;
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 8 + 's';
                particle.style.animationDuration = Math.random() * 10 + 8 + 's';
                bgAnimation.appendChild(particle);
            }
        }

        // Sound Effect Functions
        function playSound(frequency, duration, type = 'sine') {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        }

        function playCorrectSound() {
            playSound(800, 0.05, 'sine');
        }

        function playIncorrectSound() {
            playSound(200, 0.1, 'sawtooth');
        }

        function playCompleteSound() {
            playSound(523.25, 0.2, 'sine'); // C5
            setTimeout(() => playSound(659.25, 0.2, 'sine'), 100); // E5
            setTimeout(() => playSound(783.99, 0.3, 'sine'), 200); // G5
        }

        // Initialize Test
        function initTest() {
            currentSentence = getRandomSentence();
            displaySentence();
            resetStats();
            typingInput.value = '';
            typingInput.disabled = false;
            typingInput.focus();
            resultsSection.classList.remove('show');
            isTestActive = false;
            currentCharIndex = 0;
            updateBackgroundSpeed(0);
        }

        // Get Random Sentence
        function getRandomSentence() {
            const sentenceList = sentences[currentDifficulty];
            return sentenceList[Math.floor(Math.random() * sentenceList.length)];
        }

        // Display Sentence with Spans
        function displaySentence() {
            sentenceDisplay.innerHTML = '';
            for (let i = 0; i < currentSentence.length; i++) {
                const span = document.createElement('span');
                span.textContent = currentSentence[i];
                if (i === 0) {
                    span.classList.add('current');
                }
                sentenceDisplay.appendChild(span);
            }
        }

        // Reset Stats
        function resetStats() {
            startTime = null;
            totalTypedChars = 0;
            correctChars = 0;
            timerDisplay.textContent = '00:00';
            wpmDisplay.textContent = '0';
            accuracyDisplay.textContent = '100%';
            progressBar.style.width = '0%';
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        }

        // Start Timer
        function startTimer() {
            startTime = Date.now();
            timerInterval = setInterval(updateTimer, 100);
        }

        // Update Timer
        function updateTimer() {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            // Calculate and update WPM in real-time
            const timeInMinutes = elapsed / 60;
            if (timeInMinutes > 0) {
                const wordsTyped = totalTypedChars / 5;
                const currentWpm = Math.round(wordsTyped / timeInMinutes);
                wpmDisplay.textContent = currentWpm;
            }
        }

        // Update Progress Bar
        function updateProgress() {
            const progress = (currentCharIndex / currentSentence.length) * 100;
            progressBar.style.width = progress + '%';
        }

        // Update Background Speed Based on WPM
        function updateBackgroundSpeed(wpm) {
            const particles = document.querySelectorAll('.particle');
            const speed = Math.max(8, 20 - (wpm / 10));
            particles.forEach(particle => {
                particle.style.animationDuration = speed + 's';
            });
        }

        // Handle Typing Input
        function handleTyping(e) {
            if (!isTestActive) {
                isTestActive = true;
                startTimer();
            }

            const typedText = typingInput.value;
            const spans = sentenceDisplay.querySelectorAll('span');
            
            // Clear all previous styling
            spans.forEach(span => {
                span.classList.remove('correct', 'incorrect', 'current');
            });

            let allCorrect = true;
            correctChars = 0;
            totalTypedChars = typedText.length;

            // Compare each character
            for (let i = 0; i < typedText.length; i++) {
                if (i < currentSentence.length) {
                    if (typedText[i] === currentSentence[i]) {
                        spans[i].classList.add('correct');
                        correctChars++;
                    } else {
                        spans[i].classList.add('incorrect');
                        allCorrect = false;
                    }
                }
            }

            // Update current character indicator
            currentCharIndex = typedText.length;
            if (currentCharIndex < currentSentence.length) {
                spans[currentCharIndex].classList.add('current');
            }

            // Play sound effects
            if (e.inputType === 'insertText' || e.inputType === 'insertFromPaste') {
                const lastChar = typedText[typedText.length - 1];
                const expectedChar = currentSentence[typedText.length - 1];
                if (lastChar === expectedChar) {
                    playCorrectSound();
                } else {
                    playIncorrectSound();
                }
            }

            // Update accuracy
            const accuracy = totalTypedChars > 0 ? Math.round((correctChars / totalTypedChars) * 100) : 100;
            accuracyDisplay.textContent = accuracy + '%';

            // Update progress
            updateProgress();

            // Get current WPM for background animation
            const elapsed = (Date.now() - startTime) / 1000 / 60;
            const currentWpm = elapsed > 0 ? Math.round((totalTypedChars / 5) / elapsed) : 0;
            updateBackgroundSpeed(currentWpm);

            // Check if test is complete
            if (typedText.length === currentSentence.length && allCorrect) {
                completeTest();
            }
        }

        // Complete Test
        function completeTest() {
            clearInterval(timerInterval);
            isTestActive = false;
            typingInput.disabled = true;
            
            playCompleteSound();

            // Calculate final stats
            const totalTime = (Date.now() - startTime) / 1000;
            const timeInMinutes = totalTime / 60;
            const finalWpm = Math.round((totalTypedChars / 5) / timeInMinutes);
            const finalAccuracy = Math.round((correctChars / totalTypedChars) * 100);

            // Display results
            finalWpmDisplay.textContent = finalWpm;
            finalAccuracyDisplay.textContent = finalAccuracy + '%';
            const minutes = Math.floor(totalTime / 60);
            const seconds = Math.round(totalTime % 60);
            finalTimeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            // Show results section with animation
            setTimeout(() => {
                resultsSection.classList.add('show');
            }, 300);

            // Save to leaderboard
            saveToLeaderboard(finalWpm, finalAccuracy, currentDifficulty);
            displayLeaderboard();
        }

        // Save to Leaderboard
        function saveToLeaderboard(wpm, accuracy, difficulty) {
            let leaderboard = JSON.parse(localStorage.getItem('typingLeaderboard') || '[]');
            
            const entry = {
                wpm: wpm,
                accuracy: accuracy,
                difficulty: difficulty,
                date: new Date().toLocaleDateString()
            };

            leaderboard.push(entry);
            leaderboard.sort((a, b) => b.wpm - a.wpm);
            leaderboard = leaderboard.slice(0, 5); // Keep top 5

            localStorage.setItem('typingLeaderboard', JSON.stringify(leaderboard));
        }

        // Display Leaderboard
        function displayLeaderboard() {
            const leaderboard = JSON.parse(localStorage.getItem('typingLeaderboard') || '[]');
            
            if (leaderboard.length === 0) {
                leaderboardList.innerHTML = '<li class="leaderboard-item"><span>No scores yet</span></li>';
                return;
            }

            leaderboardList.innerHTML = '';
            leaderboard.forEach((entry, index) => {
                const li = document.createElement('li');
                li.classList.add('leaderboard-item');
                li.innerHTML = `
                    <span class="leaderboard-rank">#${index + 1}</span>
                    <span>${entry.difficulty.toUpperCase()} - ${entry.date}</span>
                    <span class="leaderboard-score">${entry.wpm} WPM (${entry.accuracy}%)</span>
                `;
                leaderboardList.appendChild(li);
            });
        }

        // Restart Test
        function restartTest() {
            initTest();
        }

        // Change Difficulty
        function changeDifficulty(level) {
            currentDifficulty = level;
            difficultyBtns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.level === level) {
                    btn.classList.add('active');
                }
            });
            initTest();
        }

        // Theme Toggle
        function toggleTheme() {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        }

        // Load Theme
        function loadTheme() {
            const theme = localStorage.getItem('theme');
            if (theme === 'light') {
                document.body.classList.add('light-mode');
            }
        }

        // Event Listeners
        typingInput.addEventListener('input', handleTyping);
        restartBtn.addEventListener('click', restartTest);
        themeToggle.addEventListener('click', toggleTheme);

        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                changeDifficulty(btn.dataset.level);
            });
        });

        // Prevent paste to maintain test integrity
        typingInput.addEventListener('paste', (e) => {
            e.preventDefault();
        });

        // Prevent context menu
        typingInput.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Initialize on Load
        window.addEventListener('load', () => {
            createParticles();
            loadTheme();
            displayLeaderboard();
            initTest();
        });

        // Add typing animation to title
        const titleElement = document.querySelector('.title');
        const titleText = titleElement.textContent;
        titleElement.textContent = '';
        let charIndex = 0;

        function typeTitle() {
            if (charIndex < titleText.length) {
                titleElement.textContent += titleText[charIndex];
                charIndex++;
                setTimeout(typeTitle, 100);
            }
        }

        window.addEventListener('load', typeTitle);
   