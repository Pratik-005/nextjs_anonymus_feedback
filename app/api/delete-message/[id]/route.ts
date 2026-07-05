import connectToDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { User } from "next-auth";
import UserModel from "@/models/User";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {

    const msgId = params.id;
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ message: 'Not Authenticated !', success: false }, { status: 401 });
    }

    await connectToDB();

    try {

        await UserModel.updateOne({ _id: session.user._id }, {
            $pull: {
                messages: { _id: msgId }
            }
        })

        return NextResponse.json({ message: 'Message deleted successfully', success: false }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Unable to delete user  message', success: false }, { status: 500 });
    }
}