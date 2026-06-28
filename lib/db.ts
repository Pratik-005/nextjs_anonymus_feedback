import mongoose from "mongoose"


type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

export async function connectToDB() {

    if (connection.isConnected) return;

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {});
        connection.isConnected = db.connections[0].readyState;
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit();
    }
}

export default connectToDB;