import connectToDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { User } from "next-auth";
import UserModel from "@/models/User";
import MessageModel from "@/models/Messsage";

export async function POST(req: NextRequest) {
    await connectToDB();
    const { username, content } = await req.json();

    try {

        const user = await UserModel.findOne({ username });

        if (!user) {
            return NextResponse.json({ message: 'User not found !', success: false }, { status: 404 });
        }

        if (!user.isAcceptingMessages) {
            return NextResponse.json({ message: 'User is not accepting messages', success: false }, { status: 401 });
        }

        const newMsg = new MessageModel({
            content: content,
            createdAt: Date.now()
        })

        user.messages.push(newMsg);

        await user.save();

        return NextResponse.json({ message: 'Message sent successfully', success: true }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Unable to send message !', success: false }, { status: 500 });
    }
}