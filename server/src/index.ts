import dotenv from "dotenv";

dotenv.config({ path: [".env.local", ".env"] });

void import("./app")
  .then(({ startApi }) => startApi())
  .catch((error: unknown) => {
    console.error("Could not start the Taskflow API.", error);
    process.exitCode = 1;
  });
