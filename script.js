document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SELEÇÃO DE ELEMENTOS ---
    const dropdownBtn = document.getElementById('dropdownBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const selectedDot = document.getElementById('selectedDot');
    const selectedText = document.getElementById('selectedText');
    const avatarWrapper = document.querySelector('.avatar-wrapper');
    const userPhoto = document.getElementById('userPhoto');
    const btnEntrar = document.querySelector('.submit');
    const btnCadastro = document.getElementById('btnCadastro');
    const btnVoltar = document.getElementById('btnVoltar');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Mapeamento de temas/cores por status
    const STATUS_MAP = {
        online: { c2: '#09ad3a', c3: '#96ff7c', brightness: '1.1' },
        busy: { c2: '#ff5e5e', c3: '#a70000', brightness: '0.9' },
        away: { c2: '#ffd166', c3: '#b37400', brightness: '0.8' },
        invisible: { c2: '#bbbbbb', c3: '#444444', brightness: '0.5' }
    };

    // --- 2. SISTEMA DE SOM SINTETIZADO (WEB AUDIO API) ---
    let audioCtx;

    function initAudio() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playSound(type = "normal") {
        initAudio();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        const freqs = {
            success: 1500,
            back: 700,
            normal: 1100
        };
        const freq = freqs[type] || freqs.normal;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.15);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
    }

    // Inicializa o áudio na primeira interação do usuário
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });

    // --- 3. APLICAR STATUS NO AVATAR ---
    function setStatus(value, text, color) {
        if (selectedText) selectedText.textContent = text;
        if (dropdownBtn) dropdownBtn.style.color = color;
        if (selectedDot) selectedDot.className = `status-dot ${value}`;

        const config = STATUS_MAP[value] || STATUS_MAP.online;

        if (avatarWrapper) {
            avatarWrapper.style.setProperty('--color1', color);
            avatarWrapper.style.setProperty('--color2', config.c2);
            avatarWrapper.style.setProperty('--color3', config.c3);
        }

        if (userPhoto) {
            userPhoto.style.filter = `brightness(${config.brightness})`;
        }
    }

    // Define o status padrão (Online)
    setStatus('online', 'Disponível', '#53cb03');

    // --- 4. DROPDOWN DE STATUS CUSTOMIZADO ---
    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });

        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                const value = item.getAttribute('data-value');
                const text = item.getAttribute('data-text');
                const color = item.getAttribute('data-color');

                setStatus(value, text, color);
                dropdownMenu.classList.remove('show');
            });
        });
    }

    // --- 5. FLUXO DE LOGIN (BOTÃO ENTRAR) ---
    btnEntrar?.addEventListener('click', (e) => {
        e.preventDefault();
        playSound('success');

        // Previne múltiplos disparos
        btnEntrar.style.pointerEvents = 'none';

        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
            loadingOverlay.style.display = 'flex';
            requestAnimationFrame(() => {
                loadingOverlay.style.opacity = '1';
            });
        }

        setTimeout(() => {
            if (loadingOverlay) {
                loadingOverlay.style.opacity = '0';
                
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                    loadingOverlay.classList.remove('active');

                    if (avatarWrapper) {
                        avatarWrapper.classList.add('avatar-login-anim');
                        setTimeout(() => {
                            avatarWrapper.classList.remove('avatar-login-anim');
                            btnEntrar.style.pointerEvents = 'auto'; // Reativa o botão
                        }, 800);
                    } else {
                        btnEntrar.style.pointerEvents = 'auto';
                    }
                }, 400);
            }
        }, 2200);
    });

    // --- 6. NAVEGAÇÃO DOS OUTROS BOTÕES ---
    btnCadastro?.addEventListener('click', () => {
        playSound('normal');
        setTimeout(() => {
            window.location.href = 'cadastro.html';
        }, 200);
    });

    btnVoltar?.addEventListener('click', () => {
        playSound('back');
        document.body.style.transition = 'opacity 0.2s linear';
        document.body.style.opacity = '0';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 200);
    });
});

// --- 7. CONFIGURAÇÃO PWA & SERVICE WORKER ---
let deferredPrompt;

// Captura a intenção de instalação do PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('PWA pronto para ser instalado!');
});

// Registro do Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registrado com sucesso!', reg))
            .catch(err => console.error('Erro ao registrar Service Worker:', err));
    });
}