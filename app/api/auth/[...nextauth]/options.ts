import connectToDB from "@/lib/db";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthConfig = {
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                identifier: { label: "Email", type: "text", placeholder: "Email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req): Promise<any> {

                await connectToDB();

                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    })

                    if (!user) {
                        throw new Error('User not found');
                    }

                    if (!user.isVerified) {
                        throw new Error('Please verify your account');
                    }

                    const isCorrectPass = await bcrypt.compare(credentials.password, user.password)

                    if (isCorrectPass) {
                        return user
                    } else {
                        throw new Error('Incorret credentials')
                    }
                } catch (error: any) {
                    throw new Error(error)
                }
            },

        })
    ],
    pages: {
        signIn: '/signin',

    },
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async jwt({ token, user, account, profile }) {
            if (user) {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username
            }
            return token
        },
        async session({ session, user, token }) {
            if (session) {
                session.user._id = token._id as string;
                session.user.isVerified = token.isVerified as boolean;
                session.user.isAcceptingMessages = token.isAcceptingMessages as boolean;
                session.user.username = token.username as string;
            }
            return session
        }
    },
    secret: process.env.NEXT_AUTH_SECRET
}