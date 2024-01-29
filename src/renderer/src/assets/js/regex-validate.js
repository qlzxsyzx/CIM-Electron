export const validUsername = (username) => {
    // 账号只能由数字字母构成且长度为4-10
    const reg = /^[a-zA-Z0-9]{4,10}$/;
    return reg.test(username);
}

export const validPassword = (password) => {
    // 密码不能包含空格等特殊字符且长度为4-20
    const reg = /^\S{4,20}$/;
    return reg.test(password);
}

export const validName = (name) => {
    // 昵称不能包含空格等特殊字符且长度为2-20
    const reg = /^\S{2,20}$/;
    return reg.test(name);
}
