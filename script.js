document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // ELEMENTOS
    // ============================================================

    const dropdownBtn = document.getElementById('dropdownBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const selectedDot = document.getElementById('selectedDot');
    const selectedText = document.getElementById('selectedText');

    const avatarWrapper = document.querySelector('.avatar-wrapper');
    const userPhoto = document.getElementById('userPhoto');

    const btnEntrar = document.querySelector('.submit');
    const btnCadastro = document.getElementById('btnCadastro');

    // Aceita os dois IDs
    const btnVoltar =
        document.getElementById('btnVoltar') ||
        document.querySelector('.button-voltar');

    // Aceita os dois IDs
    const btnSair =
        document.getElementById('btnSair') ||
        document.getElementById('btn-sair');

    const loadingOverlay =
        document.getElementById('loadingOverlay');

    const loginForm =
        document.getElementById('loginForm') ||
        document.getElementById('form-login');

    const cadastroForm =
        document.getElementById('cadastroForm');


    // ============================================================
    // MAPA DE STATUS
    // ============================================================

    const STATUS_MAP = {

        online: {
            c2: '#09ad3a',
            c3: '#96ff7c',
            brightness: '1.1'
        },

        busy: {
            c2: '#ff5e5e',
            c3: '#a70000',
            brightness: '0.9'
        },

        away: {
            c2: '#ffd166',
            c3: '#b37400',
            brightness: '0.8'
        },

        invisible: {
            c2: '#bbbbbb',
            c3: '#444444',
            brightness: '0.5'
        }

    };


    // ============================================================
    // SISTEMA DE ÁUDIO
    // ============================================================

    let audioCtx = null;


    function initAudio() {

        if (!audioCtx) {

            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;

            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }

        }

        if (
            audioCtx &&
            audioCtx.state === 'suspended'
        ) {

            audioCtx.resume();

        }

    }


    function playSound(type = 'normal') {

        initAudio();

        if (!audioCtx) return;

        const now = audioCtx.currentTime;

        const oscillator =
            audioCtx.createOscillator();

        const gain =
            audioCtx.createGain();


        const frequencies = {

            success: 1500,
            back: 700,
            normal: 1100

        };


        const frequency =
            frequencies[type] ||
            frequencies.normal;


        oscillator.type = 'sine';

        oscillator.frequency.setValueAtTime(
            frequency,
            now
        );


        oscillator.frequency.exponentialRampToValueAtTime(
            frequency * 0.7,
            now + 0.15
        );


        gain.gain.setValueAtTime(
            0.0001,
            now
        );


        gain.gain.exponentialRampToValueAtTime(
            0.12,
            now + 0.02
        );


        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 0.15
        );


        oscillator.connect(gain);

        gain.connect(
            audioCtx.destination
        );


        oscillator.start(now);

        oscillator.stop(
            now + 0.18
        );

    }


    // Primeira interação do usuário
    window.addEventListener(
        'click',
        initAudio,
        { once: true }
    );

    window.addEventListener(
        'keydown',
        initAudio,
        { once: true }
    );


    // ============================================================
    // STATUS DO USUÁRIO
    // ============================================================

    function setStatus(
        value,
        text,
        color
    ) {

        if (selectedText) {

            selectedText.textContent =
                text;

        }


        if (dropdownBtn) {

            dropdownBtn.style.color =
                color;

        }


        if (selectedDot) {

            selectedDot.className =
                `status-dot ${value}`;

        }


        const config =
            STATUS_MAP[value] ||
            STATUS_MAP.online;


        if (avatarWrapper) {

            avatarWrapper.style.setProperty(
                '--color1',
                color
            );

            avatarWrapper.style.setProperty(
                '--color2',
                config.c2
            );

            avatarWrapper.style.setProperty(
                '--color3',
                config.c3
            );

        }


        if (userPhoto) {

            userPhoto.style.filter =
                `brightness(${config.brightness})`;

        }

    }


    // Status inicial
    if (
        dropdownBtn ||
        dropdownMenu ||
        selectedDot ||
        selectedText
    ) {

        setStatus(
            'online',
            'Disponível',
            '#53cb03'
        );

    }


    // ============================================================
    // DROPDOWN DE STATUS
    // ============================================================

    if (
        dropdownBtn &&
        dropdownMenu
    ) {

        dropdownBtn.addEventListener(
            'click',
            (event) => {

                event.stopPropagation();

                const aberto =
                    dropdownMenu.classList.contains('show');

                dropdownMenu.classList.toggle(
                    'show',
                    !aberto
                );

                dropdownBtn.setAttribute(
                    'aria-expanded',
                    String(!aberto)
                );

            }
        );


        document.addEventListener(
            'click',
            () => {

                dropdownMenu.classList.remove(
                    'show'
                );

                dropdownBtn.setAttribute(
                    'aria-expanded',
                    'false'
                );

            }
        );


        const dropdownItems =
            document.querySelectorAll(
                '.dropdown-item'
            );


        dropdownItems.forEach(
            item => {

                item.addEventListener(
                    'click',
                    (event) => {

                        event.stopPropagation();


                        const value =
                            item.getAttribute(
                                'data-value'
                            );


                        const text =
                            item.getAttribute(
                                'data-text'
                            );


                        const color =
                            item.getAttribute(
                                'data-color'
                            );


                        setStatus(
                            value,
                            text,
                            color
                        );


                        dropdownMenu.classList.remove(
                            'show'
                        );


                        dropdownBtn.setAttribute(
                            'aria-expanded',
                            'false'
                        );

                    }
                );

            }
        );

    }


    // ============================================================
    // PARTÍCULAS DOS INPUTS
    // ============================================================

    const inputs =
        document.querySelectorAll(
            '.nebula-input .input'
        );


    inputs.forEach(
        input => {

            input.addEventListener(
                'focus',
                () => {

                    const particle =
                        input.parentElement.querySelector(
                            '.nebula-particle'
                        );


                    if (particle) {

                        const randomX =
                            (Math.random() - 0.5) * 2;


                        const randomY =
                            (Math.random() - 0.5) * 2;


                        particle.style.setProperty(
                            '--x',
                            randomX
                        );


                        particle.style.setProperty(
                            '--y',
                            randomY
                        );

                    }

                }
            );

        }
    );


    // ============================================================
    // LOGIN
    // ============================================================

    if (loginForm) {

        loginForm.addEventListener(
            'submit',
            (event) => {

                event.preventDefault();


                playSound('success');


                if (btnEntrar) {

                    btnEntrar.style.pointerEvents =
                        'none';

                }


                // Overlay
                if (loadingOverlay) {

                    loadingOverlay.classList.add(
                        'active'
                    );

                    loadingOverlay.style.display =
                        'flex';


                    requestAnimationFrame(
                        () => {

                            loadingOverlay.style.opacity =
                                '1';

                        }
                    );

                }


                // Animação de carregamento
                setTimeout(
                    () => {

                        if (!loadingOverlay) {

                            finalizarLogin();

                            return;

                        }


                        loadingOverlay.style.opacity =
                            '0';


                        setTimeout(
                            () => {

                                loadingOverlay.style.display =
                                    'none';


                                loadingOverlay.classList.remove(
                                    'active'
                                );


                                finalizarLogin();

                            },
                            400
                        );

                    },
                    2200
                );

            }
        );

    }


    function finalizarLogin() {

        if (avatarWrapper) {

            avatarWrapper.classList.add(
                'avatar-login-anim'
            );


            setTimeout(
                () => {

                    avatarWrapper.classList.remove(
                        'avatar-login-anim'
                    );


                    if (btnEntrar) {

                        btnEntrar.style.pointerEvents =
                            'auto';

                    }

                },
                800
            );

        } else {

            if (btnEntrar) {

                btnEntrar.style.pointerEvents =
                    'auto';

            }

        }

    }


    // ============================================================
    // BOTÃO CRIAR CONTA
    // ============================================================

    if (btnCadastro) {

        btnCadastro.addEventListener(
            'click',
            () => {

                playSound('normal');


                setTimeout(
                    () => {

                        window.location.href =
                            'cadastro.html';

                    },
                    200
                );

            }
        );

    }


    // ============================================================
    // BOTÃO VOLTAR
    // ============================================================

    if (btnVoltar) {

        btnVoltar.addEventListener(
            'click',
            () => {

                playSound('back');


                document.body.style.transition =
                    'opacity 0.2s linear';


                document.body.style.opacity =
                    '0';


                setTimeout(
                    () => {

                        window.location.href =
                            'index.html';

                    },
                    200
                );

            }
        );

    }


    // ============================================================
    // BOTÃO SAIR
    // ============================================================

    if (btnSair) {

        btnSair.addEventListener(
            'click',
            () => {

                playSound('back');


                document.body.style.transition =
                    'opacity 0.2s linear';


                document.body.style.opacity =
                    '0';


                setTimeout(
                    () => {

                        window.location.href =
                            'index.html';

                    },
                    200
                );

            }
        );

    }


    // ============================================================
    // CADASTRO
    // ============================================================

    if (cadastroForm) {

        cadastroForm.addEventListener(
            'submit',
            (event) => {

                event.preventDefault();


                playSound('success');


                const senha =
                    document.getElementById(
                        'password'
                    );


                const confirmarSenha =
                    document.getElementById(
                        'confirmarpassword'
                    );


                // Verifica se as senhas são iguais
                if (
                    senha &&
                    confirmarSenha &&
                    senha.value !== confirmarSenha.value
                ) {

                    alert(
                        'As senhas não são iguais.'
                    );

                    confirmarSenha.focus();

                    return;

                }


                const btnCadastrar =
                    document.getElementById(
                        'btnCadastrar'
                    );


                if (btnCadastrar) {

                    btnCadastrar.disabled =
                        true;

                    btnCadastrar.textContent =
                        'CADASTRANDO...';

                }


                // Pequena animação antes de continuar
                setTimeout(
                    () => {

                        if (btnCadastrar) {

                            btnCadastrar.disabled =
                                false;

                            btnCadastrar.textContent =
                                'CADASTRAR-SE';

                        }

                        /*
                         * Aqui você pode colocar futuramente
                         * o envio para seu banco ou planilha.
                         */

                    },
                    1200
                );

            }
        );

    }


    // ============================================================
    // MÁSCARA DE CPF
    // ============================================================

    const cpf =
        document.getElementById('cpf');


    if (cpf) {

        cpf.addEventListener(
            'input',
            () => {

                let value =
                    cpf.value.replace(
                        /\D/g,
                        ''
                    );


                value =
                    value.substring(
                        0,
                        11
                    );


                value =
                    value.replace(
                        /(\d{3})(\d)/,
                        '$1.$2'
                    );


                value =
                    value.replace(
                        /(\d{3})(\d)/,
                        '$1.$2'
                    );


                value =
                    value.replace(
                        /(\d{3})(\d{1,2})$/,
                        '$1-$2'
                    );


                cpf.value =
                    value;

            }
        );

    }


    // ============================================================
    // MÁSCARA DE TELEFONE
    // ============================================================

    const telefone =
        document.getElementById('tell');


    if (telefone) {

        telefone.addEventListener(
            'input',
            () => {

                let value =
                    telefone.value.replace(
                        /\D/g,
                        ''
                    );


                value =
                    value.substring(
                        0,
                        11
                    );


                if (value.length <= 10) {

                    value =
                        value.replace(
                            /^(\d{2})(\d)/,
                            '($1) $2'
                        );


                    value =
                        value.replace(
                            /(\d{4})(\d)/,
                            '$1-$2'
                        );

                } else {

                    value =
                        value.replace(
                            /^(\d{2})(\d)/,
                            '($1) $2'
                        );


                    value =
                        value.replace(
                            /(\d{5})(\d)/,
                            '$1-$2'
                        );

                }


                telefone.value =
                    value;

            }
        );

    }

});


// ================================================================
// PWA
// ================================================================

let deferredPrompt = null;


// Captura instalação
window.addEventListener(
    'beforeinstallprompt',
    (event) => {

        event.preventDefault();

        deferredPrompt = event;

        console.log(
            'PWA pronto para ser instalado!'
        );

    }
);


// ================================================================
// SERVICE WORKER
// ================================================================

if (
    'serviceWorker' in navigator
) {

    window.addEventListener(
        'load',
        () => {

            navigator.serviceWorker
                .register('./sw.js')

                .then(
                    registration => {

                        console.log(
                            'Service Worker registrado com sucesso!',
                            registration
                        );

                    }
                )

                .catch(
                    error => {

                        console.error(
                            'Erro ao registrar Service Worker:',
                            error
                        );

                    }
                );

        }
    );

}