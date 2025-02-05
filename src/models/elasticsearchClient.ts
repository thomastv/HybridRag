import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";

dotenv.config();

console.log(process.env.ELASTICSEARCH_NODE);

const client = new Client({
    node: process.env.ELASTICSEARCH_NODE,
    auth: {
        apiKey: process.env.ELASTIC_API_KEY || ""
    }
});

export default client;