// 写一个js判断当前platform是win,mac,android,ios,linux
export const getPlatform = () => {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/1777
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/1
    if (userAgent.indexOf("Mac") > -1) {
        return "MacOS";
    }
    
    // Windows detection from: http://stackoverflow.com/a/9039885/1777
    if (userAgent.indexOf("Win") > -1) {
        return "Windows";
    }

    // Any other platform that uses a "Linux" UA string
    if (userAgent.indexOf("Linux") > -1) {
        return "Linux";
    }
    
    return "Unknown";
}