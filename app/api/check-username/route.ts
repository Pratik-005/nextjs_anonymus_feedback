import connectToDB from "@/lib/db";
import UserModel from "@/models/User";
import { usernameValidation } from "@/schemas/signupSchema";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";


const usernameQuerySchema = z.object({
    username: usernameValidation
})


export async function GET(req: NextRequest) {
    await connectToDB();
    try {

        const { searchParams } = new URL(req.url);
        const query = { username: searchParams.get('username') }
        const result = usernameQuerySchema.safeParse(query);

        if (!result.success) {
            const errors = result.error.format().username?._errors || [];
            return NextResponse.json({
                message: errors[0],
                success: false
            }, { status: 500 });
        }
        const { username } = result.data;

        const user = await UserModel.findOne({
            username: username, isVerified: true
        })

        if (user) {
            return NextResponse.json({
                message: 'Username already taken',
                success: false
            }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Username available',
            success: true
        }, { status: 200 });


    } catch (error) {
        console.log('Error checking username :: ', error);
        return NextResponse.json({
            message: 'Error checking username',
            success: false
        }, { status: 500 });
    }
}