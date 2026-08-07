/**
 * 音频播放引擎
 * 全局唯一 Audio 对象，支持播放、停止、跳转
 */

// 全局唯一 Audio 实例
let audio = null

// 模块级监听器引用（用于 stop 时移除）
let canPlayHandler = null

// timeupdate 回调列表
let timeUpdateCallbacks = []
let timeUpdateHandler = null

// 用户注册的 ended 回调列表
let endedCallbacks = []

/**
 * 获取全局唯一的 Audio 对象
 * @returns {HTMLAudioElement} Audio 实例
 */
function getAudio() {
  // 若实例不存在则创建
  if (!audio) {
    audio = new Audio()
    audio.preload = 'auto'
  }
  return audio
}

/**
 * 播放指定音频片段
 * 先停止旧播放，再设置新 src，定位到 startTime 毫秒处播放
 * @param {string} audioUrl - 音频文件地址
 * @param {number} startTime - 开始播放的时间位置（毫秒）
 */
export function playSegment(audioUrl, startTime = 0) {
  const player = getAudio()

  // 先停止旧播放
  stop()

  // 设置新的音频源
  player.src = audioUrl

  // 音频就绪后跳转到指定时间并播放
  canPlayHandler = () => {
    player.currentTime = startTime / 1000
    player.play().catch((err) => {
      console.warn('播放失败:', err)
    })
    // 注册 timeupdate 监听
    ensureTimeUpdateHandler()
  }

  player.addEventListener('canplay', canPlayHandler, { once: true })
}

/**
 * 确保 timeupdate 事件处理器已注册
 */
function ensureTimeUpdateHandler() {
  if (!timeUpdateHandler && audio) {
    timeUpdateHandler = () => {
      // 将当前时间（毫秒）传递给所有回调
      const currentTimeMs = audio.currentTime * 1000
      timeUpdateCallbacks.forEach((cb) => {
        try {
          cb(currentTimeMs)
        } catch (e) {
          console.error('timeupdate callback error:', e)
        }
      })
    }
    audio.addEventListener('timeupdate', timeUpdateHandler)
  }
}

/**
 * 确保 ended 事件处理器已注册（用于通知用户注册的回调）
 */
function ensureEndedHandler() {
  if (!audio) return
  const handler = () => {
    // 通知所有注册的 ended 回调
    endedCallbacks.forEach((cb) => {
      try {
        cb()
      } catch (e) {
        console.error('ended callback error:', e)
      }
    })
  }
  audio.addEventListener('ended', handler)
  // 保存为全局引用以便清理
  audio._endedInternalHandler = handler
}

/**
 * 停止当前播放并释放资源
 */
export function stop() {
  if (audio) {
    // 移除已注册的监听器
    if (canPlayHandler) {
      audio.removeEventListener('canplay', canPlayHandler)
      canPlayHandler = null
    }
    // 移除 timeupdate 监听
    if (timeUpdateHandler) {
      audio.removeEventListener('timeupdate', timeUpdateHandler)
      timeUpdateHandler = null
    }
    // 移除内部 ended 处理器
    if (audio._endedInternalHandler) {
      audio.removeEventListener('ended', audio._endedInternalHandler)
      audio._endedInternalHandler = null
    }
    audio.pause()
    audio.currentTime = 0
    audio.removeAttribute('src')
    audio.load()
  }
}

/**
 * 暂停播放
 */
export function pause() {
  if (audio) {
    audio.pause()
  }
}

/**
 * 恢复播放
 */
export function resume() {
  if (audio) {
    audio.play().catch((err) => {
      console.warn('恢复播放失败:', err)
    })
  }
}

/**
 * 跳转到指定时间位置
 * @param {number} time - 目标时间（毫秒）
 */
export function seekTo(time) {
  if (audio) {
    audio.currentTime = time / 1000
  }
}

/**
 * 获取当前播放时间（毫秒）
 * @returns {number} 当前播放位置
 */
export function getCurrentTime() {
  return audio ? audio.currentTime * 1000 : 0
}

/**
 * 获取音频总时长（毫秒）
 * @returns {number} 音频总时长
 */
export function getDuration() {
  return audio ? audio.duration * 1000 : 0
}

/**
 * 设置播放倍速
 * @param {number} rate - 播放倍速（如 1.0、0.5、1.5）
 */
export function setPlaybackRate(rate) {
  if (audio) {
    audio.playbackRate = rate
  }
}

/**
 * 注册播放结束回调
 * @param {Function} callback - 播放结束时的回调函数
 */
export function onEnded(callback) {
  if (typeof callback === 'function') {
    endedCallbacks.push(callback)
    // 确保内部 ended 处理器已注册
    ensureEndedHandler()
  }
}

/**
 * 移除指定的播放结束回调
 * @param {Function} callback - 要移除的回调函数引用；若不传则清空所有回调
 */
export function offEnded(callback) {
  if (callback) {
    endedCallbacks = endedCallbacks.filter((cb) => cb !== callback)
  } else {
    endedCallbacks = []
  }
  // 如果没有任何回调了，移除内部处理器
  if (endedCallbacks.length === 0 && audio && audio._endedInternalHandler) {
    audio.removeEventListener('ended', audio._endedInternalHandler)
    audio._endedInternalHandler = null
  }
}

/**
 * 注册 timeupdate 回调
 * @param {Function} callback - 回调函数，接收当前播放时间（毫秒）作为参数
 */
export function onTimeUpdate(callback) {
  if (typeof callback === 'function') {
    timeUpdateCallbacks.push(callback)
  }
}

/**
 * 移除指定的 timeupdate 回调
 * @param {Function} callback - 要移除的回调函数引用；若不传则清空所有回调
 */
export function offTimeUpdate(callback) {
  if (callback) {
    timeUpdateCallbacks = timeUpdateCallbacks.filter((cb) => cb !== callback)
  } else {
    timeUpdateCallbacks = []
  }
}
