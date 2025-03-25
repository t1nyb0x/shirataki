import "reflect-metadata";
import express from "express";
import routesV1 from "@/routes/v1/api";
import "@/DIContainer";
import "@/config/log4js";

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

app.use("/v1", routesV1);

app.listen(port, () => {
    console.log(`Launched Shirataki server http://localhost:${port}`);
});
