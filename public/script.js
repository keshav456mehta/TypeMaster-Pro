// ==============================================
// TYPING MASTER PRO - COMPLETE IMPLEMENTATION
// ==============================================

// Game state management
const GameState = {
    IDLE: 'idle',
    RUNNING: 'running',
    PAUSED: 'paused',
    FINISHED: 'finished'
};

// Anti-Cheat System
class AntiCheatSystem {
    constructor() {
        this.keystrokeTimings = [];
        this.lastKeyTime = 0;
        this.suspiciousCount = 0;
        this.copyPasteDetected = false;
        this.cheatingScore = 0;
        this.lastText = '';
        this.lastTextTime = 0;
        this.minKeystrokeInterval = 30;
        this.maxKeystrokeInterval = 2000;
        this.cheatingThreshold = 50;
    }
    
    recordKeystroke() {
        const now = Date.now();
        if (this.lastKeyTime > 0) {
            const timeDiff = now - this.lastKeyTime;
            this.keystrokeTimings.push(timeDiff);
            
            if (this.keystrokeTimings.length > 20) {
                this.keystrokeTimings.shift();
            }
            
            if (timeDiff < this.minKeystrokeInterval) {
                this.cheatingScore += 5;
            }
            
            if (timeDiff < 10) {
                this.cheatingScore += 15;
            }
        }
        this.lastKeyTime = now;
    }
    
    detectCopyPaste(currentText, previousText) {
        const now = Date.now();
        const timeDiff = now - this.lastTextTime;
        const addedChars = currentText.length - previousText.length;
        
        if (addedChars > 3 && timeDiff < 100) {
            this.cheatingScore += 20;
            this.copyPasteDetected = true;
            return true;
        }
        
        if (addedChars > 10 && timeDiff < 500) {
            const source = window.currentText || '';
            const addedText = currentText.slice(previousText.length);
            if (source.includes(addedText)) {
                this.cheatingScore += 15;
                this.copyPasteDetected = true;
                return true;
            }
        }
        
        if (this.keystrokeTimings.length > 5) {
            const avgTime = this.keystrokeTimings.reduce((a, b) => a + b, 0) / this.keystrokeTimings.length;
            const variance = this.keystrokeTimings.reduce((a, b) => a + Math.pow(b - avgTime, 2), 0) / this.keystrokeTimings.length;
            
            if (variance < 100 && avgTime < 80) {
                this.cheatingScore += 10;
            }
            
            if (avgTime < 40) {
                this.cheatingScore += 20;
            }
        }
        
        this.lastText = currentText;
        this.lastTextTime = now;
        
        return this.cheatingScore >= this.cheatingThreshold;
    }
    
    detectPatternCheating(text) {
        if (text.length < 20) return false;
        
        const patterns = this.findRepeatingPatterns(text);
        if (patterns.length > 0 && patterns[0].length > 4) {
            this.cheatingScore += 25;
            return true;
        }
        
        let repeatCount = 0;
        for (let i = 1; i < text.length; i++) {
            if (text[i] === text[i-1]) repeatCount++;
        }
        if (repeatCount / text.length > 0.3) {
            this.cheatingScore += 10;
        }
        
        return false;
    }
    
    findRepeatingPatterns(text) {
        const patterns = [];
        for (let len = 2; len <= Math.floor(text.length / 2); len++) {
            for (let i = 0; i <= text.length - len * 2; i++) {
                const pattern = text.substr(i, len);
                if (text.substr(i + len, len) === pattern) {
                    patterns.push(pattern);
                }
            }
        }
        return patterns;
    }
    
    validateResult(wpm, accuracy, testDuration) {
        const maxHumanWPM = 220;
        const maxSustainedWPM = 180;
        
        if (wpm > maxHumanWPM) {
            return { valid: false, reason: "WPM exceeds human world record" };
        }
        
        if (wpm > maxSustainedWPM && testDuration > 30) {
            return { valid: false, reason: "Unrealistic sustained speed" };
        }
        
        if (wpm > 150 && accuracy > 99.9) {
            return { valid: false, reason: "Unrealistic speed with perfect accuracy" };
        }
        
        if (this.copyPasteDetected) {
            return { valid: false, reason: "Copy-paste detected" };
        }
        
        if (this.cheatingScore >= this.cheatingThreshold) {
            return { 
                valid: false, 
                reason: "Suspicious typing patterns detected",
                score: this.cheatingScore 
            };
        }
        
        return { 
            valid: true, 
            reason: "Valid result",
            cheatingScore: this.cheatingScore 
        };
    }
    
    reset() {
        this.keystrokeTimings = [];
        this.lastKeyTime = 0;
        this.suspiciousCount = 0;
        this.copyPasteDetected = false;
        this.cheatingScore = 0;
        this.lastText = '';
        this.lastTextTime = 0;
    }
}

// Gamification System
class GamificationSystem {
    constructor() {
        this.userLevel = parseInt(localStorage.getItem('userLevel')) || 1;
        this.userXP = parseInt(localStorage.getItem('userXP')) || 0;
        this.userStreak = parseInt(localStorage.getItem('userStreak')) || 0;
        this.lastLogin = localStorage.getItem('lastLogin') || '';
        this.achievements = JSON.parse(localStorage.getItem('achievements')) || {};
        this.unlockedThemes = JSON.parse(localStorage.getItem('unlockedThemes')) || ['midnight'];
        this.completedLessons = JSON.parse(localStorage.getItem('completedLessons')) || [];
        this.dailyChallengeCompleted = localStorage.getItem('dailyChallengeCompleted') === 'true' || false;
        
        this.xpForNextLevel = this.calculateXPForLevel(this.userLevel + 1);
        this.userRank = this.calculateRank();
    }
    
    calculateXPForLevel(level) {
        return Math.floor(100 * Math.pow(level, 1.5));
    }
    
    calculateRank() {
        const ranks = [
            { name: 'Beginner', minLevel: 1 },
            { name: 'Novice', minLevel: 5 },
            { name: 'Intermediate', minLevel: 10 },
            { name: 'Advanced', minLevel: 20 },
            { name: 'Expert', minLevel: 30 },
            { name: 'Master', minLevel: 40 },
            { name: 'Grandmaster', minLevel: 50 }
        ];
        
        for (let i = ranks.length - 1; i >= 0; i--) {
            if (this.userLevel >= ranks[i].minLevel) {
                return ranks[i].name;
            }
        }
        return 'Beginner';
    }
    
    addXP(amount, source = 'test') {
        const oldLevel = this.userLevel;
        this.userXP += amount;
        
        while (this.userXP >= this.xpForNextLevel) {
            this.userLevel++;
            this.userXP -= this.xpForNextLevel;
            this.xpForNextLevel = this.calculateXPForLevel(this.userLevel + 1);
            this.unlockLevelFeatures(this.userLevel);
        }
        
        this.updateStreak();
        this.saveProgress();
        
        return {
            xpAdded: amount,
            leveledUp: this.userLevel > oldLevel,
            newLevel: this.userLevel,
            xpToNext: this.xpForNextLevel - this.userXP
        };
    }
    
    updateStreak() {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (this.lastLogin === '') {
            this.userStreak = 1;
        } else if (this.lastLogin === today) {
            return;
        } else if (this.lastLogin === yesterday) {
            this.userStreak++;
        } else {
            this.userStreak = 1;
        }
        
        this.lastLogin = today;
        this.checkAchievements();
    }
    
    unlockLevelFeatures(level) {
        const unlocks = {
            5: ['forest'],
            10: ['sunset'],
            15: ['ocean'],
            20: ['matrix'],
            25: ['retro-sounds'],
            30: ['custom-cursors']
        };
        
        if (unlocks[level]) {
            unlocks[level].forEach(feature => {
                if (!this.unlockedThemes.includes(feature)) {
                    this.unlockedThemes.push(feature);
                }
            });
        }
    }
    
    checkAchievements() {
        const achievementChecks = {
            'first_test': { condition: () => this.getTestCount() >= 1, xp: 50 },
            'speed_50': { condition: () => this.getBestWPM() >= 50, xp: 100 },
            'speed_75': { condition: () => this.getBestWPM() >= 75, xp: 150 },
            'speed_100': { condition: () => this.getBestWPM() >= 100, xp: 200 },
            'accuracy_95': { condition: () => this.getBestAccuracy() >= 95, xp: 100 },
            'accuracy_99': { condition: () => this.getBestAccuracy() >= 99, xp: 150 },
            'streak_3': { condition: () => this.userStreak >= 3, xp: 50 },
            'streak_7': { condition: () => this.userStreak >= 7, xp: 100 },
            'streak_30': { condition: () => this.userStreak >= 30, xp: 500 },
            'tests_10': { condition: () => this.getTestCount() >= 10, xp: 100 },
            'tests_50': { condition: () => this.getTestCount() >= 50, xp: 300 },
            'tests_100': { condition: () => this.getTestCount() >= 100, xp: 500 },
            'lessons_5': { condition: () => this.completedLessons.length >= 5, xp: 150 },
            'lessons_all': { condition: () => this.completedLessons.length >= 20, xp: 300 },
            'daily_challenge': { condition: () => this.dailyChallengeCompleted, xp: 50 },
            'perfect_run': { condition: () => this.getPerfectRuns() > 0, xp: 200 },
            'level_10': { condition: () => this.userLevel >= 10, xp: 250 },
            'level_25': { condition: () => this.userLevel >= 25, xp: 500 },
            'level_50': { condition: () => this.userLevel >= 50, xp: 1000 },
            'no_errors': { condition: () => this.getZeroErrorTests() >= 3, xp: 150 },
            'fast_typer': { condition: () => this.getTestsAboveWPM(80) >= 10, xp: 200 }
        };
        
        const newAchievements = [];
        
        for (const [achievementId, achievement] of Object.entries(achievementChecks)) {
            if (!this.achievements[achievementId] && achievement.condition()) {
                this.achievements[achievementId] = {
                    unlocked: true,
                    unlockedAt: new Date().toISOString(),
                    xpReward: achievement.xp
                };
                newAchievements.push(achievementId);
                this.addXP(achievement.xp, 'achievement');
            }
        }
        
        if (newAchievements.length > 0) {
            this.saveProgress();
        }
        
        return newAchievements;
    }
    
    getTestCount() {
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        return history.length;
    }
    
    getBestWPM() {
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        return history.reduce((max, test) => Math.max(max, test.wpm || 0), 0);
    }
    
    getBestAccuracy() {
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        return history.reduce((max, test) => Math.max(max, test.accuracy || 0), 0);
    }
    
    getPerfectRuns() {
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        return history.filter(test => test.accuracy === 100).length;
    }
    
    getZeroErrorTests() {
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        return history.filter(test => test.errors === 0).length;
    }
    
    getTestsAboveWPM(wpm) {
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        return history.filter(test => test.wpm >= wpm).length;
    }
    
    saveProgress() {
        localStorage.setItem('userLevel', this.userLevel.toString());
        localStorage.setItem('userXP', this.userXP.toString());
        localStorage.setItem('userStreak', this.userStreak.toString());
        localStorage.setItem('lastLogin', this.lastLogin);
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
        localStorage.setItem('unlockedThemes', JSON.stringify(this.unlockedThemes));
        localStorage.setItem('completedLessons', JSON.stringify(this.completedLessons));
        localStorage.setItem('dailyChallengeCompleted', this.dailyChallengeCompleted.toString());
    }
    
    completeDailyChallenge() {
        this.dailyChallengeCompleted = true;
        this.addXP(50, 'daily_challenge');
        this.saveProgress();
    }
    
    completeLesson(lessonId) {
        if (!this.completedLessons.includes(lessonId)) {
            this.completedLessons.push(lessonId);
            this.addXP(25, 'lesson');
            this.saveProgress();
            return true;
        }
        return false;
    }
    
    getUnlockedAchievements() {
        return Object.entries(this.achievements)
            .filter(([id, data]) => data.unlocked)
            .map(([id, data]) => ({ id, ...data }));
    }
    
    getAllAchievementDefinitions() {
        return [
            { id: 'first_test', name: 'First Test', description: 'Complete your first typing test', icon: 'fa-flag' },
            { id: 'speed_50', name: 'Speed Demon I', description: 'Achieve 50 WPM', icon: 'fa-tachometer-alt' },
            { id: 'speed_75', name: 'Speed Demon II', description: 'Achieve 75 WPM', icon: 'fa-tachometer-alt' },
            { id: 'speed_100', name: 'Speed Master', description: 'Achieve 100 WPM', icon: 'fa-tachometer-alt-fast' },
            { id: 'accuracy_95', name: 'Precision I', description: 'Achieve 95% accuracy', icon: 'fa-bullseye' },
            { id: 'accuracy_99', name: 'Precision II', description: 'Achieve 99% accuracy', icon: 'fa-bullseye' },
            { id: 'streak_3', name: 'Consistent I', description: '3-day streak', icon: 'fa-calendar' },
            { id: 'streak_7', name: 'Consistent II', description: '7-day streak', icon: 'fa-calendar' },
            { id: 'streak_30', name: 'Dedicated', description: '30-day streak', icon: 'fa-calendar' },
            { id: 'tests_10', name: 'Practiced', description: 'Complete 10 tests', icon: 'fa-keyboard' },
            { id: 'tests_50', name: 'Experienced', description: 'Complete 50 tests', icon: 'fa-keyboard' },
            { id: 'tests_100', name: 'Veteran', description: 'Complete 100 tests', icon: 'fa-keyboard' },
            { id: 'lessons_5', name: 'Student', description: 'Complete 5 lessons', icon: 'fa-graduation-cap' },
            { id: 'lessons_all', name: 'Scholar', description: 'Complete all lessons', icon: 'fa-graduation-cap' },
            { id: 'daily_challenge', name: 'Daily Warrior', description: 'Complete daily challenge', icon: 'fa-calendar-day' },
            { id: 'perfect_run', name: 'Flawless', description: 'Complete a test with 100% accuracy', icon: 'fa-star' },
            { id: 'level_10', name: 'Rising Star', description: 'Reach level 10', icon: 'fa-level-up-alt' },
            { id: 'level_25', name: 'Prodigy', description: 'Reach level 25', icon: 'fa-level-up-alt' },
            { id: 'level_50', name: 'Legend', description: 'Reach level 50', icon: 'fa-crown' },
            { id: 'no_errors', name: 'Error Free', description: 'Complete 3 tests with 0 errors', icon: 'fa-check-circle' },
            { id: 'fast_typer', name: 'Fast Typer', description: 'Complete 10 tests above 80 WPM', icon: 'fa-bolt' }
        ];
    }
}

// Game Manager
class TypingTestGame {
    constructor() {
        // Game states
        this.normalGameState = GameState.IDLE;
        this.timerGameState = GameState.IDLE;
        this.challengeGameState = GameState.IDLE;
        this.currentMode = 'normal';
        
        // Game data
        this.normalStartTime = 0;
        this.normalErrors = 0;
        this.normalInterval = null;
        this.normalCurrentSentence = '';
        this.normalCurrentIndex = 0;
        
        this.timerStartTime = 0;
        this.timerErrors = 0;
        this.timerInterval = null;
        this.timerDuration = 60;
        this.timerRemaining = 60;
        this.timerWords = 0;
        this.timerTypedChars = 0;
        
        this.challengeStartTime = 0;
        this.challengeErrors = 0;
        this.challengeInterval = null;
        
        // Systems
        this.antiCheat = new AntiCheatSystem();
        this.gamification = new GamificationSystem();
        
        // Data collections
        this.normalSentences = {
            easy: [
                "The cat sat on the mat.",
                "I like to read books.",
                "She walks to school.",
                "The sun is bright today.",
                "We eat dinner at six.",
                "My dog is very friendly.",
                "He plays with his toys.",
                "The sky is blue and clear.",
                "I drink water every day.",
                "She sings a happy song."
            ],
            medium: [
                "Practice makes progress. Consistency beats motivation every single day.",
                "The quick brown fox jumps over the lazy dog while practicing typing skills.",
                "Programming is the art of telling another human what one wants the computer to do.",
                "Typing speed and accuracy are valuable skills in today's digital world.",
                "Success is not the key to happiness. Happiness is the key to success.",
                "The only way to do great work is to love what you do with passion.",
                "Every expert was once a beginner who never gave up on their practice.",
                "Technology is best when it brings people together through shared experiences.",
                "The future belongs to those who believe in the beauty of their dreams.",
                "Learning to code is learning to create and innovate in the digital age."
            ],
            hard: [
                "The juxtaposition of quantum mechanics and relativity theory continues to perplex physicists worldwide.",
                "Entrepreneurs must navigate complex regulatory frameworks while innovating disruptive technologies.",
                "Cryptocurrency volatility necessitates sophisticated risk management strategies for institutional investors.",
                "Epistemological debates concerning artificial consciousness raise profound philosophical implications.",
                "Multidisciplinary collaboration accelerates biomedical research breakthroughs and therapeutic discoveries.",
                "Anthropogenic climate change necessitates immediate international policy coordination and mitigation efforts.",
                "Neuroplasticity research reveals remarkable adaptive capabilities within the human cerebral cortex.",
                "Postmodern literary deconstruction challenges traditional narrative structures and authorial authority.",
                "Quantum computing algorithms potentially revolutionize cryptography and data security paradigms.",
                "Sustainable urban planning integrates ecological preservation with socioeconomic development objectives."
            ],
            expert: [
                "#!/bin/bash\nfor i in {1..10}; do\necho 'Processing file $i'\ndone\n# This is a comment",
                "const factorial = n => n <= 1 ? 1 : n * factorial(n - 1);\nconsole.log(factorial(5)); // 120",
                "import React, { useState } from 'react';\nfunction Counter() {\nconst [count, setCount] = useState(0);\nreturn <button onClick={() => setCount(count + 1)}>{count}</button>;\n}",
                "SELECT users.name, orders.total FROM users JOIN orders ON users.id = orders.user_id WHERE orders.date > '2023-01-01';",
                "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
                "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}",
                "<!DOCTYPE html>\n<html>\n<head>\n    <title>Page Title</title>\n</head>\n<body>\n    <h1>My First Heading</h1>\n</body>\n</html>",
                "docker run -d -p 8080:80 --name webserver nginx:alpine",
                "git commit -m \"feat: add new feature\" && git push origin main",
                "async function fetchData() {\n    try {\n        const response = await fetch('/api/data');\n        return await response.json();\n    } catch (error) {\n        console.error(error);\n    }\n}"
            ]
        };
        
        this.timerParagraphs = {
            30: "Typing quickly and accurately is a valuable skill in today's digital world. Regular practice with typing tests can significantly improve your speed over time. Focus on hitting the correct keys without looking at your keyboard. Start slow and gradually increase your pace as you become more comfortable.",
            60: "Touch typing is the ability to type without looking at the keyboard, and it's a skill that can dramatically increase your productivity. Professional typists can reach speeds of over 100 words per minute with high accuracy. To improve, focus on proper finger placement and practice regularly with different types of texts. Speed will naturally increase as muscle memory develops. Typing tests provide measurable feedback that helps track your progress over weeks and months.",
            90: "Mastering typing is an investment that pays dividends throughout your personal and professional life. In our digital age, almost every job requires some level of typing proficiency. Beyond just speed, good typists develop rhythm and flow that makes writing more enjoyable and less fatiguing. The benefits extend to reduced strain on your hands and wrists when you use proper technique. Start by learning the home row keys and practice with a variety of texts. Regular, focused practice will yield better results than sporadic marathon sessions.",
            120: "Advanced typing proficiency involves more than just speed; it encompasses accuracy, rhythm, and endurance. Professional transcriptionists and data entry specialists often maintain speeds of 80-120 WPM for extended periods. To reach this level, consider practicing with diverse text types including technical documents, creative writing, and numerical data. Implement ergonomic principles to prevent repetitive strain injuries. Monitor your progress through detailed analytics and adjust your practice routine accordingly. Remember that consistent, deliberate practice over months and years yields the most significant improvements in both speed and accuracy."
        };
        
        this.lessons = [
            { id: 'home1', title: 'Home Row: ASDF', text: 'asdf asdf asdf fdsa fdsa fdsa', targetWPM: 20, category: 'home' },
            { id: 'home2', title: 'Home Row: JKL;', text: 'jkl; jkl; jkl; ;lkj ;lkj ;lkj', targetWPM: 20, category: 'home' },
            { id: 'home3', title: 'Home Row Combined', text: 'asdf jkl; asdf jkl; fdsa ;lkj fdsa ;lkj', targetWPM: 25, category: 'home' },
            { id: 'top1', title: 'Top Row: QWER', text: 'qwer qwer qwer rewq rewq rewq', targetWPM: 20, category: 'top' },
            { id: 'top2', title: 'Top Row: UIOP', text: 'uiop uiop uiop poiu poiu poiu', targetWPM: 20, category: 'top' },
            { id: 'top3', title: 'Top Row Combined', text: 'qwerty qwerty poiuy poiuy trewq trewq', targetWPM: 25, category: 'top' },
            { id: 'bottom1', title: 'Bottom Row: ZXCV', text: 'zxcv zxcv zxcv vcxz vcxz vcxz', targetWPM: 20, category: 'bottom' },
            { id: 'bottom2', title: 'Bottom Row: NM,./', text: 'nm,./ nm,./ nm,./ /.,mn /.,mn /.,mn', targetWPM: 20, category: 'bottom' },
            { id: 'bottom3', title: 'Bottom Row Combined', text: 'zxcv nm,./ zxcv nm,./ vcxz /.,mn vcxz /.,mn', targetWPM: 25, category: 'bottom' },
            { id: 'full1', title: 'All Letters', text: 'the quick brown fox jumps over the lazy dog', targetWPM: 30, category: 'full' },
            { id: 'full2', title: 'Numbers', text: '12345 67890 09876 54321', targetWPM: 25, category: 'full' },
            { id: 'full3', title: 'Symbols', text: '!@#$% ^&*() _+{}| :"<>? ~`[]\\', targetWPM: 20, category: 'full' },
            { id: 'full4', title: 'Mixed Practice', text: 'Hello World! 123 Main St. var x = 5;', targetWPM: 30, category: 'full' }
        ];
        
        this.practiceModes = {
            numbers: {
                name: 'Numbers Practice',
                texts: [
                    '123 456 789 0 987 654 321',
                    '1.5 2.75 3.25 4.8 5.9 6.1',
                    '2023 1999 1776 1492 1066',
                    '555-1234 800-555-0199 911',
                    '3.14159 2.71828 1.61803 0.57721'
                ]
            },
            symbols: {
                name: 'Symbols Practice',
                texts: [
                    '! @ # $ % ^ & * ( ) _ +',
                    '{ } | : " < > ? ~ ` [ ] \\',
                    '~!@#$ %^&* ()_+ {}|:" <>?',
                    '© ® ™ ° ± ÷ × π Ω ∞ ≈ ≠',
                    '→ ← ↑ ↓ ↔ ↕ ↖ ↗ ↘ ↙'
                ]
            },
            code: {
                name: 'Code Typing',
                texts: [
                    'function add(a, b) { return a + b; }',
                    'const users = users.filter(u => u.active);',
                    '<div class="container"><p>Hello</p></div>',
                    'SELECT * FROM users WHERE active = true;',
                    'for i in range(10): print(f"Number: {i}")'
                ]
            },
            quotes: {
                name: 'Quotes Practice',
                texts: [
                    'The only way to do great work is to love what you do. - Steve Jobs',
                    'Innovation distinguishes between a leader and a follower. - Steve Jobs',
                    'The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt',
                    'Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill',
                    'The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb'
                ]
            },
            pangram: {
                name: 'Pangram Mode',
                texts: [
                    'The quick brown fox jumps over the lazy dog.',
                    'Pack my box with five dozen liquor jugs.',
                    'How vexingly quick daft zebras jump!',
                    'The five boxing wizards jump quickly.',
                    'Sphinx of black quartz, judge my vow.'
                ]
            }
        };
        
        // Settings
        this.settings = {
            theme: localStorage.getItem('theme') || 'midnight',
            soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
            volume: parseInt(localStorage.getItem('volume')) || 50,
            hapticFeedback: localStorage.getItem('hapticFeedback') !== 'false',
            autoRestart: localStorage.getItem('autoRestart') === 'true',
            pauseOnBlur: localStorage.getItem('pauseOnBlur') !== 'false',
            antiCheatEnabled: localStorage.getItem('antiCheatEnabled') !== 'false',
            defaultDuration: parseInt(localStorage.getItem('defaultDuration')) || 60,
            highContrast: localStorage.getItem('highContrast') === 'true',
            reduceMotion: localStorage.getItem('reduceMotion') === 'false',
            keyboardNavigation: localStorage.getItem('keyboardNavigation') === 'true',
            font: localStorage.getItem('font') || 'inter',
            cursorStyle: localStorage.getItem('cursorStyle') || 'block'
        };
        
        // DOM Elements cache
        this.cacheDOM();
        
        // Initialize
        this.init();
    }
    
    cacheDOM() {
        // Theme and UI
        this.themeCheckbox = document.getElementById('theme-checkbox');
        this.resetBtn = document.getElementById('reset-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.userLevel = document.getElementById('user-level');
        this.userXP = document.getElementById('user-xp');
        this.userStreak = document.getElementById('user-streak');
        this.userRank = document.getElementById('user-rank');
        this.profileBadge = document.getElementById('profile-badge');
        this.achievementCount = document.getElementById('achievement-count');
        
        // Navigation
        this.navTabs = document.querySelectorAll('.nav-tab');
        this.contentTabs = document.querySelectorAll('.content-tab');
        
        // Mode selection
        this.normalModeBtn = document.getElementById('normal-mode-btn');
        this.timerModeBtn = document.getElementById('timer-mode-btn');
        this.challengeModeBtn = document.getElementById('challenge-mode-btn');
        this.normalModeUI = document.getElementById('normal-mode-ui');
        this.timerModeUI = document.getElementById('timer-mode-ui');
        this.challengeModeUI = document.getElementById('challenge-mode-ui');
        
        // Options
        this.difficultySelect = document.getElementById('difficulty-select');
        this.timeOptions = document.querySelectorAll('.time-option');
        
        // Normal mode elements
        this.startBtn = document.getElementById('start-btn');
        this.endBtn = document.getElementById('end-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.typingInput = document.getElementById('typing-input');
        this.sentenceText = document.getElementById('sentence-text');
        this.charCount = document.getElementById('char-count');
        this.errorCount = document.getElementById('error-count');
        this.accuracy = document.getElementById('accuracy');
        this.timeElapsed = document.getElementById('time-elapsed');
        this.realtimeWPM = document.getElementById('realtime-wpm');
        this.sentenceLength = document.getElementById('sentence-length');
        this.difficultyBadge = document.getElementById('difficulty-badge');
        this.textSource = document.getElementById('text-source');
        this.newTextBtn = document.getElementById('new-text-btn');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.customTextBtn = document.getElementById('custom-text-btn');
        this.antiCheatWarning = document.getElementById('anti-cheat-warning');
        
        // Timer mode elements
        this.timerStartBtn = document.getElementById('timer-start-btn');
        this.timerEndBtn = document.getElementById('timer-end-btn');
        this.timerPauseBtn = document.getElementById('timer-pause-btn');
        this.timerTypingInput = document.getElementById('timer-typing-input');
        this.timerText = document.getElementById('timer-text');
        this.timerCount = document.getElementById('timer-count');
        this.timerWordCount = document.getElementById('timer-word-count');
        this.timerErrorCount = document.getElementById('timer-error-count');
        this.timerWPM = document.getElementById('timer-wpm');
        this.timerAccuracy = document.getElementById('timer-accuracy');
        this.timerProgress = document.getElementById('timer-progress');
        this.timerRealtimeWPM = document.getElementById('timer-realtime-wpm');
        this.timerDifficultyBadge = document.getElementById('timer-difficulty-badge');
        this.paragraphLength = document.getElementById('paragraph-length');
        this.timerCircle = document.querySelector('.timer-progress');
        
        // Challenge mode elements
        this.challengeStartBtn = document.getElementById('challenge-start-btn');
        this.challengeEndBtn = document.getElementById('challenge-end-btn');
        this.challengeTypingInput = document.getElementById('challenge-typing-input');
        this.challengeText = document.getElementById('challenge-text');
        this.challengeWPM = document.getElementById('challenge-wpm');
        this.challengeAccuracy = document.getElementById('challenge-accuracy');
        this.challengeTime = document.getElementById('challenge-time');
        this.targetWPM = document.getElementById('target-wpm');
        this.targetAccuracy = document.getElementById('target-accuracy');
        this.challengeLength = document.getElementById('challenge-length');
        
        // Stats elements
        this.bestWPM = document.getElementById('best-wpm');
        this.bestAccuracy = document.getElementById('best-accuracy');
        this.testsCompleted = document.getElementById('tests-completed');
        this.avgWPM = document.getElementById('avg-wpm');
        
        // Modals
        this.resultModal = document.getElementById('result-modal');
        this.closeModal = document.getElementById('close-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalIcon = document.getElementById('modal-icon');
        this.resultMessage = document.getElementById('result-message');
        this.resultWPM = document.getElementById('result-wpm');
        this.resultAccuracy = document.getElementById('result-accuracy');
        this.resultTime = document.getElementById('result-time');
        this.resultXP = document.getElementById('result-xp');
        this.newTestBtn = document.getElementById('new-test-btn');
        this.shareBtn = document.getElementById('share-btn');
        this.practiceMoreBtn = document.getElementById('practice-more-btn');
        
        this.customTextModal = document.getElementById('custom-text-modal');
        this.settingsModal = document.getElementById('settings-modal');
        this.accessibilityModal = document.getElementById('accessibility-modal');
        
        // Daily notification
        this.dailyNotification = document.getElementById('daily-notification');
        this.claimDailyBtn = document.getElementById('claim-daily');
        
        // Audio elements
        this.keySound = document.getElementById('key-sound');
        this.errorSound = document.getElementById('error-sound');
        this.successSound = document.getElementById('success-sound');
        this.completeSound = document.getElementById('complete-sound');
    }
    
    init() {
        this.applySettings();
        this.updateUserStats();
        this.loadRandomSentence('normal');
        this.updateTimerParagraph();
        this.updateTimerText();
        this.loadDailyChallenge();
        this.renderLessons();
        this.renderAchievements();
        this.loadAnalytics();
        this.setupEventListeners();
        
        if (!this.gamification.dailyChallengeCompleted) {
            setTimeout(() => {
                this.dailyNotification.style.display = 'flex';
            }, 2000);
        }
        
        this.initCharts();
    }
    
    applySettings() {
        document.body.className = `dark-mode theme-${this.settings.theme}`;
        
        document.body.style.fontFamily = this.settings.font === 'dyslexic' ? 'OpenDyslexic, sans-serif' : 
                                       this.settings.font === 'mono' ? 'monospace' : 'Inter, sans-serif';
        
        const cursorStyles = {
            'block': 'text',
            'line': 'vertical-text',
            'underline': 'underline'
        };
        document.documentElement.style.cursor = cursorStyles[this.settings.cursorStyle] || 'text';
        
        this.keySound.volume = this.settings.volume / 100;
        this.errorSound.volume = this.settings.volume / 100;
        this.successSound.volume = this.settings.volume / 100;
        this.completeSound.volume = this.settings.volume / 100;
        
        if (this.settings.highContrast) {
            document.body.classList.add('high-contrast');
        }
        
        if (this.settings.reduceMotion) {
            document.body.classList.add('reduce-motion');
        }
    }
    
    updateUserStats() {
        this.userLevel.textContent = this.gamification.userLevel;
        this.userXP.textContent = this.gamification.userXP;
        this.userStreak.textContent = this.gamification.userStreak;
        this.userRank.textContent = this.gamification.userRank;
        
        const unlockedCount = this.gamification.getUnlockedAchievements().length;
        this.achievementCount.textContent = unlockedCount;
        this.profileBadge.title = `${unlockedCount} achievements unlocked`;
        
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        if (history.length > 0) {
            const best = history.reduce((max, test) => test.wpm > max.wpm ? test : max, history[0]);
            const avg = history.reduce((sum, test) => sum + test.wpm, 0) / history.length;
            
            this.bestWPM.textContent = Math.round(best.wpm);
            this.bestAccuracy.textContent = `${Math.round(best.accuracy)}%`;
            this.testsCompleted.textContent = history.length;
            this.avgWPM.textContent = Math.round(avg);
        }
        
        this.updateCompetitiveUI();
    }
    
    updateCompetitiveUI() {
        const achievements = this.gamification.getUnlockedAchievements();
        document.getElementById('total-achievements').textContent = achievements.length;
        document.getElementById('highest-streak').textContent = this.gamification.userStreak;
        
        const xpProgress = (this.gamification.userXP / this.gamification.xpForNextLevel) * 100;
        document.getElementById('level-progress').style.width = `${Math.min(100, xpProgress)}%`;
        document.getElementById('level-text').textContent = 
            `Level ${this.gamification.userLevel} (${this.gamification.userXP}/${this.gamification.xpForNextLevel} XP)`;
        
        const challengeStatus = document.getElementById('daily-challenge-status');
        if (this.gamification.dailyChallengeCompleted) {
            challengeStatus.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
            challengeStatus.style.color = '#10b981';
        } else {
            challengeStatus.innerHTML = '<i class="fas fa-times-circle"></i> Not Completed';
            challengeStatus.style.color = '#ef4444';
        }
    }
    
    loadRandomSentence(mode = 'normal') {
        const difficulty = this.difficultySelect.value;
        let sentences;
        
        if (mode === 'timer') {
            sentences = [this.timerParagraphs[this.timerDuration]];
        } else {
            sentences = this.normalSentences[difficulty];
        }
        
        const randomIndex = Math.floor(Math.random() * sentences.length);
        const sentence = sentences[randomIndex];
        
        if (mode === 'normal') {
            this.normalCurrentSentence = sentence;
            this.sentenceText.innerHTML = sentence;
            this.normalCurrentIndex = 0;
            this.sentenceLength.textContent = `${sentence.length} chars`;
            this.difficultyBadge.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
            this.difficultyBadge.setAttribute('data-difficulty', difficulty);
            this.textSource.textContent = `Random sentence • ${difficulty} difficulty`;
            window.currentText = sentence;
            this.highlightCurrentCharacter();
        } else if (mode === 'timer') {
            this.timerText.textContent = sentence;
            this.paragraphLength.textContent = `${sentence.length} chars`;
            this.timerDifficultyBadge.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
            this.timerDifficultyBadge.setAttribute('data-difficulty', difficulty);
            window.currentText = sentence;
        }
    }
    
    highlightCurrentCharacter() {
        const text = this.normalCurrentSentence;
        let highlightedText = '';
        
        for (let i = 0; i < text.length; i++) {
            if (i === this.normalCurrentIndex) {
                highlightedText += `<span class="current">${text[i]}</span>`;
            } else if (i < this.normalCurrentIndex) {
                const userChar = this.typingInput.value[i] || '';
                if (userChar === text[i]) {
                    highlightedText += `<span class="correct">${text[i]}</span>`;
                } else {
                    highlightedText += `<span class="incorrect">${text[i]}</span>`;
                }
            } else {
                highlightedText += text[i];
            }
        }
        
        this.sentenceText.innerHTML = highlightedText;
    }
    
    updateTimerParagraph() {
        const paragraph = this.timerParagraphs[this.timerDuration];
        this.timerText.textContent = paragraph;
        this.paragraphLength.textContent = `${paragraph.length} chars`;
        this.timerDifficultyBadge.setAttribute('data-difficulty', this.difficultySelect.value);
        window.currentText = paragraph;
    }
    
    updateTimerText() {
        this.timerCount.textContent = this.timerRemaining;
        
        const circumference = 2 * Math.PI * 64;
        const offset = circumference - (this.timerRemaining / this.timerDuration) * circumference;
        this.timerCircle.style.strokeDashoffset = offset;
    }
    
    loadDailyChallenge() {
        const challengeText = "Complete this daily challenge to earn bonus XP and achievements. This text contains a mix of words, numbers (123), and symbols (!@#) to test your all-around typing skills. Type as fast as you can while maintaining high accuracy to complete the challenge successfully!";
        this.challengeText.textContent = challengeText;
        this.challengeLength.textContent = `${challengeText.length} chars`;
        
        const targetWPM = Math.floor(Math.random() * 30) + 40;
        const targetAccuracy = Math.floor(Math.random() * 10) + 90;
        
        this.targetWPM.textContent = targetWPM;
        this.targetAccuracy.textContent = `${targetAccuracy}%`;
        
        window.currentText = challengeText;
    }
    
    renderLessons() {
        const categories = {
            home: document.querySelector('.lesson-category:nth-child(1) .lesson-grid'),
            top: document.querySelector('.lesson-category:nth-child(2) .lesson-grid'),
            bottom: document.querySelector('.lesson-category:nth-child(3) .lesson-grid'),
            full: document.querySelector('.lesson-category:nth-child(4) .lesson-grid')
        };
        
        Object.values(categories).forEach(grid => grid.innerHTML = '');
        
        this.lessons.forEach(lesson => {
            const isCompleted = this.gamification.completedLessons.includes(lesson.id);
            const lessonCard = document.createElement('div');
            lessonCard.className = `lesson-card ${isCompleted ? 'completed' : ''}`;
            lessonCard.innerHTML = `
                <h4>${lesson.title}</h4>
                <p>${lesson.text}</p>
                <div class="lesson-footer">
                    <span>Target: ${lesson.targetWPM} WPM</span>
                    <button class="btn btn-sm start-lesson" data-id="${lesson.id}">
                        ${isCompleted ? '<i class="fas fa-redo"></i> Practice Again' : 'Start'}
                    </button>
                </div>
            `;
            
            if (categories[lesson.category]) {
                categories[lesson.category].appendChild(lessonCard);
            }
        });
        
        document.querySelectorAll('.start-lesson').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lessonId = e.target.dataset.id || e.target.closest('.start-lesson').dataset.id;
                this.startLesson(lessonId);
            });
        });
    }
    
    renderAchievements() {
        const grid = document.getElementById('achievements-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const allAchievements = this.gamification.getAllAchievementDefinitions();
        const unlockedAchievements = this.gamification.getUnlockedAchievements();
        
        allAchievements.forEach(achievement => {
            const isUnlocked = unlockedAchievements.some(a => a.id === achievement.id);
            const achievementCard = document.createElement('div');
            achievementCard.className = `achievement-mini ${isUnlocked ? 'unlocked' : 'locked'}`;
            achievementCard.innerHTML = `
                <div class="achievement-icon">
                    <i class="fas ${achievement.icon}"></i>
                </div>
                <div class="achievement-name">${achievement.name}</div>
            `;
            grid.appendChild(achievementCard);
        });
    }
    
    loadAnalytics() {
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        
        const recentTests = document.getElementById('recent-tests');
        if (recentTests) {
            recentTests.innerHTML = '';
            const recent = history.slice(-5).reverse();
            
            if (recent.length === 0) {
                recentTests.innerHTML = '<p class="no-data">No tests completed yet</p>';
            } else {
                recent.forEach(test => {
                    const testEl = document.createElement('div');
                    testEl.className = 'recent-test';
                    testEl.innerHTML = `
                        <div class="recent-test-header">
                            <span>${new Date(test.timestamp).toLocaleDateString()}</span>
                            <span class="test-mode">${test.mode}</span>
                        </div>
                        <div class="recent-test-stats">
                            <span>${test.wpm} WPM</span>
                            <span>${test.accuracy}%</span>
                            <span>${test.duration}s</span>
                        </div>
                    `;
                    recentTests.appendChild(testEl);
                });
            }
        }
    }
    
    initCharts() {
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        
        if (history.length === 0) return;
        
        // WPM Chart
        const wpmCtx = document.getElementById('wpm-chart')?.getContext('2d');
        if (wpmCtx) {
            const labels = history.slice(-10).map((_, i) => `Test ${i + 1}`);
            const wpmData = history.slice(-10).map(test => test.wpm);
            
            new Chart(wpmCtx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'WPM',
                        data: wpmData,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } },
                        x: { grid: { color: 'rgba(255,255,255,0.1)' } }
                    }
                }
            });
        }
        
        // Accuracy Chart
        const accuracyCtx = document.getElementById('accuracy-chart')?.getContext('2d');
        if (accuracyCtx) {
            const accuracyData = history.slice(-10).map(test => test.accuracy);
            
            new Chart(accuracyCtx, {
                type: 'bar',
                data: {
                    labels: history.slice(-10).map((_, i) => `Test ${i + 1}`),
                    datasets: [{
                        label: 'Accuracy',
                        data: accuracyData,
                        backgroundColor: '#10b981',
                        borderColor: '#059669',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.1)' } },
                        x: { grid: { color: 'rgba(255,255,255,0.1)' } }
                    }
                }
            });
        }
        
        // Error Chart
        const errorCtx = document.getElementById('error-chart')?.getContext('2d');
        if (errorCtx) {
            const errorTypes = {
                'Missing Letters': 35,
                'Wrong Letters': 25,
                'Extra Letters': 20,
                'Punctuation': 15,
                'Capitalization': 5
            };
            
            new Chart(errorCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(errorTypes),
                    datasets: [{
                        data: Object.values(errorTypes),
                        backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: 'var(--dark-text-primary)' }
                        }
                    }
                }
            });
        }
    }
    
    setupEventListeners() {
        // Theme toggle
        this.themeCheckbox.addEventListener('change', () => this.toggleTheme());
        
        // Reset button
        this.resetBtn.addEventListener('click', () => this.resetApp());
        
        // Settings button
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        
        // Navigation tabs
        this.navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.target.closest('.nav-tab').dataset.tab;
                this.switchTab(tabId);
            });
        });
        
        // Mode switching
        this.normalModeBtn.addEventListener('click', () => this.switchToNormalMode());
        this.timerModeBtn.addEventListener('click', () => this.switchToTimerMode());
        this.challengeModeBtn.addEventListener('click', () => this.switchToChallengeMode());
        
        // Options changes
        this.difficultySelect.addEventListener('change', () => {
            const difficulty = this.difficultySelect.value;
            this.loadRandomSentence('normal');
            
            if (this.timerModeUI.classList.contains('active')) {
                this.loadRandomSentence('timer');
            }
        });
        
        // Time options
        this.timeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                this.timeOptions.forEach(opt => opt.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.timerDuration = parseInt(e.currentTarget.dataset.time);
                this.timerRemaining = this.timerDuration;
                this.updateTimerText();
                this.updateTimerParagraph();
            });
        });
        
        // Normal mode controls
        this.startBtn.addEventListener('click', () => this.startNormalTest());
        this.endBtn.addEventListener('click', () => this.endNormalTest());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.typingInput.addEventListener('input', (e) => this.handleNormalTyping(e));
        this.typingInput.addEventListener('keydown', (e) => this.playKeySound());
        this.typingInput.addEventListener('paste', (e) => {
            e.preventDefault();
            this.antiCheat.cheatingScore += 50;
            this.antiCheat.copyPasteDetected = true;
            this.showCheatingWarning();
        });
        this.newTextBtn.addEventListener('click', () => this.loadRandomSentence('normal'));
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.customTextBtn.addEventListener('click', () => this.showCustomTextModal());
        
        // Timer mode controls
        this.timerStartBtn.addEventListener('click', () => this.startTimerTest());
        this.timerEndBtn.addEventListener('click', () => this.endTimerTest());
        this.timerPauseBtn.addEventListener('click', () => this.toggleTimerPause());
        this.timerTypingInput.addEventListener('input', (e) => this.handleTimerTyping(e));
        this.timerTypingInput.addEventListener('keydown', (e) => this.playKeySound());
        this.timerTypingInput.addEventListener('paste', (e) => {
            e.preventDefault();
            this.antiCheat.cheatingScore += 50;
            this.antiCheat.copyPasteDetected = true;
            this.showCheatingWarning();
        });
        
        // Challenge mode controls
        this.challengeStartBtn.addEventListener('click', () => this.startChallengeTest());
        this.challengeEndBtn.addEventListener('click', () => this.endChallengeTest());
        this.challengeTypingInput.addEventListener('input', (e) => this.handleChallengeTyping(e));
        this.challengeTypingInput.addEventListener('keydown', (e) => this.playKeySound());
        this.challengeTypingInput.addEventListener('paste', (e) => {
            e.preventDefault();
            this.antiCheat.cheatingScore += 50;
            this.antiCheat.copyPasteDetected = true;
            this.showCheatingWarning();
        });
        
        // Practice mode buttons
        document.querySelectorAll('.start-practice').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const practiceCard = e.target.closest('.practice-card');
                const mode = practiceCard.dataset.mode;
                this.startPracticeMode(mode);
            });
        });
        
        // Modal controls
        this.closeModal.addEventListener('click', () => this.hideModal());
        this.newTestBtn.addEventListener('click', () => {
            this.hideModal();
            this.resetApp();
        });
        this.shareBtn.addEventListener('click', () => this.shareResults());
        this.practiceMoreBtn.addEventListener('click', () => {
            this.hideModal();
            this.switchTab('practice');
        });
        
        // Daily notification
        this.claimDailyBtn?.addEventListener('click', () => {
            this.switchTab('competitive');
            this.dailyNotification.style.display = 'none';
        });
        
        document.querySelector('.notification-close')?.addEventListener('click', () => {
            this.dailyNotification.style.display = 'none';
        });
        
        // Close modal on backdrop click
        document.querySelectorAll('.modal-backdrop, .close-modal-btn').forEach(el => {
            el.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
            });
        });
        
        // Save custom text
        document.getElementById('save-custom-text')?.addEventListener('click', () => {
            const text = document.getElementById('custom-text-input').value;
            const title = document.getElementById('custom-text-title').value || 'Custom Text';
            
            if (text.trim().length > 10) {
                this.useCustomText(text, title);
                this.customTextModal.style.display = 'none';
            } else {
                alert('Please enter at least 10 characters of text.');
            }
        });
        
        // Save settings
        document.getElementById('save-settings')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-settings')?.addEventListener('click', () => this.resetSettings());
        
        // Export data
        document.getElementById('export-csv')?.addEventListener('click', () => this.exportData('csv'));
        document.getElementById('export-json')?.addEventListener('click', () => this.exportData('json'));
        
        // Competitive features
        document.getElementById('start-ghost-race')?.addEventListener('click', () => this.startGhostRace());
        document.getElementById('share-results')?.addEventListener('click', () => this.shareResults());
        document.getElementById('create-challenge')?.addEventListener('click', () => this.createChallenge());
        document.getElementById('view-leaderboard')?.addEventListener('click', () => this.showLeaderboard());
        
        // Window events
        window.addEventListener('blur', () => {
            if (this.settings.pauseOnBlur) {
                if (this.normalGameState === GameState.RUNNING) this.togglePause();
                if (this.timerGameState === GameState.RUNNING) this.toggleTimerPause();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                if (this.normalModeUI.classList.contains('active') && this.normalGameState === GameState.IDLE) {
                    this.startNormalTest();
                } else if (this.timerModeUI.classList.contains('active') && this.timerGameState === GameState.IDLE) {
                    this.startTimerTest();
                }
            }
            
            if (e.key === 'Escape') {
                if (this.normalGameState === GameState.RUNNING) this.endNormalTest();
                if (this.timerGameState === GameState.RUNNING) this.endTimerTest();
                if (this.challengeGameState === GameState.RUNNING) this.endChallengeTest();
            }
        });
    }
    
    // ==============================================
    // GAME LOGIC METHODS
    // ==============================================
    
    switchTab(tabId) {
        this.navTabs.forEach(t => t.classList.remove('active'));
        this.contentTabs.forEach(t => t.classList.remove('active'));
        
        document.querySelector(`.nav-tab[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
        
        if (tabId === 'analytics') {
            this.loadAnalytics();
            this.initCharts();
        } else if (tabId === 'competitive') {
            this.renderAchievements();
            this.updateCompetitiveUI();
        }
    }
    
    switchToNormalMode() {
        this.currentMode = 'normal';
        this.normalModeBtn.classList.add('active');
        this.timerModeBtn.classList.remove('active');
        this.challengeModeBtn.classList.remove('active');
        this.normalModeUI.classList.add('active');
        this.timerModeUI.classList.remove('active');
        this.challengeModeUI.classList.remove('active');
        
        this.resetNormalMode();
    }
    
    switchToTimerMode() {
        this.currentMode = 'timer';
        this.timerModeBtn.classList.add('active');
        this.normalModeBtn.classList.remove('active');
        this.challengeModeBtn.classList.remove('active');
        this.timerModeUI.classList.add('active');
        this.normalModeUI.classList.remove('active');
        this.challengeModeUI.classList.remove('active');
        
        this.resetTimerMode();
    }
    
    switchToChallengeMode() {
        this.currentMode = 'challenge';
        this.challengeModeBtn.classList.add('active');
        this.normalModeBtn.classList.remove('active');
        this.timerModeBtn.classList.remove('active');
        this.challengeModeUI.classList.add('active');
        this.normalModeUI.classList.remove('active');
        this.timerModeUI.classList.remove('active');
        
        this.resetChallengeMode();
    }
    
    startNormalTest() {
        if (this.normalGameState === GameState.RUNNING) return;
        
        this.antiCheat.reset();
        this.normalGameState = GameState.RUNNING;
        this.normalStartTime = Date.now();
        this.normalErrors = 0;
        
        this.typingInput.disabled = false;
        this.typingInput.focus();
        this.typingInput.value = '';
        
        this.startBtn.disabled = true;
        this.endBtn.disabled = false;
        this.pauseBtn.disabled = false;
        this.newTextBtn.disabled = true;
        
        this.charCount.textContent = '0';
        this.errorCount.textContent = '0';
        this.accuracy.textContent = '100%';
        this.timeElapsed.textContent = '0.0s';
        this.realtimeWPM.textContent = '0';
        
        this.normalInterval = setInterval(() => this.updateNormalStats(), 100);
        
        if (this.settings.antiCheatEnabled) {
            this.antiCheatWarning.style.display = 'flex';
        }
    }
    
    endNormalTest() {
        if (this.normalGameState !== GameState.RUNNING && this.normalGameState !== GameState.PAUSED) return;
        
        this.normalGameState = GameState.FINISHED;
        clearInterval(this.normalInterval);
        
        this.typingInput.disabled = true;
        
        this.startBtn.disabled = false;
        this.endBtn.disabled = true;
        this.pauseBtn.disabled = true;
        this.newTextBtn.disabled = false;
        
        this.antiCheatWarning.style.display = 'none';
        
        this.showNormalResults();
    }
    
    togglePause() {
        if (this.normalGameState === GameState.RUNNING) {
            this.normalGameState = GameState.PAUSED;
            clearInterval(this.normalInterval);
            this.pauseBtn.innerHTML = '<i class="fas fa-play"></i><span>Resume</span>';
            this.typingInput.disabled = true;
        } else if (this.normalGameState === GameState.PAUSED) {
            this.normalGameState = GameState.RUNNING;
            this.normalInterval = setInterval(() => this.updateNormalStats(), 100);
            this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
            this.typingInput.disabled = false;
            this.typingInput.focus();
        }
    }
    
    handleNormalTyping(e) {
        if (this.normalGameState !== GameState.RUNNING) return;
        
        const input = this.typingInput.value;
        const targetChar = this.normalCurrentSentence[this.normalCurrentIndex];
        
        if (this.settings.antiCheatEnabled) {
            this.antiCheat.recordKeystroke();
            if (this.antiCheat.detectCopyPaste(input, this.antiCheat.lastText)) {
                this.showCheatingWarning();
            }
        }
        
        if (this.normalCurrentIndex >= this.normalCurrentSentence.length) {
            this.endNormalTest();
            return;
        }
        
        if (input.length > this.normalCurrentIndex) {
            const userChar = input[this.normalCurrentIndex];
            
            if (userChar !== targetChar) {
                this.normalErrors++;
                this.playErrorSound();
            } else {
                this.playKeySound();
            }
            
            this.normalCurrentIndex++;
            this.highlightCurrentCharacter();
        } else if (input.length < this.normalCurrentIndex) {
            this.normalCurrentIndex = Math.max(0, input.length);
            this.highlightCurrentCharacter();
        }
        
        this.errorCount.textContent = this.normalErrors;
    }
    
    updateNormalStats() {
        if (this.normalGameState !== GameState.RUNNING) return;
        
        const elapsedSeconds = (Date.now() - this.normalStartTime) / 1000;
        const typedChars = this.typingInput.value.length;
        const words = typedChars / 5;
        const wpm = elapsedSeconds > 0 ? Math.round((words / elapsedSeconds) * 60) : 0;
        
        this.charCount.textContent = typedChars;
        this.timeElapsed.textContent = elapsedSeconds.toFixed(1) + 's';
        this.realtimeWPM.textContent = wpm;
        
        const totalChars = this.normalCurrentIndex;
        const accuracyValue = totalChars > 0 ? Math.max(0, Math.round((1 - this.normalErrors / totalChars) * 100)) : 100;
        this.accuracy.textContent = `${accuracyValue}%`;
    }
    
    showNormalResults() {
        const elapsedSeconds = (Date.now() - this.normalStartTime) / 1000;
        const typedChars = this.typingInput.value.length;
        const words = typedChars / 5;
        const wpm = elapsedSeconds > 0 ? Math.round((words / elapsedSeconds) * 60) : 0;
        
        const totalChars = this.normalCurrentIndex;
        const accuracyValue = totalChars > 0 ? Math.max(0, Math.round((1 - this.normalErrors / totalChars) * 100)) : 100;
        
        let cheatingResult = { valid: true };
        if (this.settings.antiCheatEnabled) {
            cheatingResult = this.antiCheat.validateResult(wpm, accuracyValue, elapsedSeconds);
            
            if (!cheatingResult.valid) {
                this.showCheatingResult(cheatingResult);
                return;
            }
        }
        
        const baseXP = Math.floor(wpm * 0.5 + accuracyValue * 0.3);
        const xpResult = this.gamification.addXP(baseXP);
        
        this.saveToHistory({
            mode: 'normal',
            wpm,
            accuracy: accuracyValue,
            errors: this.normalErrors,
            characters: typedChars,
            duration: elapsedSeconds,
            difficulty: this.difficultySelect.value,
            timestamp: new Date().toISOString(),
            cheatingScore: this.antiCheat.cheatingScore
        });
        
        const newAchievements = this.gamification.checkAchievements();
        
        this.updateUserStats();
        
        this.showResultsModal({
            wpm,
            accuracy: accuracyValue,
            time: elapsedSeconds,
            xpEarned: baseXP,
            leveledUp: xpResult.leveledUp,
            newLevel: xpResult.newLevel,
            newAchievements,
            mode: 'normal'
        });
        
        this.playCompleteSound();
    }
    
    // Timer mode methods
    startTimerTest() {
        if (this.timerGameState === GameState.RUNNING) return;
        
        this.antiCheat.reset();
        this.timerGameState = GameState.RUNNING;
        this.timerStartTime = Date.now();
        this.timerErrors = 0;
        this.timerWords = 0;
        this.timerTypedChars = 0;
        this.timerRemaining = this.timerDuration;
        
        this.timerTypingInput.disabled = false;
        this.timerTypingInput.focus();
        this.timerTypingInput.value = '';
        
        this.timerStartBtn.disabled = true;
        this.timerEndBtn.disabled = false;
        this.timerPauseBtn.disabled = false;
        
        this.timerWordCount.textContent = '0';
        this.timerErrorCount.textContent = '0';
        this.timerWPM.textContent = '0';
        this.timerAccuracy.textContent = '100%';
        this.timerProgress.textContent = '0%';
        this.timerRealtimeWPM.textContent = '0';
        
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        this.updateTimerText();
    }
    
    endTimerTest() {
        if (this.timerGameState !== GameState.RUNNING && this.timerGameState !== GameState.PAUSED) return;
        
        this.timerGameState = GameState.FINISHED;
        clearInterval(this.timerInterval);
        
        this.timerTypingInput.disabled = true;
        
        this.timerStartBtn.disabled = false;
        this.timerEndBtn.disabled = true;
        this.timerPauseBtn.disabled = true;
        
        this.showTimerResults(false);
    }
    
    toggleTimerPause() {
        if (this.timerGameState === GameState.RUNNING) {
            this.timerGameState = GameState.PAUSED;
            clearInterval(this.timerInterval);
            this.timerPauseBtn.innerHTML = '<i class="fas fa-play"></i><span>Resume</span>';
            this.timerTypingInput.disabled = true;
        } else if (this.timerGameState === GameState.PAUSED) {
            this.timerGameState = GameState.RUNNING;
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
            this.timerPauseBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
            this.timerTypingInput.disabled = false;
            this.timerTypingInput.focus();
        }
    }
    
    updateTimer() {
        if (this.timerGameState !== GameState.RUNNING) return;
        
        this.timerRemaining--;
        this.updateTimerText();
        this.updateTimerStats();
        
        if (this.timerRemaining <= 0) {
            clearInterval(this.timerInterval);
            this.timerGameState = GameState.FINISHED;
            this.timerTypingInput.disabled = true;
            this.timerStartBtn.disabled = false;
            this.timerEndBtn.disabled = true;
            this.timerPauseBtn.disabled = true;
            this.showTimerResults(true);
        }
    }
    
    handleTimerTyping(e) {
        if (this.timerGameState !== GameState.RUNNING) return;
        
        const input = this.timerTypingInput.value;
        const targetText = this.timerText.textContent;
        
        if (this.settings.antiCheatEnabled) {
            this.antiCheat.recordKeystroke();
            if (this.antiCheat.detectCopyPaste(input, this.antiCheat.lastText)) {
                this.showCheatingWarning();
            }
        }
        
        const words = input.trim() === '' ? 0 : input.trim().split(/\s+/).length;
        this.timerWords = words;
        this.timerTypedChars = input.length;
        
        let errors = 0;
        const minLength = Math.min(input.length, targetText.length);
        
        for (let i = 0; i < minLength; i++) {
            if (input[i] !== targetText[i]) {
                errors++;
            }
        }
        
        this.timerErrors = errors;
        this.timerErrorCount.textContent = errors;
        
        const progress = Math.min(100, Math.round((input.length / targetText.length) * 100));
        this.timerProgress.textContent = `${progress}%`;
        
        if (input.length >= targetText.length) {
            clearInterval(this.timerInterval);
            this.timerGameState = GameState.FINISHED;
            this.timerTypingInput.disabled = true;
            this.timerStartBtn.disabled = false;
            this.timerEndBtn.disabled = true;
            this.timerPauseBtn.disabled = true;
            this.showTimerResults(false);
        }
    }
    
    updateTimerStats() {
        if (this.timerGameState !== GameState.RUNNING) return;
        
        const elapsedSeconds = this.timerDuration - this.timerRemaining;
        
        this.timerWordCount.textContent = this.timerWords;
        
        const wpm = elapsedSeconds > 0 ? Math.round((this.timerWords / elapsedSeconds) * 60) : 0;
        this.timerWPM.textContent = wpm;
        this.timerRealtimeWPM.textContent = wpm;
        
        const accuracyValue = this.timerTypedChars > 0 ? Math.max(0, Math.round(((this.timerTypedChars - this.timerErrors) / this.timerTypedChars) * 100)) : 100;
        this.timerAccuracy.textContent = `${accuracyValue}%`;
    }
    
    showTimerResults(isTimeUp) {
        const elapsedSeconds = this.timerDuration - this.timerRemaining;
        const targetText = this.timerText.textContent;
        const typedText = this.timerTypingInput.value;
        
        let correctChars = 0;
        const minLength = Math.min(typedText.length, targetText.length);
        
        for (let i = 0; i < minLength; i++) {
            if (typedText[i] === targetText[i]) {
                correctChars++;
            }
        }
        
        const accuracyValue = typedText.length > 0 ? Math.round((correctChars / typedText.length) * 100) : 0;
        const wpm = elapsedSeconds > 0 ? Math.round((this.timerWords / elapsedSeconds) * 60) : 0;
        
        let cheatingResult = { valid: true };
        if (this.settings.antiCheatEnabled) {
            cheatingResult = this.antiCheat.validateResult(wpm, accuracyValue, elapsedSeconds);
            
            if (!cheatingResult.valid) {
                this.showCheatingResult(cheatingResult);
                return;
            }
        }
        
        const completionBonus = !isTimeUp ? 20 : 0;
        const baseXP = Math.floor(wpm * 0.3 + accuracyValue * 0.2 + completionBonus);
        const xpResult = this.gamification.addXP(baseXP);
        
        this.saveToHistory({
            mode: 'timer',
            wpm,
            accuracy: accuracyValue,
            errors: this.timerErrors,
            characters: typedText.length,
            duration: elapsedSeconds,
            timeLimit: this.timerDuration,
            completed: !isTimeUp,
            timestamp: new Date().toISOString(),
            cheatingScore: this.antiCheat.cheatingScore
        });
        
        const newAchievements = this.gamification.checkAchievements();
        
        this.updateUserStats();
        
        this.showResultsModal({
            wpm,
            accuracy: accuracyValue,
            time: elapsedSeconds,
            xpEarned: baseXP,
            leveledUp: xpResult.leveledUp,
            newLevel: xpResult.newLevel,
            newAchievements,
            mode: 'timer',
            timeUp: isTimeUp,
            completed: !isTimeUp
        });
        
        this.playCompleteSound();
    }
    
    // Challenge mode methods
    startChallengeTest() {
        if (this.challengeGameState === GameState.RUNNING) return;
        
        this.antiCheat.reset();
        this.challengeGameState = GameState.RUNNING;
        this.challengeStartTime = Date.now();
        this.challengeErrors = 0;
        
        this.challengeTypingInput.disabled = false;
        this.challengeTypingInput.focus();
        this.challengeTypingInput.value = '';
        
        this.challengeStartBtn.disabled = true;
        this.challengeEndBtn.disabled = false;
        
        this.challengeWPM.textContent = '0';
        this.challengeAccuracy.textContent = '100%';
        this.challengeTime.textContent = '0.0s';
        
        this.challengeInterval = setInterval(() => this.updateChallengeStats(), 100);
    }
    
    endChallengeTest() {
        if (this.challengeGameState !== GameState.RUNNING) return;
        
        this.challengeGameState = GameState.FINISHED;
        clearInterval(this.challengeInterval);
        
        this.challengeTypingInput.disabled = true;
        
        this.challengeStartBtn.disabled = false;
        this.challengeEndBtn.disabled = true;
        
        this.showChallengeResults();
    }
    
    handleChallengeTyping(e) {
        if (this.challengeGameState !== GameState.RUNNING) return;
        
        const input = this.challengeTypingInput.value;
        const targetText = this.challengeText.textContent;
        
        if (this.settings.antiCheatEnabled) {
            this.antiCheat.recordKeystroke();
            if (this.antiCheat.detectCopyPaste(input, this.antiCheat.lastText)) {
                this.showCheatingWarning();
            }
        }
        
        let errors = 0;
        const minLength = Math.min(input.length, targetText.length);
        
        for (let i = 0; i < minLength; i++) {
            if (input[i] !== targetText[i]) {
                errors++;
            }
        }
        
        this.challengeErrors = errors;
        
        if (input.length >= targetText.length) {
            this.endChallengeTest();
        }
    }
    
    updateChallengeStats() {
        if (this.challengeGameState !== GameState.RUNNING) return;
        
        const elapsedSeconds = (Date.now() - this.challengeStartTime) / 1000;
        const typedChars = this.challengeTypingInput.value.length;
        const words = typedChars / 5;
        const wpm = elapsedSeconds > 0 ? Math.round((words / elapsedSeconds) * 60) : 0;
        
        const totalChars = typedChars;
        const accuracyValue = totalChars > 0 ? Math.max(0, Math.round(((totalChars - this.challengeErrors) / totalChars) * 100)) : 100;
        
        this.challengeWPM.textContent = wpm;
        this.challengeAccuracy.textContent = `${accuracyValue}%`;
        this.challengeTime.textContent = elapsedSeconds.toFixed(1) + 's';
    }
    
    showChallengeResults() {
        const elapsedSeconds = (Date.now() - this.challengeStartTime) / 1000;
        const typedChars = this.challengeTypingInput.value.length;
        const words = typedChars / 5;
        const wpm = elapsedSeconds > 0 ? Math.round((words / elapsedSeconds) * 60) : 0;
        
        const totalChars = typedChars;
        const accuracyValue = totalChars > 0 ? Math.max(0, Math.round(((totalChars - this.challengeErrors) / totalChars) * 100)) : 100;
        
        let cheatingResult = { valid: true };
        if (this.settings.antiCheatEnabled) {
            cheatingResult = this.antiCheat.validateResult(wpm, accuracyValue, elapsedSeconds);
            
            if (!cheatingResult.valid) {
                this.showCheatingResult(cheatingResult);
                return;
            }
        }
        
        const targetWPM = parseInt(this.targetWPM.textContent);
        const targetAccuracy = parseInt(this.targetAccuracy.textContent);
        const passed = wpm >= targetWPM && accuracyValue >= targetAccuracy;
        
        const passBonus = passed ? 50 : 0;
        const baseXP = Math.floor(wpm * 0.2 + accuracyValue * 0.1 + passBonus);
        const xpResult = this.gamification.addXP(baseXP);
        
        if (passed) {
            this.gamification.completeDailyChallenge();
            this.dailyNotification.style.display = 'none';
        }
        
        this.saveToHistory({
            mode: 'challenge',
            wpm,
            accuracy: accuracyValue,
            errors: this.challengeErrors,
            characters: typedChars,
            duration: elapsedSeconds,
            passed,
            targetWPM,
            targetAccuracy,
            timestamp: new Date().toISOString(),
            cheatingScore: this.antiCheat.cheatingScore
        });
        
        const newAchievements = this.gamification.checkAchievements();
        
        this.updateUserStats();
        
        this.showResultsModal({
            wpm,
            accuracy: accuracyValue,
            time: elapsedSeconds,
            xpEarned: baseXP,
            leveledUp: xpResult.leveledUp,
            newLevel: xpResult.newLevel,
            newAchievements,
            mode: 'challenge',
            passed,
            targetWPM,
            targetAccuracy
        });
        
        this.playCompleteSound();
    }
    
    // Practice mode methods
    startPracticeMode(mode) {
        if (mode === 'custom') {
            this.showCustomTextModal();
            return;
        }
        
        const practiceData = this.practiceModes[mode];
        if (!practiceData) return;
        
        this.switchTab('typing-test');
        this.switchToNormalMode();
        
        const texts = practiceData.texts;
        const randomText = texts[Math.floor(Math.random() * texts.length)];
        this.useCustomText(randomText, practiceData.name);
        
        this.textSource.textContent = `${practiceData.name} • Practice mode`;
        this.difficultyBadge.textContent = 'Practice';
        this.difficultyBadge.setAttribute('data-difficulty', 'practice');
    }
    
    startLesson(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return;
        
        this.switchTab('typing-test');
        this.switchToNormalMode();
        
        this.useCustomText(lesson.text, lesson.title);
        
        this.textSource.textContent = `${lesson.title} • Lesson`;
        this.difficultyBadge.textContent = 'Lesson';
        this.difficultyBadge.setAttribute('data-difficulty', 'lesson');
        
        this.currentLessonId = lessonId;
    }
    
    // ==============================================
    // UI & MODAL METHODS
    // ==============================================
    
    showResultsModal(results) {
        this.modalTitle.textContent = results.passed === false ? 'Challenge Failed' : 
                                     results.timeUp ? "Time's Up!" : 
                                     results.completed === false ? 'Test Completed' : 'Congratulations!';
        
        this.modalIcon.innerHTML = results.passed === false ? '<i class="fas fa-times-circle"></i>' :
                                  results.timeUp ? '<i class="fas fa-clock"></i>' :
                                  results.leveledUp ? '<i class="fas fa-trophy"></i>' :
                                  '<i class="fas fa-check-circle"></i>';
        
        this.resultMessage.textContent = this.generateResultMessage(results);
        this.resultWPM.textContent = results.wpm;
        this.resultAccuracy.textContent = `${results.accuracy}%`;
        this.resultTime.textContent = `${results.time.toFixed(1)}s`;
        this.resultXP.textContent = `+${results.xpEarned}`;
        
        if (results.newAchievements && results.newAchievements.length > 0) {
            const achievementHTML = results.newAchievements.map(achId => {
                const achDef = this.gamification.getAllAchievementDefinitions().find(a => a.id === achId);
                return achDef ? `<div class="achievement-notification">
                    <i class="fas ${achDef.icon}"></i>
                    <span><strong>${achDef.name}</strong> unlocked!</span>
                </div>` : '';
            }).join('');
            
            document.getElementById('achievement-unlocked').innerHTML = achievementHTML;
        } else {
            document.getElementById('achievement-unlocked').innerHTML = '';
        }
        
        this.resultModal.style.display = 'flex';
    }
    
    generateResultMessage(results) {
        if (results.mode === 'challenge') {
            if (results.passed) {
                return `You passed the daily challenge! ${results.wpm} WPM meets the ${results.targetWPM} WPM target.`;
            } else {
                return `Challenge not passed. You needed ${results.targetWPM} WPM and ${results.targetAccuracy}% accuracy.`;
            }
        }
        
        if (results.timeUp) {
            return "Time's up! Try to type faster next time.";
        }
        
        if (results.wpm >= 100) {
            return "Incredible speed! You're typing at professional levels.";
        } else if (results.wpm >= 70) {
            return "Great job! You're faster than most people.";
        } else if (results.wpm >= 50) {
            return "Good speed! Keep practicing to improve further.";
        } else {
            return "Keep practicing! Regular practice will improve your speed.";
        }
    }
    
    hideModal() {
        this.resultModal.style.display = 'none';
    }
    
    showCheatingWarning() {
        this.antiCheatWarning.style.backgroundColor = '#dc2626';
        this.antiCheatWarning.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Suspicious activity detected!';
        
        this.playErrorSound();
        
        if (this.settings.hapticFeedback && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    }
    
    showCheatingResult(result) {
        this.modalTitle.textContent = "Invalid Result";
        this.modalIcon.innerHTML = '<i class="fas fa-ban"></i>';
        this.resultMessage.textContent = `Result invalidated: ${result.reason}. Please type manually without copying.`;
        this.resultWPM.textContent = '0';
        this.resultAccuracy.textContent = '0%';
        this.resultTime.textContent = '0s';
        this.resultXP.textContent = '+0';
        
        document.getElementById('achievement-unlocked').innerHTML = '';
        
        this.resultModal.style.display = 'flex';
    }
    
    showCustomTextModal() {
        document.getElementById('custom-text-input').value = '';
        document.getElementById('custom-text-title').value = '';
        this.customTextModal.style.display = 'flex';
    }
    
    useCustomText(text, title) {
        this.normalCurrentSentence = text;
        this.sentenceText.innerHTML = text;
        this.normalCurrentIndex = 0;
        
        this.sentenceLength.textContent = `${text.length} chars`;
        this.difficultyBadge.textContent = 'Custom';
        this.difficultyBadge.setAttribute('data-difficulty', 'custom');
        this.textSource.textContent = `${title} • Custom text`;
        
        window.currentText = text;
        
        this.highlightCurrentCharacter();
    }
    
    showSettings() {
        document.getElementById('theme-select').value = this.settings.theme;
        document.getElementById('font-select').value = this.settings.font;
        document.getElementById('cursor-select').value = this.settings.cursorStyle;
        document.getElementById('volume-slider').value = this.settings.volume;
        document.getElementById('haptic-feedback').checked = this.settings.hapticFeedback;
        document.getElementById('sound-toggle-checkbox').checked = this.settings.soundEnabled;
        document.getElementById('auto-restart').checked = this.settings.autoRestart;
        document.getElementById('pause-on-blur').checked = this.settings.pauseOnBlur;
        document.getElementById('anti-cheat-toggle').checked = this.settings.antiCheatEnabled;
        document.getElementById('default-duration').value = this.settings.defaultDuration;
        document.getElementById('high-contrast').checked = this.settings.highContrast;
        document.getElementById('reduce-motion').checked = this.settings.reduceMotion;
        document.getElementById('keyboard-navigation').checked = this.settings.keyboardNavigation;
        
        this.settingsModal.style.display = 'flex';
    }
    
    saveSettings() {
        this.settings.theme = document.getElementById('theme-select').value;
        this.settings.font = document.getElementById('font-select').value;
        this.settings.cursorStyle = document.getElementById('cursor-select').value;
        this.settings.volume = parseInt(document.getElementById('volume-slider').value);
        this.settings.hapticFeedback = document.getElementById('haptic-feedback').checked;
        this.settings.soundEnabled = document.getElementById('sound-toggle-checkbox').checked;
        this.settings.autoRestart = document.getElementById('auto-restart').checked;
        this.settings.pauseOnBlur = document.getElementById('pause-on-blur').checked;
        this.settings.antiCheatEnabled = document.getElementById('anti-cheat-toggle').checked;
        this.settings.defaultDuration = parseInt(document.getElementById('default-duration').value);
        this.settings.highContrast = document.getElementById('high-contrast').checked;
        this.settings.reduceMotion = document.getElementById('reduce-motion').checked;
        this.settings.keyboardNavigation = document.getElementById('keyboard-navigation').checked;
        
        Object.entries(this.settings).forEach(([key, value]) => {
            localStorage.setItem(key, value.toString());
        });
        
        this.applySettings();
        this.settingsModal.style.display = 'none';
        alert('Settings saved successfully!');
    }
    
    resetSettings() {
        if (confirm('Reset all settings to default values?')) {
            Object.keys(this.settings).forEach(key => {
                localStorage.removeItem(key);
            });
            
            location.reload();
        }
    }
    
    // ==============================================
    // UTILITY METHODS
    // ==============================================
    
    toggleTheme() {
        const isDark = document.body.classList.contains('dark-mode');
        document.body.classList.toggle('dark-mode', !isDark);
        document.body.classList.toggle('light-mode', isDark);
        
        const labels = document.querySelectorAll('.theme-label');
        labels[0].textContent = isDark ? 'Dark' : 'Light';
        labels[1].textContent = isDark ? 'Light' : 'Dark';
    }
    
    resetApp() {
        switch (this.currentMode) {
            case 'normal':
                this.resetNormalMode();
                break;
            case 'timer':
                this.resetTimerMode();
                break;
            case 'challenge':
                this.resetChallengeMode();
                break;
        }
    }
    
    resetNormalMode() {
        this.normalGameState = GameState.IDLE;
        clearInterval(this.normalInterval);
        
        this.typingInput.disabled = true;
        this.typingInput.value = '';
        this.startBtn.disabled = false;
        this.endBtn.disabled = true;
        this.pauseBtn.disabled = true;
        this.newTextBtn.disabled = false;
        this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
        
        this.loadRandomSentence('normal');
        
        this.charCount.textContent = '0';
        this.errorCount.textContent = '0';
        this.accuracy.textContent = '100%';
        this.timeElapsed.textContent = '0.0s';
        this.realtimeWPM.textContent = '0';
        
        this.antiCheatWarning.style.display = 'none';
    }
    
    resetTimerMode() {
        this.timerGameState = GameState.IDLE;
        clearInterval(this.timerInterval);
        
        this.timerTypingInput.disabled = true;
        this.timerTypingInput.value = '';
        this.timerStartBtn.disabled = false;
        this.timerEndBtn.disabled = true;
        this.timerPauseBtn.disabled = true;
        this.timerPauseBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
        
        this.timerRemaining = this.timerDuration;
        this.updateTimerText();
        this.updateTimerParagraph();
        
        this.timerWordCount.textContent = '0';
        this.timerErrorCount.textContent = '0';
        this.timerWPM.textContent = '0';
        this.timerAccuracy.textContent = '100%';
        this.timerProgress.textContent = '0%';
        this.timerRealtimeWPM.textContent = '0';
    }
    
    resetChallengeMode() {
        this.challengeGameState = GameState.IDLE;
        clearInterval(this.challengeInterval);
        
        this.challengeTypingInput.disabled = true;
        this.challengeTypingInput.value = '';
        this.challengeStartBtn.disabled = false;
        this.challengeEndBtn.disabled = true;
        
        this.loadDailyChallenge();
        
        this.challengeWPM.textContent = '0';
        this.challengeAccuracy.textContent = '100%';
        this.challengeTime.textContent = '0.0s';
    }
    
    playKeySound() {
        if (!this.settings.soundEnabled) return;
        
        this.keySound.currentTime = 0;
        this.keySound.play().catch(() => {});
        
        if (this.settings.hapticFeedback && navigator.vibrate) {
            navigator.vibrate(5);
        }
    }
    
    playErrorSound() {
        if (!this.settings.soundEnabled) return;
        
        this.errorSound.currentTime = 0;
        this.errorSound.play().catch(() => {});
    }
    
    playCompleteSound() {
        if (!this.settings.soundEnabled) return;
        
        this.completeSound.currentTime = 0;
        this.completeSound.play().catch(() => {});
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            this.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen();
            this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    }
    
    saveToHistory(testData) {
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        history.push(testData);
        
        if (history.length > 100) {
            history.shift();
        }
        
        localStorage.setItem('typingHistory', JSON.stringify(history));
    }
    
    shareResults() {
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        const latestTest = history[history.length - 1];
        
        if (!latestTest) {
            alert('No test results to share!');
            return;
        }
        
        const text = `I just scored ${latestTest.wpm} WPM with ${latestTest.accuracy}% accuracy on TypeMaster Pro!`;
        const url = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Typing Test Result',
                text: text,
                url: url
            }).catch(() => {
                this.copyToClipboard(`${text} ${url}`);
            });
        } else {
            this.copyToClipboard(`${text} ${url}`);
        }
    }
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Result copied to clipboard!');
        }).catch(() => {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Result copied to clipboard!');
        });
    }
    
    exportData(format) {
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        const userData = {
            userLevel: this.gamification.userLevel,
            userXP: this.gamification.userXP,
            userStreak: this.gamification.userStreak,
            achievements: this.gamification.achievements,
            typingHistory: history,
            settings: this.settings
        };
        
        let data, filename, mimeType;
        
        if (format === 'csv') {
            const headers = ['Date', 'Mode', 'WPM', 'Accuracy', 'Errors', 'Duration', 'Difficulty'];
            const rows = history.map(test => [
                new Date(test.timestamp).toLocaleDateString(),
                test.mode,
                test.wpm,
                test.accuracy,
                test.errors,
                test.duration,
                test.difficulty || 'N/A'
            ]);
            
            data = [headers, ...rows].map(row => row.join(',')).join('\n');
            filename = 'typing-data.csv';
            mimeType = 'text/csv';
        } else {
            data = JSON.stringify(userData, null, 2);
            filename = 'typing-data.json';
            mimeType = 'application/json';
        }
        
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    startGhostRace() {
        const ghostType = document.getElementById('ghost-select').value;
        alert(`Starting ghost race against your ${ghostType.replace('-', ' ')}! This feature would show a visual comparison of your typing in real-time.`);
    }
    
    createChallenge() {
        alert('Challenge feature: This would generate a shareable link for friends to compete against your score.');
    }
    
    showLeaderboard() {
        alert('Leaderboard feature: This would show global rankings based on WPM, accuracy, and XP.');
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.typingGame = new TypingTestGame();
});