export const parseJwt = (token) => {
    try {
        const data = JSON.parse(atob(token.split('.')[1]));
        return {
            issuedAt: data.iat * 1000,
            expiredAt: data.exp * 1000,
            subject: data.sub   
        }
    } catch {
        return null;
    }
};
