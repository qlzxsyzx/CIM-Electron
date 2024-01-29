
export const formatLocalDateTimeToText = (localDateTime) => {
    // localDateTime比较当前时间，显示当天时间，昨天，星期，日期
    const date = new Date(localDateTime)
    const now = new Date()
    if(date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()){
        return date.toLocaleTimeString('zh-CN', {hour12: false, hour: '2-digit', minute: '2-digit'})
    }else if(date.getDate() === now.getDate() - 1){
        return '昨天'
    }else{
        const dayofWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const curDay = now.getDay() === 0 ? 7 : now.getDay();
        const mondayDate = now.getDate() - curDay + 1;
        now.setDate(mondayDate)  // 当周星期一的日期
        if(date < now) {
            // 不在一个星期
            return date.toLocaleDateString('zh-CN', {year: 'numeric', month: '2-digit', day: '2-digit'})
        }else {
            const weekDay = date.getDay();
            return dayofWeek[weekDay]
        }
    }
}