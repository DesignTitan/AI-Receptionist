/** Mobile audio is unlocked synchronously by the Start button, before network work. */
export class VoiceAudio {
  private context: AudioContext;
  private stream: MediaStream | null = null;
  private node: AudioWorkletNode | null = null;
  private playing = new Set<AudioBufferSourceNode>();
  private playhead = 0;
  private stopped = false;
  readonly ready: Promise<void>;
  lastInputAt = 0;

  /** `deviceId` picks a specific microphone; omitted, the browser's default input is used. */
  constructor(deviceId?: string) {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia)
      throw new Error("Microphone access requires HTTPS. Open this page using its secure website address.");
    this.context = new AudioContext({ sampleRate: 16000 });
    const resume = this.context.resume(); // Must happen inside the user's tap.
    const microphone = navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true, ...(deviceId ? { deviceId: { exact: deviceId } } : {}) } });
    this.ready = Promise.all([resume, microphone.then(stream => {
      if (this.stopped) stream.getTracks().forEach(track => track.stop());
      else this.stream = stream;
    })]).then(() => { if (this.stopped) throw new Error("Conversation cancelled."); });
    // Permission can remain pending after cancellation. Never leave an unhandled rejection.
    void this.ready.catch(() => this.stop());
  }
  async start(onChunk: (pcm: string) => void) {
    await this.ready;
    const source = `class Capture extends AudioWorkletProcessor {
      constructor(){super();this.samples=[];this.phase=0;}
      process(inputs){const input=inputs[0]?.[0];if(input)for(const value of input){
        this.phase+=16000;if(this.phase>=sampleRate){this.phase-=sampleRate;this.samples.push(value);}
        if(this.samples.length===2048){this.port.postMessage(new Float32Array(this.samples));this.samples=[];}
      }return true;}
    }registerProcessor('bubs-capture',Capture);`;
    const url = URL.createObjectURL(new Blob([source], { type: "application/javascript" }));
    try { await this.context.audioWorklet.addModule(url); } finally { URL.revokeObjectURL(url); }
    if (this.stopped || !this.stream) throw new Error("Conversation cancelled.");
    this.node = new AudioWorkletNode(this.context, "bubs-capture");
    this.node.port.onmessage = (event: MessageEvent<Float32Array>) => {
      if (this.stopped) return;
      const rms = Math.sqrt(event.data.reduce((sum, value) => sum + value * value, 0) / event.data.length);
      if (rms > 0.008) this.lastInputAt = Date.now();
      const bytes = new Uint8Array(event.data.length * 2), view = new DataView(bytes.buffer);
      event.data.forEach((value, i) => { const sample = Math.max(-1, Math.min(1, value)); view.setInt16(i * 2, sample * (sample < 0 ? 32768 : 32767), true); });
      onChunk(btoa(String.fromCharCode(...bytes)));
    };
    this.context.createMediaStreamSource(this.stream).connect(this.node);
    // Silent output keeps the worklet scheduled on mobile without microphone feedback.
    const silent = this.context.createGain(); silent.gain.value = 0;
    this.node.connect(silent).connect(this.context.destination);
  }
  enqueue(pcm: string) {
    if (this.stopped) return;
    const bytes = Uint8Array.from(atob(pcm), char => char.charCodeAt(0));
    if (!bytes.length) return;
    const samples = new Float32Array(Math.floor(bytes.length / 2)), view = new DataView(bytes.buffer);
    for (let i = 0; i < samples.length; i++) samples[i] = view.getInt16(i * 2, true) / 32768;
    const buffer = this.context.createBuffer(1, samples.length, 16000); buffer.copyToChannel(samples, 0);
    const source = this.context.createBufferSource(); source.buffer = buffer; source.connect(this.context.destination);
    const at = Math.max(this.context.currentTime, this.playhead); source.start(at); this.playhead = at + buffer.duration;
    this.playing.add(source); source.onended = () => { this.playing.delete(source); source.disconnect(); };
  }
  clear() { for (const source of this.playing) { try { source.stop(); } catch {} } this.playing.clear(); this.playhead = 0; }
  setMuted(muted: boolean) { this.stream?.getAudioTracks().forEach(track => { track.enabled = !muted; }); }
  stop() {
    this.stopped = true; this.clear(); this.node?.disconnect(); this.node = null;
    this.stream?.getTracks().forEach(track => track.stop()); this.stream = null;
    if (this.context.state !== "closed") void this.context.close().catch(() => {});
  }
}
