exports.handler = async function (event) {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                error: "Method not allowed"
            })
        };
    }

    try {
        const backendURL =
            "https://script.google.com/macros/s/AKfycbxQz7KWVBcUUuFQoAOZAOvJdSdprr4ua9BleGhoWNatafrJ70FWL9OZeauCCmtjGSTC/exec";

        // Get data sent by the ZARYX website
        const requestData = event.body
            ? JSON.parse(event.body)
            : {};

        // Send request to Google Apps Script
        const response = await fetch(backendURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        const responseText = await response.text();

        return {
            statusCode: response.status,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            },
            body: responseText
        };

    } catch (error) {
        console.error("ZARYX PROXY ERROR:", error);

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                error: "ZARYX proxy failed.",
                details: error.message
            })
        };
    }
};
