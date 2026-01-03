class Database {
    constructor() {
        this.apiUrl = '/api';
        this.currentUserKey = 'swap_current_user';
        this.tokenKey = 'swap_token';
    }

    getCurrentUser() {
        const userStr = localStorage.getItem(this.currentUserKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    logout() {
        localStorage.removeItem(this.currentUserKey);
        localStorage.removeItem(this.tokenKey);
        window.location.href = '/login/';
    }

    requireAuth() {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = '/login/';
            return null;
        }
        return user;
    }

    async register(username, email, password) {
        try {
            const res = await fetch(`${this.apiUrl}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem(this.currentUserKey, JSON.stringify(data.user));
                if (data.token) localStorage.setItem(this.tokenKey, data.token);
                return { success: true, user: data.user };
            }
            return data;
        } catch (err) {
            console.error(err);
            return { success: false, message: 'Błąd połączenia z serwerem' };
        }
    }

    async login(emailOrUsername, password) {
        try {
            const res = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailOrUsername, password })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem(this.currentUserKey, JSON.stringify(data.user));
                if (data.token) localStorage.setItem(this.tokenKey, data.token);
                return { success: true, user: data.user };
            }
            return data;
        } catch (err) {
            console.error(err);
            return { success: false, message: 'Błąd połączenia z serwerem' };
        }
    }

    async getProfile(userId) {
        try {
            const res = await fetch(`${this.apiUrl}/profile/${userId}`);
            if (res.status === 404) {
                return null; // Profil nie istnieje
            }
            if (!res.ok) {
                console.error('Failed to fetch profile:', res.status);
                return null;
            }
            return await res.json();
        } catch (err) {
            console.error('Error fetching profile:', err);
            return null;
        }
    }

    async getProfileBySlug(slug) {
        return this.getProfile(slug);
    }

    async updateProfile(userId, profileData) {
        try {
            const res = await fetch(`${this.apiUrl}/profile/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: JSON.stringify(profileData)
            });
            return await res.json();
        } catch (err) {
            console.error(err);
            return { success: false };
        }
    }

    async saveProfile(userId, profileData) {
        return this.updateProfile(userId, profileData);
    }

    async saveFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch(`${this.apiUrl}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: formData
            });
            const data = await res.json();

            if (!data.success) {
                console.error('Upload failed:', data);
                alert(`Błąd uploadu: ${data.message}`);
                throw new Error(data.message || 'Upload failed');
            }

            if (data.success) {
                const extension = file.name.split('.').pop().toLowerCase();
                let fileType = 'Unknown';
                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) fileType = 'Image';
                else if (['mp4', 'webm', 'mov', 'avi'].includes(extension)) fileType = 'Video';
                else if (['mp3', 'wav', 'ogg'].includes(extension)) fileType = 'Audio';
                else if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) fileType = 'Document';

                return {
                    id: Date.now().toString(),
                    name: data.name || file.name,
                    size: data.size || file.size,
                    type: fileType,
                    extension: extension,
                    url: data.url,
                    createdAt: new Date().toISOString()
                };
            }
            throw new Error('Upload failed');
        } catch (err) {
            console.error('Upload error:', err);
            return null;
        }
    }

    async getFiles() {
        try {
            const res = await fetch(`${this.apiUrl}/files`, {
                headers: { 'Authorization': `Bearer ${this.getToken()}` }
            });
            if (!res.ok) return [];
            const files = await res.json();

            // Mapowanie formatu z bazy na format frontendowy
            return files.map(f => {
                const extension = f.original_name.split('.').pop().toUpperCase();
                let fileType = 'Unknown';
                const lext = extension.toLowerCase();

                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(lext)) fileType = 'Image';
                else if (['mp4', 'webm', 'mov', 'avi'].includes(lext)) fileType = 'Video';
                else if (['mp3', 'wav', 'ogg'].includes(lext)) fileType = 'Audio';
                else if (['pdf', 'doc', 'docx', 'txt'].includes(lext)) fileType = 'Document';

                return {
                    id: f.id,
                    name: f.original_name,
                    size: parseInt(f.size),
                    type: fileType,
                    extension: extension,
                    url: f.url,
                    createdAt: f.created_at
                };
            });
        } catch (err) {
            console.error('Failed to get files:', err);
            return [];
        }
    }

    // saveFileMetadataLocally usunięte - niepotrzebne

    async deleteFile(fileId) {
        try {
            const res = await fetch(`${this.apiUrl}/files/${fileId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.getToken()}` }
            });
            return await res.json();
        } catch (err) {
            console.error(err);
            return { success: false };
        }
    }

    async getCommunityTemplates() {
        try {
            const res = await fetch(`${this.apiUrl}/templates`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.error('Failed to fetch templates:', err);
            return [];
        }
    }

    async saveTemplate(templateData) {
        try {
            const res = await fetch(`${this.apiUrl}/templates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: JSON.stringify(templateData)
            });
            return await res.json();
        } catch (err) {
            console.error('Failed to save template:', err);
            return { success: false, message: 'Błąd połączenia' };
        }
    }

    async deleteTemplate(templateId) {
        try {
            const res = await fetch(`${this.apiUrl}/templates/${templateId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.getToken()}` }
            });
            return await res.json();
        } catch (err) {
            console.error('Failed to delete template:', err);
            return { success: false, message: 'Błąd połączenia' };
        }
    }

    async getDashboardStats(userId) {
        try {
            const res = await fetch(`${this.apiUrl}/stats/${userId}`);
            const stats = await res.json();
            const files = await this.getFiles();
            const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);
            stats.storage = this.formatBytes(totalSize);
            return stats;
        } catch (err) {
            const files = await this.getFiles();
            const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);
            return { views: 0, clicks: 0, activeProfiles: 1, storage: this.formatBytes(totalSize), history: [0, 0, 0, 0, 0, 0, 0] };
        }
    }

    async getRecentActivity(userId) {
        try {
            const res = await fetch(`${this.apiUrl}/stats/${userId}/activity`);
            const data = await res.json();
            return data.activity || [];
        } catch (err) {
            return [];
        }
    }

    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    getViewsHistory(userId) {
        return [0, 0, 0, 0, 0, 0, 0];
    }

    async incrementViews(userId) {
        try {
            const res = await fetch(`${this.apiUrl}/profile/${userId}/view`, { method: 'POST' });
            const data = await res.json();
            return data.views || 0;
        } catch (err) {
            return 0;
        }
    }

    async incrementLinkClicks(userId) {
        try {
            await fetch(`${this.apiUrl}/profile/${userId}/click`, { method: 'POST' });
        } catch (err) { }
    }

    async getGlobalStats() {
        try {
            const res = await fetch(`${this.apiUrl}/stats/global`);
            
            if (!res.ok) {
                throw new Error('API request failed');
            }
            
            const data = await res.json();
            
            // Return data if it has the expected properties
            if (data && (data.users !== undefined || data.views !== undefined || data.uploads !== undefined)) {
                return {
                    users: parseInt(data.users) || 0,
                    views: parseInt(data.views) || 0,
                    uploads: parseInt(data.uploads) || 0
                };
            }
            
            return { users: 0, views: 0, uploads: 0 };
        } catch (err) {
            console.error('Failed to fetch global stats:', err);
            return { users: 0, views: 0, uploads: 0 };
        }
    }

    async changePassword(userId, currentPassword, newPassword) {
        try {
            const res = await fetch(`${this.apiUrl}/user/${userId}/password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            return await res.json();
        } catch (err) {
            return { success: false, message: 'Błąd połączenia' };
        }
    }

    async deleteAccount(userId) {
        try {
            const res = await fetch(`${this.apiUrl}/user/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.getToken()}` }
            });
            const data = await res.json();
            if (data.success) this.logout();
            return data;
        } catch (err) {
            return { success: false, message: 'Błąd połączenia' };
        }
    }
}

window.db = new Database();
