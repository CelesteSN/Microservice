import { connect }  from "mongoose";



 export async function connectDB() {
const db = await connect("mongodb://localhost:27017/reclamoDB", {
});
console.log("Database connected", db.connection.name);

}