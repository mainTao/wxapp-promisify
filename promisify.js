const Promise = require('./es6-promise').Promise
const defaultMethods = [
  'uploadFile',
  'downloadFile',
  'connectSocket',
  'sendSocketMessage',
  'chooseImage',
  'previewImage',
  'getImageInfo',
  'startRecord',
  'stopRecord',
  'playVoice',
  'getBackgroundAudioPlayerState',
  'playBackgroundAudio',
  'seekBackgroundAudio',
  'chooseVideo',
  'saveFile',
  'getSavedFileList',
  'getSavedFileInfo',
  'removeSavedFile',
  'openDocument',
  'getStorageInfo',
  'getLocation',
  'chooseLocation',
  'openLocation',
  'getSystemInfo',
  'getNetworkType',
  'startAccelerometer',
  'stopAccelerometer',
  'startCompass',
  'stopCompass',
  'makePhoneCall',
  'scanCode',
  'setClipboardData',
  'getClipboardData',
  'openBluetoothAdapter',
  'closeBluetoothAdapter',
  'getBluetoothAdapterState',
  'startBluetoothDevicesDiscovery',
  'stopBluetoothDevicesDiscovery',
  'getBluetoothDevices',
  'getConnectedBluetoothDevices',
  'createBLEConnection',
  'closeBLEConnection',
  'getBLEDeviceServices',
  'getBLEDeviceCharacteristics',
  'readBLECharacteristicValue',
  'writeBLECharacteristicValue',
  'notifyBLECharacteristicValueChange',
  'showToast',
  'showLoading',
  'showModal',
  'showActionSheet',
  'setNavigationBarTitle',
  'navigateTo',
  'redirectTo',
  'switchTab',
  'reLaunch',
  'login',
  'checkSession',
  'getUserInfo',
  'requestPayment',
  'chooseAddress',
  'addCard',
  'openCard',
  'openSetting',
]

function promisify(functionNames) {
  Object.defineProperty(wx, 'Promise', {value: Promise}) // wx.Promise 即 Promise
  Object.defineProperty(wx, 'pro', {value: {}}) // wx.pro 下面挂载着返回 promise 的 wx.API
  // 普通的要转换的函数
  let fnNames = Array.isArray(functionNames) ? functionNames : defaultMethods

  fnNames.forEach(fnName => {
    if(wx.canIUse(fnName)){
      wx.pro[fnName] = (obj = {}) => {
        return new Promise((resolve, reject) => {
          obj.success = function (res) {
            console.debug(`wx.${fnName} success`, res)
            resolve(res)
          }
          obj.fail = function (err) {
            console.debug(`wx.${fnName} fail`, err)
            reject(err)
          }
          wx[fnName](obj)
        })
      }
    }
  })

  // 特殊改造的函数
  wx.pro.getStorage = (key) => {
    return new Promise((resolve, reject) => {
      wx.getStorage({
        key: key,
        success: res => {
          resolve(res.data) // unwrap data
        },
        fail: err => {
          resolve() // not reject, resolve undefined
        }
      })
    })
  }

  wx.pro.setStorage = (key, value) => {
    return new Promise((resolve, reject) => {
      wx.setStorage({
        key: key,
        data: value,
        success: res => {
          resolve(value) // 将数据返回
        },
        fail: err => {
          reject(err)
        }
      })
    })
  }

  wx.pro.removeStorage = (key) => {
    return new Promise((resolve, reject) => {
      wx.removeStorage({
        key: key,
        success: res => {
          resolve(res.data) // unwrap data
        },
        fail: err => {
          reject(err)
        }
      })
    })
  }

  wx.pro.request = options => {
    return new Promise((resolve, reject) => {
      options.success = res => {
        if (res.statusCode >= 400) {
          console.debug('wx.request fail [business]', options, res.statusCode, res.data)
          reject(res)
        }
        else {
          console.debug('wx.request success', options, res.data)
          resolve(res.data) // unwrap data
        }
      }

      options.fail = err => {
        console.debug('wx.request fail [network]', options, err)
        reject(err)
      }

      wx.request(options)
    })
  }
}

module.exports = promisify