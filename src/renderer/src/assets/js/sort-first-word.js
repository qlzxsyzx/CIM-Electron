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
    const sortList = list.sort((a, b) => {
        // 若有备注，则按备注排序，否则按名称排序
        let sort
        if (getNameOrRemarkFirstWord(name(a),remark(a)) === '#') {
            if (getNameOrRemarkFirstWord(name(b),remark(b)) === '#') {
                sort = 0
            }
            return 1
        } else if (getNameOrRemarkFirstWord(name(b),remark(b)) === '#') {
            if (getNameOrRemarkFirstWord(name(a),remark(a)) === '#') {
                sort = 0
            }
            return -1
        } else if (remark(a) && remark(b)) {
            sort = remark(a).localeCompare(remark(b))
        } else if (remark(a)) {
            sort = remark(a).localeCompare(name(b))
        } else if (remark(b)) {
            sort = name(a).localeCompare(remark(b))
        } else {
            sort = name(a).localeCompare(name(b))
        }
        if (sort === 0) {
            return a.createTime.localeCompare(b.createTime)
        }
    })
    const map = new Map()
    sortList.forEach(item => {
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