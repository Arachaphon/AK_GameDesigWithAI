/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  Play, 
  Settings, 
  Volume2, 
  VolumeX, 
  Keyboard, 
  Sparkles, 
  RotateCcw, 
  Info, 
  X, 
  Gamepad2, 
  Music, 
  Pause, 
  HelpCircle, 
  Heart, 
  Trophy, 
  Zap, 
  Check, 
  Sliders,
  ChevronRight,
  User,
  Activity,
  Award
} from 'lucide-react';

// --- SOUND SYNTHESIZER ---
// Generates real-time retro game audio via Web Audio API (no assets needed, very stable)
class GameSoundSynth {
  ctx: AudioContext | null = null;
  volume: number = 0.4;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(v: number) {
    this.volume = v;
  }

  playMove() {
    this.init();
    if (!this.ctx || this.volume === 0) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(this.volume * 0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.11);
  }

  playPunch() {
    this.init();
    if (!this.ctx || this.volume === 0) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(this.volume * 0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  playShockwave() {
    this.init();
    if (!this.ctx || this.volume === 0) return;
    // Boom sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(this.volume * 0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.52);

    // Dynamic pitch sweep synth
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.4);

    gain2.gain.setValueAtTime(this.volume * 0.12, this.ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

    osc2.start();
    osc2.stop(this.ctx.currentTime + 0.46);
  }

  playShatter() {
    this.init();
    if (!this.ctx || this.volume === 0) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1500, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.13);
  }

  playDance() {
    this.init();
    if (!this.ctx || this.volume === 0) return;
    // Happy chord blip
    const freqs = [523.25, 659.25, 783.99, 987.77]; // Cmaj7 notes
    freqs.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.05);
      gain.gain.setValueAtTime(this.volume * 0.08, this.ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.05 + 0.15);
      osc.start(this.ctx.currentTime + i * 0.05);
      osc.stop(this.ctx.currentTime + i * 0.05 + 0.16);
    });
  }
}

// Background melody sequencer (120 BPM Cyberpunk bassline)
class CyberMusicSynth {
  ctx: AudioContext | null = null;
  volume: number = 0.18;
  enabled: boolean = false;
  timerId: any = null;
  step: number = 0;

  melody = [110, 110, 130, 110, 146.83, 110, 165, 130]; // Cyber retro arpeggio
  drums = [1, 0, 0, 0, 1, 0, 0, 0];

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  start(volume: number) {
    this.volume = volume;
    this.enabled = true;
    this.init();
    if (this.timerId) return;

    const tick = () => {
      if (!this.enabled || !this.ctx || this.volume === 0) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const time = this.ctx.currentTime;
      
      // Cyber Bass Note
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sawtooth';
      
      const currentFreq = this.melody[this.step % this.melody.length];
      osc.frequency.setValueAtTime(currentFreq, time);
      gain.gain.setValueAtTime(this.volume * 0.06, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
      
      osc.start(time);
      osc.stop(time + 0.24);

      // Cyber Beat kick trigger on index
      if (this.step % 2 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.connect(kickGain);
        kickGain.connect(this.ctx.destination);
        kickOsc.type = 'triangle';
        kickOsc.frequency.setValueAtTime(130, time);
        kickOsc.frequency.exponentialRampToValueAtTime(30, time + 0.12);
        kickGain.gain.setValueAtTime(this.volume * 0.14, time);
        kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.13);
        kickOsc.start(time);
        kickOsc.stop(time + 0.14);
      }

      this.step++;
      this.timerId = setTimeout(tick, 250); // 120 BPM
    };

    tick();
  }

  stop() {
    this.enabled = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  setVolume(v: number) {
    this.volume = v;
  }
}

const sfx = new GameSoundSynth();
const bgm = new CyberMusicSynth();

const endingDialogue = [
  {
    speaker: "CYBER PROTOCOL OPERATOR (NPC)",
    avatar: "npc",
    text: "🌟 High-altitude cyber telemetry stabilizes! You did it, Cadet! The dangerous anomaly core has been successfully purged!",
    speakerColor: "text-cyan-400 font-bold",
    row: 0
  },
  {
    speaker: "YOU (HERO)",
    avatar: "player",
    text: "👊 It was a critical battle, operator. The anomaly was fiercely throwing high-temp fireballs at me!",
    speakerColor: "text-pink-400 font-bold",
    row: 0
  },
  {
    speaker: "CYBER PROTOCOL OPERATOR (NPC)",
    avatar: "npc",
    text: "📡 Spectacular focus! Your lightning-fast punch reflexes and rapid movement were absolutely flawless!",
    speakerColor: "text-cyan-400 font-bold",
    row: 1
  },
  {
    speaker: "YOU (HERO)",
    avatar: "player",
    text: "⚡ Gathering those matrix crystal boosters and health potions kept my shield integrity active.",
    speakerColor: "text-pink-400 font-bold",
    row: 2
  },
  {
    speaker: "CYBER PROTOCOL OPERATOR (NPC)",
    avatar: "npc",
    text: "🔮 Excellent discipline. The network threat index has fully dropped back down to safe absolute zero!",
    speakerColor: "text-cyan-400 font-bold",
    row: 0
  },
  {
    speaker: "YOU (HERO)",
    avatar: "player",
    text: "🚪 The escape Warp Portal is completely operational now. It is time to close this simulation.",
    speakerColor: "text-pink-400 font-bold",
    row: 1
  },
  {
    speaker: "CYBER PROTOCOL OPERATOR (NPC)",
    avatar: "npc",
    text: "🏆 Indeed! The network is celebrating. Your heroic logs are permanently written into the High-Score legends!",
    speakerColor: "text-cyan-400 font-bold",
    row: 1
  },
  {
    speaker: "YOU (HERO)",
    avatar: "player",
    text: "🌌 Out of this retro space-grid we go. Logout sequence initiated. Return sequence complete. warp!",
    speakerColor: "text-pink-400 font-bold",
    row: 0
  }
];

export default function App() {
  // --- UI STATES ---
  const [view, setView] = useState<'launcher' | 'game'>('launcher');
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('retro_3d_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [musicMuted, setMusicMuted] = useState<boolean>(false);
  const [activeActionLog, setActiveActionLog] = useState<string[]>(['READY TO LAUNCH! WASD TO MOVE, P TO PUNCH, O FOR NOVA BOOST.']);

  // Potion and enemy state trackers
  const [playerHp, setPlayerHp] = useState<number>(5);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [defeatedCount, setDefeatedCount] = useState<number>(0);
  const [bossActive, setBossActive] = useState<boolean>(false);
  const [bossHp, setBossHp] = useState<number>(15);
  const [bossMaxHp, setBossMaxHp] = useState<number>(15);
  const [isEnding, setIsEnding] = useState<boolean>(false);
  const [endingStep, setEndingStep] = useState<'dialogue' | 'finish'>('dialogue');
  const [dialogueIndex, setDialogueIndex] = useState<number>(0);
  const [npcFrame, setNpcFrame] = useState<number>(0);
  const [npcWalkedIn, setNpcWalkedIn] = useState<boolean>(false);

  // Character status for UI
  const [playerStateText, setPlayerStateText] = useState<'IDLE' | 'WALKING' | 'PUNCHING' | 'DANCING'>('IDLE');

  // Interactive Gamepad lighting indicator
  const [keyboardState, setKeyboardState] = useState<{ [key: string]: boolean }>({});

  // New Upgrade powerups and Safe Zone states
  const [equippedSword, setEquippedSword] = useState<boolean>(false);
  const [equippedArmor, setEquippedArmor] = useState<boolean>(false);
  const [equippedBoots, setEquippedBoots] = useState<boolean>(false);
  const [inSafeZone, setInSafeZone] = useState<boolean>(false);

  // Canvas ref & loop control
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // References to allow React and 3D loop thread communication
  const gameRunning = useRef<boolean>(false);
  const stateRef = useRef({
    keys: {
      w: false, a: false, s: false, d: false,
      ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
      p: false, o: false
    },
    player: {
      x: 0,
      z: 0,
      vx: 0,
      vz: 0,
      facingRight: true,
      row: 0, // 0: Idle, 1: Walk, 2: Attack, 3: Dance
      frame: 0,
      frameTime: 0,
      isAttacking: false,
      attackLock: 0, // lock animations during punches
      isDancing: false,
      danceLock: 0,
      hp: 5,
      maxHp: 5,
      invulnTimer: 0
    },
    // Ultimate explosion state
    novaRing: {
      active: false,
      radius: 0.2,
      maxRadius: 7.5,
      speed: 0.28
    },
    // Direct punch swipe hit box
    hitBox: {
      active: false,
      x: 0,
      z: 0,
      size: 2.2,
      duration: 0
    },
    // Dropped items
    drops: [] as Array<{
      id: string;
      type: 'sword' | 'armor' | 'boots';
      x: number;
      z: number;
      mesh: THREE.Mesh;
      light: THREE.PointLight;
      bobTime: number;
    }>,
    equippedSword: false,
    equippedArmor: false,
    equippedBoots: false,
    inSafeZone: false,
    // Potions spawned on map
    potions: [] as Array<{
      mesh: THREE.Sprite;
      x: number;
      z: number;
      collected: boolean;
      y: number;
      floatTime: number;
      respawnTimer: number;
    }>,
    // Enemies spawned on map
    enemies: [] as Array<{
      mesh: THREE.Sprite;
      material: THREE.SpriteMaterial;
      texture: THREE.Texture;
      x: number;
      z: number;
      vx: number;
      vz: number;
      hp: number;
      row: number; // 0: Idle, 1: Walk
      frame: number;
      frameTime: number;
      facingRight: boolean;
      knockbackTimer: number;
      flashRedTimer: number;
      flashWhiteTimer: number;
      attackCooldown: number;
      isDead: boolean;
      respawnTimer: number;
    }>,
    // Targets to destroy (Crystals)
    crystals: [] as Array<{
      mesh: THREE.Mesh;
      light: THREE.PointLight;
      x: number;
      z: number;
      vx: number;
      vz: number;
      vy: number; // for bounce height
      y: number;
      color: string;
      shattered: boolean;
      scale: number;
      respawnTimer: number;
    }>,
    // Gold shatter particles
    particles: [] as Array<{
      mesh: THREE.Mesh;
      vx: number;
      vy: number;
      vz: number;
      life: number;
      maxLife: number;
    }>,
    score: 0,
    combo: 0,
    comboTimer: 0,
    defeatedCount: 0,
    enemySpawnTimer: 2.0,
    boss: {
      mesh: null as THREE.Sprite | null,
      material: null as THREE.SpriteMaterial | null,
      texture: null as THREE.Texture | null,
      active: false,
      hp: 15,
      maxHp: 15,
      x: 0,
      z: -15,
      y: 2.2,
      phase: 'idle' as 'idle' | 'dash' | 'prepare' | 'fire',
      phaseTimer: 2.0,
      targetX: 0,
      targetZ: 0,
      bobTime: 0,
      scaleStep: 1.0,
      frame: 0,
      frameTime: 0,
      flashRedTimer: 0,
      flashWhiteTimer: 0,
      isDead: false,
      isDefeated: false,
    },
    fireballs: [] as Array<{
      mesh: THREE.Mesh;
      targetMesh: THREE.Mesh;
      x: number;
      z: number;
      y: number;
      targetX: number;
      targetZ: number;
      speed: number;
      active: boolean;
      landTimer: number;
    }>,
    warpPortal: {
      mesh: null as THREE.Mesh | null,
      light: null as THREE.PointLight | null,
      active: false,
      x: 0,
      z: 0,
    }
  });

  // Start background synth depending on state
  useEffect(() => {
    if (!musicMuted && view === 'game') {
      bgm.start(0.18);
    } else {
      bgm.stop();
    }
    return () => bgm.stop();
  }, [view, musicMuted]);

  // Cycle sprite frames during ending scenes
  useEffect(() => {
    if (isEnding) {
      const interval = setInterval(() => {
        setNpcFrame((prev) => (prev + 1) % 4);
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isEnding]);

  // Log dispatching helper
  const addActionLog = (msg: string) => {
    setActiveActionLog(prev => [msg, ...prev.slice(0, 4)]);
  };

  // Setup Keyboard and Mouse binding detectors
  useEffect(() => {
    // Auto-focus window on click or pointer down to ensure iframe has focus to capture keystrokes
    // Support left-click to punch and right-click to trigger ultimate
    const handleWindowFocusClick = (e: MouseEvent) => {
      window.focus();
      if (gameRunning.current) {
        if (e.button === 0) {
          triggerPunch();
        } else if (e.button === 2) {
          e.preventDefault();
          triggerUltimate();
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (gameRunning.current) {
        e.preventDefault();
      }
    };

    window.addEventListener('mousedown', handleWindowFocusClick);
    window.addEventListener('click', handleWindowFocusClick);
    window.addEventListener('contextmenu', handleContextMenu);

    // Initial focus attempt
    window.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const code = e.code;
      
      const isUp = k === 'w' || k === 'ไ' || code === 'KeyW' || code === 'ArrowUp' || e.key === 'ArrowUp';
      const isLeft = k === 'a' || k === 'ฟ' || code === 'KeyA' || code === 'ArrowLeft' || e.key === 'ArrowLeft';
      const isDown = k === 's' || k === 'ห' || code === 'KeyS' || code === 'ArrowDown' || e.key === 'ArrowDown';
      const isRight = k === 'd' || k === 'ก' || code === 'KeyD' || code === 'ArrowRight' || e.key === 'ArrowRight';
      const isPunch = k === 'p' || k === 'ย' || code === 'KeyP';
      const isUltimate = k === 'o' || k === 'น' || code === 'KeyO';

      // Sync gamepad highlighted UI keys
      setKeyboardState(prev => {
        const next = { ...prev };
        next[k] = true;
        next[code] = true;
        if (isUp) { next['w'] = true; next['ArrowUp'] = true; }
        if (isLeft) { next['a'] = true; next['ArrowLeft'] = true; }
        if (isDown) { next['s'] = true; next['ArrowDown'] = true; }
        if (isRight) { next['d'] = true; next['ArrowRight'] = true; }
        if (isPunch) next['p'] = true;
        if (isUltimate) next['o'] = true;
        return next;
      });

      const keys = stateRef.current.keys;
      if (isUp) { keys.w = true; keys.ArrowUp = true; }
      if (isLeft) { keys.a = true; keys.ArrowLeft = true; }
      if (isDown) { keys.s = true; keys.ArrowDown = true; }
      if (isRight) { keys.d = true; keys.ArrowRight = true; }
      
      // P = Attack
      if (isPunch) {
        keys.p = true;
        triggerPunch();
      }

      // O = Burst ultimate
      if (isUltimate) {
        keys.o = true;
        triggerUltimate();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const code = e.code;

      const isUp = k === 'w' || k === 'ไ' || code === 'KeyW' || code === 'ArrowUp' || e.key === 'ArrowUp';
      const isLeft = k === 'a' || k === 'ฟ' || code === 'KeyA' || code === 'ArrowLeft' || e.key === 'ArrowLeft';
      const isDown = k === 's' || k === 'ห' || code === 'KeyS' || code === 'ArrowDown' || e.key === 'ArrowDown';
      const isRight = k === 'd' || k === 'ก' || code === 'KeyD' || code === 'ArrowRight' || e.key === 'ArrowRight';
      const isPunch = k === 'p' || k === 'ย' || code === 'KeyP';
      const isUltimate = k === 'o' || k === 'น' || code === 'KeyO';

      setKeyboardState(prev => {
        const next = { ...prev };
        next[k] = false;
        next[code] = false;
        if (isUp) { next['w'] = false; next['ArrowUp'] = false; }
        if (isLeft) { next['a'] = false; next['ArrowLeft'] = false; }
        if (isDown) { next['s'] = false; next['ArrowDown'] = false; }
        if (isRight) { next['d'] = false; next['ArrowRight'] = false; }
        if (isPunch) next['p'] = false;
        if (isUltimate) next['o'] = false;
        return next;
      });

      const keys = stateRef.current.keys;
      if (isUp) { keys.w = false; keys.ArrowUp = false; }
      if (isLeft) { keys.a = false; keys.ArrowLeft = false; }
      if (isDown) { keys.s = false; keys.ArrowDown = false; }
      if (isRight) { keys.d = false; keys.ArrowRight = false; }
      if (isPunch) keys.p = false;
      if (isUltimate) keys.o = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('mousedown', handleWindowFocusClick);
      window.removeEventListener('click', handleWindowFocusClick);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // --- ACTIONS ---

  const triggerPunch = () => {
    const state = stateRef.current;
    const p = state.player;
    if (p.isAttacking) return; // Prevent spamming mid-punch frame

    p.isAttacking = true;
    p.isDancing = false;
    p.row = 2; // Row 3 = Attack index 2
    p.frame = 0;
    p.frameTime = 0;
    
    // Sword equipped bonus: attack animation is even faster (locks only 10 frames)
    const attackLockDuration = state.equippedSword ? 10 : 16;
    p.attackLock = attackLockDuration;
    
    // Position Hit box further in front if sword is equipped
    const baseOffset = state.equippedSword ? 2.2 : 1.4;
    const offsetDirection = p.facingRight ? baseOffset : -baseOffset;
    state.hitBox.active = true;
    state.hitBox.x = p.x + offsetDirection;
    state.hitBox.z = p.z;
    
    // Sword equipped bonus: hitbox size is 3.6 instead of 2.2!
    state.hitBox.size = state.equippedSword ? 3.6 : 2.2;
    state.hitBox.duration = 14;

    sfx.playPunch();
  };

  const triggerUltimate = () => {
    const r = stateRef.current.novaRing;
    if (r.active) return; // Cooldown limit

    r.active = true;
    r.radius = 0.2;

    const p = stateRef.current.player;
    p.isDancing = true;
    p.isAttacking = false;
    p.row = 3; // Row 4 = Dance index 3
    p.frame = 0;
    p.frameTime = 0;
    p.danceLock = 32; // lock during ring expansion

    sfx.playShockwave();
    addActionLog("🔥 ULTIMATE NOVA EXPLOSION UNLEASHED!");
  };

  const handleStartGame = () => {
    sfx.init();
    bgm.init();
    // Reset gameplay state
    const p = stateRef.current.player;
    p.hp = 5;
    p.x = 0;
    p.z = 0;
    p.vx = 0;
    p.vz = 0;
    p.isAttacking = false;
    p.isDancing = false;
    p.attackLock = 0;
    p.danceLock = 0;
    p.invulnTimer = 0;
    
    stateRef.current.score = 0;
    stateRef.current.combo = 0;
    stateRef.current.comboTimer = 0;
    stateRef.current.defeatedCount = 0;
    stateRef.current.enemySpawnTimer = 2.0;
    stateRef.current.boss.active = false;
    stateRef.current.boss.isDead = false;
    stateRef.current.boss.isDefeated = false;
    stateRef.current.boss.hp = 15;
    stateRef.current.boss.mesh = null;
    stateRef.current.boss.material = null;
    stateRef.current.boss.texture = null;
    stateRef.current.fireballs = [];
    stateRef.current.warpPortal.active = false;
    stateRef.current.warpPortal.mesh = null;
    stateRef.current.warpPortal.light = null;
    stateRef.current.drops = [];
    stateRef.current.equippedSword = false;
    stateRef.current.equippedArmor = false;
    stateRef.current.equippedBoots = false;
    stateRef.current.inSafeZone = false;
    
    setPlayerHp(5);
    setScore(0);
    setCombo(0);
    setDefeatedCount(0);
    setBossActive(false);
    setBossHp(15);
    setEquippedSword(false);
    setEquippedArmor(false);
    setEquippedBoots(false);
    setInSafeZone(false);
    setIsGameOver(false);
    setIsEnding(false);
    setEndingStep('dialogue');
    setDialogueIndex(0);
    setNpcWalkedIn(false);
    
    // Toggle view to force unmount / remount of 3D scene
    setView('launcher');
    setTimeout(() => {
      setView('game');
      gameRunning.current = true;
    }, 50);
  };

  const resetHighScores = () => {
    localStorage.removeItem('retro_3d_highscore');
    setHighScore(0);
    addActionLog("🔄 DATABASE SCORES CLEARED.");
    sfx.playShatter();
  };

  // --- THREE.JS GRAPHICS LOOP ---
  useEffect(() => {
    if (view !== 'game' || !canvasRef.current) return;

    // --- SCENE, RENDERER, LIGHTING ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030107');
    scene.fog = new THREE.FogExp2('#030107', 0.04);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Ambient cyberpunk ambient glow
    const ambientLight = new THREE.AmbientLight('#2a1a45', 1.2);
    scene.add(ambientLight);

    // Directional light casting realistic shadows
    const dirLight = new THREE.DirectionalLight('#8b5cf6', 2.5);
    dirLight.position.set(10, 25, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    const d = 15;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // Dynamic glowing player aura light source
    const playerLight = new THREE.PointLight('#06b6d4', 6, 12);
    playerLight.position.set(0, 1.5, 0);
    playerLight.castShadow = true;
    scene.add(playerLight);

    // Sky dome / Nebula aura stars background in 3D Space
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 350;
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      // Create random distribution on sphere
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 80 + Math.random() * 40;

      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);

      // Cyber pink, purple, and blue stars
      const colorRand = Math.random();
      if (colorRand < 0.33) {
        starColors[i] = 0.96; starColors[i+1] = 0.25; starColors[i+2] = 0.96; // Pink
      } else if (colorRand < 0.66) {
        starColors[i] = 0.14; starColors[i+1] = 0.81; starColors[i+2] = 0.94; // Cyan/Blue
      } else {
        starColors[i] = 0.54; starColors[i+1] = 0.17; starColors[i+2] = 0.89; // Purple
      }
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // --- LOAD TEXTURES ---
    const textureLoader = new THREE.TextureLoader();
    
    // 1. Tiled Ground Plane Texture
    const groundTex = textureLoader.load('https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/ground_d1kjrx.png', (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      // As requested: "ทำ tiling เล็กหน่อย" (Make the tiling small / high repeat density)
      tex.repeat.set(30, 30);
      tex.minFilter = THREE.NearestFilter;
      tex.magFilter = THREE.NearestFilter;
    });

    const groundGeo = new THREE.PlaneGeometry(50, 50);
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.7,
      metalness: 0.1,
      bumpScale: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add neon light boundary ring at the edge of the 50x50 map
    const mapEdgeGeo = new THREE.RingGeometry(24.8, 25.2, 64);
    const mapEdgeMat = new THREE.MeshBasicMaterial({ color: '#f43f5e', side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    const mapEdge = new THREE.Mesh(mapEdgeGeo, mapEdgeMat);
    mapEdge.rotation.x = -Math.PI / 2;
    mapEdge.position.y = 0.02;
    scene.add(mapEdge);

    // Add visual Cyber Safe Zone at the center
    const safeZoneRingGeo = new THREE.RingGeometry(4.3, 4.5, 32);
    const safeZoneRingMat = new THREE.MeshBasicMaterial({ color: '#10b981', side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const safeZoneRing = new THREE.Mesh(safeZoneRingGeo, safeZoneRingMat);
    safeZoneRing.rotation.x = -Math.PI / 2;
    safeZoneRing.position.y = 0.03;
    scene.add(safeZoneRing);

    const shieldGeo = new THREE.CylinderGeometry(4.5, 4.5, 3.2, 32, 1, true);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: '#10b981',
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldMesh.position.set(0, 1.6, 0);
    scene.add(shieldMesh);

    // Safe zone ambient green light
    const safeZoneLight = new THREE.PointLight('#10b981', 8, 10);
    safeZoneLight.position.set(0, 1.8, 0);
    scene.add(safeZoneLight);

    // 2. 2D Sprite Character Facing Camera
    const spriteTex = textureLoader.load('https://raw.githubusercontent.com/banyapon/banyapon.github.io/refs/heads/main/studio/images/player.png', (tex) => {
      // Sprite sheet splits: 4 columns x 4 rows
      tex.repeat.set(0.25, 0.25);
      tex.minFilter = THREE.NearestFilter;
      tex.magFilter = THREE.NearestFilter;
    });

    // We will use a Mesh with SpriteMaterial or standard material for billboards
    // Sprite material always faces the camera, which matches perfectly: "ตัวละครเป็น 2D Facing Camera"
    const spriteMat = new THREE.SpriteMaterial({
      map: spriteTex,
      transparent: true
    });
    const playerSprite = new THREE.Sprite(spriteMat);
    // Position character slightly above the ground
    playerSprite.scale.set(2.4, 2.4, 1);
    playerSprite.position.set(0, 1.2, 0);
    scene.add(playerSprite);

    // --- VISUAL FX: SHOCKWAVE RING (O ULTIMATE) ---
    const ringGeo = new THREE.RingGeometry(0.1, 1, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#ec4899', // bright neon pink ring
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    const shockwaveMesh = new THREE.Mesh(ringGeo, ringMat);
    shockwaveMesh.rotation.x = -Math.PI / 2;
    shockwaveMesh.position.y = 0.05;
    scene.add(shockwaveMesh);

    // --- VISUAL FX: HIT PUNCH BOX VISUALIZER ---
    const punchIndicatorGeo = new THREE.BoxGeometry(2.0, 0.2, 2.0);
    const punchIndicatorMat = new THREE.MeshBasicMaterial({
      color: '#f43f5e',
      transparent: true,
      opacity: 0,
      wireframe: true
    });
    const punchIndicator = new THREE.Mesh(punchIndicatorGeo, punchIndicatorMat);
    punchIndicator.position.y = 0.5;
    scene.add(punchIndicator);

    // --- SPAWN RETRO COSMIC CRYSTAL TARGETS ---
    const crystalGeo = new THREE.OctahedronGeometry(0.7, 0);
    const crystalColors = ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6'];
    const activeCrystals: Array<typeof stateRef.current.crystals[0]> = [];

    for (let i = 0; i < 18; i++) {
      const color = crystalColors[i % crystalColors.length];
      const mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.1,
        metalness: 0.9,
        emissive: color,
        emissiveIntensity: 0.35
      });
      const cMesh = new THREE.Mesh(crystalGeo, mat);
      cMesh.castShadow = true;
      cMesh.receiveShadow = true;

      // Random position inside ground grid (range -20 to 20)
      const rX = (Math.random() - 0.5) * 40;
      const rZ = (Math.random() - 0.5) * 40;
      cMesh.position.set(rX, 0.7, rZ);
      scene.add(cMesh);

      // Personal glowing light under the crystal
      const cLight = new THREE.PointLight(color, 2, 4);
      cLight.position.set(rX, 0.8, rZ);
      scene.add(cLight);

      activeCrystals.push({
        mesh: cMesh,
        light: cLight,
        x: rX,
        z: rZ,
        vx: 0,
        vz: 0,
        vy: 0,
        y: 0.7,
        color: color,
        shattered: false,
        scale: 1.0,
        respawnTimer: 0
      });
    }
    stateRef.current.crystals = activeCrystals;

    // --- 3. POTION ITEM TEXTURE & SPAWN ---
    const potionTex = textureLoader.load('https://raw.githubusercontent.com/banyapon/banyapon.github.io/refs/heads/main/studio/images/potion.png', (tex) => {
      tex.minFilter = THREE.NearestFilter;
      tex.magFilter = THREE.NearestFilter;
    });

    const activePotions: Array<typeof stateRef.current.potions[0]> = [];
    const potionMat = new THREE.SpriteMaterial({ map: potionTex, transparent: true });

    for (let i = 0; i < 5; i++) {
      const pSprite = new THREE.Sprite(potionMat);
      pSprite.scale.set(1.4, 1.4, 1);
      
      const px = (Math.random() - 0.5) * 40;
      const pz = (Math.random() - 0.5) * 40;
      pSprite.position.set(px, 0.7, pz);
      scene.add(pSprite);

      activePotions.push({
        mesh: pSprite,
        x: px,
        z: pz,
        collected: false,
        y: 0.7,
        floatTime: Math.random() * 10,
        respawnTimer: 0
      });
    }
    stateRef.current.potions = activePotions;

    // --- 4. ENEMY CHARACTER & BOSS TEXTURES & SPAWNERS ---
    const enemyTexBase = textureLoader.load('https://raw.githubusercontent.com/banyapon/banyapon.github.io/refs/heads/main/studio/images/enemy.png', (tex) => {
      tex.minFilter = THREE.NearestFilter;
      tex.magFilter = THREE.NearestFilter;
    });

    const bossTexBase = textureLoader.load('https://res.cloudinary.com/dsucg33fv/image/upload/v1782709455/boss_e8jti1.png', (tex) => {
      tex.minFilter = THREE.NearestFilter;
      tex.magFilter = THREE.NearestFilter;
    });

    const activeEnemies: Array<typeof stateRef.current.enemies[0]> = [];
    stateRef.current.enemies = activeEnemies;

    const spawnEnemy = (ex: number, ez: number) => {
      const eTex = enemyTexBase.clone();
      eTex.repeat.set(0.25, 0.5); // 4 columns, 2 rows
      eTex.needsUpdate = true;

      const eMat = new THREE.SpriteMaterial({ map: eTex, transparent: true });
      const eSprite = new THREE.Sprite(eMat);
      eSprite.scale.set(2.2, 2.2, 1);
      eSprite.position.set(ex, 1.1, ez);
      scene.add(eSprite);

      stateRef.current.enemies.push({
        mesh: eSprite,
        material: eMat,
        texture: eTex,
        x: ex,
        z: ez,
        vx: 0,
        vz: 0,
        hp: 2,
        row: 1, // Row 1 (index 1) = Walk
        frame: Math.floor(Math.random() * 4),
        frameTime: 0,
        facingRight: Math.random() > 0.5,
        knockbackTimer: 0,
        flashRedTimer: 0,
        flashWhiteTimer: 0,
        attackCooldown: 0,
        isDead: false,
        respawnTimer: 0
      });
    };

    const spawnBoss = () => {
      if (stateRef.current.boss.active || stateRef.current.boss.isDefeated) return;

      const bTex = bossTexBase.clone();
      bTex.repeat.set(0.25, 0.5); // 4 columns, 2 rows
      bTex.needsUpdate = true;

      const bMat = new THREE.SpriteMaterial({ map: bTex, transparent: true });
      const bSprite = new THREE.Sprite(bMat);
      bSprite.scale.set(5.0, 5.0, 1);
      bSprite.position.set(0, 2.2, -15);
      scene.add(bSprite);

      stateRef.current.boss = {
        mesh: bSprite,
        material: bMat,
        texture: bTex,
        active: true,
        hp: 15,
        maxHp: 15,
        x: 0,
        z: -15,
        y: 2.2,
        phase: 'idle',
        phaseTimer: 2.0,
        targetX: 0,
        targetZ: -15,
        bobTime: 0,
        scaleStep: 1.0,
        frame: 0,
        frameTime: 0,
        flashRedTimer: 0,
        flashWhiteTimer: 0,
        isDead: false,
        isDefeated: false,
      };

      setBossActive(true);
      setBossHp(15);
      setBossMaxHp(15);
      
      addActionLog("🚨 WARNING: BOSS HAS SPAWNED! PREPARE YOUR SHIELD!");
      sfx.playShockwave();
    };

    const spawnItemDrop = (dx: number, dz: number) => {
      const state = stateRef.current;
      const neededTypes: Array<'sword' | 'armor' | 'boots'> = [];
      if (!state.equippedSword) neededTypes.push('sword');
      if (!state.equippedArmor) neededTypes.push('armor');
      if (!state.equippedBoots) neededTypes.push('boots');
      
      // Fallback if they have everything, drop Armor (which can heal them)
      const type = neededTypes.length > 0 
        ? neededTypes[Math.floor(Math.random() * neededTypes.length)]
        : 'armor';
        
      let color = '#06b6d4'; // cyan for sword
      let geo: THREE.BufferGeometry;
      
      if (type === 'sword') {
        color = '#06b6d4'; // bright cyan
        geo = new THREE.ConeGeometry(0.35, 1.2, 5);
      } else if (type === 'armor') {
        color = '#f59e0b'; // golden armor shield
        geo = new THREE.TorusGeometry(0.38, 0.14, 8, 16);
      } else {
        color = '#10b981'; // emerald boots speed
        geo = new THREE.OctahedronGeometry(0.45);
      }
      
      const mat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 1.5,
        roughness: 0.2,
        metalness: 0.9,
        transparent: true,
        opacity: 0.95
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(dx, 0.9, dz);
      mesh.castShadow = true;
      scene.add(mesh);
      
      const pLight = new THREE.PointLight(color, 4.0, 6.0);
      pLight.position.set(dx, 0.6, dz);
      scene.add(pLight);
      
      stateRef.current.drops.push({
        id: 'drop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        type: type,
        x: dx,
        z: dz,
        mesh: mesh,
        light: pLight,
        bobTime: Math.random() * 10
      });

      addActionLog(`🎁 A CYBER ${type.toUpperCase()} ENHANCEMENT DROPPED!`);
    };

    const spawnWarpPortal = (px: number, pz: number) => {
      if (stateRef.current.warpPortal.active) return;

      const portalGeo = new THREE.TorusGeometry(1.2, 0.15, 16, 100);
      const portalMat = new THREE.MeshBasicMaterial({ color: '#06b6d4', wireframe: true });
      const portalMesh = new THREE.Mesh(portalGeo, portalMat);
      
      portalMesh.rotation.x = -Math.PI / 2;
      portalMesh.position.set(px, 0.05, pz);
      scene.add(portalMesh);

      const portalLight = new THREE.PointLight('#06b6d4', 8, 8);
      portalLight.position.set(px, 0.5, pz);
      scene.add(portalLight);

      stateRef.current.warpPortal = {
        mesh: portalMesh,
        light: portalLight,
        active: true,
        x: px,
        z: pz
      };

      addActionLog("🔮 WARP PORTAL ACTIVATED! STEP IN TO PURGE SIMULATION.");
      sfx.playDance();
    };

    // Spawn 3 initial enemies inside (fewer NPCs)
    for (let i = 0; i < 3; i++) {
      spawnEnemy((Math.random() - 0.5) * 35, (Math.random() - 0.5) * 35);
    }

    // --- RESIZE LISTENER ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- ANIMATION STEP TIMER ---
    const clock = new THREE.Clock();

    const loop = () => {
      if (!gameRunning.current) return;

      const delta = clock.getDelta();
      const state = stateRef.current;
      const keys = state.keys;
      const p = state.player;

      // Ensure game halts if health is zero
      if (p.hp <= 0) {
        gameRunning.current = false;
        setIsGameOver(true);
        sfx.playShatter();
        bgm.stop();
        addActionLog("💀 SYSTEM SHUTDOWN: GAME OVER!");
        return;
      }

      // --- 1. PLAYER INPUT & PHYSICS MOVEMENT ---
      let dx = 0;
      let dz = 0;

      if (keys.w || keys.ArrowUp) dz -= 1;
      if (keys.s || keys.ArrowDown) dz += 1;
      if (keys.a || keys.ArrowLeft) dx -= 1;
      if (keys.d || keys.ArrowRight) dx += 1;

      // Diagonal speed dampener
      if (dx !== 0 && dz !== 0) {
        dx *= 0.7071;
        dz *= 0.7071;
      }

      // Set moving status
      const isMovingNow = (dx !== 0 || dz !== 0);

      // Dynamic friction & velocity adjustments based on Quantum Boots
      const speedMultiplier = state.equippedBoots ? 9.5 : 6.8;
      p.vx = dx * speedMultiplier;
      p.vz = dz * speedMultiplier;

      // Apply coordinates changes
      p.x += p.vx * delta;
      p.z += p.vz * delta;

      // Bound constraints within the 50x50 grid boundaries
      const boundLimit = 24.0;
      if (p.x < -boundLimit) p.x = -boundLimit;
      if (p.x > boundLimit) p.x = boundLimit;
      if (p.z < -boundLimit) p.z = -boundLimit;
      if (p.z > boundLimit) p.z = boundLimit;

      // Update Safe Zone status
      const isPlayerInSafeZone = (p.x * p.x + p.z * p.z) < 4.5 * 4.5;
      if (state.inSafeZone !== isPlayerInSafeZone) {
        state.inSafeZone = isPlayerInSafeZone;
        setInSafeZone(isPlayerInSafeZone);
        if (isPlayerInSafeZone) {
          addActionLog("🛡️ ENTERED CYBER SAFE ZONE. SHIELD ACTIVE.");
        } else {
          addActionLog("⚠️ LEFT SAFE ZONE. SHIELD DEACTIVATED.");
        }
      }

      // Pulsate the Safe Zone Shield rotating animation
      if (shieldMesh) {
        shieldMesh.rotation.y += delta * 0.45;
        shieldMesh.material.opacity = 0.12 + Math.sin(Date.now() * 0.0035) * 0.06;
      }

      // Sync Sprite Horizontal face direction based on move
      if (dx > 0) p.facingRight = true;
      if (dx < 0) p.facingRight = false;

      // --- 2. UPDATE ANIMATION STATE & ROW INDICES ---
      // Row offsets: Row 0 (Idle, offset y = 0.75), Row 1 (Walk, offset y = 0.50), Row 2 (Attack, offset y = 0.25), Row 3 (Dance, offset y = 0.0)

      // Animation locks timers decrease
      if (p.attackLock > 0) {
        p.attackLock--;
        if (p.attackLock === 0) {
          p.isAttacking = false;
        }
      }

      if (p.danceLock > 0) {
        p.danceLock--;
        if (p.danceLock === 0) {
          p.isDancing = false;
        }
      }

      // Determine appropriate state labels
      let determinedRow = 0;
      let frameSpeed = 6.5; // Ticks before updating frame index

      if (p.isAttacking) {
        determinedRow = 2; // Attack
        frameSpeed = 2.5; // Plays much faster as requested! "เล่น Animation ไวขึ้น"
        setPlayerStateText('PUNCHING');
      } else if (p.isDancing) {
        determinedRow = 3; // Dance ultimate activation
        frameSpeed = 5.0;
        setPlayerStateText('DANCING');
      } else if (isMovingNow) {
        determinedRow = 1; // Walk
        frameSpeed = 5.5;
        setPlayerStateText('WALKING');
        // Play soft rhythmic walking synth ticks
        if (Math.floor(Date.now() / 250) % 2 === 0) {
          sfx.playMove();
        }
      } else {
        determinedRow = 0; // Idle
        frameSpeed = 9.0;
        setPlayerStateText('IDLE');
      }

      p.row = determinedRow;

      // Increment Frame time
      p.frameTime += delta * 45;
      if (p.frameTime >= frameSpeed) {
        p.frame = (p.frame + 1) % 4; // 4 columns per sheet
        p.frameTime = 0;
      }

      // Update texture coordinates with robust horizontal flipping
      if (p.facingRight) {
        spriteTex.repeat.x = 0.25;
        spriteTex.offset.x = p.frame * 0.25;
      } else {
        spriteTex.repeat.x = -0.25;
        spriteTex.offset.x = (p.frame + 1) * 0.25;
      }
      spriteTex.offset.y = 0.75 - (p.row * 0.25);

      // Keep scale.x positive to avoid billboarding bugs
      playerSprite.scale.x = 2.4;

      // Sync character coordinates into 3D world
      playerSprite.position.set(p.x, 1.2, p.z);
      playerLight.position.set(p.x, 1.6, p.z);

      // Invulnerability flash
      if (p.invulnTimer > 0) {
        p.invulnTimer -= delta;
        playerSprite.material.opacity = Math.floor(Date.now() / 75) % 2 === 0 ? 0.3 : 1.0;
      } else {
        playerSprite.material.opacity = 1.0;
      }

      // Change Aura color depending on dynamic actions
      if (p.isAttacking) {
        playerLight.color.set('#f43f5e');
        playerLight.intensity = 10;
      } else if (p.isDancing) {
        playerLight.color.set('#ec4899');
        playerLight.intensity = 12;
      } else {
        playerLight.color.set('#06b6d4');
        playerLight.intensity = 6;
      }

      // --- 3. PUNCH ATTACK HIT BOX CALCULATION ---
      const h = state.hitBox;
      if (h.active) {
        h.duration -= delta * 60;
        if (h.duration <= 0) {
          h.active = false;
        }
        
        // Match visual indicator position
        const punchOffset = p.facingRight ? (state.equippedSword ? 2.2 : 1.5) : (state.equippedSword ? -2.2 : -1.5);
        punchIndicator.position.set(p.x + punchOffset, 0.7, p.z);
        punchIndicatorMat.opacity = Math.max(0, h.duration / 14) * 0.7;
        
        if (state.equippedSword) {
          punchIndicator.scale.set(1.8, 1.0, 1.8);
          punchIndicatorMat.color.set('#06b6d4'); // cyber neon cyan
        } else {
          punchIndicator.scale.set(1.0, 1.0, 1.0);
          punchIndicatorMat.color.set('#e11d48'); // rose red
        }
      } else {
        punchIndicatorMat.opacity = 0;
      }

      // --- 4. ULTIMATE NOVA WAVE EXPANSION ---
      const r = state.novaRing;
      if (r.active) {
        r.radius += r.speed;
        if (r.radius >= r.maxRadius) {
          r.active = false;
        }
        
        // Sync ring visual mesh size
        shockwaveMesh.position.set(p.x, 0.06, p.z);
        shockwaveMesh.scale.set(r.radius, r.radius, 1);
        
        // Fade out depending on radius expansion ratio
        const opacityRatio = 1.0 - (r.radius / r.maxRadius);
        ringMat.opacity = opacityRatio * 0.8;
      } else {
        ringMat.opacity = 0;
      }

      // --- 5. UPDATE FLOATING CRYSTALS & SHATTER ACTIONS ---
      state.crystals.forEach((cry, idx) => {
        if (cry.shattered) {
          cry.respawnTimer -= delta * 60;
          if (cry.respawnTimer <= 0) {
            // Respawn at random new coordinate
            const nx = (Math.random() - 0.5) * 40;
            const nz = (Math.random() - 0.5) * 40;
            cry.x = nx;
            cry.z = nz;
            cry.vx = 0;
            cry.vz = 0;
            cry.vy = 0;
            cry.y = 0.7;
            cry.mesh.position.set(nx, 0.7, nz);
            cry.mesh.scale.set(1, 1, 1);
            cry.light.position.set(nx, 0.8, nz);
            cry.light.intensity = 2;
            cry.shattered = false;
          }
          return;
        }

        // Float bobbing effect
        const floatBob = Math.sin(Date.now() * 0.003 + idx * 0.8) * 0.15;
        cry.mesh.position.y = cry.y + floatBob;
        cry.mesh.rotation.y += 1.2 * delta;
        cry.mesh.rotation.x += 0.5 * delta;

        // Apply physical sliding drag
        cry.x += cry.vx * delta;
        cry.z += cry.vz * delta;
        cry.vx *= 0.92;
        cry.vz *= 0.92;

        // Constraint boundaries for crystals
        if (cry.x < -boundLimit) { cry.x = -boundLimit; cry.vx *= -1; }
        if (cry.x > boundLimit) { cry.x = boundLimit; cry.vx *= -1; }
        if (cry.z < -boundLimit) { cry.z = -boundLimit; cry.vz *= -1; }
        if (cry.z > boundLimit) { cry.z = boundLimit; cry.vz *= -1; }

        cry.mesh.position.x = cry.x;
        cry.mesh.position.z = cry.z;
        cry.light.position.x = cry.x;
        cry.light.position.z = cry.z;

        // Check 1: Normal Hitbox Collision (PUNCH action)
        if (h.active) {
          const dx = cry.x - punchIndicator.position.x;
          const dz = cry.z - punchIndicator.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);

          // Within punch box range!
          if (dist < 2.0) {
            // Apply high physical knockback force
            const pushDirX = p.facingRight ? 8.5 : -8.5;
            cry.vx = pushDirX;
            cry.vz = (Math.random() - 0.5) * 6;
            
            // Shatter and earn points
            cry.shattered = true;
            cry.respawnTimer = 180; // 3 seconds to reappear
            cry.mesh.scale.set(0, 0, 0);
            cry.light.intensity = 0;

            sfx.playShatter();
            state.score += 150 + (state.combo * 15);
            state.combo += 1;
            state.comboTimer = 120; // 2 seconds to chain combo

            setScore(state.score);
            setCombo(state.combo);
            
            // Save local record
            if (state.score > highScore) {
              setHighScore(state.score);
              localStorage.setItem('retro_3d_highscore', state.score.toString());
            }

            addActionLog(`✨ PUNCH SHATTERED A CRYSTAL (+150 PTS!) x${state.combo}`);

            // Generate neon explosion particles
            generateShatterParticles(cry.x, cry.mesh.position.y, cry.z, cry.color);
          }
        }

        // Check 2: Nova blast wave expanding shockwave (Ultimate O action)
        if (r.active) {
          const dx = cry.x - p.x;
          const dz = cry.z - p.z;
          const dist = Math.sqrt(dx * dx + dz * dz);

          // If inside the expanding wave bounds
          if (dist < r.radius && dist > r.radius - 1.2) {
            // Launch crystals high outwards radially
            const angle = Math.atan2(dz, dx);
            cry.vx = Math.cos(angle) * 16;
            cry.vz = Math.sin(angle) * 16;

            cry.shattered = true;
            cry.respawnTimer = 180;
            cry.mesh.scale.set(0, 0, 0);
            cry.light.intensity = 0;

            sfx.playShatter();
            state.score += 250 + (state.combo * 20);
            state.combo += 2;
            state.comboTimer = 120;

            setScore(state.score);
            setCombo(state.combo);

            if (state.score > highScore) {
              setHighScore(state.score);
              localStorage.setItem('retro_3d_highscore', state.score.toString());
            }

            addActionLog(`💥 NOVA SHOCKWAVE DETONATION (+250 PTS!) x${state.combo}`);
            generateShatterParticles(cry.x, cry.mesh.position.y, cry.z, cry.color);
          }
        }
      });

      // --- 6. UPDATE PARTICLES LIFE TIMERS ---
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const par = state.particles[i];
        par.mesh.position.x += par.vx * delta;
        par.mesh.position.y += par.vy * delta;
        par.mesh.position.z += par.vz * delta;

        // Apply soft gravity to gold debris
        par.vy -= 4.2 * delta;

        par.life -= delta * 60;
        
        // Shrink particle over time
        const scaleRatio = Math.max(0, par.life / par.maxLife);
        par.mesh.scale.set(scaleRatio * 0.35, scaleRatio * 0.35, scaleRatio * 0.35);

        if (par.life <= 0) {
          scene.remove(par.mesh);
          par.mesh.geometry.dispose();
          state.particles.splice(i, 1);
        }
      }

      // Combo decrease timer
      if (state.comboTimer > 0) {
        state.comboTimer -= delta * 60;
        if (state.comboTimer <= 0) {
          state.combo = 0;
          setCombo(0);
        }
      }

      // --- 6B. UPDATE POTION ITEMS ---
      state.potions.forEach((pot) => {
        if (pot.collected) {
          pot.respawnTimer -= delta;
          if (pot.respawnTimer <= 0) {
            pot.x = (Math.random() - 0.5) * 40;
            pot.z = (Math.random() - 0.5) * 40;
            pot.mesh.position.set(pot.x, 0.7, pot.z);
            pot.collected = false;
            pot.mesh.visible = true;
          }
          return;
        }

        // Float bobbing effect
        pot.floatTime += delta * 3;
        pot.mesh.position.y = pot.y + Math.sin(pot.floatTime) * 0.12;

        // Collision check with player
        const dx = pot.x - p.x;
        const dz = pot.z - p.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 1.3) {
          pot.collected = true;
          pot.mesh.visible = false;
          pot.respawnTimer = 8.0; // 8 seconds respawn cooldown

          // Heal player
          if (p.hp < p.maxHp) {
            p.hp = Math.min(p.maxHp, p.hp + 1);
            setPlayerHp(p.hp);
            addActionLog("🧪 POTION COLLECTED! HEALTH RESTORED (+1 HP)");
          } else {
            // Give points if full health
            state.score += 300;
            setScore(state.score);
            addActionLog("🧪 POTION COLLECTED AT FULL HP (+300 PTS bonus!)");
          }
          sfx.playDance(); // Play healing sound chord
        }
      });

      // --- 6C. SPAWN NORMAL ENEMIES PERIODICALLY ---
      if (!state.boss.active && !state.boss.isDefeated) {
        state.enemySpawnTimer -= delta;
        if (state.enemySpawnTimer <= 0) {
          // Reset timer randomly to 3.0 to 7.0 seconds (fewer NPCs)
          state.enemySpawnTimer = 3.0 + Math.random() * 4.0;

          // Limit maximum concurrent active enemies on the map to 5
          if (state.enemies.length < 5) {
            // Spawn from a random outer boundary edge (from all directions!)
            const angle = Math.random() * Math.PI * 2;
            const spawnDist = 23.5;
            const spawnX = Math.cos(angle) * spawnDist;
            const spawnZ = Math.sin(angle) * spawnDist;
            spawnEnemy(spawnX, spawnZ);
          }
        }
      }

      // --- 6D. UPDATE CHASER ENEMIES ---
      for (let i = state.enemies.length - 1; i >= 0; i--) {
        const enemy = state.enemies[i];
        if (enemy.isDead) {
          enemy.flashWhiteTimer -= delta;
          
          // Rapid flashing white / blank effect
          enemy.mesh.visible = Math.floor(Date.now() / 60) % 2 === 0;
          enemy.material.color.setRGB(10.0, 10.0, 10.0);
          
          // Spin and fly away out of screen
          enemy.mesh.rotation.z += 12 * delta;
          enemy.x += enemy.vx * delta;
          enemy.z += enemy.vz * delta;
          enemy.mesh.position.set(enemy.x, enemy.mesh.position.y + 15 * delta, enemy.z);
          
          const sizeRatio = Math.max(0, enemy.flashWhiteTimer / 1.2);
          enemy.mesh.scale.set(sizeRatio * 2.2, sizeRatio * 2.2, 1);

          if (enemy.flashWhiteTimer <= 0) {
            scene.remove(enemy.mesh);
            enemy.mesh.geometry.dispose();
            enemy.material.dispose();
            enemy.texture.dispose();
            state.enemies.splice(i, 1);
          }
          continue;
        }

        const dx = p.x - enemy.x;
        const dz = p.z - enemy.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        // Enemy knockback physics
        if (enemy.knockbackTimer > 0) {
          enemy.knockbackTimer -= delta;
          enemy.x += enemy.vx * delta;
          enemy.z += enemy.vz * delta;
          enemy.vx *= 0.90;
          enemy.vz *= 0.90;
        } else {
          // AI: Chasing the player character
          if (dist > 0.8) {
            enemy.vx = (dx / dist) * 2.5;
            enemy.vz = (dz / dist) * 2.5;
            enemy.x += enemy.vx * delta;
            enemy.z += enemy.vz * delta;
            enemy.row = 1; // Row 1 (index 1) = Walking animation
          } else {
            enemy.vx = 0;
            enemy.vz = 0;
            enemy.row = 0; // Row 0 (index 0) = Idle animation
          }
        }

        // Keep enemies inside the 50x50 map boundaries
        const bLimit = 24.2;
        if (enemy.x < -bLimit) enemy.x = -bLimit;
        if (enemy.x > bLimit) enemy.x = bLimit;
        if (enemy.z < -bLimit) enemy.z = -bLimit;
        if (enemy.z > bLimit) enemy.z = bLimit;

        // Active Repel normal enemies from Cyber Safe Zone (radius 4.5)
        const distFromCenter = Math.sqrt(enemy.x * enemy.x + enemy.z * enemy.z);
        if (distFromCenter < 4.5 && enemy.knockbackTimer <= 0) {
          const angle = Math.atan2(enemy.z, enemy.x);
          enemy.x = Math.cos(angle) * 4.6;
          enemy.z = Math.sin(angle) * 4.6;
          enemy.vx = Math.cos(angle) * 8.0;
          enemy.vz = Math.sin(angle) * 8.0;
          enemy.knockbackTimer = 0.25;
        }

        // Position mesh in the 3D world
        enemy.mesh.position.set(enemy.x, 1.1, enemy.z);

        // Facing direction with robust turning mapping
        if (enemy.vx > 0.1) {
          enemy.facingRight = true;
        } else if (enemy.vx < -0.1) {
          enemy.facingRight = false;
        } else {
          enemy.facingRight = (dx >= 0);
        }

        if (enemy.facingRight) {
          enemy.texture.repeat.x = 0.25;
          enemy.texture.offset.x = enemy.frame * 0.25;
        } else {
          enemy.texture.repeat.x = -0.25;
          enemy.texture.offset.x = (enemy.frame + 1) * 0.25;
        }
        enemy.mesh.scale.x = 2.2;

        // Walk Animation cycle
        enemy.frameTime += delta * 45;
        if (enemy.frameTime >= 6.5) {
          enemy.frame = (enemy.frame + 1) % 4; // 4 columns
          enemy.frameTime = 0;
        }
        
        enemy.texture.offset.y = 0.5 - (enemy.row * 0.5);

        // Flash Red visualizer decrement
        if (enemy.flashRedTimer > 0) {
          enemy.flashRedTimer -= delta;
          enemy.material.color.setRGB(1.0, 0.15, 0.15);
        } else {
          enemy.material.color.setRGB(1.0, 1.0, 1.0);
        }

        // Deal damage to player on touch (cooldown managed)
        if (enemy.attackCooldown > 0) {
          enemy.attackCooldown -= delta;
        }

        if (dist < 1.15 && p.invulnTimer <= 0 && enemy.attackCooldown <= 0 && !state.inSafeZone) {
          p.hp -= 1;
          setPlayerHp(p.hp);
          p.invulnTimer = 1.5; // 1.5s invulnerability flash
          enemy.flashRedTimer = 0.6; // flash red when attacking
          enemy.attackCooldown = 1.2; // 1.2s delay before hurting again
          
          sfx.playPunch(); // Hurt impact sound
          addActionLog("⚠️ HURT BY ENEMY CHASER! (-1 HP)");

          if (p.hp <= 0) {
            gameRunning.current = false;
            setIsGameOver(true);
            sfx.playShatter();
            bgm.stop();
            addActionLog("💀 SYSTEM SHUTDOWN: GAME OVER!");
            return;
          }
        }

        // --- ENEMY DOUBLE HIT COMBAT DETECTIONS ---
        // Strike 1: Normal Hitbox Punch (P)
        if (state.hitBox.active && enemy.knockbackTimer <= 0) {
          const hdx = enemy.x - punchIndicator.position.x;
          const hdz = enemy.z - punchIndicator.position.z;
          const hdist = Math.sqrt(hdx * hdx + hdz * hdz);

          if (hdist < 2.0) {
            enemy.hp -= 1;
            enemy.knockbackTimer = 0.45; // knockback duration

            const angle = Math.atan2(enemy.z - p.z, enemy.x - p.x);
            
            if (enemy.hp === 1) {
              enemy.vx = Math.cos(angle) * 16;
              enemy.vz = Math.sin(angle) * 16;
              enemy.flashRedTimer = 0.5;
              
              state.score += 150 + (state.combo * 15);
              state.combo += 1;
              state.comboTimer = 120;
              setScore(state.score);
              setCombo(state.combo);

              sfx.playPunch();
              addActionLog("⚔️ ENEMY HIT! FIRST STRIKE KNOCKBACK.");
            } else if (enemy.hp <= 0) {
              enemy.isDead = true;
              enemy.flashWhiteTimer = 1.2;
              enemy.vx = Math.cos(angle) * 24;
              enemy.vz = Math.sin(angle) * 24;

              state.score += 400 + (state.combo * 25);
              state.combo += 2;
              state.comboTimer = 120;
              setScore(state.score);
              setCombo(state.combo);

              state.defeatedCount += 1;
              setDefeatedCount(state.defeatedCount);
              if (state.defeatedCount >= 10) {
                spawnBoss();
              }

              sfx.playShatter();
              addActionLog(`☠️ CYBER ENEMY OBLITERATED! (${state.defeatedCount}/10 kills to anomaly)`);
              generateShatterParticles(enemy.x, 1.1, enemy.z, '#ef4444');
              
              // 40% probability of dropping a cool Quantum upgrade item
              if (Math.random() < 0.40) {
                spawnItemDrop(enemy.x, enemy.z);
              }
            }

            if (state.score > highScore) {
              setHighScore(state.score);
              localStorage.setItem('retro_3d_highscore', state.score.toString());
            }
          }
        }

        // Strike 2: Ultimate Nova Ring Wave (O)
        if (state.novaRing.active && enemy.knockbackTimer <= 0) {
          const r_ring = state.novaRing;
          if (dist < r_ring.radius && dist > r_ring.radius - 1.2) {
            enemy.hp -= 1;
            enemy.knockbackTimer = 0.45;

            const angle = Math.atan2(enemy.z - p.z, enemy.x - p.x);

            if (enemy.hp === 1) {
              enemy.vx = Math.cos(angle) * 18;
              enemy.vz = Math.sin(angle) * 18;
              enemy.flashRedTimer = 0.5;

              state.score += 150 + (state.combo * 15);
              state.combo += 1;
              state.comboTimer = 120;
              setScore(state.score);
              setCombo(state.combo);

              sfx.playPunch();
              addActionLog("💥 NOVA IMPACT! ENEMY HIT.");
            } else if (enemy.hp <= 0) {
              enemy.isDead = true;
              enemy.flashWhiteTimer = 1.2;
              enemy.vx = Math.cos(angle) * 28;
              enemy.vz = Math.sin(angle) * 28;

              state.score += 500 + (state.combo * 30);
              state.combo += 2;
              state.comboTimer = 120;
              setScore(state.score);
              setCombo(state.combo);

              state.defeatedCount += 1;
              setDefeatedCount(state.defeatedCount);
              if (state.defeatedCount >= 10) {
                spawnBoss();
              }

              sfx.playShatter();
              addActionLog(`🔥 NOVA WAVE VAPORIZED ENEMY! (${state.defeatedCount}/10 kills)`);
              generateShatterParticles(enemy.x, 1.1, enemy.z, '#a855f7');
              
              // 40% probability of dropping a cool Quantum upgrade item
              if (Math.random() < 0.40) {
                spawnItemDrop(enemy.x, enemy.z);
              }
            }

            if (state.score > highScore) {
              setHighScore(state.score);
              localStorage.setItem('retro_3d_highscore', state.score.toString());
            }
          }
        }
      }

      // --- 6E. UPDATE EPIC BOSS CHARACTER ---
      const boss = state.boss;
      if (boss.active) {
        if (boss.isDead) {
          boss.flashWhiteTimer -= delta;
          boss.mesh!.visible = Math.floor(Date.now() / 60) % 2 === 0;
          boss.material!.color.setRGB(10.0, 10.0, 10.0);
          
          boss.mesh!.rotation.z += 8 * delta;
          boss.y += 12 * delta;
          boss.mesh!.position.set(boss.x, boss.y, boss.z);
          
          const sizeRatio = Math.max(0, boss.flashWhiteTimer / 2.0);
          boss.mesh!.scale.set(sizeRatio * 5.0, sizeRatio * 5.0, 1);

          if (boss.flashWhiteTimer <= 0) {
            scene.remove(boss.mesh!);
            boss.mesh = null;
            boss.active = false;
            boss.isDefeated = true;
            setBossActive(false);

            // Spawn the warp portal at the center (0, 0)
            spawnWarpPortal(0, 0);
          }
        } else {
          // --- BOSS BEHAVIOR PATTERNS ---
          boss.phaseTimer -= delta;
          boss.bobTime += delta * 4;
          
          // Gentle floating bob
          boss.y = 2.2 + Math.sin(boss.bobTime) * 0.25;

          if (boss.phaseTimer <= 0) {
            if (boss.phase === 'idle') {
              // Transition to Dash (พุ่งไกล-ใกล้)
              boss.phase = 'dash';
              boss.phaseTimer = 1.2;
              
              const roll = Math.random();
              if (roll < 0.6) {
                boss.targetX = p.x + (Math.random() - 0.5) * 4;
                boss.targetZ = p.z + (Math.random() - 0.5) * 4;
              } else {
                boss.targetX = (Math.random() - 0.5) * 36;
                boss.targetZ = (Math.random() - 0.5) * 36;
              }
              addActionLog("⚡ BOSS INITIATING RAPID TRANSLOCATION!");
            } else if (boss.phase === 'dash') {
              // Transition to Prepare Fireball (ขยายย่อ บอก step)
              boss.phase = 'prepare';
              boss.phaseTimer = 1.5;
              addActionLog("🔥 BOSS CHARGING FIRE SPELL CORES!");
            } else if (boss.phase === 'prepare') {
              // Transition to Shoot Fireball (โยนลูกไฟ ขึ้นฟ้า สุ่มตก)
              boss.phase = 'fire';
              boss.phaseTimer = 2.0;
              
              const fireballCount = 3 + Math.floor(Math.random() * 2);
              for (let f = 0; f < fireballCount; f++) {
                let tx = p.x;
                let tz = p.z;
                if (f > 0) {
                  tx += (Math.random() - 0.5) * 12;
                  tz += (Math.random() - 0.5) * 12;
                }

                tx = Math.max(-23.5, Math.min(23.5, tx));
                tz = Math.max(-23.5, Math.min(23.5, tz));

                const warnGeo = new THREE.RingGeometry(1.2, 1.4, 32);
                const warnMat = new THREE.MeshBasicMaterial({ color: '#f43f5e', side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
                const warnMesh = new THREE.Mesh(warnGeo, warnMat);
                warnMesh.rotation.x = -Math.PI / 2;
                warnMesh.position.set(tx, 0.05, tz);
                scene.add(warnMesh);

                const ballGeo = new THREE.SphereGeometry(0.5, 16, 16);
                const ballMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });
                const ballMesh = new THREE.Mesh(ballGeo, ballMat);
                ballMesh.position.set(tx, 18.0, tz);
                scene.add(ballMesh);

                state.fireballs.push({
                  mesh: ballMesh,
                  targetMesh: warnMesh,
                  x: tx,
                  z: tz,
                  y: 18.0,
                  targetX: tx,
                  targetZ: tz,
                  speed: 10.0 + Math.random() * 5.0,
                  active: true,
                  landTimer: 1.5 + f * 0.4,
                });
              }
              sfx.playShockwave();
            } else if (boss.phase === 'fire') {
              boss.phase = 'idle';
              boss.phaseTimer = 2.0;
            }
          }

          // --- EXECUTE PHASE BEHAVIOR ---
          if (boss.phase === 'dash') {
            boss.x = THREE.MathUtils.lerp(boss.x, boss.targetX, delta * 4.0);
            boss.z = THREE.MathUtils.lerp(boss.z, boss.targetZ, delta * 4.0);
            boss.scaleStep = 1.0;
          } else if (boss.phase === 'prepare') {
            const pulse = 1.0 + Math.sin(Date.now() * 0.018) * 0.28;
            boss.scaleStep = pulse;
          } else {
            boss.scaleStep = 1.0;
          }

          boss.mesh!.position.set(boss.x, boss.y, boss.z);

          const bdx = p.x - boss.x;
          if (bdx > 0.1) {
            boss.mesh!.scale.x = 5.0 * boss.scaleStep;
          } else if (bdx < -0.1) {
            boss.mesh!.scale.x = -5.0 * boss.scaleStep;
          }
          boss.mesh!.scale.y = 5.0 * boss.scaleStep;

          boss.frameTime += delta * 35;
          if (boss.frameTime >= 8.0) {
            boss.frame = (boss.frame + 1) % 4;
            boss.frameTime = 0;
          }

          const bossRowIndex = (boss.phase === 'prepare' || boss.phase === 'fire') ? 1 : 0;
          boss.texture!.offset.x = boss.frame * 0.25;
          boss.texture!.offset.y = 0.5 - (bossRowIndex * 0.5);

          if (boss.flashRedTimer > 0) {
            boss.flashRedTimer -= delta;
            boss.material!.color.setRGB(1.0, 0.2, 0.2);
          } else {
            boss.material!.color.setRGB(1.0, 1.0, 1.0);
          }

          const distToBoss = Math.sqrt((p.x - boss.x) * (p.x - boss.x) + (p.z - boss.z) * (p.z - boss.z));
          if (distToBoss < 2.0 && p.invulnTimer <= 0 && !state.inSafeZone) {
            p.hp -= 1;
            setPlayerHp(p.hp);
            p.invulnTimer = 1.5;
            sfx.playPunch();
            addActionLog("⚠️ COLLIDED WITH ELITE BOSS CORES! (-1 HP)");
            
            if (p.hp <= 0) {
              gameRunning.current = false;
              setIsGameOver(true);
              sfx.playShatter();
              bgm.stop();
              addActionLog("💀 SYSTEM SHUTDOWN: GAME OVER!");
              return;
            }
          }

          // --- COMBAT DETECTIONS ON BOSS ---
          if (state.hitBox.active && boss.flashRedTimer <= 0) {
            const hdx = boss.x - punchIndicator.position.x;
            const hdz = boss.z - punchIndicator.position.z;
            const hdist = Math.sqrt(hdx * hdx + hdz * hdz);

            if (hdist < 3.2) {
              boss.hp -= 1;
              setBossHp(boss.hp);
              boss.flashRedTimer = 0.45;
              sfx.playPunch();
              addActionLog(`⚔️ DIRECT IMPACT ON BOSS! (-1 HP) HP: ${boss.hp}/15`);

              if (boss.hp <= 0) {
                boss.isDead = true;
                boss.flashWhiteTimer = 2.0;
                boss.vx = (Math.random() - 0.5) * 8;
                boss.vz = (Math.random() - 0.5) * 8;
                state.score += 2000;
                setScore(state.score);
                sfx.playShatter();
                addActionLog("☠️ BOSS CYBER DEMON ELIMINATED! PORTAL EMITTING...");
                generateShatterParticles(boss.x, boss.y, boss.z, '#a855f7');
              }
            }
          }

          if (state.novaRing.active && boss.flashRedTimer <= 0) {
            if (distToBoss < state.novaRing.radius && distToBoss > state.novaRing.radius - 1.5) {
              boss.hp -= 2;
              setBossHp(Math.max(0, boss.hp));
              boss.flashRedTimer = 0.45;
              sfx.playPunch();
              addActionLog(`💥 NOVA WAVE BLASTED BOSS! (-2 HP!) HP: ${Math.max(0, boss.hp)}/15`);

              if (boss.hp <= 0) {
                boss.isDead = true;
                boss.flashWhiteTimer = 2.0;
                boss.vx = (Math.random() - 0.5) * 8;
                boss.vz = (Math.random() - 0.5) * 8;
                state.score += 2000;
                setScore(state.score);
                sfx.playShatter();
                addActionLog("☠️ BOSS CYBER DEMON ELIMINATED! PORTAL EMITTING...");
                generateShatterParticles(boss.x, boss.y, boss.z, '#a855f7');
              }
            }
          }
        }
      }

      // --- 6F. UPDATE FALLING FIREBALLS ---
      for (let i = state.fireballs.length - 1; i >= 0; i--) {
        const fb = state.fireballs[i];
        fb.landTimer -= delta;

        if (fb.landTimer > 0) {
          const ratio = fb.landTimer / 1.5;
          fb.y = 0.7 + ratio * 17.3;
          fb.mesh.position.y = fb.y;

          const indicatorScale = 1.0 + Math.sin(Date.now() * 0.015) * 0.15;
          fb.targetMesh.scale.set(indicatorScale, indicatorScale, 1.0);
        } else {
          scene.remove(fb.mesh);
          scene.remove(fb.targetMesh);
          
          generateShatterParticles(fb.x, 0.7, fb.z, '#f97316');

          const distToImpact = Math.sqrt((p.x - fb.x) * (p.x - fb.x) + (p.z - fb.z) * (p.z - fb.z));
          if (distToImpact < 1.8 && p.invulnTimer <= 0 && !state.inSafeZone) {
            p.hp -= 1;
            setPlayerHp(p.hp);
            p.invulnTimer = 1.5;
            sfx.playPunch();
            addActionLog("💥 DIRECT FIREBALL CRITICAL HIT! (-1 HP)");

            if (p.hp <= 0) {
              gameRunning.current = false;
              setIsGameOver(true);
              sfx.playShatter();
              bgm.stop();
              addActionLog("💀 SYSTEM SHUTDOWN: GAME OVER!");
              return;
            }
          } else {
            sfx.playMove();
          }

          state.fireballs.splice(i, 1);
        }
      }

      // --- 6G. UPDATE WARP PORTAL ---
      const portal = state.warpPortal;
      if (portal.active) {
        portal.mesh!.rotation.z += 2.5 * delta;
        portal.light!.intensity = 6.0 + Math.sin(Date.now() * 0.01) * 2.0;

        const distToPortal = Math.sqrt((p.x - portal.x) * (p.x - portal.x) + (p.z - portal.z) * (p.z - portal.z));
        if (distToPortal < 1.4) {
          gameRunning.current = false;
          setIsEnding(true);
          setEndingStep('dialogue');
          setDialogueIndex(0);
          setTimeout(() => {
            setNpcWalkedIn(true);
          }, 300);
          bgm.stop();
          sfx.playDance();
          addActionLog("🌌 SIMULATION PURGED! ENDING PROTOCOL INITIATED.");
        }
      }

      // --- 6H. UPDATE AND COLLIDE WITH ITEM DROPS ---
      for (let i = state.drops.length - 1; i >= 0; i--) {
        const drop = state.drops[i];
        
        // Bobbing and spinning animation
        drop.bobTime += delta * 3.5;
        drop.mesh.position.y = 0.8 + Math.sin(drop.bobTime) * 0.16;
        drop.mesh.rotation.y += delta * 2.2;
        drop.mesh.rotation.x += delta * 0.6;
        
        // Pulse light intensity
        drop.light.intensity = 3.0 + Math.sin(drop.bobTime) * 1.5;
        
        // Distance check with player
        const d_x = p.x - drop.x;
        const d_z = p.z - drop.z;
        const distToPlayer = Math.sqrt(d_x * d_x + d_z * d_z);
        
        if (distToPlayer < 1.4) {
          // Play collection sound & feedback
          sfx.playDance(); // nice rewarding sound
          
          if (drop.type === 'sword') {
            state.equippedSword = true;
            setEquippedSword(true);
            addActionLog("🗡️ CYBER SWORD EQUIPPED: PUNCH SPEED & HITBOX BOOSTED!");
          } else if (drop.type === 'armor') {
            state.equippedArmor = true;
            setEquippedArmor(true);
            p.hp = Math.min(5, p.hp + 2); // Heal +2 HP
            setPlayerHp(p.hp);
            addActionLog("🛡️ CYBER ARMOR EQUIPPED: CHIP DAMAGE ABSORPTION & +2 HP HEAL!");
          } else if (drop.type === 'boots') {
            state.equippedBoots = true;
            setEquippedBoots(true);
            addActionLog("🥾 QUANTUM BOOTS EQUIPPED: MOVEMENT SPEED PERMANENTLY BOOSTED!");
          }
          
          // Generate neon collection particles
          const colorHex = drop.type === 'sword' ? '#06b6d4' : (drop.type === 'armor' ? '#f59e0b' : '#10b981');
          generateShatterParticles(drop.x, 0.9, drop.z, colorHex);
          
          // Remove from scene
          scene.remove(drop.mesh);
          scene.remove(drop.light);
          if (drop.mesh.geometry) drop.mesh.geometry.dispose();
          if (Array.isArray(drop.mesh.material)) {
            drop.mesh.material.forEach(m => m.dispose());
          } else if (drop.mesh.material) {
            drop.mesh.material.dispose();
          }
          
          state.drops.splice(i, 1);
        }
      }

      // --- 7. CAMERA CHASE INTERPOLATED (LERP) ---
      // Positioned slightly above and behind looking at character
      const targetCamX = p.x;
      const targetCamZ = p.z + 9.5;
      const targetCamY = 6.2; // elevated view

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.07);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.07);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.07);

      camera.lookAt(p.x, 1.0, p.z);

      // Render Step
      renderer.render(scene, camera);

      animationFrameId.current = requestAnimationFrame(loop);
    };

    // Helper particle generator inside 3D environment
    const generateShatterParticles = (cx: number, cy: number, cz: number, color: string) => {
      const pGeo = new THREE.BoxGeometry(1, 1, 1);
      const pMat = new THREE.MeshBasicMaterial({ color: color });
      
      for (let i = 0; i < 15; i++) {
        const pMesh = new THREE.Mesh(pGeo, pMat);
        pMesh.position.set(cx, cy, cz);
        scene.add(pMesh);

        stateRef.current.particles.push({
          mesh: pMesh,
          vx: (Math.random() - 0.5) * 8,
          vy: Math.random() * 5 + 3,
          vz: (Math.random() - 0.5) * 8,
          life: 45,
          maxLife: 45
        });
      }
    };

    // Begin looping
    loop();

    return () => {
      gameRunning.current = false;
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [view]);

  // Handle virtual buttons helper triggers for touch screen
  const pressVirtualKey = (key: string) => {
    const keys = stateRef.current.keys;
    // Set state
    setKeyboardState(prev => ({ ...prev, [key]: true }));

    if (key === 'w') { keys.w = true; }
    if (key === 'a') { keys.a = true; }
    if (key === 's') { keys.s = true; }
    if (key === 'd') { keys.d = true; }

    if (key === 'p') {
      keys.p = true;
      triggerPunch();
    }
    if (key === 'o') {
      keys.o = true;
      triggerUltimate();
    }
  };

  const releaseVirtualKey = (key: string) => {
    const keys = stateRef.current.keys;
    setKeyboardState(prev => ({ ...prev, [key]: false }));

    if (key === 'w') { keys.w = false; }
    if (key === 'a') { keys.a = false; }
    if (key === 's') { keys.s = false; }
    if (key === 'd') { keys.d = false; }
    if (key === 'p') keys.p = false;
    if (key === 'o') keys.o = false;
  };

  return (
    <div className="relative min-h-screen bg-[#030107] text-white flex flex-col font-sans select-none overflow-hidden" id="galaxy-app-root">
      {/* Background Animated Neon Nebulas (Pink, Blue, Purple) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] bg-pink-500/10 rounded-full blur-[120px] animate-nebula-slow"></div>
        <div className="absolute bottom-[20%] right-[5%] w-[450px] h-[450px] bg-cyan-500/12 rounded-full blur-[130px] animate-nebula-medium"></div>
        <div className="absolute top-[40%] right-[25%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[140px] animate-nebula-fast"></div>
      </div>

      {/* VIEWPORT 1: LAUNCHER ENTRY SCREEN */}
      {view === 'launcher' && (
        <div className="flex-1 w-full flex flex-col items-center justify-center p-4 relative z-10" id="splash-viewport">
          <div className="w-full max-w-xl bg-slate-950/85 border border-purple-900/50 hover:border-cyan-500/40 rounded-3xl p-8 flex flex-col items-center shadow-2xl relative transition-all duration-300">
            {/* Glowing neon top stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-400 rounded-t-3xl"></div>

            {/* Clouds / Sparkle details */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-cyan-400/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl"></div>

            {/* Custom Logo Render requested */}
            <div className="mb-6 relative flex items-center justify-center py-4 min-h-[120px]" id="studio-logo-badge">
              <img 
                src="https://res.cloudinary.com/dsucg33fv/image/upload/v1782709347/logo_i8827v.png" 
                alt="Cyber Retro logo" 
                className="max-h-24 w-auto object-contain select-none drop-shadow-[0_0_18px_rgba(236,72,153,0.45)] transform hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Sub-heading info */}
            <h1 className="text-2xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 font-mono text-center mb-1">
              GALAXY BLASTER 3D
            </h1>
            <p className="text-xs text-cyan-400 font-mono uppercase tracking-widest text-center mb-6">
              ThreeJS 3D World • 2D Pixel Billboard Character
            </p>

            <div className="w-full bg-slate-900/60 border border-purple-950 rounded-2xl p-4 mb-8 space-y-3.5" id="launcher-key-guide">
              <h2 className="text-xs font-mono text-pink-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>Calibrated Controls (การบังคับปุ่ม)</span>
              </h2>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-300">
                <div className="bg-black/40 border border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2">
                  <div className="bg-slate-800 px-1.5 py-0.5 rounded text-white text-[10px]">W,A,S,D</div>
                  <span>/ Arrows to Move 8-Dirs</span>
                </div>
                <div className="bg-black/40 border border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2">
                  <div className="bg-pink-900/40 text-pink-300 border border-pink-700/50 px-2 py-0.5 rounded text-[10px] font-bold">P Key</div>
                  <span>Punch / Hitbox (Attack Row)</span>
                </div>
                <div className="bg-black/40 border border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2 col-span-2">
                  <div className="bg-cyan-950 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded text-[10px] font-bold">O Key</div>
                  <span>Power Nova Ring Blast (Expanding Wave)</span>
                </div>
              </div>

              {/* Texture notification */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-purple-950/60">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ground Texture (ground.png tiling) Loaded</span>
                </span>
                <span className="text-cyan-400 font-bold">Size 50x50</span>
              </div>
            </div>

            {/* Launch actions */}
            <div className="w-full space-y-3 max-w-sm" id="splash-buttons">
              <button 
                onClick={handleStartGame}
                className="group relative w-full bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-white font-black text-lg py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-pink-500/10 hover:shadow-cyan-500/25 flex items-center justify-center gap-2.5 cursor-pointer transform active:scale-98"
              >
                <Play className="w-5 h-5 fill-white text-white" />
                <span>START 3D ADVENTURE</span>
                <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={resetHighScores}
                className="w-full bg-slate-900/40 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800/60 hover:border-pink-500/40 py-2.5 px-6 rounded-xl text-xs font-mono transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Local High Scores</span>
              </button>
            </div>

            {/* Highscore bottom display */}
            <div className="mt-8 pt-4 border-t border-slate-900 w-full flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>HIGH SCORE: {highScore}</span>
              </span>
              <span>Web Audio Synth v1.4</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEWPORT 2: THREEJS FULL SCREEN ACTIVE PLAY AREA */}
      {view === 'game' && (
        <div className="relative flex-1 w-full h-full" id="game-stage">
          {/* Main 3D WebGL Canvas viewport */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0" id="three-webgl-canvas"></canvas>

          {/* BACK TO LAUNCHER BUTTON */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <button 
              onClick={() => {
                gameRunning.current = false;
                setView('launcher');
                sfx.playPunch();
              }}
              className="bg-black/75 backdrop-blur-md border border-slate-800 hover:border-pink-500 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-mono transition flex items-center gap-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>RETURN TO MENU</span>
            </button>

            <button 
              onClick={() => setMusicMuted(p => !p)}
              className="bg-black/75 backdrop-blur-md border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-white p-2.5 rounded-xl transition flex items-center cursor-pointer"
              title="Mute synth soundtrack"
            >
              {musicMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>

          {/* REALTIME ARCADE HEADS UP DISPLAY (HUD) */}
          <div className="absolute top-4 right-4 z-10 space-y-2.5 max-w-xs w-full pointer-events-none" id="arcade-hud">
            {/* Main Stats score card */}
            <div className="bg-black/75 backdrop-blur-md border border-purple-950 rounded-2xl p-4 space-y-3 shadow-lg text-left">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-purple-950 pb-2">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>ACTIVE CYBERSPACE</span>
                </span>
                <span className="text-pink-400 font-bold uppercase">{playerStateText}</span>
              </div>

              {/* Player Life Indicator */}
              <div className="flex flex-col gap-1.5 border-b border-purple-950/50 pb-2.5">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>PLAYER SHIELD HP</span>
                  <span className="text-emerald-400 font-bold">{playerHp} / 5</span>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded transition-all duration-300 ${
                        i < playerHp
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                          : 'bg-slate-800 border border-slate-700/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Anomaly Telemetry Kills Tracker */}
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-purple-950/50 pb-2.5">
                <span>ANOMALY TELEMETRY</span>
                <span className={`${defeatedCount >= 10 ? 'text-purple-400 animate-pulse font-black' : 'text-cyan-400 font-bold'}`}>
                  {defeatedCount >= 10 ? '⚡ ANOMALY DETECTED' : `${defeatedCount} / 10 KILLS`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase text-left">SCORE POINTS</div>
                  <div className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 text-left">
                    {score.toLocaleString()}
                  </div>
                </div>

                {combo > 0 && (
                  <div className="bg-pink-950/40 text-pink-400 border border-pink-500/35 px-2.5 py-1 rounded-lg text-xs font-black font-mono animate-bounce">
                    x{combo} COMBO
                  </div>
                )}
              </div>

              {/* High score display */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-b border-purple-950/50 pb-2.5">
                <span>Personal Best:</span>
                <span className="text-amber-400 font-bold">{highScore.toLocaleString()}</span>
              </div>

              {/* Powerups & Safe Zone UI Inventory */}
              <div className="space-y-2">
                {inSafeZone && (
                  <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/35 px-2 py-0.5 rounded-lg text-[9px] font-bold font-mono animate-pulse flex items-center justify-center gap-1">
                    🛡️ SAFE ZONE ACTIVE (IMMUNE)
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <div className="text-[9px] font-mono text-slate-500 uppercase text-left">CYBER EQUIPMENT</div>
                  <div className="flex gap-2">
                    <div className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[9px] font-mono font-bold border transition-colors ${equippedSword ? 'bg-cyan-950/30 border-cyan-500/45 text-cyan-400 font-black shadow-[0_0_4px_rgba(6,182,212,0.15)] animate-pulse' : 'bg-slate-950/30 border-slate-900 text-slate-600'}`}>
                      <span>🗡️ SWORD</span>
                    </div>
                    <div className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[9px] font-mono font-bold border transition-colors ${equippedArmor ? 'bg-amber-950/30 border-amber-500/45 text-amber-400 font-black shadow-[0_0_4px_rgba(245,158,11,0.15)] animate-pulse' : 'bg-slate-950/30 border-slate-900 text-slate-600'}`}>
                      <span>🛡️ ARMOR</span>
                    </div>
                    <div className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[9px] font-mono font-bold border transition-colors ${equippedBoots ? 'bg-emerald-950/30 border-emerald-500/45 text-emerald-400 font-black shadow-[0_0_4px_rgba(16,185,129,0.15)] animate-pulse' : 'bg-slate-950/30 border-slate-900 text-slate-600'}`}>
                      <span>🥾 BOOTS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION REAL-TIME FEEDS */}
            <div className="bg-black/60 backdrop-blur-sm border border-slate-900 rounded-xl p-3 space-y-1">
              <span className="text-[9px] font-mono text-cyan-400/80 block uppercase tracking-widest">CYBERNETICS FEED LOG</span>
              <div className="space-y-1 font-mono text-[10px]">
                {activeActionLog.map((log, index) => (
                  <div key={index} className={`truncate ${index === 0 ? 'text-white font-bold' : 'text-slate-500'}`}>
                    &gt; {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* INTERACTIVE CONTROLS OVERLAY: WASD GADGET */}
          <div className="absolute bottom-4 left-4 z-10 pointer-events-none bg-black/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 max-w-xs" id="virtual-controls-hud">
            <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">REALTIME KEYBOARD CALIBRATOR</span>
            
            <div className="flex items-center gap-6">
              {/* Keyboard WASD Block Visualizer */}
              <div className="grid grid-cols-3 gap-1.5 w-28">
                <div></div>
                <div className={`aspect-square flex items-center justify-center border rounded font-mono text-[11px] transition-all ${
                  keyboardState['w'] || keyboardState['ArrowUp']
                    ? 'bg-cyan-500 text-black border-cyan-400 font-bold scale-95 shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}>W</div>
                <div></div>

                <div className={`aspect-square flex items-center justify-center border rounded font-mono text-[11px] transition-all ${
                  keyboardState['a'] || keyboardState['ArrowLeft']
                    ? 'bg-cyan-500 text-black border-cyan-400 font-bold scale-95 shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}>A</div>
                <div className={`aspect-square flex items-center justify-center border rounded font-mono text-[11px] transition-all ${
                  keyboardState['s'] || keyboardState['ArrowDown']
                    ? 'bg-cyan-500 text-black border-cyan-400 font-bold scale-95 shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}>S</div>
                <div className={`aspect-square flex items-center justify-center border rounded font-mono text-[11px] transition-all ${
                  keyboardState['d'] || keyboardState['ArrowRight']
                    ? 'bg-cyan-500 text-black border-cyan-400 font-bold scale-95 shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}>D</div>
              </div>

              {/* Action Buttons Block Visualizer */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 flex items-center justify-center border rounded font-mono text-xs transition-all ${
                    keyboardState['p']
                      ? 'bg-pink-500 text-white border-pink-400 font-bold scale-90 shadow-[0_0_8px_rgba(236,72,153,0.5)]'
                      : 'bg-slate-900/60 border-slate-800 text-pink-400'
                  }`}>P</div>
                  <span className="text-[10px] text-slate-400 font-mono">PUNCH ATTACK</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 flex items-center justify-center border rounded font-mono text-xs transition-all ${
                    keyboardState['o']
                      ? 'bg-purple-600 text-white border-purple-400 font-bold scale-90 shadow-[0_0_8px_rgba(147,51,234,0.5)]'
                      : 'bg-slate-900/60 border-slate-800 text-purple-400'
                  }`}>O</div>
                  <span className="text-[10px] text-slate-400 font-mono">NOVA RING</span>
                </div>
              </div>
            </div>
          </div>

          {/* ONSCREEN TOUCH CONTROLLER FOR MOBILE DEVICES OR EASY TESTING */}
          <div className="absolute bottom-4 right-4 z-10 flex gap-4 pointer-events-auto" id="virtual-gamepad-panel">
            {/* Directional pad */}
            <div className="bg-black/75 backdrop-blur-md border border-slate-800 p-3 rounded-2xl flex flex-col items-center gap-1.5 shadow-2xl">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest text-center">MOVE D-PAD</span>
              <div className="grid grid-cols-3 gap-1">
                <div></div>
                <button 
                  onMouseDown={() => pressVirtualKey('w')}
                  onMouseUp={() => releaseVirtualKey('w')}
                  onMouseLeave={() => releaseVirtualKey('w')}
                  onTouchStart={(e) => { e.preventDefault(); pressVirtualKey('w'); }}
                  onTouchEnd={(e) => { e.preventDefault(); releaseVirtualKey('w'); }}
                  className="w-10 h-10 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 active:bg-cyan-500 active:text-black rounded-lg text-xs font-bold text-cyan-300 transition-colors flex items-center justify-center cursor-pointer select-none"
                >
                  ▲
                </button>
                <div></div>

                <button 
                  onMouseDown={() => pressVirtualKey('a')}
                  onMouseUp={() => releaseVirtualKey('a')}
                  onMouseLeave={() => releaseVirtualKey('a')}
                  onTouchStart={(e) => { e.preventDefault(); pressVirtualKey('a'); }}
                  onTouchEnd={(e) => { e.preventDefault(); releaseVirtualKey('a'); }}
                  className="w-10 h-10 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 active:bg-cyan-500 active:text-black rounded-lg text-xs font-bold text-cyan-300 transition-colors flex items-center justify-center cursor-pointer select-none"
                >
                  ◀
                </button>
                <div className="w-10 h-10 flex items-center justify-center text-slate-600 text-xs">◆</div>
                <button 
                  onMouseDown={() => pressVirtualKey('d')}
                  onMouseUp={() => releaseVirtualKey('d')}
                  onMouseLeave={() => releaseVirtualKey('d')}
                  onTouchStart={(e) => { e.preventDefault(); pressVirtualKey('d'); }}
                  onTouchEnd={(e) => { e.preventDefault(); releaseVirtualKey('d'); }}
                  className="w-10 h-10 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 active:bg-cyan-500 active:text-black rounded-lg text-xs font-bold text-cyan-300 transition-colors flex items-center justify-center cursor-pointer select-none"
                >
                  ▶
                </button>

                <div></div>
                <button 
                  onMouseDown={() => pressVirtualKey('s')}
                  onMouseUp={() => releaseVirtualKey('s')}
                  onMouseLeave={() => releaseVirtualKey('s')}
                  onTouchStart={(e) => { e.preventDefault(); pressVirtualKey('s'); }}
                  onTouchEnd={(e) => { e.preventDefault(); releaseVirtualKey('s'); }}
                  className="w-10 h-10 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 active:bg-cyan-500 active:text-black rounded-lg text-xs font-bold text-cyan-300 transition-colors flex items-center justify-center cursor-pointer select-none"
                >
                  ▼
                </button>
                <div></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-black/75 backdrop-blur-md border border-slate-800 p-3 rounded-2xl flex flex-col items-center gap-1.5 justify-center shadow-2xl w-28">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">ACTIONS</span>
              
              <div className="flex flex-col gap-1.5 w-full">
                <button 
                  onMouseDown={() => pressVirtualKey('p')}
                  onMouseUp={() => releaseVirtualKey('p')}
                  onTouchStart={(e) => { e.preventDefault(); pressVirtualKey('p'); }}
                  onTouchEnd={(e) => { e.preventDefault(); releaseVirtualKey('p'); }}
                  className="w-full h-10 bg-pink-900/30 hover:bg-pink-900/50 border border-pink-700/50 active:bg-pink-500 active:text-white rounded-xl text-xs font-bold text-pink-400 transition-all flex items-center justify-center gap-1 cursor-pointer select-none uppercase tracking-wide"
                >
                  <span className="bg-pink-500/20 px-1.5 rounded text-[10px]">P</span> Punch
                </button>

                <button 
                  onMouseDown={() => pressVirtualKey('o')}
                  onMouseUp={() => releaseVirtualKey('o')}
                  onTouchStart={(e) => { e.preventDefault(); pressVirtualKey('o'); }}
                  onTouchEnd={(e) => { e.preventDefault(); releaseVirtualKey('o'); }}
                  className="w-full h-10 bg-purple-950/40 hover:bg-purple-900/40 border border-purple-700/50 active:bg-purple-600 active:text-white rounded-xl text-xs font-bold text-purple-300 transition-all flex items-center justify-center gap-1 cursor-pointer select-none uppercase tracking-wide"
                >
                  <span className="bg-purple-500/20 px-1.5 rounded text-[10px]">O</span> Nova
                </button>
              </div>
            </div>
          </div>

          {/* GAME OVER DIALOG POPUP */}
          {isGameOver && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4" id="game-over-screen">
              <div className="w-full max-w-md bg-slate-950 border border-red-500/40 rounded-3xl p-8 flex flex-col items-center shadow-2xl shadow-red-500/10 text-center relative">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-pink-600 to-amber-500 rounded-t-3xl"></div>
                
                <div className="w-16 h-16 bg-red-950/40 text-red-500 border border-red-500/30 rounded-full flex items-center justify-center mb-4 text-3xl animate-pulse">
                  ☠️
                </div>

                <h2 className="text-3xl font-black font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-amber-400 uppercase mb-2">
                  GAME OVER
                </h2>
                <p className="text-xs text-slate-400 font-mono tracking-widest uppercase mb-6">
                  YOUR SHIELD IS COMPLETELY DEPLETED
                </p>

                <div className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 mb-6 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">FINAL SCORE:</span>
                    <span className="text-pink-400 font-bold text-lg">{score.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">HIGH SCORE:</span>
                    <span className="text-amber-400 font-bold text-lg">{highScore.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleStartGame}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-black py-4 px-6 rounded-2xl shadow-lg transition-transform hover:scale-102 cursor-pointer active:scale-98 font-mono tracking-wider uppercase"
                >
                  RETRY SIMULATION
                </button>
              </div>
            </div>
          )}

          {/* EPIC BOSS HEALTH BAR AT TOP CENTER */}
          {bossActive && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-md bg-black/85 backdrop-blur-md border border-purple-900/50 px-4 py-3 rounded-2xl flex flex-col gap-1.5 shadow-2xl pointer-events-none animate-fade-in" id="boss-hp-bar">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-purple-400 font-bold uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  CYBER ANOMALY (BOSS)
                </span>
                <span className="text-red-400 font-bold">{bossHp} / {bossMaxHp} HP</span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-purple-950/50 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 via-purple-600 to-pink-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                  style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* ENDING VICTORY SEQUENCE SCREEN */}
          {isEnding && (
            <div className="absolute inset-0 z-50 bg-slate-950/98 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-fade-in" id="ending-screen">
              {endingStep === 'dialogue' ? (
                /* RPG DIALOGUE INTERACTIVE SEQUENCE */
                <div className="w-full max-w-2xl bg-slate-900/90 border-2 border-cyan-500/30 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl shadow-cyan-500/10 min-h-[460px] relative overflow-hidden" id="dialogue-container">
                  {/* Decorative cyberpunk grid */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:24px_24px] opacity-15 pointer-events-none"></div>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"></div>

                  {/* Cutscene Stage Area (Sprites standing left and right) */}
                  <div className="flex-1 flex items-end justify-between px-4 md:px-12 py-6 relative min-h-[180px] border-b border-slate-800/80 mb-6" id="cutscene-stage">
                    {/* LEFT SPEAKER: PLAYER HERO */}
                    <div 
                      className={`flex flex-col items-center transition-all duration-300 ${
                        endingDialogue[dialogueIndex].avatar === 'player' 
                          ? 'scale-110 opacity-100 filter-none drop-shadow-[0_0_12px_rgba(236,72,153,0.4)]' 
                          : 'scale-90 opacity-40 blur-[0.5px]'
                      }`}
                    >
                      {/* Live cycling player sprite */}
                      <div 
                        className="w-24 h-24 md:w-28 md:h-28 transition-transform duration-300"
                        style={{
                          backgroundImage: 'url("https://raw.githubusercontent.com/banyapon/banyapon.github.io/refs/heads/main/studio/images/player.png")',
                          backgroundSize: '400% 400%',
                          backgroundPositionX: `-${(npcFrame % 4) * 100}%`,
                          backgroundPositionY: `-${(endingDialogue[dialogueIndex].avatar === 'player' ? endingDialogue[dialogueIndex].row : 0) * 100}%`,
                          imageRendering: 'pixelated'
                        }}
                      />
                      <span className="text-[10px] font-mono font-bold tracking-widest text-pink-400 bg-pink-950/40 border border-pink-500/20 px-2 py-0.5 rounded mt-2">
                        YOU (HERO)
                      </span>
                    </div>

                    {/* NPC WALKS / APPROACHES FROM RIGHT */}
                    <div 
                      className={`flex flex-col items-center transition-all duration-1000 ${
                        npcWalkedIn ? 'translate-x-0 opacity-100' : 'translate-x-[150px] opacity-0'
                      } ${
                        endingDialogue[dialogueIndex].avatar === 'npc' 
                          ? 'scale-110 opacity-100 filter-none drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]' 
                          : 'scale-90 opacity-40 blur-[0.5px]'
                      }`}
                    >
                      {/* Live cycling npc sprite */}
                      <div 
                        className="w-24 h-24 md:w-28 md:h-28 transition-transform duration-300"
                        style={{
                          backgroundImage: 'url("https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/npc1_pdraha.png")',
                          backgroundSize: '400% 200%',
                          backgroundPositionX: `-${(npcFrame % 4) * 100}%`,
                          backgroundPositionY: `-${(endingDialogue[dialogueIndex].avatar === 'npc' ? endingDialogue[dialogueIndex].row : 0) * 100}%`,
                          imageRendering: 'pixelated'
                        }}
                      />
                      <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded mt-2">
                        OPERATOR (NPC)
                      </span>
                    </div>
                  </div>

                  {/* Dialogue Box Area */}
                  <div 
                    onClick={() => {
                      if (dialogueIndex < endingDialogue.length - 1) {
                        setDialogueIndex(prev => prev + 1);
                        sfx.playMove();
                      } else {
                        setEndingStep('finish');
                        sfx.playDance();
                      }
                    }}
                    className="bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-5 md:p-6 text-left cursor-pointer hover:border-cyan-400/50 transition-colors relative"
                    id="dialogue-box"
                  >
                    <div className="flex justify-between items-center mb-2.5">
                      <span className={`text-xs font-black font-mono tracking-widest uppercase ${endingDialogue[dialogueIndex].speakerColor}`}>
                        {endingDialogue[dialogueIndex].speaker}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        PHASE {dialogueIndex + 1} / {endingDialogue.length}
                      </span>
                    </div>
                    <p className="text-slate-200 text-sm md:text-base font-mono leading-relaxed min-h-[60px]">
                      {endingDialogue[dialogueIndex].text}
                    </p>
                    <div className="flex justify-between items-center mt-4 text-[10px] font-mono text-slate-500">
                      <span>[CLICK TO CONTINUE]</span>
                      <span className="animate-pulse text-cyan-400 font-bold">NEXT ▶</span>
                    </div>
                  </div>

                  {/* Skip Dialogue Button */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        setEndingStep('finish');
                        sfx.playDance();
                      }}
                      className="text-[10px] font-mono tracking-widest text-slate-500 hover:text-cyan-400 uppercase transition cursor-pointer"
                    >
                      ⚡ SKIP CONVERSATION
                    </button>
                  </div>
                </div>
              ) : (
                /* RPG FINISH / FINAL RESULTS REPORT */
                <div className="w-full max-w-lg bg-slate-950 border border-cyan-400/40 rounded-3xl p-8 flex flex-col items-center shadow-2xl shadow-cyan-500/10 text-center relative overflow-hidden animate-scale-up">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-purple-600 to-pink-500 rounded-t-3xl"></div>
                  
                  {/* Visual particles / ambient lights */}
                  <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px]"></div>
                  <div className="absolute bottom-[-50px] right-[-50px] w-48 h-48 bg-pink-500/10 rounded-full blur-[80px]"></div>

                  <div className="w-20 h-20 bg-cyan-950/40 text-cyan-400 border border-cyan-400/30 rounded-full flex items-center justify-center mb-6 text-4xl animate-bounce">
                    🏆
                  </div>

                  <h2 className="text-3xl font-black font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 uppercase mb-3 animate-pulse">
                    SIMULATION COMPLETE
                  </h2>
                  <p className="text-xs text-cyan-300 font-mono tracking-widest uppercase mb-6 bg-cyan-950/60 px-4 py-1.5 rounded-full border border-cyan-800/40">
                    SYSTEM STATUS: RETRO UNIVERSE SAVED
                  </p>

                  <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-8 text-left space-y-4 font-mono text-xs text-slate-300">
                    <div className="text-pink-400 border-b border-slate-800/80 pb-2 flex justify-between font-bold">
                      <span>WARP STATE:</span>
                      <span className="text-cyan-400">SUCCESS</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">CYBER ANOMALY (BOSS):</span>
                      <span className="text-emerald-400 font-bold uppercase">PURGED</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">CYBER ENEMIES DESTROYED:</span>
                      <span className="text-cyan-400 font-bold">{defeatedCount} UNITS</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">FINAL SIMULATION SCORE:</span>
                      <span className="text-pink-400 font-bold text-base">{score.toLocaleString()} PTS</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-800/60 pt-3">
                      <span className="text-slate-400">PERSONAL BEST:</span>
                      <span className="text-amber-400 font-bold text-base">{highScore.toLocaleString()} PTS</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full">
                    <button
                      onClick={handleStartGame}
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black py-4 px-6 rounded-2xl shadow-lg transition-all hover:scale-102 cursor-pointer active:scale-98 font-mono tracking-wider uppercase"
                    >
                      PLAY AGAIN
                    </button>

                    <button
                      onClick={() => {
                        gameRunning.current = false;
                        setView('launcher');
                        sfx.playPunch();
                      }}
                      className="w-full bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800 py-2.5 rounded-xl text-xs font-mono transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      RETURN TO TITLE
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
