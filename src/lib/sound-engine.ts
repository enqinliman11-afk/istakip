export class SoundEngine {
    private audioContext: AudioContext | null = null;
    private gainNode: GainNode | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
                this.gainNode = this.audioContext.createGain();
                this.gainNode.connect(this.audioContext.destination);
                this.gainNode.gain.value = 0.5; // Master volume
            }
        }
    }

    private createOscillator(type: OscillatorType, frequency: number, duration: number, startTime: number = 0) {
        if (!this.audioContext || !this.gainNode) return;

        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        oscillator.connect(gain);
        gain.connect(this.gainNode);

        const now = this.audioContext.currentTime + startTime;

        // Attack
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(1, now + 0.05);

        // Decay
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    public playSuccess() {
        // "Ding" sound - Nice major chord arpeggio
        this.createOscillator('sine', 523.25, 0.4, 0);   // C5
        this.createOscillator('sine', 659.25, 0.4, 0.1); // E5
        this.createOscillator('sine', 783.99, 0.6, 0.2); // G5
        this.createOscillator('sine', 1046.50, 0.8, 0.3); // C6
    }

    public playError() {
        // "Buzz" sound - Low saw wave
        this.createOscillator('sawtooth', 150, 0.3, 0);
        this.createOscillator('sawtooth', 120, 0.3, 0.1);
    }

    public playNotification() {
        // "Pop" sound - Quick sine sweep
        if (!this.audioContext || !this.gainNode) return;
        const now = this.audioContext.currentTime;

        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);

        oscillator.connect(gain);
        gain.connect(this.gainNode);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(1, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }
}

export const soundEngine = new SoundEngine();
