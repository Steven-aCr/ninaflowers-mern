export const opcionalHttpOnlyCooki = (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
        const useCookie = req.headers['x-use-cookie'] === 'true';

        if (useCookie && data && data.token) {
            res.cookie('token', data.token, {
                httpOnly: true,
                secure: process.env.COOKIE_SECURE === 'true',
                sameSite: process.env.COOKIE_SAMESITE || 'none',
                maxAge: 8 * 60 * 60 * 1000 // 8 horas al igual que JWT
            });
        }

        return originalJson.call(this, data);
    };
    next();
};