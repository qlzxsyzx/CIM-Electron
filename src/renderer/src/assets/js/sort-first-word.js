import { pinyin } from 'pinyin-pro'

// 得到名称或者备注的首字母，中文得到拼音首字母
const getNameOrRemarkFirstWord = (name,remark) => {
    const firstWord = remark ? remark.charAt(0) : name.charAt(0)
    const english = /^[A-Za-z]$/
    if (english.test(firstWord)) {
        return firstWord.toUpperCase()
    } else {
        const pinyinFirstWord = pinyin(firstWord, { pattern: 'first', toneType: 'none' })
        if (english.test(pinyinFirstWord)) {
            return pinyinFirstWord.toUpperCase()
        } else {
            return '#'
        }
    }
}

// 将名称按首字母排序，然后装入map中，key是首字母，value为数据
const sortListToMap = (list, name,remark) => {
    let sort
    list.sort((a, b) => {
        // 若有备注，则按备注排序，否则按名称排序
        const aname = name(a)
        const bname = name(b)
        const aremark = remark(a)
        const bremark = remark(b)
        const afirst = getNameOrRemarkFirstWord(aname,aremark)
        const bfirst = getNameOrRemarkFirstWord(bname,bremark)
        if (afirst === '#') {
            if (bfirst === '#') {
                sort = 0
            }
            return 1
        } else if (bfirst === '#') {
            return -1
        } else if (aremark && bremark) {
            sort = aremark.toLowerCase().localeCompare(bremark.toLowerCase())
        } else if (aremark) {
            sort = aremark.toLowerCase().localeCompare(bname.toLowerCase())
        } else if (bremark) {
            sort = aname.toLowerCase().localeCompare(bremark.toLowerCase())
        } else {
            sort = aname.toLowerCase().localeCompare(bname.toLowerCase())
        }
        if (sort === 0) {
            return a.createTime.localeCompare(b.createTime)
        }
        return sort
    })
    const map = new Map()
    list.forEach(item => {
        const firstWord = getNameOrRemarkFirstWord(name(item),remark(item))
        if (!map.has(firstWord)) {
            map.set(firstWord, [item])
        } else {
            map.get(firstWord).push(item)
        }
    })
    return map
}

export default sortListToMap;