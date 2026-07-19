import connectToDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { User } from "next-auth";
import UserModel from "@/models/User";

export async function POST(req: NextRequest) {

    await connectToDB();
    const { isAcceptingMessages } = await req.json();

    try {

        const session = await auth();
        const user: User | undefined = session?.user;

        if (!session || !user) {
            return NextResponse.json({ message: 'Not Authenticated !', success: false }, { status: 401 });
        }

        await UserModel.findByIdAndUpdate(user?._id, {
            $set: {
                isAcceptingMessages: isAcceptingMessages
            }
        })

        return NextResponse.json({ message: 'Status updated successfully', success: true }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Unable to update user status to update messages !', success: false }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    await connectToDB();

    try {

        const session = await auth();
        const user: User | undefined = session?.user;

        if (!session || !user) {
            return NextResponse.json({ message: 'Not Authenticated !', success: false }, { status: 401 });
        }

        const dbuser = await UserModel.findById(user._id);

        if (!dbuser) {
            return NextResponse.json({ message: 'User not found', success: false }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Status fetched successfully',
            isAcceptingMessages: dbuser.isAcceptingMessages,
            success: true
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Unable to get user status to update messages !', success: false }, { status: 500 });
    }
}