import mongoose from 'mongoose';

let isConnected: boolean = false;

export const connectToDB = async (): Promise<void> => {
    mongoose.set("strictQuery", true);
    if (isConnected) {
        console.log("MongoDb is already connected");
        return;
    }
    try {
        await mongoose.connect(process.env.CONNECTION_URL || "", {
            dbName:"Fashion_Admin",
        });
        isConnected=true;
        console.log("MongoDb is connected");
    } catch (error) {
        console.log(error);

    }
}

