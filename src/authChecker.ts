let authChecker = (req: any, res, next) => {
    debugger
    if (req.isAuthenticated) {
        console.log("authed")
        next();
    } else {
        console.log('not authed')
        res.redirect('/login');
    }
};

export {
    authChecker
}