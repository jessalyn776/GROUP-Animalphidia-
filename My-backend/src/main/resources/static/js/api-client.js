// api-client.js - Keep the same as the previous version
class ApiClient {
    constructor() {
        this.baseUrl = 'http://localhost:8081/api';
        this.token = localStorage.getItem('token');
        this.refreshToken = localStorage.getItem('refreshToken');

        console.log('🔧 ApiClient initialized');
    }

    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (includeAuth && this.token) {
            const parts = this.token.split('.');
            if (parts.length === 3) {
                headers['Authorization'] = `Bearer ${this.token}`;
            } else {
                headers['Authorization'] = this.token;
            }
        }

        return headers;
    }

    setToken(token, refreshToken = null) {
        this.token = token;
        this.refreshToken = refreshToken;

        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }

        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        } else {
            localStorage.removeItem('refreshToken');
        }
    }

    async request(method, url, data = null, includeAuth = true) {
        const options = {
            method: method,
            headers: this.getHeaders(includeAuth)
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.baseUrl}${url}`, options);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Request failed: ${response.status} - ${errorText}`);
            }

            const responseText = await response.text();
            if (responseText && responseText.trim() !== '') {
                try {
                    return JSON.parse(responseText);
                } catch (e) {
                    return responseText;
                }
            }

            return null;

        } catch (error) {
            console.error(`❌ ${method} request failed for ${url}:`, error);
            throw error;
        }
    }

    async get(url, includeAuth = true) {
        return this.request('GET', url, null, includeAuth);
    }

    async post(url, data, includeAuth = true) {
        return this.request('POST', url, data, includeAuth);
    }

    async put(url, data, includeAuth = true) {
        return this.request('PUT', url, data, includeAuth);
    }

    async delete(url, includeAuth = true) {
        return this.request('DELETE', url, null, includeAuth);
    }
}

// Create global instance
const apiClient = new ApiClient();