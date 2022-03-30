class App {
    constructor(document, boardEl, keyboardEl, modelEl, toastEl, answers) {
        this.document = document;
        this.boardEl = boardEl;
        this.keyboardEl = keyboardEl;
        this.modelEl = modelEl;
        this.toastEl = toastEl;
        this.answers = answers;
        this.answerEntries = this.answers.entries();
        this.keyboardButtons= {};
        this.keyboardEl.querySelectorAll('button').forEach(buttonEl => {
            this.keyboardButtons[buttonEl.textContent.toLowerCase()] = buttonEl;
        });
        this.bind();
    }

    start() {
        console.log('starting game!');
        this.guessAttempt = 0;
        this.char = 0;
        let nextAnswer = this.answerEntries.next();
        if (nextAnswer.done) {
            this.answerIterator = this.answers.entries();
            nextAnswer = this.answerEntries.next();
        }
        this.answer = nextAnswer.value[1];
        this.gameStopped = false;
        
    }

    bind() {
        this.document.querySelectorAll('.close-modal').forEach(el => el.addEventListener('click', this.hideModal.bind(this)));
        this.document.querySelectorAll('.open-modal').forEach(el => el.addEventListener('click', this.openModal.bind(this)));
        this.document.addEventListener('keydown', this.onKeydown.bind(this));
        this.keyboardEl.querySelectorAll('button').forEach(el => { el.addEventListener('click', this.onKeyboardPress.bind(this)) });
    }

    hideModal() {
        console.log('App.hideModal: Closing modal');
        this.modelEl.style.display = 'none';
    }

    openModal() {
        console.log('App.openModal: Opening modal');
        this.modelEl.style.display = 'inherit';
    }

    isModalOpen() {
        return (this.modelEl.style.display != 'none');
    }

    isValidLetter(letter) {
        const regex = new RegExp(/^[a-zA-Z]{1}$/);
        return regex.test(letter)
    }

    guessTds() {
        return this.boardEl.querySelectorAll('tr')[this.guessAttempt].querySelectorAll('td');
    }

    guessAttempts() {
        return this.boardEl.querySelectorAll('tr').length;
    }

    onKeyboardPress(e) {
        this.onKeydown({key: e.target.textContent.toLowerCase()});
    }
    onKeydown(e) {
        if (this.isModalOpen() || this.gameStopped) {
            return;
        }

        let tds = this.guessTds();

        if (this.isValidLetter(e.key) && this.char < tds.length) {
            tds[this.char].innerHTML = e.key;
            this.char += 1;
        } else if (e.key.toLowerCase() == 'backspace' && this.char > 0) {
            tds[this.char - 1].innerHTML = '';
            this.char -= 1;
        } else if (e.key.toLowerCase() == 'enter') {
            this.checkGuess();
        }
    }

    toast(message, duration) {
        this.toastEl.textContent = message;
        this.toastEl.style.display = 'inherit';
        clearTimeout(this.toastTimeoutId);
        this.toastTimeoutId = setTimeout(() => { this.toastEl.style.display = 'none'; }, duration);
    }


    checkGuess() {
        console.log('checking guess!');
        // if the game is stopped don't check guesses
        if (this.gameStopped) {
            return;
        }

        // Get the word guessed
        let tds = this.guessTds();
        let guess = '';
        tds.forEach(td => {
            guess += td.textContent;
        });

        // Check all cells filled out for the guess, else show toast message
        if (guess.length < tds.length) {
            this.toast('Not enough letters', 1500);
            return;
        }

        // Animate guess
        let i = 0;
        const intv = setInterval(() => {
            if (i >= tds.length) {
                clearInterval(intv);
                return;
            }
            
            if (guess[i] == this.answer[i]) {
                tds[i].className = 'correct';
                this.keyboardButtons[guess[i]].className = 'correct';
            } else if (this.answer.indexOf(guess[i]) != -1) {
                tds[i].className = 'present';
                this.keyboardButtons[guess[i]].className = 'present';
            } else {
                tds[i].className = 'incorrect';
                this.keyboardButtons[guess[i]].className = 'incorrect';
            }
            i +=1
        }, 100);

        //  Move pointers to next guess row
        this.guessAttempt += 1;
        this.char = 0;

        const noMoreGuesses = (this.guessAttempts() == this.guessAttempt);
        if (noMoreGuesses || guess == this.answer) {
            this.end();
        }
    }

    clearBoard() {
        console.log('clearBoard');
        this.boardEl.querySelectorAll('td').forEach(td => {
            td.innerHTML = '';
            td.className = '';
        });
        this.keyboardEl.querySelectorAll('button').forEach(button => {
            button.className = '';
        });
    }

    end() {
        this.gameStopped = true;
        const el = this.document.createElement('section');
        el.className = 'next-game-modal';
        el.innerHTML = `
            <h2>Sedle!</h2>
            <p>The word was: <span class="answer">${this.answer}</span></p>
            <button>Next <span class="sedler">Sedler</span>?</button>`;
        this.document.body.appendChild(el);
        el.querySelector('button').addEventListener('click', ()=>{
            this.document.body.removeChild(el);
            this.clearBoard();
            this.start();
        });
    }
}

(function(w) {
    let boardEl = w.document.querySelector('#game .board');
    let keyboardEl = w.document.querySelector('#game #keyboard');
    let modelEl = w.document.querySelector('.help-modal');
    let toastEl = w.document.querySelector('.toast');
    let answers = [
        'slave',
        'egypt',
        'first',
        'matza',
        'bread',
        'motzi',
        'maror',
        'herbs',
        'feast',
        'drink',
        'child',
        'akiva',
        'death',
        'river',
        'angel',
        'beast',
        'frogs',
        'boils',
        'moses',
        'snake',
        'freed',
        'idols',
        'forty',
        'drown',
        'sedar',
        'magid',
        'orech',
    ]
    app = new App(w.document, boardEl, keyboardEl, modelEl, toastEl, answers);
    app.start();

})(window);