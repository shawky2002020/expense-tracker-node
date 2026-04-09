/* eslint-disable no-console */
const http = require("http");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const TOKEN = process.env.SEED_TOKEN || process.argv[2];

if (!TOKEN) {
  console.error("Missing bearer token.");
  console.error("Usage: node scripts/seedAnalyticsData.js <JWT_TOKEN>");
  console.error("Or set environment variable: SEED_TOKEN=<JWT_TOKEN>");
  process.exit(1);
}

const transactions = [
  { type: "income", amount: 3200, currency: "USD", description: "Salary Jan", date: "2026-01-03T09:00:00.000Z", notes: "Monthly payroll" },
  { type: "expense", amount: 420, currency: "USD", description: "Rent Jan", date: "2026-01-05T10:00:00.000Z", notes: "Home rent" },
  { type: "expense", amount: 180, currency: "USD", description: "Groceries Jan", date: "2026-01-14T16:00:00.000Z", notes: "Weekly groceries" },

  { type: "income", amount: 3250, currency: "USD", description: "Salary Feb", date: "2026-02-03T09:00:00.000Z", notes: "Monthly payroll" },
  { type: "expense", amount: 460, currency: "USD", description: "Rent Feb", date: "2026-02-05T10:00:00.000Z", notes: "Home rent" },
  { type: "expense", amount: 155, currency: "USD", description: "Utilities Feb", date: "2026-02-17T18:00:00.000Z", notes: "Electricity and water" },

  { type: "income", amount: 3300, currency: "USD", description: "Salary Mar", date: "2026-03-03T09:00:00.000Z", notes: "Monthly payroll" },
  { type: "expense", amount: 500, currency: "USD", description: "Rent Mar", date: "2026-03-05T10:00:00.000Z", notes: "Home rent" },
  { type: "expense", amount: 210, currency: "USD", description: "Groceries Mar", date: "2026-03-21T12:00:00.000Z", notes: "Groceries and supplies" },

  { type: "income", amount: 3350, currency: "USD", description: "Salary Apr", date: "2026-04-03T09:00:00.000Z", notes: "Monthly payroll" },
  { type: "expense", amount: 550, currency: "USD", description: "Rent Apr", date: "2026-04-05T10:00:00.000Z", notes: "Home rent" },
  { type: "expense", amount: 265, currency: "USD", description: "Transport Apr", date: "2026-04-08T08:30:00.000Z", notes: "Taxi and metro" },
];

function postJson(urlString, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const payload = JSON.stringify(body);

    const request = http.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          Authorization: `Bearer ${token}`,
        },
      },
      (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          const isSuccess = response.statusCode >= 200 && response.statusCode < 300;
          if (isSuccess) {
            resolve({ statusCode: response.statusCode, body: data });
            return;
          }

          reject(
            new Error(
              `Request failed with ${response.statusCode}: ${data || "No response body"}`,
            ),
          );
        });
      },
    );

    request.on("error", (error) => {
      reject(error);
    });

    request.write(payload);
    request.end();
  });
}

async function seed() {
  try {
    const endpoint = `${BASE_URL}/api/transactions`;
    let successCount = 0;

    for (const tx of transactions) {
      await postJson(endpoint, tx, TOKEN);
      successCount += 1;
      console.log(`Inserted ${successCount}/${transactions.length}: ${tx.description}`);
    }

    console.log(`Seeding completed. Inserted ${successCount} transactions.`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
}

seed();
