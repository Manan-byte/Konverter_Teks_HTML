// Ini adalah file Netlify Function (ES Module)
// File ini akan berjalan di server Netlify, bukan di browser.

// URL API Gemini yang sebenarnya
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=`;

export const handler = async (event) => {
    // 1. Dapatkan API Key dari Environment Variables (yang Anda atur di Netlify)
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "GEMINI_API_KEY tidak diatur di server." }),
        };
    }

    // 2. Dapatkan prompt dari body request yang dikirim oleh front-end
    let body;
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Request body tidak valid." }),
        };
    }
    
    const { prompt, systemInstruction } = body;

    if (!prompt) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Parameter 'prompt' tidak ditemukan." }),
        };
    }

    // 3. Buat payload untuk API Gemini
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
            parts: [{ text: systemInstruction || "Anda adalah asisten yang membantu." }]
        }
    };

    // 4. Panggil API Gemini yang sebenarnya (dengan API Key yang aman)
    try {
        const response = await fetch(API_URL + API_KEY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", errorText);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Gemini API error: ${response.statusText}` }),
            };
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Tidak ada konten yang diterima dari API." }),
            };
        }

        // 5. Kembalikan HANYA teks yang dihasilkan ke front-end
        return {
            statusCode: 200,
            body: JSON.stringify({ text: text }),
        };

    } catch (error) {
        console.error("Internal Server Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
