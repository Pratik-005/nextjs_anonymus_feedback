import { auth } from "@/auth";
import connectToDB from "@/lib/db";
import UserModel from "@/models/User";
import mongoose from "mongoose";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

    await connectToDB();

    try {

        const session = await auth();
        const user: User | undefined = session?.user;

        if (!session || !user) {
            return NextResponse.json({ message: 'Not Authenticated !', success: false }, { status: 401 });
        }

        const userId = new mongoose.Types.ObjectId(user._id);

        const data = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            {
                $group: {
                    _id: '$_id',
                    messages: { $push: '$messages' }
                }
            },
        ]).exec();


        if (!data || !data.length) {
            return NextResponse.json({ message: 'User not found', success: false }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Messages fetched successfully',
            messages: data[0].messages,
            success: true
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Unable to get user messages !', success: false }, { status: 500 });
    }
}