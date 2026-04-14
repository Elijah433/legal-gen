exports.handler = async (event) => {

  const allowedOrigins = [
   "https://legal-gen-pro.netlify.app", // Your actual URL!
    "http://localhost:3000",
    "http://localhost:8888"
  ];

  const origin = event.headers.origin;

  if (origin && !allowedOrigins.includes(origin))
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "Forbidden" }),
    };

  if (event.httpMethod !== "POST")
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };

  try {

    const { license_key } = JSON.parse(event.body);

    if (!license_key || license_key.length > 100)
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Invalid license key",
        }),
      };

    const response = await fetch(
      "https://api.lemonsqueezy.com/v1/licenses/validate",
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
        },
        body: new URLSearchParams({ license_key }),
      }
    );

    const data = await response.json();

    if (data.valid === true && data.meta?.status === "active")
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          customer:
            data.meta?.customer_name || "Customer",
        }),
      };

    return {
      statusCode: 401,
      body: JSON.stringify({
        success: false,
        message: "License inactive",
      }),
    };

  } catch (err) {

    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Internal error",
      }),
    };

  }

};