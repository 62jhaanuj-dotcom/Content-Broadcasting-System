const http = require("http");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:5000";
let teacherToken = "";
let principalToken = "";
let teacherId = 1;
let principalId = 2;
let contentId = 1;

const log = (title, data) => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📌 ${title}`);
  console.log("=".repeat(60));
  console.log(JSON.stringify(data, null, 2));
};

const apiCall = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runTests = async () => {
  try {
    console.log("\n🚀 STARTING API TESTS...\n");

    // 1. SIGNUP TESTS
    log("1. TEACHER SIGNUP", "");
    let res = await apiCall("POST", "/api/auth/signup", {
      name: "Mr. John",
      email: "teacher2@test.com",
      password: "pass123",
      role: "teacher",
    });
    log("Response", res.data);
    if (res.data.user) teacherId = res.data.user.id;

    log("2. PRINCIPAL SIGNUP", "");
    res = await apiCall("POST", "/api/auth/signup", {
      name: "Principal Smith",
      email: "principal2@test.com",
      password: "pass123",
      role: "principal",
    });
    log("Response", res.data);
    if (res.data.user) principalId = res.data.user.id;

    // 2. LOGIN TESTS
    log("3. TEACHER LOGIN", "");
    res = await apiCall("POST", "/api/auth/login", {
      email: "teacher2@test.com",
      password: "pass123",
    });
    log("Response", res.data);
    teacherToken = res.data.token;

    log("4. PRINCIPAL LOGIN", "");
    res = await apiCall("POST", "/api/auth/login", {
      email: "principal2@test.com",
      password: "pass123",
    });
    log("Response", res.data);
    principalToken = res.data.token;

    // 3. CONTENT UPLOAD TEST (no file, just test structure)
    log("5. TEACHER VIEW OWN CONTENT (Empty)", "");
    res = await apiCall("GET", "/api/content/my", null, teacherToken);
    log("Response", res.data);

    // 4. APPROVAL WORKFLOW
    log("6. PRINCIPAL VIEW PENDING CONTENT", "");
    res = await apiCall("GET", "/api/approval/pending", null, principalToken);
    log("Response", res.data);

    log("7. PRINCIPAL VIEW ALL CONTENT", "");
    res = await apiCall("GET", "/api/approval/all", null, principalToken);
    log("Response", res.data);
    if (res.data.data && res.data.data.length > 0) {
      contentId = res.data.data[0].id;
    }

    // 5. APPROVAL ACTIONS
    if (contentId) {
      log("8. PRINCIPAL APPROVE CONTENT", `ID: ${contentId}`);
      res = await apiCall(
        "PUT",
        `/api/approval/${contentId}/approve`,
        {},
        principalToken,
      );
      log("Response", res.data);

      log("9. PRINCIPAL REJECT CONTENT", "ID: (new if available)");
      res = await apiCall(
        "PUT",
        `/api/approval/${contentId + 1}/reject`,
        { reason: "Invalid format" },
        principalToken,
      );
      log("Response", res.data);
    }

    // 6. PUBLIC BROADCASTING API
    log("10. GET LIVE CONTENT FOR TEACHER", `Teacher ID: ${teacherId}`);
    res = await apiCall("GET", `/api/broadcast/live/${teacherId}`);
    log("Response", res.data);

    log(
      "11. GET LIVE CONTENT BY SUBJECT",
      `Teacher ID: ${teacherId}, Subject: maths`,
    );
    res = await apiCall("GET", `/api/broadcast/live/${teacherId}/maths`);
    log("Response", res.data);

    log("12. GET ALL LIVE CONTENT BY TEACHER", `Teacher ID: ${teacherId}`);
    res = await apiCall("GET", `/api/broadcast/teacher/${teacherId}`);
    log("Response", res.data);

    // 7. EDGE CASES
    log("13. INVALID TEACHER ID", "");
    res = await apiCall("GET", `/api/broadcast/live/invalid`);
    log("Response", res.data);

    log("14. NONEXISTENT SUBJECT", "");
    res = await apiCall("GET", `/api/broadcast/live/999`);
    log("Response", res.data);

    // 8. ERROR CASES
    log("15. TEACHER TRYING TO ACCESS APPROVAL (Should get 403)", "");
    res = await apiCall("GET", "/api/approval/pending", null, teacherToken);
    log("Response", { status: res.status, data: res.data });

    log("16. MISSING TOKEN (Should get 401)", "");
    res = await apiCall("GET", "/api/content/my");
    log("Response", { status: res.status, data: res.data });

    log("17. WRONG PASSWORD LOGIN (Should fail)", "");
    res = await apiCall("POST", "/api/auth/login", {
      email: "teacher2@test.com",
      password: "wrongpass",
    });
    log("Response", { status: res.status, data: res.data });

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL API TESTS COMPLETED!");
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("❌ Test Error:", error.message);
  }
};

runTests();
