exports.handler = async (event) => {
  const allowedOrigins = [
    "https://legal-gen-pro.netlify.app",
    "http://localhost:3000",
    "http://localhost:8888"
  ];

  const origin = event.headers.origin;
  const headers = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle pre-flight requests from the browser
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  try {
    const { license_key } = JSON.parse(event.body);

    if (!license_key) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: "No key provided" }),
      };
    }

    const response = await fetch("https://api.lemonsqueezy.com/v1/licenses/validate", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json", // Changed to JSON for better compatibility
        "Authorization": `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({ license_key }), // Sending as JSON
    });

    const data = await response.json();

    // Check if valid is true (Lemon Squeezy returns { valid: true, ... })
    if (data.valid === true) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, customer: data.meta?.customer_name || "Customer" }),
      };
    }

    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ success: false, message: "License invalid or inactive" }),
    };

  } catch (err) {
    console.error("Function Error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: "Internal server error" }),
    };
  }
};