// صداهای کوچک ساخته‌شده با Web Audio API — بدون نیاز به هیچ فایل صوتی
let audioCtx = null

export const soundSettings = { muted: false }

function getCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext
    audioCtx = new AC()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

function tone({ freq, slideTo = null, type = 'sine', duration = 0.15, volume = 0.18, delay = 0 }) {
  if (soundSettings.muted) return
  try {
    const ctx = getCtx()
    const start = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, start)
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + duration + 0.05)
  } catch {
    // اگر مرورگر پخش صدا را مسدود کند، اپ نباید خطا بدهد
  }
}

export const sounds = {
  // افزودن: آرپژ شاد بالارونده (دو–می–سُل)
  add() {
    tone({ freq: 523.25, duration: 0.12 })
    tone({ freq: 659.25, duration: 0.12, delay: 0.09 })
    tone({ freq: 783.99, duration: 0.22, delay: 0.18 })
  },

  // حذف: سُرد پایین‌رونده
  delete() {
    tone({ freq: 420, slideTo: 140, type: 'sawtooth', duration: 0.28, volume: 0.12 })
    tone({ freq: 200, slideTo: 90, type: 'sine', duration: 0.2, volume: 0.15, delay: 0.02 })
  },

  // ویرایش: دو بلیپ کوتاه بالارونده
  edit() {
    tone({ freq: 740, type: 'triangle', duration: 0.07 })
    tone({ freq: 988, type: 'triangle', duration: 0.12, delay: 0.08 })
  },

  // تیک زدن / برداشتن تیک
  toggle(done) {
    if (done) {
      tone({ freq: 587.33, type: 'triangle', duration: 0.09, volume: 0.12 })
      tone({ freq: 880, type: 'triangle', duration: 0.14, delay: 0.07, volume: 0.12 })
    } else {
      tone({ freq: 660, slideTo: 440, type: 'triangle', duration: 0.12, volume: 0.12 })
    }
  },
}
