const horas = document.getElementById("horas");
const minutos = document.getElementById("minutos");
const segundos = document.getElementById("segundos");
const tempo = document.getElementById("tempo");
const btnIniciar = document.getElementById("btnIniciar");
const btnPausar = document.getElementById("btnPausar");
const btnZerar = document.getElementById("btnZerar");
const modoCronometro = document.getElementById("modoCronometro");
const modoContagem = document.getElementById("modoContagem");
const tituloModo = document.getElementById("tituloModo");

let intervalo = null;
let tempoRestante = 120;
let modoAtual = "contagem";

function pegarTempo() {
    const h = Number(horas.value) || 0;
    const m = Number(minutos.value) || 0;
    const s = Number(segundos.value) || 0;
    return (h * 3600) + (m * 60) + s;
}

function formatarTempo(totalSegundos) {
    const h = Math.floor(totalSegundos / 3600);
    const m = Math.floor((totalSegundos % 3600) / 60);
    const s = totalSegundos % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function atualizarTela() {
    tempo.textContent = formatarTempo(Math.max(tempoRestante, 0));
}

function limparIntervalo() {
    if (intervalo !== null) {
        clearInterval(intervalo);
        intervalo = null;
    }
}

function tocarAlarme() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (navigator.vibrate) {
        navigator.vibrate([180, 120, 180, 120, 180]);
    }

    if (!AudioContextClass) {
        return;
    }

    const audioContext = new AudioContextClass();
    const notas = [220, 180, 140];

    audioContext.resume();

    notas.forEach(function (frequencia, indice) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const inicio = audioContext.currentTime + (indice * 0.22);

        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(frequencia, inicio);

        gainNode.gain.setValueAtTime(0.0001, inicio);
        gainNode.gain.linearRampToValueAtTime(0.22, inicio + 0.03);
        gainNode.gain.linearRampToValueAtTime(0.0001, inicio + 0.18);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(inicio);
        oscillator.stop(inicio + 0.18);
    });

    setTimeout(() => {
        audioContext.close();
    }, 900);
}

function aplicarModo(novoModo) {
    modoAtual = novoModo;
    limparIntervalo();

    const emContagem = novoModo === "contagem";
    modoContagem.classList.toggle("active", emContagem);
    modoCronometro.classList.toggle("active", !emContagem);
    tituloModo.textContent = emContagem ? "⌛ Regresso" : "⏱ Cronômetro";

    if (emContagem) {
        tempoRestante = pegarTempo() || 0;
    } else {
        tempoRestante = 0;
    }

    atualizarTela();
}

btnIniciar.addEventListener("click", function () {
    if (intervalo !== null) return;

    if (modoAtual === "contagem") {
        tempoRestante = pegarTempo() || 0;

        if (tempoRestante <= 0) return;

        intervalo = setInterval(function () {
            tempoRestante -= 1;
            atualizarTela();

            if (tempoRestante <= 0) {
                tempoRestante = 0;
                atualizarTela();
                limparIntervalo();
                tocarAlarme();
                alert("⏰ Tempo encerrado!");
            }
        }, 1000);
        return;
    }

    intervalo = setInterval(function () {
        tempoRestante += 1;
        atualizarTela();
    }, 1000);
});

btnPausar.addEventListener("click", function () {
    limparIntervalo();
});

btnZerar.addEventListener("click", function () {
    limparIntervalo();

    if (modoAtual === "contagem") {
        horas.value = 0;
        minutos.value = 2;
        segundos.value = 0;
        tempoRestante = 120;
    } else {
        horas.value = 0;
        minutos.value = 0;
        segundos.value = 0;
        tempoRestante = 0;
    }

    atualizarTela();
});

const camposTempo = [horas, minutos, segundos];
camposTempo.forEach(function (input) {
    input.addEventListener("change", function () {
        if (intervalo !== null) return;

        if (modoAtual === "contagem") {
            tempoRestante = pegarTempo() || 0;
        } else {
            tempoRestante = 0;
        }

        atualizarTela();
    });
});

modoCronometro.addEventListener("click", function () {
    aplicarModo("cronometro");
});

modoContagem.addEventListener("click", function () {
    aplicarModo("contagem");
});

horas.value = 0;
minutos.value = 2;
segundos.value = 0;
aplicarModo("contagem");
