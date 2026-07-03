import "next-auth";

declare module 'next-auth' {
    interface User {
        _id?: string;
        isVerified?: boolean;
        username?: string;
        isAcceptingMessages?: boolean
    }
    interface Session {
        user: {
            _id?: string;
            isVerified?: boolean;
            username?: string;
            isAcceptingMessages?: boolean
        } & DefaultSessinon['user']
    }
}


declare module 'next-auth/jwt' {
    interface jwt {
        _id?: string;
        isVerified?: boolean;
        username?: string;
        isAcceptingMessages?: boolean
    }
}