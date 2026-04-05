/**
 * MindEase — face-api.js Singleton Loader
 * Loads models from working CDN directory exactly once per session.
 * Uses window.faceapi which is injected by the CDN script in index.html.
 */

const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models'

let _loaded = false
let _loading = false
let _promise = null

/** Map from face-api expression labels to our app labels */
export const FACE_EMOTION_MAP = {
  happy:     'happy',
  sad:       'sad',
  angry:     'angry',
  fearful:   'anxious',
  disgusted: 'angry',
  surprised: 'neutral',
  neutral:   'neutral',
}

/**
 * Load TinyFaceDetector + FaceExpressionNet once.
 * Subsequent calls return immediately.
 */
export const loadFaceApiModels = () => {
  if (_loaded) return Promise.resolve()
  if (_loading) return _promise

  _loading = true
  _promise = new Promise(async (resolve, reject) => {
    // Wait for the CDN script to finish injecting window.faceapi
    let attempts = 0
    while (!window.faceapi && attempts < 30) {
      await new Promise(r => setTimeout(r, 200))
      attempts++
    }
    if (!window.faceapi) {
      reject(new Error('face-api.js CDN script did not load. Check your internet connection.'))
      return
    }

    try {
      const faceapi = window.faceapi
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ])
      _loaded = true
      resolve()
    } catch (err) {
      _loading = false
      reject(err)
    }
  })

  return _promise
}

/**
 * Get the dominant expression from a face-api detections object.
 * Returns { emotion, score, rawLabel } or null if no face found.
 */
export const extractDominantEmotion = (detection) => {
  if (!detection?.expressions) return null
  const expressions = detection.expressions
  const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1])
  const [rawLabel, score] = sorted[0]
  return {
    emotion: FACE_EMOTION_MAP[rawLabel] ?? 'neutral',
    score: Math.round(score * 100) / 100,
    rawLabel,
  }
}
