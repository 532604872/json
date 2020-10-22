!(function() {
  'use strict'

  const startText = '立即抽奖', // 开始按钮文案
    stopText = '暂停' // 停止按钮文案

  // 除chrome外，其他支持需要在服务器上运行才支持
  if (!window.localStorage) {
    alert('不支持localstorage，抽奖无法启动！')
  }
  // 处理 localstorage 中奖数据
  let local_handle = {
    local_item: 'lottery_datas',
    get(key) {
      let val = window.localStorage.getItem(key)
      if (val) {
        return JSON.parse(val)
      }
      return ''
    },

    set(key, val) {
      window.localStorage.setItem(key, JSON.stringify(val))
    },
    delete(datas, name) {
      let res = []
      datas.forEach((val, index) => {
        if (name != val.nameen) {
          res.push(val)
        }
      })
      let new_datas = JSON.stringify(res)
      this.set(this.local_item, new_datas)
      return res
    },
    clear() {
      window.localStorage.clear()
    }
  }

  // 音乐数据
  let music_config = {
    music: document.getElementById('music'),
    music_bool: false,
    init() {
      if (this.music_bool) {
        this.play()
      } else {
        this.music.pause()
      }
    },
    play() {
      this.music.play()
      $('#musicButton').addClass('open-button')
      this.music_bool = true
    },
    pause() {
      this.music.pause()
      $('#musicButton').removeClass('open-button')
      this.music_bool = false
    }
  }
  music_config.init()

  class Base {
    /**
     * 判断类型
     * @param obj
     * @returns {string|boolean}
     */
    typeof = obj => {
      try {
        let type = Object.prototype.toString.call(obj)
        if (type === '[object Array]') {
          return 'Array'
        } else if (type === '[object Object]') {
          return 'Object'
        } else if (type === '[object Number]') {
          return 'Number'
        } else if (type === '[object String]') {
          return 'String'
        } else if (type === '[object Boolean]') {
          return 'Boolean'
        } else if (type === '[object Function]') {
          return 'Function'
        }
      } catch (e) {
        console.error(e)
      }
      return false
    }

    /**
     * 产生一个随机数
     * @param number
     * @returns {number}
     * Math.ceil(Math.random()*10);     // 获取从 1 到 10 的随机整数，取 0 的概率极小。
     * Math.round(Math.random());       // 可均衡获取 0 到 1 的随机整数。
     * Math.floor(Math.random()*10);    // 可均衡获取 0 到 9 的随机整数。
     * Math.round(Math.random()*10);    // 基本均衡获取 0 到 10 的随机整数，其中获取最小值 0 和最大值 10 的几率少一半。
     */
    random = number => {
      try {
        if (this.typeof(number) === 'Number') {
          return Math.floor(Math.random() * number)
        }
      } catch (e) {
        console.error(e)
      }
      return 0
    }

    /**
     * 随机获取 n 位数
     * @param arr
     * @param count
     * @returns {T[]}
     */
    getRandomArrayElements = (arr, count) => {
      let shuffled = arr.slice(0),
        i = arr.length,
        min = i - count,
        temp, index
      while (i-- > min) {
        index = Math.floor((i + 1) * Math.random())
        temp = shuffled[index]
        shuffled[index] = shuffled[i]
        shuffled[i] = temp
      }
      return shuffled.slice(min)
    }
  }

  class Lottery extends Base {
    constructor(props) {
      super(props)
      this.state = {
        award: null, // 当前奖项
        award_num: 0, // 奖项数量
        file_list: [], // 图片数据
        file_total: 0, // 图片总数

        photo_row: 4, // 行数
        photo_col: 10, // 列数
        photo_num: 0, // 显示总数
        photos: [] // 显示的图片
      }

      // [图片总数] 必须大于 [显示总数]
      this.state.photo_num = this.state.photo_row * this.state.photo_col

      // 奖项对应抽奖数量
      /**
       三等奖。38个三次出 13 13 12

       二等奖：16个，两次出，8、8出

       一等奖：三个，分三次出，一次出一个

       特等奖，一个，一次出
       */
      this.winnerNumber = [[1], [1, 1, 1], [8, 8], [13, 13, 12]]
    }
    /**
      * 设置 state
      * @param obj
      */
    setState = (obj, callback) => {
      if (this.typeof(obj) === 'Object') {
        this.state = Object.assign(this.state, obj)
        callback && this.typeof(callback) === 'Function' && callback()
      }
    }

    /**
     * 获取图片数据
     * @param callback
     */
    fetchPhotoList = (callback) => {
      const { photo_num } = this.state
      const self = this
      let url = './photos.json?v=0.0.5'
      let request = new XMLHttpRequest()
      request.open('get', url)
      request.send(null)
      request.onload = function() {
        if (request.status == 200) {
          let json = JSON.parse(request.responseText)
          let file_list = Object.values(json)
          self.photoPreload(file_list)
          let file_total = file_list.length - 1
          // console.error('图片总数:', file_total) // 图片总数
          self.setState({
            file_list,
            file_total,
            photo_num: file_total < photo_num ? file_total : photo_num // 控制显示图片最大数量
          })
        }

        callback && self.typeof(callback) === 'Function' && callback()
      }
    }

    /**
     * 图片预加载
     * @param fileList
     */
    photoPreload = (fileList, callback) => {
      let promiseAll = fileList.map(item => {
        return new Promise((resolve, reject) => {
          let img = new Image()
          img.onload = function() {
            resolve(img)
          }
          img.error = function() {
            console.error(item)
            reject('图片加载失败')
          }
          img.src = item.url.replace(/^\//, '')
        })
      })

      // 图片 预加载
      Promise.all(promiseAll).then(() => {
        callback && self.typeof(callback) === 'Function' && callback()
        console.log('图片加载完毕')
      }, (err) => {
        console.log(err)
      })
    }

    /**
     * 更新图片数据
     * @param award
     * @param winners
     */
    updatePhotoList = (award, winners) => {
      if (award !== null && winners && winners.length) {
        const { photo_num, file_list } = this.state

        // 用过滤的方式得到新图片数据
        let fileList = file_list.filter((item, index) => !winners.includes(index))

        let file_total = fileList.length - 1
        // 更新state
        this.setState({
          file_list: fileList,
          file_total,
          photo_num: file_total < photo_num ? file_total : photo_num // 控制显示图片最大数量
        })
      }
    }

    /**
     * 保存中奖者信息
     * @param award
     * @param winners
     */
    saveWinnerInfo = (award, winners) => {
      if (award !== null && winners && winners.length) {
        // 获取本地中奖信息
        let winnerName = `award_${award}`
        let winnerInfo = local_handle.get(winnerName) || []

        // 把中奖者信息保存在本地
        local_handle.set(winnerName, winnerInfo.concat(winners))
      }
    }

    /**
     * 获取随机图片(下标)
     * @returns {Array}
     */
    getRandomPhoto = () => {
      try {
        const { file_total, photos } = this.state
        let index = this.random(file_total)

        if (photos.includes(index)) { // 包含控制
          return this.getRandomPhoto() // 重新获取
        } else {
          return index
        }
      } catch (e) {
        console.error(e)
        return 0
      }
    }

    /**
     * 获取显示图片数据(下标)
     * @returns {Array}
     */
    getPhotoData = () => {
      const { photo_num } = this.state

      try {
        let list = []
        for (let i = 1; i <= photo_num; i++) {
          list.push(this.getRandomPhoto())
          this.setState({
            photos: list
          })
        }
      } catch (e) {
        console.error(e)
      }
    }

    /**
     * 获取显示图片
     * @param index
     * @returns {void | string | never|string}
     */
    getPhoto = (index) => {
      const { file_list } = this.state

      try {
        if (index !== undefined) {
          let photoInfo = file_list[index]
          let photo = photoInfo.url.replace(/^\//, '')
          return photo
        }
      } catch (e) {
        console.error(e)
      }
      return ''
    }

    /**
     * 渲染
     */
    render = () => {
      const { photos, photo_num, file_total } = this.state
      let loadedIndex = 1
      // 图片渲染
      console.log('初始化图片', photos)
      $.each(photos, (index, photo) => {
        /* 此方式会将图片一并输出*/
        let link = document.createElement('a'),
          li = document.createElement('li')

        link.href = 'javascript:;'
        link.style.backgroundImage = `url('${this.getPhoto(photo)}')`
        li.appendChild(link)

        $('#gallery')[0].appendChild(li)

        setTimeout(() => {
          $(li).addClass('loaded')
        }, 10 * loadedIndex++)
      })

      if (photo_num < file_total) { // 执行动画条件
        this.animatedBounce()
      } else {
        alert('[图片总数] 必须大于 [显示总数]')
      }
    }

    /**
     * 重新渲染
     */
    reRender = () => {
      if (this.timer_small_slow) { // 停止切换图片
        clearInterval(this.timer_small_slow)
      }
      if (this.timer_fast) { // 停止快速切换图片
        clearInterval(this.timer_fast)
      }
      $('#action').data('action', 'start').html(startText)

      this.clearStyle()

      if (!this.state.photos.length) {
        return false
      }

      // 图片重新渲染
      this.setState({
        photos: []
      })
      this.getPhotoData()
      const { photos, photo_num, file_total } = this.state
      let loadedIndex = 1

      // 图片渲染
      // console.log('重新渲染图片', photos)

      $('#gallery li').each((index, item) => {
        $(item).removeClass('loaded')
        let photo = photos[index]
        if (photo === undefined) {
          $(item).remove() // 缺少图片删除
        } else {
          $(item)
            .removeClass('animated bounce')
            .find('a')
            .attr('style', `background-image: url('${this.getPhoto(photo)}')`)
        }

        setTimeout(() => {
          $(item).addClass('loaded')
        }, 25 * loadedIndex++)
      })

      if (photo_num < file_total) { // 执行动画条件
        this.animatedBounce()
      } else {
        alert('[图片总数] 必须大于 [显示总数]')
      }
    }

    /**
     * 开启切换图片
     */
    animatedBounce = () => {
      const {
        photo_num,
        photos
      } = this.state

      let self = this
      self.timer_small_slow = setInterval(() => {
        try {
          let rendomLi = self.random(photo_num)
          $(`#gallery li:eq(${rendomLi})`)
            .addClass('animated bounce')
            .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
              let photo = self.getRandomPhoto() // 随机图片下标
              photos[rendomLi] = photo // 替换图片下标
              self.setState({
                photos
              })
              $(this)
                .removeClass('animated bounce')
                .find('a')
                .attr('style', `background-image: url('${self.getPhoto(photo)}')`)
            })
        } catch (e) {
          console.error(e)
        }
      }, 50)
    }

    /**
     * 添加操作事件
     */
    event = () => {
      let self = this

      // 按钮控制器
      $(document).keypress((event) => {
        if (event.target.id !== 'wardNumber') {
          console.error(event.which)
          switch (event.which) {
            case 13: // [enter | 回车键]
            case 32: // [spacing | 空格键]
              // 控制开始和停止
              $('#action').click()
              break
            case 48: // [0键] - 重新渲染
              console.error('0键')
              self.reRender()
              break
            case 49: // [1键] - 一等奖
              console.error('1键')
              self.setWinner('1')
              break
            case 50: // [2键] - 二等奖
              console.error('2键')
              self.setWinner('2')
              break
            case 51: // [3键] - 三等奖
              console.error('3键')
              self.setWinner('3')
              break
            case 52: // [4键] - 特等奖
              console.error('4键')
              self.setWinner('0')
              break
            case 53: // [5键]
              console.error('5键')
              break
            case 54: // [6键]
              console.error('6键')
              break
            case 55: // [7键]
              console.error('7键')
              break
            case 56: // [8键] - 音乐开关
              console.error('8键')
              if (music_config.music_bool) {
                music_config.pause()
              } else {
                music_config.play()
              }
              break
            case 57: // [9键]
              console.error('9键')
              self.setState({award: null})
              break
            default:
              return false
          }
        }
      })

      $('#action').click(function() {
        if (self.timer_small_slow) { // 停止切换图片
          clearInterval(self.timer_small_slow)
        }
        if ($(this).data('action') == 'start') { // 开始
          self.clearWinner()
          let { photos, photo_num, file_total } = self.state

          if (!photos.length) {
            alert('没有抽奖候选人')
            return false
          }
          $(this).data('action', 'stop').html(stopText)
          if (photo_num < file_total) { // 执行动画条件
            if (self.timer_fast) { // 停止快速切换图片
              clearInterval(self.timer_fast)
            }
            // 快速切换图片
            self.timer_fast = setInterval(() => {
              let rendomLi = self.random(photo_num)
              let photo = self.getRandomPhoto() // 随机图片下标
              photos[rendomLi] = photo // 替换图片下标
              self.setState({
                photos
              })
              $(`#gallery li:eq(${rendomLi}) a`).attr('style', `background-image: url('${self.getPhoto(photo)}')`)
            }, 5)
          }
        } else { // 停止
          clearInterval(self.timer_fast)
          $(this).data('action', 'start').html(startText)
          self.getWinner()
        }
      })

      // 音乐开关
      $('#musicButton').click(() => {
        if (music_config.music_bool) {
          music_config.pause()
        } else {
          music_config.play()
        }
      })

      // 清除数据开关
      $('#clearButton').click(() => {
        let sure = confirm('警告：确定清除所有数据？！')
        if (sure) {
          local_handle.clear()
          window.location.reload()
        }
      })

      // 自定义抽奖
      let customVisible = false
      $('#settingButton').click((e) => {
        e.preventDefault()
        if (customVisible) { // 隐藏
          $('.custom-draw').attr('style', 'opacity: 0')
          customVisible = false

          // 清除自定义抽奖
          $('#wardNumber').val('')
        } else { // 显示
          $('.custom-draw').attr('style', 'opacity: 1')
          customVisible = true
        }
      })

      // 自定义奖品选择
      $('.cirle-btn').click(function() {
        let wardNumber = Number($('#wardNumber').val())
        if (wardNumber && self.typeof(wardNumber) === 'Number') {
          let { photos, award } = self.state
          let awa = $(this).data('award')
          if (award === awa) return false
          if (wardNumber > photos.length) {
            alert('[抽奖数量] 必须小于 [显示总数]')
            return false
          }

          $('.cirle-btn').removeClass('active')
          $(this).addClass('active')
          self.setState({
            award: awa,
            award_num: wardNumber
          })
        } else {
          alert('抽奖数量输入有误')
          $('#wardNumber').val('')
        }
      })
    }

    /**
     * 设置奖项
     */
    setWinner = (award) => {
      if (award !== null) {
        this.setState({
          award
        })
        $('.cirle-btn').removeClass('active')
        $(`#award-${award}`).addClass('active')
      }
    }

    /**
     * 清除样式
     */
    clearStyle = () => {
      // 清除图片样式
      $('#gallery li.focus').removeClass('focus hover')
      // 关闭弹窗
      $('.pop-up').hide()
      $('.pop-up .pop-up-content').hide()
    }

    /**
     * 清除历史奖项
     */
    clearWinner = () => {
      this.clearStyle()

      if (!this.state.photos.length) {
        return false
      }

      // 图片重新渲染
      this.setState({
        photos: []
      })
      this.getPhotoData()
      const { photos } = this.state

      // 图片渲染
      // console.log('重新渲染图片', photos)

      $('#gallery li').each((index, item) => {
        let photo = photos[index]
        if (photo === undefined) {
          $(item).remove() // 缺少图片删除
        } else {
          $(item)
            .removeClass('animated bounce')
            .find('a')
            .attr('style', `background-image: url('${this.getPhoto(photo)}')`)
        }
      })
    }

    /**
     * 获取中奖者
     */
    getWinner = () => {
      const { award, photos, award_num } = this.state

      if (award !== null && photos) {
        // 获取中奖人数
        let count = this.winnerNumber[award]
        let awardNum = award_num || count[0]
        if (count.length > 1) {
          count.shift() // 删除第一项
          this.winnerNumber[award] = count
        }

        let winners = []
        if (photos.length <= awardNum) { // 图片数量小于或等于中奖数，显示所有图片
          winners = photos
        } else {
          winners = this.getRandomArrayElements(photos, awardNum)
        }
        this.showWinning(award, winners)

        this.updatePhotoList(award, winners)
      } else { // 演示使用
        let rendomLi = this.random(this.state.photo_num) // 随机单个中奖下标
        $(`#gallery li:eq(${rendomLi})`).addClass('focus hover')
      }
    }

    /**
     * 显示中奖
     * @param award 当前奖项
     * @param winners 中奖名单
     */
    showWinning = (award, winners) => {
      const { file_list } = this.state
      if (award !== null && winners && winners.length) {
        let group = $(`#prize-${award} ul`)[0]
        group.innerHTML = '' // 清除

        let winnerInfos = []
        winners.forEach(index => {
          let item = file_list[index]
          if (item) {
            winnerInfos.push(item) // 记录中奖者信息
            let branch = document.createElement('div'),
              number = document.createElement('div'),
              name = document.createElement('div'),
              photo = document.createElement('div'),
              img = document.createElement('img'),
              li = document.createElement('li')

            branch.innerText = item.position
            branch.className = 'user-branch'
            number.innerText = item.number
            number.className = 'user-number'
            name.innerText = `·${item.name}·`
            name.className = 'user-name'
            photo.className = 'user-photo'
            img.src = item.url.replace(/^\//, '')
            li.className = 'user-box'

            photo.appendChild(img)
            li.appendChild(photo)
            li.appendChild(name)
            li.appendChild(number)
            li.appendChild(branch)

            group.appendChild(li)
          }
        })

        $(`#prize-${award}`).show()
        $('.pop-up').show()

        this.saveWinnerInfo(award, winnerInfos)
        console.error(`${award}等奖名单:`, winnerInfos)
      }
    }

    /**
     * 初始化
     */
    init = () => {
      this.fetchPhotoList(() => {
        this.getPhotoData()
        this.render()
        this.event()
      })
    }
  }

  // local_handle.clear()
  const lottery = new Lottery()
  lottery.init()
})()
