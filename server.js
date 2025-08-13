const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// API endpoint to check headers
app.get('/api/check-headers', async (req, res) => {
    const url = req.query.url;
    
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        // Make a HEAD request to get headers without downloading the full page
        const response = await axios.head(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            // Some sites might redirect, so we want to follow redirects
            maxRedirects: 5,
            // If HEAD doesn't work, fall back to GET
            validateStatus: function (status) {
                return status < 500; // Accept any status code less than 500
            }
        });

        // If HEAD request fails or returns an error status, try GET
        if (response.status >= 400) {
            const getResponse = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                maxRedirects: 5
            });
            
            return res.json({
                headers: getResponse.headers,
                status: getResponse.status
            });
        }

        // Return the headers
        return res.json({
            headers: response.headers,
            status: response.status
        });
    } catch (error) {
        console.error('Error fetching headers:', error.message);
        return res.status(500).json({ 
            error: 'Failed to fetch headers', 
            message: error.message 
        });
    }
});

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});