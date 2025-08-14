import { MongoClient } from "mongodb";

export class DbClient {
    #mongoClient;

    constructor(dburl) {
        this.#mongoClient = new MongoClient(dburl);
    }
    
    async connect() { await this.#mongoClient.connect() }

    async addUser(id, lvl=1, gold=0, catches=0) {
        const user = {
            id: id,
            level: lvl,
            gold: gold,
            catches: catches,
            location: 0,
            last_fished: 0,
            last_traveled: 0,
            xp_required: 100,
            xp_required_increase: 100
        };

        await this.#mongoClient.db("userdata").collection("users").insertOne(user);
    }

    async getUser(id) {
        const user = await this.#mongoClient.db("userdata").collection("users").findOne({ id: id });
        return user;
    }

    async editUser(id, editData) {
        this.#mongoClient.db("userdata").collection("users").updateOne({ id: id }, { $set: editData });
    }

    async exists(id) {
        const user = await this.getUser(id);
        return user !== null ? true : false;
    }

    close() {
        this.#mongoClient.close();
    }
};