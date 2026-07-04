import connectToDB from "@/lib/db";
import UserModel from "@/models/User";
import { sendVerificationEmail } from "@/utils/sendVerificationEmail";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await connectToDB();
    try {

        const { username, email, password } = await req.json();

        const existingUserWithVerifiedUsername = await UserModel.findOne({
            email: email,
            isVerified: true
        });

        if (existingUserWithVerifiedUsername) {
            return NextResponse.json({
                message: 'Username already taken',
                success: false
            }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1);

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            if (existingUser.isVerified) {
                return NextResponse.json({
                    success: false,
                    message: 'User already exists with this email',
                }, { status: 400 });
            } else {
                existingUser.password = hashedPassword;
                existingUser.verifyCode = code;
                existingUser.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUser.save();
            }
        } else {
            const newUser = new UserModel({
                username: username,
                email: email,
                password: hashedPassword,
                verifyCode: code,
                verifyCodeExpiry: expiry
            });

            await newUser.save();
        }

        await sendVerificationEmail(email, username, code);

        return NextResponse.json({
            message: 'User registered successfully',
            success: true
        }, { status: 200 })

    } catch (error) {
        console.log('Error registering user :: ', error);
        return NextResponse.json({
            message: 'Error registering user',
            success: false
        }, { status: 500 });
    }
}