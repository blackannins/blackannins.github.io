const btf = {
  debounce: (func, wait = 0, immediate = false) => {
    let timeout
    return (...args) => {
      const later = () => {
        timeout = null
        if (!immediate) func(...args)
      }
      const callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func(...args)
    }
  },

  throttle: function (func, wait, options = {}) {
    let timeout, context, args
    let previous = 0

    const later = () => {
      previous = options.leading === false ? 0 : new Date().getTime()
      timeout = null
      func.apply(context, args)
      if (!timeout) context = args = null
    }

    const throttled = (...params) => {
      const now = new Date().getTime()
      if (!previous && options.leading === false) previous = now
      const remaining = wait - (now - previous)
      context = this
      args = params
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
        previous = now
        func.apply(context, args)
        if (!timeout) context = args = null
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining)
      }
    }

    return throttled
  },

  sidebarPaddingR: () => {
    const innerWidth = window.innerWidth
    const clientWidth = document.body.clientWidth
    const paddingRight = innerWidth - clientWidth
    if (innerWidth !== clientWidth) {
      document.body.style.paddingRight = paddingRight + 'px'
    }
  },

  snackbarShow: (text, showAction = false, duration = 2000) => {
    const { position, bgLight, bgDark } = GLOBAL_CONFIG.Snackbar
    const bg = document.documentElement.getAttribute('data-theme') === 'light' ? bgLight : bgDark
    Snackbar.show({
      text,
      backgroundColor: bg,
      showAction,
      duration,
      pos: position,
      customClass: 'snackbar-css'
    })
  },

  diffDate: (d, more = false) => {
    const dateNow = new Date()
    const datePost = new Date(d)
    const dateDiff = dateNow.getTime() - datePost.getTime()
    const minute = 1000 * 60
    const hour = minute * 60
    const day = hour * 24
    const month = day * 30
    const { dateSuffix } = GLOBAL_CONFIG

    if (!more) return parseInt(dateDiff / day)

    const monthCount = dateDiff / month
    const dayCount = dateDiff / day
    const hourCount = dateDiff / hour
    const minuteCount = dateDiff / minute

    if (monthCount > 12) return datePost.toISOString().slice(0, 10)
    if (monthCount >= 1) return `${parseInt(monthCount)} ${dateSuffix.month}`
    if (dayCount >= 1) return `${parseInt(dayCount)} ${dateSuffix.day}`
    if (hourCount >= 1) return `${parseInt(hourCount)} ${dateSuffix.hour}`
    if (minuteCount >= 1) return `${parseInt(minuteCount)} ${dateSuffix.min}`
    return dateSuffix.just
  },

  loadComment: (dom, callback) => {
    if ('IntersectionObserver' in window) {
      const observerItem = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          callback()
          observerItem.disconnect()
        }
      }, { threshold: [0] })
      observerItem.observe(dom)
    } else {
      callback()
    }
  },

  scrollToDest: (pos, time = 500) => {
    const currentPos = window.pageYOffset
    const isNavFixed = document.getElementById('page-header').classList.contains('fixed')
    if (currentPos > pos || isNavFixed) pos = pos - 70

    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: pos,
        behavior: 'smooth'
      })
      return
    }

    let start = null
    pos = +pos
    window.requestAnimationFrame(function step (currentTime) {
      start = !start ? currentTime : start
      const progress = currentTime - start
      if (currentPos < pos) {
        window.scrollTo(0, ((pos - currentPos) * progress / time) + currentPos)
      } else {
        window.scrollTo(0, currentPos - ((currentPos - pos) * progress / time))
      }
      if (progress < time) {
        window.requestAnimationFrame(step)
      } else {
        window.scrollTo(0, pos)
      }
    })
  },

  animateIn: (ele, text) => {
    ele.style.display = 'block'
    ele.style.animation = text
  },

  animateOut: (ele, text) => {
    ele.addEventListener('animationend', function f () {
      ele.style.display = ''
      ele.style.animation = ''
      ele.removeEventListener('animationend', f)
    })
    ele.style.animation = text
  },

  wrap: (selector, eleType, options) => {
    const createEle = document.createElement(eleType)
    for (const [key, value] of Object.entries(options)) {
      createEle.setAttribute(key, value)
    }
    selector.parentNode.insertBefore(createEle, selector)
    createEle.appendChild(selector)
  },

  isHidden: ele => ele.offsetHeight === 0 && ele.offsetWidth === 0,

  getEleTop: ele => {
    let actualTop = ele.offsetTop
    let current = ele.offsetParent

    while (current !== null) {
      actualTop += current.offsetTop
      current = current.offsetParent
    }

    return actualTop
  },

  loadLightbox: ele => {
    const service = GLOBAL_CONFIG.lightbox

    if (service === 'mediumZoom') {
      mediumZoom(ele, { background: 'var(--zoom-bg)' })
    }

    if (service === 'fancybox') {
      Array.from(ele).forEach(i => {
        if (i.parentNode.tagName !== 'A') {
          const dataSrc = i.dataset.lazySrc || i.src
          const dataCaption = i.title || i.alt || ''
          btf.wrap(i, 'a', { href: dataSrc, 'data-fancybox': 'gallery', 'data-caption': dataCaption, 'data-thumb': dataSrc })
        }
      })

      if (!window.fancyboxRun) {
        Fancybox.bind('[data-fancybox]', {
          Hash: false,
          Thumbs: {
            showOnStart: false
          },
          Images: {
            Panzoom: {
              maxScale: 4
            }
          },
          Carousel: {
            transition: 'slide'
          },
          Toolbar: {
            display: {
              left: ['infobar'],
              middle: [
                'zoomIn',
                'zoomOut',
                'toggle1to1',
                'rotateCCW',
                'rotateCW',
                'flipX',
                'flipY'
              ],
              right: ['slideshow', 'thumbs', 'close']
            }
          }
        })
        window.fancyboxRun = true
      }
    }
  },

  setLoading: {
    add: ele => {
      const html = `
        <div class="loading-container">
          <div class="loading-item">
            <div></div><div></div><div></div><div></div><div></div>
          </div>
        </div>
      `
      ele.insertAdjacentHTML('afterend', html)
    },
    remove: ele => {
      ele.nextElementSibling.remove()
    }
  },

  updateAnchor: (anchor) => {
    if (anchor !== window.location.hash) {
      if (!anchor) anchor = location.pathname
      const title = GLOBAL_CONFIG_SITE.title
      window.history.replaceState({
        url: location.href,
        title
      }, title, anchor)
    }
  },

  getScrollPercent: (currentTop, ele) => {
    const docHeight = ele.clientHeight
    const winHeight = document.documentElement.clientHeight
    const headerHeight = ele.offsetTop
    const contentMath = (docHeight > winHeight) ? (docHeight - winHeight) : (document.documentElement.scrollHeight - winHeight)
    const scrollPercent = (currentTop - headerHeight) / (contentMath)
    const scrollPercentRounded = Math.round(scrollPercent * 100)
    const percentage = (scrollPercentRounded > 100) ? 100 : (scrollPercentRounded <= 0) ? 0 : scrollPercentRounded
    return percentage
  },

  addGlobalFn: (key, fn, name = false, parent = window) => {
    const globalFn = parent.globalFn || {}
    const keyObj = globalFn[key] || {}

    if (name && keyObj[name]) return

    name = name || Object.keys(keyObj).length
    keyObj[name] = fn
    globalFn[key] = keyObj
    parent.globalFn = globalFn
  },

  addEventListenerPjax: (ele, event, fn, option = false) => {
    ele.addEventListener(event, fn, option)
    btf.addGlobalFn('pjax', () => {
      ele.removeEventListener(event, fn, option)
    })
  },

  removeGlobalFnEvent: (key, parent = window) => {
    const { globalFn = {} } = parent
    const keyObj = globalFn[key] || {}
    const keyArr = Object.keys(keyObj)
    if (!keyArr.length) return
    keyArr.forEach(i => {
      keyObj[i]()
    })
    delete parent.globalFn[key]
  }
}
;
document.addEventListener('DOMContentLoaded', function () {
  let headerContentWidth, $nav
  let mobileSidebarOpen = false

  const adjustMenu = init => {
    const getAllWidth = ele => {
      return Array.from(ele).reduce((width, i) => width + i.offsetWidth, 0)
    }

    if (init) {
      const blogInfoWidth = getAllWidth(document.querySelector('#blog-info > a').children)
      const menusWidth = getAllWidth(document.getElementById('menus').children)
      headerContentWidth = blogInfoWidth + menusWidth
      $nav = document.getElementById('nav')
    }

    const hideMenuIndex = window.innerWidth <= 768 || headerContentWidth > $nav.offsetWidth - 120
    $nav.classList.toggle('hide-menu', hideMenuIndex)
  }

  // 初始化header
  const initAdjust = () => {
    adjustMenu(true)
    $nav.classList.add('show')
  }

  // sidebar menus
  const sidebarFn = {
    open: () => {
      btf.sidebarPaddingR()
      document.body.style.overflow = 'hidden'
      btf.animateIn(document.getElementById('menu-mask'), 'to_show 0.5s')
      document.getElementById('sidebar-menus').classList.add('open')
      mobileSidebarOpen = true
    },
    close: () => {
      const $body = document.body
      $body.style.overflow = ''
      $body.style.paddingRight = ''
      btf.animateOut(document.getElementById('menu-mask'), 'to_hide 0.5s')
      document.getElementById('sidebar-menus').classList.remove('open')
      mobileSidebarOpen = false
    }
  }

  /**
   * 首頁top_img底下的箭頭
   */
  const scrollDownInIndex = () => {
    const handleScrollToDest = () => {
      btf.scrollToDest(document.getElementById('content-inner').offsetTop, 300)
    }

    const $scrollDownEle = document.getElementById('scroll-down')
    $scrollDownEle && btf.addEventListenerPjax($scrollDownEle, 'click', handleScrollToDest)
  }

  /**
   * 代碼
   * 只適用於Hexo默認的代碼渲染
   */
  const addHighlightTool = () => {
    const highLight = GLOBAL_CONFIG.highlight
    if (!highLight) return

    const { highlightCopy, highlightLang, highlightHeightLimit, plugin } = highLight
    const isHighlightShrink = GLOBAL_CONFIG_SITE.isHighlightShrink
    const isShowTool = highlightCopy || highlightLang || isHighlightShrink !== undefined
    const $figureHighlight = plugin === 'highlight.js' ? document.querySelectorAll('figure.highlight') : document.querySelectorAll('pre[class*="language-"]')

    if (!((isShowTool || highlightHeightLimit) && $figureHighlight.length)) return

    const isPrismjs = plugin === 'prismjs'
    const highlightShrinkClass = isHighlightShrink === true ? 'closed' : ''
    const highlightShrinkEle = isHighlightShrink !== undefined ? '<i class="fas fa-angle-down expand"></i>' : ''
    const highlightCopyEle = highlightCopy ? '<div class="copy-notice"></div><i class="fas fa-paste copy-button"></i>' : ''

    const alertInfo = (ele, text) => {
      if (GLOBAL_CONFIG.Snackbar !== undefined) {
        btf.snackbarShow(text)
      } else {
        const prevEle = ele.previousElementSibling
        prevEle.textContent = text
        prevEle.style.opacity = 1
        setTimeout(() => { prevEle.style.opacity = 0 }, 800)
      }
    }

    const copy = ctx => {
      if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
        document.execCommand('copy')
        alertInfo(ctx, GLOBAL_CONFIG.copy.success)
      } else {
        alertInfo(ctx, GLOBAL_CONFIG.copy.noSupport)
      }
    }

    // click events
    const highlightCopyFn = ele => {
      const $buttonParent = ele.parentNode
      $buttonParent.classList.add('copy-true')
      const selection = window.getSelection()
      const range = document.createRange()
      const preCodeSelector = isPrismjs ? 'pre code' : 'table .code pre'
      range.selectNodeContents($buttonParent.querySelectorAll(`${preCodeSelector}`)[0])
      selection.removeAllRanges()
      selection.addRange(range)
      copy(ele.lastChild)
      selection.removeAllRanges()
      $buttonParent.classList.remove('copy-true')
    }

    const highlightShrinkFn = ele => {
      ele.classList.toggle('closed')
    }

    const highlightToolsFn = function (e) {
      const $target = e.target.classList
      if ($target.contains('expand')) highlightShrinkFn(this)
      else if ($target.contains('copy-button')) highlightCopyFn(this)
    }

    const expandCode = function () {
      this.classList.toggle('expand-done')
    }

    const createEle = (lang, item, service) => {
      const fragment = document.createDocumentFragment()

      if (isShowTool) {
        const hlTools = document.createElement('div')
        hlTools.className = `highlight-tools ${highlightShrinkClass}`
        hlTools.innerHTML = highlightShrinkEle + lang + highlightCopyEle
        btf.addEventListenerPjax(hlTools, 'click', highlightToolsFn)
        fragment.appendChild(hlTools)
      }

      if (highlightHeightLimit && item.offsetHeight > highlightHeightLimit + 30) {
        const ele = document.createElement('div')
        ele.className = 'code-expand-btn'
        ele.innerHTML = '<i class="fas fa-angle-double-down"></i>'
        btf.addEventListenerPjax(ele, 'click', expandCode)
        fragment.appendChild(ele)
      }

      if (service === 'hl') {
        item.insertBefore(fragment, item.firstChild)
      } else {
        item.parentNode.insertBefore(fragment, item)
      }
    }

    if (isPrismjs) {
      $figureHighlight.forEach(item => {
        if (highlightLang) {
          const langName = item.getAttribute('data-language') || 'Code'
          const highlightLangEle = `<div class="code-lang">${langName}</div>`
          btf.wrap(item, 'figure', { class: 'highlight' })
          createEle(highlightLangEle, item)
        } else {
          btf.wrap(item, 'figure', { class: 'highlight' })
          createEle('', item)
        }
      })
    } else {
      $figureHighlight.forEach(item => {
        if (highlightLang) {
          let langName = item.getAttribute('class').split(' ')[1]
          if (langName === 'plain' || langName === undefined) langName = 'Code'
          const highlightLangEle = `<div class="code-lang">${langName}</div>`
          createEle(highlightLangEle, item, 'hl')
        } else {
          createEle('', item, 'hl')
        }
      })
    }
  }

  /**
   * PhotoFigcaption
   */
  const addPhotoFigcaption = () => {
    document.querySelectorAll('#article-container img').forEach(item => {
      const altValue = item.title || item.alt
      if (!altValue) return
      const ele = document.createElement('div')
      ele.className = 'img-alt is-center'
      ele.textContent = altValue
      item.insertAdjacentElement('afterend', ele)
    })
  }

  /**
   * Lightbox
   */
  const runLightbox = () => {
    btf.loadLightbox(document.querySelectorAll('#article-container img:not(.no-lightbox)'))
  }

  /**
   * justified-gallery 圖庫排版
   */

  const fetchUrl = async (url) => {
    const response = await fetch(url)
    return await response.json()
  }

  const runJustifiedGallery = (item, data, isButton = false, tabs) => {
    const dataLength = data.length

    const ig = new InfiniteGrid.JustifiedInfiniteGrid(item, {
      gap: 5,
      isConstantSize: true,
      sizeRange: [150, 600],
      useResizeObserver: true,
      observeChildren: true,
      useTransform: true
      // useRecycle: false
    })

    if (tabs) {
      btf.addGlobalFn('igOfTabs', () => { ig.destroy() }, false, tabs)
    }

    const replaceDq = str => str.replace(/"/g, '&quot;') // replace double quotes to &quot;

    const getItems = (nextGroupKey, count) => {
      const nextItems = []
      const startCount = (nextGroupKey - 1) * count

      for (let i = 0; i < count; ++i) {
        const num = startCount + i
        if (num >= dataLength) {
          break
        }

        const item = data[num]
        const alt = item.alt ? `alt="${replaceDq(item.alt)}"` : ''
        const title = item.title ? `title="${replaceDq(item.title)}"` : ''

        nextItems.push(`<div class="item ">
            <img src="${item.url}" data-grid-maintained-target="true" ${alt + title} />
          </div>`)
      }
      return nextItems
    }

    const buttonText = GLOBAL_CONFIG.infinitegrid.buttonText
    const addButton = item => {
      const button = document.createElement('button')
      button.textContent = buttonText

      const buttonFn = e => {
        e.target.removeEventListener('click', buttonFn)
        e.target.remove()
        btf.setLoading.add(item)
        appendItem(ig.getGroups().length + 1, 10)
      }

      button.addEventListener('click', buttonFn)
      item.insertAdjacentElement('afterend', button)
    }

    const appendItem = (nextGroupKey, count) => {
      ig.append(getItems(nextGroupKey, count), nextGroupKey)
    }

    const maxGroupKey = Math.ceil(dataLength / 10)

    const completeFn = e => {
      const { updated, isResize, mounted } = e
      if (!updated.length || !mounted.length || isResize) {
        return
      }

      btf.loadLightbox(item.querySelectorAll('img:not(.medium-zoom-image)'))

      if (ig.getGroups().length === maxGroupKey) {
        btf.setLoading.remove(item)
        ig.off('renderComplete', completeFn)
        return
      }

      if (isButton) {
        btf.setLoading.remove(item)
        addButton(item)
      }
    }

    const requestAppendFn = btf.debounce(e => {
      const nextGroupKey = (+e.groupKey || 0) + 1
      appendItem(nextGroupKey, 10)

      if (nextGroupKey === maxGroupKey) {
        ig.off('requestAppend', requestAppendFn)
      }
    }, 300)

    btf.setLoading.add(item)
    ig.on('renderComplete', completeFn)

    if (isButton) {
      appendItem(1, 10)
    } else {
      ig.on('requestAppend', requestAppendFn)
      ig.renderItems()
    }

    btf.addGlobalFn('justifiedGallery', () => { ig.destroy() })
  }

  const addJustifiedGallery = async (ele, tabs = false) => {
    const init = async () => {
      for (const item of ele) {
        if (btf.isHidden(item)) continue
        if (tabs && item.classList.contains('loaded')) {
          item.querySelector('.gallery-items').innerHTML = ''
          const button = item.querySelector(':scope > button')
          const loadingContainer = item.querySelector(':scope > .loading-container')
          button && button.remove()
          loadingContainer && loadingContainer.remove()
        }

        const isButton = item.getAttribute('data-button') === 'true'
        const text = item.firstElementChild.textContent
        item.classList.add('loaded')
        const content = item.getAttribute('data-type') === 'url' ? await fetchUrl(text) : JSON.parse(text)
        runJustifiedGallery(item.lastElementChild, content, isButton, tabs)
      }
    }

    if (typeof InfiniteGrid === 'function') {
      init()
    } else {
      await getScript(`${GLOBAL_CONFIG.infinitegrid.js}`)
      init()
    }
  }

  /**
   * rightside scroll percent
   */
  const rightsideScrollPercent = currentTop => {
    const scrollPercent = btf.getScrollPercent(currentTop, document.body)
    const goUpElement = document.getElementById('go-up')

    if (scrollPercent < 95) {
      goUpElement.classList.add('show-percent')
      goUpElement.querySelector('.scroll-percent').textContent = scrollPercent
    } else {
      goUpElement.classList.remove('show-percent')
    }
  }

  /**
   * 滾動處理
   */
  const scrollFn = () => {
    const $rightside = document.getElementById('rightside')
    const innerHeight = window.innerHeight + 56
    let initTop = 0
    const $header = document.getElementById('page-header')
    const isChatBtn = typeof chatBtn !== 'undefined'
    const isShowPercent = GLOBAL_CONFIG.percent.rightside

    // 當滾動條小于 56 的時候
    if (document.body.scrollHeight <= innerHeight) {
      $rightside.classList.add('rightside-show')
      return
    }

    // find the scroll direction
    const scrollDirection = currentTop => {
      const result = currentTop > initTop // true is down & false is up
      initTop = currentTop
      return result
    }

    let flag = ''
    const scrollTask = btf.throttle(() => {
      const currentTop = window.scrollY || document.documentElement.scrollTop
      const isDown = scrollDirection(currentTop)
      if (currentTop > 56) {
        if (flag === '') {
          $header.classList.add('nav-fixed')
          $rightside.classList.add('rightside-show')
        }

        if (isDown) {
          if (flag !== 'down') {
            $header.classList.remove('nav-visible')
            isChatBtn && window.chatBtn.hide()
            flag = 'down'
          }
        } else {
          if (flag !== 'up') {
            $header.classList.add('nav-visible')
            isChatBtn && window.chatBtn.show()
            flag = 'up'
          }
        }
      } else {
        flag = ''
        if (currentTop === 0) {
          $header.classList.remove('nav-fixed', 'nav-visible')
        }
        $rightside.classList.remove('rightside-show')
      }

      isShowPercent && rightsideScrollPercent(currentTop)

      if (document.body.scrollHeight <= innerHeight) {
        $rightside.classList.add('rightside-show')
      }
    }, 300)

    btf.addEventListenerPjax(window, 'scroll', scrollTask, { passive: true })
  }

  /**
  * toc,anchor
  */
  const scrollFnToDo = () => {
    const isToc = GLOBAL_CONFIG_SITE.isToc
    const isAnchor = GLOBAL_CONFIG.isAnchor
    const $article = document.getElementById('article-container')

    if (!($article && (isToc || isAnchor))) return

    let $tocLink, $cardToc, autoScrollToc, $tocPercentage, isExpand

    if (isToc) {
      const $cardTocLayout = document.getElementById('card-toc')
      $cardToc = $cardTocLayout.querySelector('.toc-content')
      $tocLink = $cardToc.querySelectorAll('.toc-link')
      $tocPercentage = $cardTocLayout.querySelector('.toc-percentage')
      isExpand = $cardToc.classList.contains('is-expand')

      // toc元素點擊
      const tocItemClickFn = e => {
        const target = e.target.closest('.toc-link')
        if (!target) return

        e.preventDefault()
        btf.scrollToDest(btf.getEleTop(document.getElementById(decodeURI(target.getAttribute('href')).replace('#', ''))), 300)
        if (window.innerWidth < 900) {
          $cardTocLayout.classList.remove('open')
        }
      }

      btf.addEventListenerPjax($cardToc, 'click', tocItemClickFn)

      autoScrollToc = item => {
        const activePosition = item.getBoundingClientRect().top
        const sidebarScrollTop = $cardToc.scrollTop
        if (activePosition > (document.documentElement.clientHeight - 100)) {
          $cardToc.scrollTop = sidebarScrollTop + 150
        }
        if (activePosition < 100) {
          $cardToc.scrollTop = sidebarScrollTop - 150
        }
      }
    }

    // find head position & add active class
    const $articleList = $article.querySelectorAll('h1,h2,h3,h4,h5,h6')
    let detectItem = ''
    const findHeadPosition = top => {
      if (top === 0) {
        return false
      }

      let currentId = ''
      let currentIndex = ''

      $articleList.forEach((ele, index) => {
        if (top > btf.getEleTop(ele) - 80) {
          const id = ele.id
          currentId = id ? '#' + encodeURI(id) : ''
          currentIndex = index
        }
      })

      if (detectItem === currentIndex) return

      if (isAnchor) btf.updateAnchor(currentId)

      detectItem = currentIndex

      if (isToc) {
        $cardToc.querySelectorAll('.active').forEach(i => { i.classList.remove('active') })

        if (currentId === '') {
          return
        }

        const currentActive = $tocLink[currentIndex]
        currentActive.classList.add('active')

        setTimeout(() => {
          autoScrollToc(currentActive)
        }, 0)

        if (isExpand) return
        let parent = currentActive.parentNode

        for (; !parent.matches('.toc'); parent = parent.parentNode) {
          if (parent.matches('li')) parent.classList.add('active')
        }
      }
    }

    // main of scroll
    const tocScrollFn = btf.throttle(() => {
      const currentTop = window.scrollY || document.documentElement.scrollTop
      if (isToc && GLOBAL_CONFIG.percent.toc) {
        $tocPercentage.textContent = btf.getScrollPercent(currentTop, $article)
      }
      findHeadPosition(currentTop)
    }, 100)

    btf.addEventListenerPjax(window, 'scroll', tocScrollFn, { passive: true })
  }

  const handleThemeChange = mode => {
    const globalFn = window.globalFn || {}
    const themeChange = globalFn.themeChange || {}
    if (!themeChange) {
      return
    }

    Object.keys(themeChange).forEach(key => {
      const themeChangeFn = themeChange[key]
      if (['disqus', 'disqusjs'].includes(key)) {
        setTimeout(() => themeChangeFn(mode), 300)
      } else {
        themeChangeFn(mode)
      }
    })
  }

  /**
   * Rightside
   */
  const rightSideFn = {
    readmode: () => { // read mode
      const $body = document.body
      $body.classList.add('read-mode')
      const newEle = document.createElement('button')
      newEle.type = 'button'
      newEle.className = 'fas fa-sign-out-alt exit-readmode'
      $body.appendChild(newEle)

      const clickFn = () => {
        $body.classList.remove('read-mode')
        newEle.remove()
        newEle.removeEventListener('click', clickFn)
      }

      newEle.addEventListener('click', clickFn)
    },
    darkmode: () => { // switch between light and dark mode
      const willChangeMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
      if (willChangeMode === 'dark') {
        activateDarkMode()
        GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night)
      } else {
        activateLightMode()
        GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day)
      }
      saveToLocal.set('theme', willChangeMode, 2)
      handleThemeChange(willChangeMode)
    },
    'rightside-config': item => { // Show or hide rightside-hide-btn
      const hideLayout = item.firstElementChild
      if (hideLayout.classList.contains('show')) {
        hideLayout.classList.add('status')
        setTimeout(() => {
          hideLayout.classList.remove('status')
        }, 300)
      }

      hideLayout.classList.toggle('show')
    },
    'go-up': () => { // Back to top
      btf.scrollToDest(0, 500)
    },
    'hide-aside-btn': () => { // Hide aside
      const $htmlDom = document.documentElement.classList
      const saveStatus = $htmlDom.contains('hide-aside') ? 'show' : 'hide'
      saveToLocal.set('aside-status', saveStatus, 2)
      $htmlDom.toggle('hide-aside')
    },
    'mobile-toc-button': item => { // Show mobile toc
      const tocEle = document.getElementById('card-toc')
      tocEle.style.transition = 'transform 0.3s ease-in-out'
      tocEle.classList.toggle('open')
      tocEle.addEventListener('transitionend', () => {
        tocEle.style.transition = ''
      }, { once: true })
    },
    'chat-btn': () => { // Show chat
      window.chatBtnFn()
    },
    translateLink: () => { // switch between traditional and simplified chinese
      window.translateFn.translatePage()
    }
  }

  document.getElementById('rightside').addEventListener('click', function (e) {
    const $target = e.target.closest('[id]')
    if ($target && rightSideFn[$target.id]) {
      rightSideFn[$target.id](this)
    }
  })

  /**
   * menu
   * 側邊欄sub-menu 展開/收縮
   */
  const clickFnOfSubMenu = () => {
    const handleClickOfSubMenu = e => {
      const target = e.target.closest('.site-page.group')
      if (!target) return
      target.classList.toggle('hide')
    }

    document.querySelector('#sidebar-menus .menus_items').addEventListener('click', handleClickOfSubMenu)
  }

  /**
   * 手机端目录点击
   */
  const openMobileMenu = () => {
    const handleClick = () => { sidebarFn.open() }
    btf.addEventListenerPjax(document.getElementById('toggle-menu'), 'click', handleClick)
  }

  /**
 * 複製時加上版權信息
 */
  const addCopyright = () => {
    const { limitCount, languages } = GLOBAL_CONFIG.copyright

    const handleCopy = (e) => {
      e.preventDefault()
      const copyFont = window.getSelection(0).toString()
      let textFont = copyFont
      if (copyFont.length > limitCount) {
        textFont = `${copyFont}\n\n\n${languages.author}\n${languages.link}${window.location.href}\n${languages.source}\n${languages.info}`
      }
      if (e.clipboardData) {
        return e.clipboardData.setData('text', textFont)
      } else {
        return window.clipboardData.setData('text', textFont)
      }
    }

    document.body.addEventListener('copy', handleCopy)
  }

  /**
   * 網頁運行時間
   */
  const addRuntime = () => {
    const $runtimeCount = document.getElementById('runtimeshow')
    if ($runtimeCount) {
      const publishDate = $runtimeCount.getAttribute('data-publishDate')
      $runtimeCount.textContent = `${btf.diffDate(publishDate)} ${GLOBAL_CONFIG.runtime}`
    }
  }

  /**
   * 最後一次更新時間
   */
  const addLastPushDate = () => {
    const $lastPushDateItem = document.getElementById('last-push-date')
    if ($lastPushDateItem) {
      const lastPushDate = $lastPushDateItem.getAttribute('data-lastPushDate')
      $lastPushDateItem.textContent = btf.diffDate(lastPushDate, true)
    }
  }

  /**
   * table overflow
   */
  const addTableWrap = () => {
    const $table = document.querySelectorAll('#article-container table')
    if (!$table.length) return

    $table.forEach(item => {
      if (!item.closest('.highlight')) {
        btf.wrap(item, 'div', { class: 'table-wrap' })
      }
    })
  }

  /**
   * tag-hide
   */
  const clickFnOfTagHide = () => {
    const hideButtons = document.querySelectorAll('#article-container .hide-button')
    if (!hideButtons.length) return
    const handleClick = function (e) {
      const $this = this
      $this.classList.add('open')
      const $fjGallery = $this.nextElementSibling.querySelectorAll('.gallery-container')
      $fjGallery.length && addJustifiedGallery($fjGallery)
    }

    hideButtons.forEach(item => {
      item.addEventListener('click', handleClick, { once: true })
    })
  }

  const tabsFn = () => {
    const navTabsElement = document.querySelectorAll('#article-container .tabs')
    if (!navTabsElement.length) return

    const removeAndAddActiveClass = (elements, detect) => {
      Array.from(elements).forEach(element => {
        element.classList.remove('active')
        if (element === detect || element.id === detect) {
          element.classList.add('active')
        }
      })
    }

    const addTabNavEventListener = (item, isJustifiedGallery) => {
      const navClickHandler = function (e) {
        const target = e.target.closest('button')
        if (target.classList.contains('active')) return
        removeAndAddActiveClass(this.children, target)
        this.classList.remove('no-default')
        const tabId = target.getAttribute('data-href')
        const tabContent = this.nextElementSibling
        removeAndAddActiveClass(tabContent.children, tabId)
        if (isJustifiedGallery) {
          btf.removeGlobalFnEvent('igOfTabs', this)
          const justifiedGalleryItems = tabContent.querySelectorAll(`:scope > #${tabId} .gallery-container`)
          justifiedGalleryItems.length && addJustifiedGallery(justifiedGalleryItems, this)
        }
      }
      btf.addEventListenerPjax(item.firstElementChild, 'click', navClickHandler)
    }

    const addTabToTopEventListener = item => {
      const btnClickHandler = (e) => {
        const target = e.target.closest('button')
        if (!target) return
        btf.scrollToDest(btf.getEleTop(item), 300)
      }
      btf.addEventListenerPjax(item.lastElementChild, 'click', btnClickHandler)
    }

    navTabsElement.forEach(item => {
      const isJustifiedGallery = !!item.querySelectorAll('.gallery-container')
      addTabNavEventListener(item, isJustifiedGallery)
      addTabToTopEventListener(item)
    })
  }

  const toggleCardCategory = () => {
    const cardCategory = document.querySelector('#aside-cat-list.expandBtn')
    if (!cardCategory) return

    const handleToggleBtn = (e) => {
      const target = e.target
      if (target.nodeName === 'I') {
        e.preventDefault()
        target.parentNode.classList.toggle('expand')
      }
    }
    btf.addEventListenerPjax(cardCategory, 'click', handleToggleBtn, true)
  }

  const switchComments = () => {
    const switchBtn = document.getElementById('switch-btn')
    if (!switchBtn) return
    let switchDone = false
    const commentContainer = document.getElementById('post-comment')
    const handleSwitchBtn = () => {
      commentContainer.classList.toggle('move')
      if (!switchDone && typeof loadOtherComment === 'function') {
        switchDone = true
        loadOtherComment()
      }
    }
    btf.addEventListenerPjax(switchBtn, 'click', handleSwitchBtn)
  }

  const addPostOutdateNotice = () => {
    const { limitDay, messagePrev, messageNext, position } = GLOBAL_CONFIG.noticeOutdate
    const diffDay = btf.diffDate(GLOBAL_CONFIG_SITE.postUpdate)
    if (diffDay >= limitDay) {
      const ele = document.createElement('div')
      ele.className = 'post-outdate-notice'
      ele.textContent = `${messagePrev} ${diffDay} ${messageNext}`
      const $targetEle = document.getElementById('article-container')
      if (position === 'top') {
        $targetEle.insertBefore(ele, $targetEle.firstChild)
      } else {
        $targetEle.appendChild(ele)
      }
    }
  }

  const lazyloadImg = () => {
    window.lazyLoadInstance = new LazyLoad({
      elements_selector: 'img',
      threshold: 0,
      data_src: 'lazy-src'
    })
  }

  const relativeDate = function (selector) {
    selector.forEach(item => {
      const timeVal = item.getAttribute('datetime')
      item.textContent = btf.diffDate(timeVal, true)
      item.style.display = 'inline'
    })
  }

  const unRefreshFn = function () {
    window.addEventListener('resize', () => {
      adjustMenu(false)
      mobileSidebarOpen && btf.isHidden(document.getElementById('toggle-menu')) && sidebarFn.close()
    })

    document.getElementById('menu-mask').addEventListener('click', e => { sidebarFn.close() })

    clickFnOfSubMenu()
    GLOBAL_CONFIG.islazyload && lazyloadImg()
    GLOBAL_CONFIG.copyright !== undefined && addCopyright()

    if (GLOBAL_CONFIG.autoDarkmode) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (saveToLocal.get('theme') !== undefined) return
        e.matches ? handleThemeChange('dark') : handleThemeChange('light')
      })
    }
  }

  window.refreshFn = function () {
    initAdjust()

    if (GLOBAL_CONFIG_SITE.isPost) {
      GLOBAL_CONFIG.noticeOutdate !== undefined && addPostOutdateNotice()
      GLOBAL_CONFIG.relativeDate.post && relativeDate(document.querySelectorAll('#post-meta time'))
    } else {
      GLOBAL_CONFIG.relativeDate.homepage && relativeDate(document.querySelectorAll('#recent-posts time'))
      GLOBAL_CONFIG.runtime && addRuntime()
      addLastPushDate()
      toggleCardCategory()
    }

    scrollFnToDo()
    GLOBAL_CONFIG_SITE.isHome && scrollDownInIndex()
    addHighlightTool()
    GLOBAL_CONFIG.isPhotoFigcaption && addPhotoFigcaption()
    scrollFn()

    btf.removeGlobalFnEvent('justifiedGallery')
    const galleryContainer = document.querySelectorAll('#article-container .gallery-container')
    galleryContainer.length && addJustifiedGallery(galleryContainer)

    runLightbox()
    addTableWrap()
    clickFnOfTagHide()
    tabsFn()
    switchComments()
    openMobileMenu()
  }

  refreshFn()
  unRefreshFn()
})
;
setInterval(() => {
    // let create_time = Math.round(new Date('2021-10-15 00:00:00').getTime() / 1000); //在此行修改建站时间
    // 有苹果用户发现safari浏览器不能正常运行，百度了一下发现是格式化的问题，改成下面这种应该就可以了。感谢反馈。
    let create_time = Math.round(new Date('2024/6/11 18:07:20').getTime() / 1000); //在此行修改建站时间
    let timestamp = Math.round((new Date().getTime()) / 1000);
    let second = timestamp - create_time;
    let time = new Array(0, 0, 0, 0, 0);

    var nol = function(h) {
        return h > 9 ? h : '0' + h;
    }
    if (second >= 365 * 24 * 3600) {
        time[0] = parseInt(second / (365 * 24 * 3600));
        second %= 365 * 24 * 3600;
    }
    if (second >= 24 * 3600) {
        time[1] = parseInt(second / (24 * 3600));
        second %= 24 * 3600;
    }
    if (second >= 3600) {
        time[2] = nol(parseInt(second / 3600));
        second %= 3600;
    }
    if (second >= 60) {
        time[3] = nol(parseInt(second / 60));
        second %= 60;
    }
    if (second >= 0) {
        time[4] = nol(second);
    }
    let currentTimeHtml = ""
    if (time[0] != 0) {
        currentTimeHtml += time[0] + ' 年 '
    }
    currentTimeHtml += '本站已运行：' + time[1] + ' 天 ' + time[2] + ' : ' + time[3] + ' : ' + time[4];
    document.getElementById("runtime").innerHTML = currentTimeHtml;
}, 1000);;
/*! https://github.com/xiazeyu/live2d-widget.js built@2019-4-6 09:38:17 */
var L2Dwidget=function(t){var n=window.webpackJsonpL2Dwidget;window.webpackJsonpL2Dwidget=function(e,o,i){for(var c,u,a=0,s=[];a<e.length;a++)u=e[a],r[u]&&s.push(r[u][0]),r[u]=0;for(c in o)Object.prototype.hasOwnProperty.call(o,c)&&(t[c]=o[c]);for(n&&n(e,o,i);s.length;)s.shift()()};var e={},r={1:0};function o(n){if(e[n])return e[n].exports;var r=e[n]={i:n,l:!1,exports:{}};return t[n].call(r.exports,r,r.exports,o),r.l=!0,r.exports}return o.e=function(t){var n=r[t];if(0===n)return new Promise(function(t){t()});if(n)return n[2];var e=new Promise(function(e,o){n=r[t]=[e,o]});n[2]=e;var i=document.getElementsByTagName("head")[0],c=document.createElement("script");c.type="text/javascript",c.charset="utf-8",c.async=!0,c.timeout=12e4,o.nc&&c.setAttribute("nonce",o.nc),c.src=o.p+"L2Dwidget."+t+".min.js";var u=setTimeout(a,12e4);c.onerror=c.onload=a;function a(){c.onerror=c.onload=null,clearTimeout(u);var n=r[t];0!==n&&(n&&n[1](new Error("Loading chunk "+t+" failed.")),r[t]=void 0)}return i.appendChild(c),e},o.m=t,o.c=e,o.d=function(t,n,e){o.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:e})},o.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return o.d(n,"a",n),n},o.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},o.p="",o.oe=function(t){throw console.error(t),t},o(o.s=40)}([function(t,n,e){var r=e(24)("wks"),o=e(16),i=e(1).Symbol,c="function"==typeof i;(t.exports=function(t){return r[t]||(r[t]=c&&i[t]||(c?i:o)("Symbol."+t))}).store=r},function(t,n){var e=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=e)},function(t,n,e){var r=e(6);t.exports=function(t){if(!r(t))throw TypeError(t+" is not an object!");return t}},function(t,n,e){var r=e(11),o=e(26);t.exports=e(7)?function(t,n,e){return r.f(t,n,o(1,e))}:function(t,n,e){return t[n]=e,t}},function(t,n){var e=t.exports={version:"2.5.3"};"number"==typeof __e&&(__e=e)},function(t,n,e){var r=e(1),o=e(3),i=e(8),c=e(16)("src"),u="toString",a=Function[u],s=(""+a).split(u);e(4).inspectSource=function(t){return a.call(t)},(t.exports=function(t,n,e,u){var a="function"==typeof e;a&&(i(e,"name")||o(e,"name",n)),t[n]!==e&&(a&&(i(e,c)||o(e,c,t[n]?""+t[n]:s.join(String(n)))),t===r?t[n]=e:u?t[n]?t[n]=e:o(t,n,e):(delete t[n],o(t,n,e)))})(Function.prototype,u,function(){return"function"==typeof this&&this[c]||a.call(this)})},function(t,n){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,n,e){t.exports=!e(25)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(t,n){var e={}.hasOwnProperty;t.exports=function(t,n){return e.call(t,n)}},function(t,n){t.exports={}},function(t,n){var e={}.toString;t.exports=function(t){return e.call(t).slice(8,-1)}},function(t,n,e){var r=e(2),o=e(43),i=e(44),c=Object.defineProperty;n.f=e(7)?Object.defineProperty:function(t,n,e){if(r(t),n=i(n,!0),r(e),o)try{return c(t,n,e)}catch(t){}if("get"in e||"set"in e)throw TypeError("Accessors not supported!");return"value"in e&&(t[n]=e.value),t}},function(t,n,e){var r=e(1),o=e(4),i=e(3),c=e(5),u=e(13),a="prototype",s=function(t,n,e){var f,l,p,d,v=t&s.F,h=t&s.G,y=t&s.S,m=t&s.P,b=t&s.B,w=h?r:y?r[n]||(r[n]={}):(r[n]||{})[a],g=h?o:o[n]||(o[n]={}),x=g[a]||(g[a]={});h&&(e=n);for(f in e)p=((l=!v&&w&&void 0!==w[f])?w:e)[f],d=b&&l?u(p,r):m&&"function"==typeof p?u(Function.call,p):p,w&&c(w,f,p,t&s.U),g[f]!=p&&i(g,f,d),m&&x[f]!=p&&(x[f]=p)};r.core=o,s.F=1,s.G=2,s.S=4,s.P=8,s.B=16,s.W=32,s.U=64,s.R=128,t.exports=s},function(t,n,e){var r=e(14);t.exports=function(t,n,e){if(r(t),void 0===n)return t;switch(e){case 1:return function(e){return t.call(n,e)};case 2:return function(e,r){return t.call(n,e,r)};case 3:return function(e,r,o){return t.call(n,e,r,o)}}return function(){return t.apply(n,arguments)}}},function(t,n){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,n,e){var r=e(10),o=e(0)("toStringTag"),i="Arguments"==r(function(){return arguments}());t.exports=function(t){var n,e,c;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(e=function(t,n){try{return t[n]}catch(t){}}(n=Object(t),o))?e:i?r(n):"Object"==(c=r(n))&&"function"==typeof n.callee?"Arguments":c}},function(t,n){var e=0,r=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++e+r).toString(36))}},function(t,n,e){var r=e(6),o=e(1).document,i=r(o)&&r(o.createElement);t.exports=function(t){return i?o.createElement(t):{}}},function(t,n){var e=Math.ceil,r=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?r:e)(t)}},function(t,n){t.exports=function(t){if(void 0==t)throw TypeError("Can't call method on  "+t);return t}},function(t,n,e){var r=e(51),o=e(19);t.exports=function(t){return r(o(t))}},function(t,n,e){var r=e(24)("keys"),o=e(16);t.exports=function(t){return r[t]||(r[t]=o(t))}},function(t,n,e){var r=e(11).f,o=e(8),i=e(0)("toStringTag");t.exports=function(t,n,e){t&&!o(t=e?t:t.prototype,i)&&r(t,i,{configurable:!0,value:n})}},function(t,n,e){"use strict";var r=e(14);t.exports.f=function(t){return new function(t){var n,e;this.promise=new t(function(t,r){if(void 0!==n||void 0!==e)throw TypeError("Bad Promise constructor");n=t,e=r}),this.resolve=r(n),this.reject=r(e)}(t)}},function(t,n,e){var r=e(1),o="__core-js_shared__",i=r[o]||(r[o]={});t.exports=function(t){return i[t]||(i[t]={})}},function(t,n){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,n){t.exports=function(t,n){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:n}}},function(t,n,e){"use strict";var r=e(28),o=e(12),i=e(5),c=e(3),u=e(8),a=e(9),s=e(47),f=e(22),l=e(54),p=e(0)("iterator"),d=!([].keys&&"next"in[].keys()),v="values",h=function(){return this};t.exports=function(t,n,e,y,m,b,w){s(e,n,y);var g,x,_,S=function(t){if(!d&&t in O)return O[t];switch(t){case"keys":case v:return function(){return new e(this,t)}}return function(){return new e(this,t)}},k=n+" Iterator",P=m==v,j=!1,O=t.prototype,T=O[p]||O["@@iterator"]||m&&O[m],L=!d&&T||S(m),E=m?P?S("entries"):L:void 0,M="Array"==n?O.entries||T:T;if(M&&(_=l(M.call(new t)))!==Object.prototype&&_.next&&(f(_,k,!0),r||u(_,p)||c(_,p,h)),P&&T&&T.name!==v&&(j=!0,L=function(){return T.call(this)}),r&&!w||!d&&!j&&O[p]||c(O,p,L),a[n]=L,a[k]=h,m)if(g={values:P?L:S(v),keys:b?L:S("keys"),entries:E},w)for(x in g)x in O||i(O,x,g[x]);else o(o.P+o.F*(d||j),n,g);return g}},function(t,n){t.exports=!1},function(t,n,e){var r=e(50),o=e(31);t.exports=Object.keys||function(t){return r(t,o)}},function(t,n,e){var r=e(18),o=Math.min;t.exports=function(t){return t>0?o(r(t),9007199254740991):0}},function(t,n){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(t,n,e){var r=e(1).document;t.exports=r&&r.documentElement},function(t,n,e){var r=e(2),o=e(14),i=e(0)("species");t.exports=function(t,n){var e,c=r(t).constructor;return void 0===c||void 0==(e=r(c)[i])?n:o(e)}},function(t,n,e){var r,o,i,c=e(13),u=e(66),a=e(32),s=e(17),f=e(1),l=f.process,p=f.setImmediate,d=f.clearImmediate,v=f.MessageChannel,h=f.Dispatch,y=0,m={},b="onreadystatechange",w=function(){var t=+this;if(m.hasOwnProperty(t)){var n=m[t];delete m[t],n()}},g=function(t){w.call(t.data)};p&&d||(p=function(t){for(var n=[],e=1;arguments.length>e;)n.push(arguments[e++]);return m[++y]=function(){u("function"==typeof t?t:Function(t),n)},r(y),y},d=function(t){delete m[t]},"process"==e(10)(l)?r=function(t){l.nextTick(c(w,t,1))}:h&&h.now?r=function(t){h.now(c(w,t,1))}:v?(i=(o=new v).port2,o.port1.onmessage=g,r=c(i.postMessage,i,1)):f.addEventListener&&"function"==typeof postMessage&&!f.importScripts?(r=function(t){f.postMessage(t+"","*")},f.addEventListener("message",g,!1)):r=b in s("script")?function(t){a.appendChild(s("script"))[b]=function(){a.removeChild(this),w.call(t)}}:function(t){setTimeout(c(w,t,1),0)}),t.exports={set:p,clear:d}},function(t,n){t.exports=function(t){try{return{e:!1,v:t()}}catch(t){return{e:!0,v:t}}}},function(t,n,e){var r=e(2),o=e(6),i=e(23);t.exports=function(t,n){if(r(t),o(n)&&n.constructor===t)return n;var e=i.f(t);return(0,e.resolve)(n),e.promise}},function(t,n,e){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.L2Dwidget=void 0;var r,o=function(){function t(t,n){for(var e=0;e<n.length;e++){var r=n[e];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(n,e,r){return e&&t(n.prototype,e),r&&t(n,r),n}}(),i=e(39),c=(r=i,r&&r.__esModule?r:{default:r}),u=e(38);var a=void 0,s=new(function(){function t(){!function(t,n){if(!(t instanceof n))throw new TypeError("Cannot call a class as a function")}(this,t),this.eventHandlers={},this.config=u.config}return o(t,[{key:"on",value:function(t,n){if("function"!=typeof n)throw new TypeError("Event handler is not a function.");return this.eventHandlers[t]||(this.eventHandlers[t]=[]),this.eventHandlers[t].push(n),this}},{key:"emit",value:function(t){for(var n=arguments.length,e=Array(n>1?n-1:0),r=1;r<n;r++)e[r-1]=arguments[r];return this.eventHandlers[t]&&this.eventHandlers[t].forEach(function(t){"function"==typeof t&&t.apply(void 0,e)}),this.eventHandlers["*"]&&this.eventHandlers["*"].forEach(function(n){"function"==typeof n&&n.apply(void 0,[t].concat(e))}),this}},{key:"init",value:function(){var t=this,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};(0,u.configApplyer)(n),this.emit("config",this.config),!u.config.mobile.show&&c.default.mobile()||e.e(0).then(e.bind(null,76)).then(function(n){(a=n).theRealInit(t)}).catch(function(t){console.error(t)})}},{key:"captureFrame",value:function(t){return a.captureFrame(t)}},{key:"downloadFrame",value:function(){this.captureFrame(function(t){var n=document.createElement("a");document.body.appendChild(n),n.setAttribute("type","hidden"),n.href=t,n.download="live2d.png",n.click()})}}]),t}());n.L2Dwidget=s},function(t,n,e){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.config=n.configApplyer=void 0;var r=i(e(74)),o=i(e(75));function i(t){return t&&t.__esModule?t:{default:t}}var c={};n.configApplyer=function(t){(0,o.default)(c,t,r.default)},n.config=c},function(t,n,e){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},o=window.device,i={},c=[];window.device=i;var u=window.document.documentElement,a=window.navigator.userAgent.toLowerCase(),s=["googletv","viera","smarttv","internet.tv","netcast","nettv","appletv","boxee","kylo","roku","dlnadoc","roku","pov_tv","hbbtv","ce-html"];i.macos=function(){return f("mac")},i.ios=function(){return i.iphone()||i.ipod()||i.ipad()},i.iphone=function(){return!i.windows()&&f("iphone")},i.ipod=function(){return f("ipod")},i.ipad=function(){return f("ipad")},i.android=function(){return!i.windows()&&f("android")},i.androidPhone=function(){return i.android()&&f("mobile")},i.androidTablet=function(){return i.android()&&!f("mobile")},i.blackberry=function(){return f("blackberry")||f("bb10")||f("rim")},i.blackberryPhone=function(){return i.blackberry()&&!f("tablet")},i.blackberryTablet=function(){return i.blackberry()&&f("tablet")},i.windows=function(){return f("windows")},i.windowsPhone=function(){return i.windows()&&f("phone")},i.windowsTablet=function(){return i.windows()&&f("touch")&&!i.windowsPhone()},i.fxos=function(){return(f("(mobile")||f("(tablet"))&&f(" rv:")},i.fxosPhone=function(){return i.fxos()&&f("mobile")},i.fxosTablet=function(){return i.fxos()&&f("tablet")},i.meego=function(){return f("meego")},i.cordova=function(){return window.cordova&&"file:"===location.protocol},i.nodeWebkit=function(){return"object"===r(window.process)},i.mobile=function(){return i.androidPhone()||i.iphone()||i.ipod()||i.windowsPhone()||i.blackberryPhone()||i.fxosPhone()||i.meego()},i.tablet=function(){return i.ipad()||i.androidTablet()||i.blackberryTablet()||i.windowsTablet()||i.fxosTablet()},i.desktop=function(){return!i.tablet()&&!i.mobile()},i.television=function(){for(var t=0;t<s.length;){if(f(s[t]))return!0;t++}return!1},i.portrait=function(){return window.innerHeight/window.innerWidth>1},i.landscape=function(){return window.innerHeight/window.innerWidth<1},i.noConflict=function(){return window.device=o,this};function f(t){return-1!==a.indexOf(t)}function l(t){return u.className.match(new RegExp(t,"i"))}function p(t){var n=null;l(t)||(n=u.className.replace(/^\s+|\s+$/g,""),u.className=n+" "+t)}function d(t){l(t)&&(u.className=u.className.replace(" "+t,""))}i.ios()?i.ipad()?p("ios ipad tablet"):i.iphone()?p("ios iphone mobile"):i.ipod()&&p("ios ipod mobile"):i.macos()?p("macos desktop"):i.android()?i.androidTablet()?p("android tablet"):p("android mobile"):i.blackberry()?i.blackberryTablet()?p("blackberry tablet"):p("blackberry mobile"):i.windows()?i.windowsTablet()?p("windows tablet"):i.windowsPhone()?p("windows mobile"):p("windows desktop"):i.fxos()?i.fxosTablet()?p("fxos tablet"):p("fxos mobile"):i.meego()?p("meego mobile"):i.nodeWebkit()?p("node-webkit"):i.television()?p("television"):i.desktop()&&p("desktop"),i.cordova()&&p("cordova");function v(){i.landscape()?(d("portrait"),p("landscape"),h("landscape")):(d("landscape"),p("portrait"),h("portrait")),b()}function h(t){for(var n in c)c[n](t)}i.onChangeOrientation=function(t){"function"==typeof t&&c.push(t)};var y="resize";Object.prototype.hasOwnProperty.call(window,"onorientationchange")&&(y="onorientationchange"),window.addEventListener?window.addEventListener(y,v,!1):window.attachEvent?window.attachEvent(y,v):window[y]=v,v();function m(t){for(var n=0;n<t.length;n++)if(i[t[n]]())return t[n];return"unknown"}i.type=m(["mobile","tablet","desktop"]),i.os=m(["ios","iphone","ipad","ipod","android","blackberry","windows","fxos","meego","television"]);function b(){i.orientation=m(["portrait","landscape"])}b(),n.default=i},function(t,n,e){e(41),e(73),t.exports=e(37)},function(t,n,e){e(42),e(45),e(56),e(60),e(71),e(72),t.exports=e(4).Promise},function(t,n,e){"use strict";var r=e(15),o={};o[e(0)("toStringTag")]="z",o+""!="[object z]"&&e(5)(Object.prototype,"toString",function(){return"[object "+r(this)+"]"},!0)},function(t,n,e){t.exports=!e(7)&&!e(25)(function(){return 7!=Object.defineProperty(e(17)("div"),"a",{get:function(){return 7}}).a})},function(t,n,e){var r=e(6);t.exports=function(t,n){if(!r(t))return t;var e,o;if(n&&"function"==typeof(e=t.toString)&&!r(o=e.call(t)))return o;if("function"==typeof(e=t.valueOf)&&!r(o=e.call(t)))return o;if(!n&&"function"==typeof(e=t.toString)&&!r(o=e.call(t)))return o;throw TypeError("Can't convert object to primitive value")}},function(t,n,e){"use strict";var r=e(46)(!0);e(27)(String,"String",function(t){this._t=String(t),this._i=0},function(){var t,n=this._t,e=this._i;return e>=n.length?{value:void 0,done:!0}:(t=r(n,e),this._i+=t.length,{value:t,done:!1})})},function(t,n,e){var r=e(18),o=e(19);t.exports=function(t){return function(n,e){var i,c,u=String(o(n)),a=r(e),s=u.length;return a<0||a>=s?t?"":void 0:(i=u.charCodeAt(a))<55296||i>56319||a+1===s||(c=u.charCodeAt(a+1))<56320||c>57343?t?u.charAt(a):i:t?u.slice(a,a+2):c-56320+(i-55296<<10)+65536}}},function(t,n,e){"use strict";var r=e(48),o=e(26),i=e(22),c={};e(3)(c,e(0)("iterator"),function(){return this}),t.exports=function(t,n,e){t.prototype=r(c,{next:o(1,e)}),i(t,n+" Iterator")}},function(t,n,e){var r=e(2),o=e(49),i=e(31),c=e(21)("IE_PROTO"),u=function(){},a="prototype",s=function(){var t,n=e(17)("iframe"),r=i.length;for(n.style.display="none",e(32).appendChild(n),n.src="javascript:",(t=n.contentWindow.document).open(),t.write("<script>document.F=Object<\/script>"),t.close(),s=t.F;r--;)delete s[a][i[r]];return s()};t.exports=Object.create||function(t,n){var e;return null!==t?(u[a]=r(t),e=new u,u[a]=null,e[c]=t):e=s(),void 0===n?e:o(e,n)}},function(t,n,e){var r=e(11),o=e(2),i=e(29);t.exports=e(7)?Object.defineProperties:function(t,n){o(t);for(var e,c=i(n),u=c.length,a=0;u>a;)r.f(t,e=c[a++],n[e]);return t}},function(t,n,e){var r=e(8),o=e(20),i=e(52)(!1),c=e(21)("IE_PROTO");t.exports=function(t,n){var e,u=o(t),a=0,s=[];for(e in u)e!=c&&r(u,e)&&s.push(e);for(;n.length>a;)r(u,e=n[a++])&&(~i(s,e)||s.push(e));return s}},function(t,n,e){var r=e(10);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==r(t)?t.split(""):Object(t)}},function(t,n,e){var r=e(20),o=e(30),i=e(53);t.exports=function(t){return function(n,e,c){var u,a=r(n),s=o(a.length),f=i(c,s);if(t&&e!=e){for(;s>f;)if((u=a[f++])!=u)return!0}else for(;s>f;f++)if((t||f in a)&&a[f]===e)return t||f||0;return!t&&-1}}},function(t,n,e){var r=e(18),o=Math.max,i=Math.min;t.exports=function(t,n){return(t=r(t))<0?o(t+n,0):i(t,n)}},function(t,n,e){var r=e(8),o=e(55),i=e(21)("IE_PROTO"),c=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=o(t),r(t,i)?t[i]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?c:null}},function(t,n,e){var r=e(19);t.exports=function(t){return Object(r(t))}},function(t,n,e){for(var r=e(57),o=e(29),i=e(5),c=e(1),u=e(3),a=e(9),s=e(0),f=s("iterator"),l=s("toStringTag"),p=a.Array,d={CSSRuleList:!0,CSSStyleDeclaration:!1,CSSValueList:!1,ClientRectList:!1,DOMRectList:!1,DOMStringList:!1,DOMTokenList:!0,DataTransferItemList:!1,FileList:!1,HTMLAllCollection:!1,HTMLCollection:!1,HTMLFormElement:!1,HTMLSelectElement:!1,MediaList:!0,MimeTypeArray:!1,NamedNodeMap:!1,NodeList:!0,PaintRequestList:!1,Plugin:!1,PluginArray:!1,SVGLengthList:!1,SVGNumberList:!1,SVGPathSegList:!1,SVGPointList:!1,SVGStringList:!1,SVGTransformList:!1,SourceBufferList:!1,StyleSheetList:!0,TextTrackCueList:!1,TextTrackList:!1,TouchList:!1},v=o(d),h=0;h<v.length;h++){var y,m=v[h],b=d[m],w=c[m],g=w&&w.prototype;if(g&&(g[f]||u(g,f,p),g[l]||u(g,l,m),a[m]=p,b))for(y in r)g[y]||i(g,y,r[y],!0)}},function(t,n,e){"use strict";var r=e(58),o=e(59),i=e(9),c=e(20);t.exports=e(27)(Array,"Array",function(t,n){this._t=c(t),this._i=0,this._k=n},function(){var t=this._t,n=this._k,e=this._i++;return!t||e>=t.length?(this._t=void 0,o(1)):o(0,"keys"==n?e:"values"==n?t[e]:[e,t[e]])},"values"),i.Arguments=i.Array,r("keys"),r("values"),r("entries")},function(t,n,e){var r=e(0)("unscopables"),o=Array.prototype;void 0==o[r]&&e(3)(o,r,{}),t.exports=function(t){o[r][t]=!0}},function(t,n){t.exports=function(t,n){return{value:n,done:!!t}}},function(t,n,e){"use strict";var r,o,i,c,u=e(28),a=e(1),s=e(13),f=e(15),l=e(12),p=e(6),d=e(14),v=e(61),h=e(62),y=e(33),m=e(34).set,b=e(67)(),w=e(23),g=e(35),x=e(36),_="Promise",S=a.TypeError,k=a.process,P=a[_],j="process"==f(k),O=function(){},T=o=w.f,L=!!function(){try{var t=P.resolve(1),n=(t.constructor={})[e(0)("species")]=function(t){t(O,O)};return(j||"function"==typeof PromiseRejectionEvent)&&t.then(O)instanceof n}catch(t){}}(),E=function(t){var n;return!(!p(t)||"function"!=typeof(n=t.then))&&n},M=function(t,n){if(!t._n){t._n=!0;var e=t._c;b(function(){for(var r=t._v,o=1==t._s,i=0,c=function(n){var e,i,c=o?n.ok:n.fail,u=n.resolve,a=n.reject,s=n.domain;try{c?(o||(2==t._h&&F(t),t._h=1),!0===c?e=r:(s&&s.enter(),e=c(r),s&&s.exit()),e===n.promise?a(S("Promise-chain cycle")):(i=E(e))?i.call(e,u,a):u(e)):a(r)}catch(t){a(t)}};e.length>i;)c(e[i++]);t._c=[],t._n=!1,n&&!t._h&&A(t)})}},A=function(t){m.call(a,function(){var n,e,r,o=t._v,i=C(t);if(i&&(n=g(function(){j?k.emit("unhandledRejection",o,t):(e=a.onunhandledrejection)?e({promise:t,reason:o}):(r=a.console)&&r.error&&r.error("Unhandled promise rejection",o)}),t._h=j||C(t)?2:1),t._a=void 0,i&&n.e)throw n.v})},C=function(t){return 1!==t._h&&0===(t._a||t._c).length},F=function(t){m.call(a,function(){var n;j?k.emit("rejectionHandled",t):(n=a.onrejectionhandled)&&n({promise:t,reason:t._v})})},N=function(t){var n=this;n._d||(n._d=!0,(n=n._w||n)._v=t,n._s=2,n._a||(n._a=n._c.slice()),M(n,!0))},R=function(t){var n,e=this;if(!e._d){e._d=!0,e=e._w||e;try{if(e===t)throw S("Promise can't be resolved itself");(n=E(t))?b(function(){var r={_w:e,_d:!1};try{n.call(t,s(R,r,1),s(N,r,1))}catch(t){N.call(r,t)}}):(e._v=t,e._s=1,M(e,!1))}catch(t){N.call({_w:e,_d:!1},t)}}};L||(P=function(t){v(this,P,_,"_h"),d(t),r.call(this);try{t(s(R,this,1),s(N,this,1))}catch(t){N.call(this,t)}},(r=function(t){this._c=[],this._a=void 0,this._s=0,this._d=!1,this._v=void 0,this._h=0,this._n=!1}).prototype=e(68)(P.prototype,{then:function(t,n){var e=T(y(this,P));return e.ok="function"!=typeof t||t,e.fail="function"==typeof n&&n,e.domain=j?k.domain:void 0,this._c.push(e),this._a&&this._a.push(e),this._s&&M(this,!1),e.promise},catch:function(t){return this.then(void 0,t)}}),i=function(){var t=new r;this.promise=t,this.resolve=s(R,t,1),this.reject=s(N,t,1)},w.f=T=function(t){return t===P||t===c?new i(t):o(t)}),l(l.G+l.W+l.F*!L,{Promise:P}),e(22)(P,_),e(69)(_),c=e(4)[_],l(l.S+l.F*!L,_,{reject:function(t){var n=T(this);return(0,n.reject)(t),n.promise}}),l(l.S+l.F*(u||!L),_,{resolve:function(t){return x(u&&this===c?P:this,t)}}),l(l.S+l.F*!(L&&e(70)(function(t){P.all(t).catch(O)})),_,{all:function(t){var n=this,e=T(n),r=e.resolve,o=e.reject,i=g(function(){var e=[],i=0,c=1;h(t,!1,function(t){var u=i++,a=!1;e.push(void 0),c++,n.resolve(t).then(function(t){a||(a=!0,e[u]=t,--c||r(e))},o)}),--c||r(e)});return i.e&&o(i.v),e.promise},race:function(t){var n=this,e=T(n),r=e.reject,o=g(function(){h(t,!1,function(t){n.resolve(t).then(e.resolve,r)})});return o.e&&r(o.v),e.promise}})},function(t,n){t.exports=function(t,n,e,r){if(!(t instanceof n)||void 0!==r&&r in t)throw TypeError(e+": incorrect invocation!");return t}},function(t,n,e){var r=e(13),o=e(63),i=e(64),c=e(2),u=e(30),a=e(65),s={},f={};(n=t.exports=function(t,n,e,l,p){var d,v,h,y,m=p?function(){return t}:a(t),b=r(e,l,n?2:1),w=0;if("function"!=typeof m)throw TypeError(t+" is not iterable!");if(i(m)){for(d=u(t.length);d>w;w++)if((y=n?b(c(v=t[w])[0],v[1]):b(t[w]))===s||y===f)return y}else for(h=m.call(t);!(v=h.next()).done;)if((y=o(h,b,v.value,n))===s||y===f)return y}).BREAK=s,n.RETURN=f},function(t,n,e){var r=e(2);t.exports=function(t,n,e,o){try{return o?n(r(e)[0],e[1]):n(e)}catch(n){var i=t.return;throw void 0!==i&&r(i.call(t)),n}}},function(t,n,e){var r=e(9),o=e(0)("iterator"),i=Array.prototype;t.exports=function(t){return void 0!==t&&(r.Array===t||i[o]===t)}},function(t,n,e){var r=e(15),o=e(0)("iterator"),i=e(9);t.exports=e(4).getIteratorMethod=function(t){if(void 0!=t)return t[o]||t["@@iterator"]||i[r(t)]}},function(t,n){t.exports=function(t,n,e){var r=void 0===e;switch(n.length){case 0:return r?t():t.call(e);case 1:return r?t(n[0]):t.call(e,n[0]);case 2:return r?t(n[0],n[1]):t.call(e,n[0],n[1]);case 3:return r?t(n[0],n[1],n[2]):t.call(e,n[0],n[1],n[2]);case 4:return r?t(n[0],n[1],n[2],n[3]):t.call(e,n[0],n[1],n[2],n[3])}return t.apply(e,n)}},function(t,n,e){var r=e(1),o=e(34).set,i=r.MutationObserver||r.WebKitMutationObserver,c=r.process,u=r.Promise,a="process"==e(10)(c);t.exports=function(){var t,n,e,s=function(){var r,o;for(a&&(r=c.domain)&&r.exit();t;){o=t.fn,t=t.next;try{o()}catch(r){throw t?e():n=void 0,r}}n=void 0,r&&r.enter()};if(a)e=function(){c.nextTick(s)};else if(!i||r.navigator&&r.navigator.standalone)if(u&&u.resolve){var f=u.resolve();e=function(){f.then(s)}}else e=function(){o.call(r,s)};else{var l=!0,p=document.createTextNode("");new i(s).observe(p,{characterData:!0}),e=function(){p.data=l=!l}}return function(r){var o={fn:r,next:void 0};n&&(n.next=o),t||(t=o,e()),n=o}}},function(t,n,e){var r=e(5);t.exports=function(t,n,e){for(var o in n)r(t,o,n[o],e);return t}},function(t,n,e){"use strict";var r=e(1),o=e(11),i=e(7),c=e(0)("species");t.exports=function(t){var n=r[t];i&&n&&!n[c]&&o.f(n,c,{configurable:!0,get:function(){return this}})}},function(t,n,e){var r=e(0)("iterator"),o=!1;try{var i=[7][r]();i.return=function(){o=!0},Array.from(i,function(){throw 2})}catch(t){}t.exports=function(t,n){if(!n&&!o)return!1;var e=!1;try{var i=[7],c=i[r]();c.next=function(){return{done:e=!0}},i[r]=function(){return c},t(i)}catch(t){}return e}},function(t,n,e){"use strict";var r=e(12),o=e(4),i=e(1),c=e(33),u=e(36);r(r.P+r.R,"Promise",{finally:function(t){var n=c(this,o.Promise||i.Promise),e="function"==typeof t;return this.then(e?function(e){return u(n,t()).then(function(){return e})}:t,e?function(e){return u(n,t()).then(function(){throw e})}:t)}})},function(t,n,e){"use strict";var r=e(12),o=e(23),i=e(35);r(r.S,"Promise",{try:function(t){var n=o.f(this),e=i(t);return(e.e?n.reject:n.resolve)(e.v),n.promise}})},function(t,n,e){"use strict";Object.defineProperty(n,"__esModule",{value:!0});function r(){try{return document.currentScript.src}catch(n){var t=document.getElementsByTagName("script");return t[t.length-1].src}}e.p=r().replace(/[^/\\\\]+$/,""),n.getCurrentPath=r},function(t,n,e){"use strict";t.exports={model:{jsonPath:"https://unpkg.com/live2d-widget-model-shizuku@latest/assets/shizuku.model.json",scale:1},display:{superSample:2,width:200,height:400,position:"right",hOffset:0,vOffset:-20},mobile:{show:!0,scale:.8,motion:!0},name:{canvas:"live2dcanvas",div:"live2d-widget"},react:{opacity:1},dev:{border:!1},dialog:{enable:!1,hitokoto:!1}}},function(t,n,e){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};t.exports=function t(n,e){n=n||{};function o(n,e){for(var o in e)if(e.hasOwnProperty(o)){var i=e[o];if("__proto__"===o)continue;var c=n[o];null==c?n[o]=i:"object"===(void 0===c?"undefined":r(c))&&null!==c&&"object"===(void 0===i?"undefined":r(i))&&null!==i&&t(c,i)}}for(var i=arguments.length,c=0;c<i;){var u=arguments[c++];u&&o(n,u)}return n}}]).L2Dwidget;
//# sourceMappingURL=L2Dwidget.min.js.map;
(() => {
  'use strict';

  const cryptoObj = window.crypto || window.msCrypto;
  const storage = window.localStorage;

  const storageName = 'hexo-blog-encrypt:#' + window.location.pathname;
  const keySalt = textToArray('hexo-blog-encrypt的作者们都是大帅比!');
  const ivSalt = textToArray('hexo-blog-encrypt是地表最强Hexo加密插件!');

// As we can't detect the wrong password with AES-CBC,
// so adding an empty div and check it when decrption.
const knownPrefix = "<hbe-prefix></hbe-prefix>";

  const mainElement = document.getElementById('hexo-blog-encrypt');
  const wrongPassMessage = mainElement.dataset['wpm'];
  const wrongHashMessage = mainElement.dataset['whm'];
  const dataElement = mainElement.getElementsByTagName('script')['hbeData'];
  const encryptedData = dataElement.innerText;
  const HmacDigist = dataElement.dataset['hmacdigest'];

  function hexToArray(s) {
    return new Uint8Array(s.match(/[\da-f]{2}/gi).map((h => {
      return parseInt(h, 16);
    })));
  }

  function textToArray(s) {
    var i = s.length;
    var n = 0;
    var ba = new Array()

    for (var j = 0; j < i;) {
      var c = s.codePointAt(j);
      if (c < 128) {
        ba[n++] = c;
        j++;
      } else if ((c > 127) && (c < 2048)) {
        ba[n++] = (c >> 6) | 192;
        ba[n++] = (c & 63) | 128;
        j++;
      } else if ((c > 2047) && (c < 65536)) {
        ba[n++] = (c >> 12) | 224;
        ba[n++] = ((c >> 6) & 63) | 128;
        ba[n++] = (c & 63) | 128;
        j++;
      } else {
        ba[n++] = (c >> 18) | 240;
        ba[n++] = ((c >> 12) & 63) | 128;
        ba[n++] = ((c >> 6) & 63) | 128;
        ba[n++] = (c & 63) | 128;
        j += 2;
      }
    }
    return new Uint8Array(ba);
  }

  function arrayBufferToHex(arrayBuffer) {
    if (typeof arrayBuffer !== 'object' || arrayBuffer === null || typeof arrayBuffer.byteLength !== 'number') {
      throw new TypeError('Expected input to be an ArrayBuffer')
    }

    var view = new Uint8Array(arrayBuffer)
    var result = ''
    var value

    for (var i = 0; i < view.length; i++) {
      value = view[i].toString(16)
      result += (value.length === 1 ? '0' + value : value)
    }

    return result
  }

  async function getExecutableScript(oldElem) {
    let out = document.createElement('script');
    const attList = ['type', 'text', 'src', 'crossorigin', 'defer', 'referrerpolicy'];
    attList.forEach((att) => {
      if (oldElem[att])
        out[att] = oldElem[att];
    })

    return out;
  }

  async function convertHTMLToElement(content) {
    let out = document.createElement('div');
    out.innerHTML = content;
    out.querySelectorAll('script').forEach(async (elem) => {
      elem.replaceWith(await getExecutableScript(elem));
    });

    return out;
  }

  function getKeyMaterial(password) {
    let encoder = new TextEncoder();
    return cryptoObj.subtle.importKey(
      'raw',
      encoder.encode(password),
      {
        'name': 'PBKDF2',
      },
      false,
      [
        'deriveKey',
        'deriveBits',
      ]
    );
  }

  function getHmacKey(keyMaterial) {
    return cryptoObj.subtle.deriveKey({
      'name': 'PBKDF2',
      'hash': 'SHA-256',
      'salt': keySalt.buffer,
      'iterations': 1024
    }, keyMaterial, {
      'name': 'HMAC',
      'hash': 'SHA-256',
      'length': 256,
    }, true, [
      'verify',
    ]);
  }

  function getDecryptKey(keyMaterial) {
    return cryptoObj.subtle.deriveKey({
      'name': 'PBKDF2',
      'hash': 'SHA-256',
      'salt': keySalt.buffer,
      'iterations': 1024,
    }, keyMaterial, {
      'name': 'AES-CBC',
      'length': 256,
    }, true, [
      'decrypt',
    ]);
  }

  function getIv(keyMaterial) {
    return cryptoObj.subtle.deriveBits({
      'name': 'PBKDF2',
      'hash': 'SHA-256',
      'salt': ivSalt.buffer,
      'iterations': 512,
    }, keyMaterial, 16 * 8);
  }

  async function verifyContent(key, content) {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(content);

    let signature = hexToArray(HmacDigist);

    const result = await cryptoObj.subtle.verify({
      'name': 'HMAC',
      'hash': 'SHA-256',
    }, key, signature, encoded);
    console.log(`Verification result: ${result}`);
    if (!result) {
      alert(wrongHashMessage);
      console.log(`${wrongHashMessage}, got `, signature, ` but proved wrong.`);
    }
    return result;
  }

  async function decrypt(decryptKey, iv, hmacKey) {
    let typedArray = hexToArray(encryptedData);

    const result = await cryptoObj.subtle.decrypt({
      'name': 'AES-CBC',
      'iv': iv,
    }, decryptKey, typedArray.buffer).then(async (result) => {
      const decoder = new TextDecoder();
      const decoded = decoder.decode(result);

      // check the prefix, if not then we can sure here is wrong password.
      if (!decoded.startsWith(knownPrefix)) {
        throw "Decode successfully but not start with KnownPrefix.";
      }

      const hideButton = document.createElement('button');
      hideButton.textContent = 'Encrypt again';
      hideButton.type = 'button';
      hideButton.classList.add("hbe-button");
      hideButton.addEventListener('click', () => {
        window.localStorage.removeItem(storageName);
        window.location.reload();
      });

      document.getElementById('hexo-blog-encrypt').style.display = 'inline';
      document.getElementById('hexo-blog-encrypt').innerHTML = '';
      document.getElementById('hexo-blog-encrypt').appendChild(await convertHTMLToElement(decoded));
      document.getElementById('hexo-blog-encrypt').appendChild(hideButton);

      // support html5 lazyload functionality.
      document.querySelectorAll('img').forEach((elem) => {
        if (elem.getAttribute("data-src") && !elem.src) {
          elem.src = elem.getAttribute('data-src');
        }
      });

      // support theme-next refresh
      window.NexT && NexT.boot && typeof NexT.boot.refresh === 'function' && NexT.boot.refresh();

      // TOC part
      var tocDiv = document.getElementById("toc-div");
      if (tocDiv) {
        tocDiv.style.display = 'inline';
      }

      var tocDivs = document.getElementsByClassName('toc-div-class');
      if (tocDivs && tocDivs.length > 0) {
        for (var idx = 0; idx < tocDivs.length; idx++) {
          tocDivs[idx].style.display = 'inline';
        }
      }
      
      // trigger event
      var event = new Event('hexo-blog-decrypt');
      window.dispatchEvent(event);

      return await verifyContent(hmacKey, decoded);
    }).catch((e) => {
      alert(wrongPassMessage);
      console.log(e);
      return false;
    });

    return result;

  }

  function hbeLoader() {

    const oldStorageData = JSON.parse(storage.getItem(storageName));

    if (oldStorageData) {
      console.log(`Password got from localStorage(${storageName}): `, oldStorageData);

      const sIv = hexToArray(oldStorageData.iv).buffer;
      const sDk = oldStorageData.dk;
      const sHmk = oldStorageData.hmk;

      cryptoObj.subtle.importKey('jwk', sDk, {
        'name': 'AES-CBC',
        'length': 256,
      }, true, [
        'decrypt',
      ]).then((dkCK) => {
        cryptoObj.subtle.importKey('jwk', sHmk, {
          'name': 'HMAC',
          'hash': 'SHA-256',
          'length': 256,
        }, true, [
          'verify',
        ]).then((hmkCK) => {
          decrypt(dkCK, sIv, hmkCK).then((result) => {
            if (!result) {
              storage.removeItem(storageName);
            }
          });
        });
      });
    }

    mainElement.addEventListener('keydown', async (event) => {
      if (event.isComposing || event.keyCode === 13) {
        const password = document.getElementById('hbePass').value;
        const keyMaterial = await getKeyMaterial(password);
        const hmacKey = await getHmacKey(keyMaterial);
        const decryptKey = await getDecryptKey(keyMaterial);
        const iv = await getIv(keyMaterial);

        decrypt(decryptKey, iv, hmacKey).then((result) => {
          console.log(`Decrypt result: ${result}`);
          if (result) {
            cryptoObj.subtle.exportKey('jwk', decryptKey).then((dk) => {
              cryptoObj.subtle.exportKey('jwk', hmacKey).then((hmk) => {
                const newStorageData = {
                  'dk': dk,
                  'iv': arrayBufferToHex(iv),
                  'hmk': hmk,
                };
                storage.setItem(storageName, JSON.stringify(newStorageData));
              });
            });
          }
        });
      }
    });
  }

  hbeLoader();

})();
