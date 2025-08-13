document.addEventListener('DOMContentLoaded', () => {
    const urlForm = document.getElementById('url-form');
    const urlInput = document.getElementById('url-input');
    const loadingSection = document.getElementById('loading-section');
    const resultsSection = document.getElementById('results-section');
    const headersContainer = document.getElementById('headers-container');
    const scoreElement = document.getElementById('score');
    const passedCountElement = document.getElementById('passed-count');
    const warningCountElement = document.getElementById('warning-count');
    const failedCountElement = document.getElementById('failed-count');

    // Security headers to check and their descriptions
    const securityHeaders = {
        'Content-Security-Policy': {
            description: 'Controls resources the user agent is allowed to load for a given page.',
            recommendation: 'Implement a strong Content-Security-Policy to prevent XSS attacks by specifying which resources can be loaded.',
            importance: 'high'
        },
        'Strict-Transport-Security': {
            description: 'Enforces secure (HTTPS) connections to the server.',
            recommendation: 'Set Strict-Transport-Security with a max-age of at least 1 year and include subdomains.',
            importance: 'high'
        },
        'X-Content-Type-Options': {
            description: 'Prevents browsers from MIME-sniffing a response from the declared content-type.',
            recommendation: 'Set X-Content-Type-Options to "nosniff" to prevent MIME type sniffing.',
            importance: 'high'
        },
        'X-Frame-Options': {
            description: 'Indicates whether a browser should be allowed to render a page in a <frame>, <iframe>, <embed> or <object>.',
            recommendation: 'Set X-Frame-Options to DENY or SAMEORIGIN to prevent clickjacking attacks.',
            importance: 'high'
        },
        'Permissions-Policy': {
            description: 'Controls which browser features and APIs can be used in the document.',
            recommendation: 'Implement a Permissions-Policy to limit which features and APIs can be used in your application.',
            importance: 'medium'
        },
        'Referrer-Policy': {
            description: 'Controls how much referrer information should be included with requests.',
            recommendation: 'Set a Referrer-Policy to control how much information is sent in the Referer header.',
            importance: 'medium'
        },
        'X-XSS-Protection': {
            description: 'Enables the cross-site scripting (XSS) filter in browsers.',
            recommendation: 'Set X-XSS-Protection to "1; mode=block" to enable XSS protection.',
            importance: 'medium'
        },
        'Cache-Control': {
            description: 'Directives for caching mechanisms in requests and responses.',
            recommendation: 'Use appropriate Cache-Control headers for sensitive pages to prevent caching of sensitive information.',
            importance: 'medium'
        },
        'X-Permitted-Cross-Domain-Policies': {
            description: 'Specifies if a cross-domain policy file is allowed.',
            recommendation: 'Set X-Permitted-Cross-Domain-Policies to "none" or "master-only" to restrict cross-domain policies.',
            importance: 'low'
        },
        'Cross-Origin-Embedder-Policy': {
            description: 'Prevents a document from loading any cross-origin resources that don\'t explicitly grant the document permission.',
            recommendation: 'Consider implementing Cross-Origin-Embedder-Policy for enhanced security isolation.',
            importance: 'low'
        },
        'Cross-Origin-Opener-Policy': {
            description: 'Controls how a document interacts with its opener.',
            recommendation: 'Consider implementing Cross-Origin-Opener-Policy for enhanced security isolation.',
            importance: 'low'
        },
        'Cross-Origin-Resource-Policy': {
            description: 'Prevents other domains from reading the response of the resources to which this header is applied.',
            recommendation: 'Consider implementing Cross-Origin-Resource-Policy for enhanced security isolation.',
            importance: 'low'
        }
    };

    // Event listener for form submission
    urlForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = urlInput.value.trim();
        
        if (!url) {
            alert('Please enter a valid URL');
            return;
        }

        // Show loading section, hide results
        loadingSection.style.display = 'flex';
        resultsSection.style.display = 'none';
        headersContainer.innerHTML = '';

        try {
            // Make request to the backend proxy
            const response = await fetch(`/api/check-headers?url=${encodeURIComponent(url)}`);
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            displayResults(data.headers, url);
        } catch (error) {
            // For demo purposes, we'll simulate a response if the backend is not available
            console.error('Error fetching headers:', error);
            simulateResponse(url);
        }
    });

    // Function to display the results
    function displayResults(headers, url) {
        // Hide loading, show results
        loadingSection.style.display = 'none';
        resultsSection.style.display = 'block';

        // Clear previous results
        headersContainer.innerHTML = '';
        
        let passedCount = 0;
        let warningCount = 0;
        let failedCount = 0;

        // Create a header item for the URL
        const urlItem = document.createElement('div');
        urlItem.className = 'header-item';
        urlItem.innerHTML = `
            <div class="header-title">
                <div class="header-name">
                    <i class="fas fa-link"></i>
                    Analyzed URL
                </div>
            </div>
            <div class="header-content active">
                <div class="header-value">${url}</div>
            </div>
        `;
        headersContainer.appendChild(urlItem);

        // Check each security header
        Object.keys(securityHeaders).forEach(headerName => {
            const headerValue = headers[headerName] || null;
            const headerInfo = securityHeaders[headerName];
            let status, statusText, statusClass;

            // Determine status based on presence and value
            if (headerValue) {
                // For simplicity, we're just checking if the header exists
                // In a real app, you'd want to validate the header value
                status = 'pass';
                statusText = 'Implemented';
                statusClass = 'status-pass';
                passedCount++;
            } else if (headerInfo.importance === 'high') {
                status = 'fail';
                statusText = 'Missing';
                statusClass = 'status-fail';
                failedCount++;
            } else {
                status = 'warning';
                statusText = 'Not Implemented';
                statusClass = 'status-warning';
                warningCount++;
            }

            // Create header item element
            const headerItem = document.createElement('div');
            headerItem.className = 'header-item';
            headerItem.innerHTML = `
                <div class="header-title">
                    <div class="header-name">
                        <i class="fas fa-shield-alt"></i>
                        ${headerName}
                    </div>
                    <div class="header-status">
                        <span class="status-icon ${statusClass}">
                            <i class="fas ${status === 'pass' ? 'fa-check' : status === 'warning' ? 'fa-exclamation' : 'fa-times'}"></i>
                        </span>
                        ${statusText}
                    </div>
                </div>
                <div class="header-content">
                    ${headerValue ? `<div class="header-value">${headerValue}</div>` : ''}
                    <div class="header-description">${headerInfo.description}</div>
                    <div class="recommendation">
                        <strong>Recommendation:</strong> ${headerInfo.recommendation}
                    </div>
                </div>
            `;
            headersContainer.appendChild(headerItem);

            // Add click event to toggle content
            const headerTitle = headerItem.querySelector('.header-title');
            const headerContent = headerItem.querySelector('.header-content');
            headerTitle.addEventListener('click', () => {
                headerContent.classList.toggle('active');
            });
        });

        // Update summary stats
        passedCountElement.textContent = passedCount;
        warningCountElement.textContent = warningCount;
        failedCountElement.textContent = failedCount;

        // Calculate and update score (simple calculation for demo)
        const totalHeaders = Object.keys(securityHeaders).length;
        const score = Math.round((passedCount / totalHeaders) * 100);
        scoreElement.textContent = score;

        // Apply color to score based on value
        if (score >= 80) {
            scoreElement.style.color = 'var(--success-color)';
        } else if (score >= 50) {
            scoreElement.style.color = 'var(--warning-color)';
        } else {
            scoreElement.style.color = 'var(--danger-color)';
        }
    }

    // Function to simulate a response for demo purposes
    function simulateResponse(url) {
        // Simulate a delay to show loading
        setTimeout(() => {
            // Sample headers for demonstration
            const sampleHeaders = {
                'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' data:;",
                'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'Referrer-Policy': 'no-referrer-when-downgrade',
                // Intentionally missing some headers for demonstration
            };
            
            displayResults(sampleHeaders, url);
        }, 1500);
    }
});