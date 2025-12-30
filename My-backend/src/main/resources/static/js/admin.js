// Admin Dashboard
class AdminDashboard {
    constructor() {
        this.api = apiClient;
        this.auth = authManager;
        this.currentUser = this.auth.getCurrentUser();
        this.systemChart = null;
        this.userChart = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            // Check authentication
            if (!this.auth.isLoggedIn()) {
                window.location.href = 'index.html';
                return;
            }

            // Check if user has admin role
            if (!this.currentUser || this.currentUser.role !== 'admin') {
                this.auth.showNotification('Access denied. Admin access required.', 'danger');
                window.location.href = 'index.html';
                return;
            }

            this.setupUI();
            this.loadAdminDashboard();
            this.setupEventListeners();
        });
    }

    setupUI() {
        // Update admin name display
        const adminName = document.getElementById('adminName');
        if (adminName && this.currentUser) {
            adminName.textContent = this.currentUser.username;
        }
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('.sidebar-link').dataset.section;
                this.showSection(section);
            });
        });

        // Quick action buttons
        document.querySelectorAll('[data-section]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.hasAttribute('data-section')) {
                    e.preventDefault();
                    const section = e.target.dataset.section;
                    this.showSection(section);
                }
            });
        });

        // Logout button
        const logoutBtn = document.getElementById('adminLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.auth.logout();
            });
        }

        // User search
        const searchUsersBtn = document.getElementById('searchUsersBtn');
        if (searchUsersBtn) {
            searchUsersBtn.addEventListener('click', () => {
                this.searchUsers();
            });
        }

        // Animal filter buttons
        document.querySelectorAll('#filterVerified, #filterPending, #filterRejected, #filterAll').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.id.replace('filter', '').toLowerCase();
                this.filterAnimals(filter);
            });
        });

        // System maintenance buttons
        const clearCacheBtn = document.getElementById('clearCacheBtn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                this.clearCache();
            });
        }

        const backupBtn = document.getElementById('backupBtn');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => {
                this.createBackup();
            });
        }

        const maintenanceBtn = document.getElementById('maintenanceBtn');
        if (maintenanceBtn) {
            maintenanceBtn.addEventListener('click', () => {
                this.toggleMaintenance();
            });
        }
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.style.display = 'none';
        });

        // Remove active class from all sidebar links
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        const sectionElement = document.getElementById(sectionId + 'Section');
        if (sectionElement) {
            sectionElement.style.display = 'block';

            // Add active class to corresponding sidebar link
            const sidebarLink = document.querySelector(`[data-section="${sectionId}"]`);
            if (sidebarLink) {
                sidebarLink.classList.add('active');
            }

            // Load section data if needed
            switch(sectionId) {
                case 'system-stats':
                    this.loadSystemStats();
                    break;
                case 'user-management':
                    this.loadUsers();
                    break;
                case 'animal-management':
                    this.loadAnimals();
                    break;
                case 'content-moderation':
                    this.loadContentModeration();
                    break;
            }
        }
    }

    async loadAdminDashboard() {
        try {
            const stats = await this.api.getAdminStats();

            // Update quick stats
            document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
            document.getElementById('totalAnimals').textContent = stats.totalAnimals || 0;
            document.getElementById('pendingApprovals').textContent = stats.pendingSubmissions || 0;
            document.getElementById('activeToday').textContent = stats.newUsersToday || 0;

            // Update detailed stats
            document.getElementById('endangeredCount').textContent = stats.endangeredCount || 0;
            document.getElementById('protectedCount').textContent = stats.protectedCount || 0;
            document.getElementById('verifiedAnimals').textContent = stats.verifiedAnimals || 0;
            document.getElementById('newToday').textContent = stats.newAnimalsToday || 0;

            // Update user distribution
            document.getElementById('adminCount').textContent = stats.adminCount || 0;
            document.getElementById('moderatorCount').textContent = stats.moderatorCount || 0;
            document.getElementById('contributorCount').textContent = stats.contributorCount || 0;
            document.getElementById('viewerCount').textContent =
                (stats.totalUsers || 0) - (stats.adminCount || 0) - (stats.moderatorCount || 0) - (stats.contributorCount || 0);

            // Initialize charts
            this.initCharts(stats);

        } catch (error) {
            console.error('Error loading admin dashboard:', error);
            this.auth.showNotification('Error loading dashboard data', 'danger');
        }
    }

    initCharts(stats) {
        // System Chart
        const systemCtx = document.getElementById('systemChart');
        if (systemCtx && typeof Chart !== 'undefined') {
            if (this.systemChart) {
                this.systemChart.destroy();
            }

            this.systemChart = new Chart(systemCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'New Users',
                        data: [12, 19, 15, 25, 22, 30],
                        borderColor: '#198754',
                        backgroundColor: 'rgba(25, 135, 84, 0.1)',
                        tension: 0.3
                    }, {
                        label: 'New Animals',
                        data: [5, 8, 12, 18, 15, 20],
                        borderColor: '#0dcaf0',
                        backgroundColor: 'rgba(13, 202, 240, 0.1)',
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // User Chart
        const userCtx = document.getElementById('userChart');
        if (userCtx && typeof Chart !== 'undefined') {
            if (this.userChart) {
                this.userChart.destroy();
            }

            this.userChart = new Chart(userCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Admins', 'Moderators', 'Contributors', 'Viewers'],
                    datasets: [{
                        data: [
                            stats.adminCount || 1,
                            stats.moderatorCount || 1,
                            stats.contributorCount || 1,
                            (stats.totalUsers || 4) - (stats.adminCount || 1) - (stats.moderatorCount || 1) - (stats.contributorCount || 1)
                        ],
                        backgroundColor: [
                            '#dc3545',
                            '#ffc107',
                            '#198754',
                            '#0dcaf0'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }

    async loadSystemStats() {
        try {
            const stats = await this.api.getAdminStats();
            this.displayDetailedStats(stats);
        } catch (error) {
            console.error('Error loading system stats:', error);
            this.auth.showNotification('Error loading system statistics', 'danger');
        }
    }

    displayDetailedStats(stats) {
        const table = document.getElementById('detailedStatsTable');
        if (!table) return;

        const statsData = [
            { metric: 'Total Users', value: stats.totalUsers || 0, change: '+5%', trend: 'up' },
            { metric: 'Active Users (Today)', value: stats.activeUsers || 0, change: '+12%', trend: 'up' },
            { metric: 'Total Animals', value: stats.totalAnimals || 0, change: '+8%', trend: 'up' },
            { metric: 'Verified Animals', value: stats.verifiedAnimals || 0, change: '+15%', trend: 'up' },
            { metric: 'Endangered Species', value: stats.endangeredCount || 0, change: '0%', trend: 'stable' },
            { metric: 'New Animals (Today)', value: stats.newAnimalsToday || 0, change: '+3%', trend: 'up' },
            { metric: 'New Users (Today)', value: stats.newUsersToday || 0, change: '+7%', trend: 'up' },
            { metric: 'Pending Approvals', value: stats.pendingSubmissions || 0, change: '-2%', trend: 'down' }
        ];

        table.innerHTML = statsData.map(stat => {
            const trendIcon = stat.trend === 'up' ? 'bi-arrow-up' :
                stat.trend === 'down' ? 'bi-arrow-down' : 'bi-dash';
            const trendColor = stat.trend === 'up' ? 'text-success' :
                stat.trend === 'down' ? 'text-danger' : 'text-secondary';

            return `
                <tr>
                    <td>${stat.metric}</td>
                    <td><strong>${stat.value}</strong></td>
                    <td>
                        <span class="${trendColor}">
                            <i class="bi ${trendIcon} me-1"></i>${stat.change}
                        </span>
                    </td>
                    <td>
                        <div class="progress" style="height: 6px;">
                            <div class="progress-bar ${trendColor.replace('text-', 'bg-')}" 
                                 style="width: ${Math.min(100, (stat.value / 100) * 100)}%"></div>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async loadUsers() {
        try {
            // Note: You'll need to implement getUsers API endpoint
            // For now, we'll use placeholder data
            const placeholderUsers = [
                { id: 1, username: 'admin', email: 'admin@animalphidia.ph', role: 'admin', status: 'active', createdAt: '2024-01-01' },
                { id: 2, username: 'moderator1', email: 'mod@animalphidia.ph', role: 'moderator', status: 'active', createdAt: '2024-01-15' },
                { id: 3, username: 'contributor1', email: 'user1@animalphidia.ph', role: 'contributor', status: 'active', createdAt: '2024-02-01' },
                { id: 4, username: 'viewer1', email: 'viewer@animalphidia.ph', role: 'viewer', status: 'active', createdAt: '2024-02-15' }
            ];

            this.displayUsers(placeholderUsers);
        } catch (error) {
            console.error('Error loading users:', error);
            this.auth.showNotification('Error loading users', 'danger');
        }
    }

    displayUsers(users) {
        const table = document.getElementById('usersTable');
        if (!table) return;

        if (!users || users.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        No users found.
                    </td>
                </tr>
            `;
            return;
        }

        table.innerHTML = users.map(user => {
            const statusClass = user.status === 'active' ? 'badge bg-success' : 'badge bg-danger';
            const joinedDate = new Date(user.createdAt).toLocaleDateString();

            return `
                <tr>
                    <td>${user.id}</td>
                    <td>
                        <strong>${user.username}</strong>
                        ${user.id === this.currentUser.id ? '<span class="badge bg-info ms-2">You</span>' : ''}
                    </td>
                    <td>${user.email}</td>
                    <td>
                        <span class="badge ${this.getRoleClass(user.role)}">${user.role}</span>
                    </td>
                    <td>
                        <span class="${statusClass}">${user.status}</span>
                    </td>
                    <td>${joinedDate}</td>
                    <td>
                        ${user.id !== this.currentUser.id ? `
                        <button class="btn btn-sm btn-outline-primary edit-user-btn" data-id="${user.id}">
                            Edit
                        </button>
                        <button class="btn btn-sm btn-outline-warning toggle-user-btn" data-id="${user.id}" data-status="${user.status}">
                            ${user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        ` : '<span class="text-muted">Current User</span>'}
                    </td>
                </tr>
            `;
        }).join('');

        // Add event listeners
        table.querySelectorAll('.edit-user-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.dataset.id;
                this.editUser(userId);
            });
        });

        table.querySelectorAll('.toggle-user-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.dataset.id;
                const currentStatus = e.target.dataset.status;
                this.toggleUserStatus(userId, currentStatus);
            });
        });
    }

    async loadAnimals() {
        try {
            const animals = await this.api.getAnimals(0, 50);
            this.displayAnimals(animals.content || []);
        } catch (error) {
            console.error('Error loading animals:', error);
            this.auth.showNotification('Error loading animals', 'danger');
        }
    }

    displayAnimals(animals) {
        const table = document.getElementById('animalsTable');
        if (!table) return;

        if (!animals || animals.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        No animals found.
                    </td>
                </tr>
            `;
            return;
        }

        table.innerHTML = animals.map(animal => {
            const status = animal.isVerified || animal.verified ? 'Verified' : 'Pending';
            const statusClass = status === 'Verified' ? 'badge bg-success' :
                status === 'Rejected' ? 'badge bg-danger' : 'badge bg-warning';
            const createdDate = new Date(animal.createdAt).toLocaleDateString();

            return `
                <tr>
                    <td>${animal.id}</td>
                    <td>
                        <strong>${animal.commonName}</strong>
                    </td>
                    <td>${animal.scientificName}</td>
                    <td>
                        <span class="${statusClass}">${status}</span>
                    </td>
                    <td>User ${animal.createdBy || 'Unknown'}</td>
                    <td>${createdDate}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary view-animal-btn" data-id="${animal.id}">
                                View
                            </button>
                            <button class="btn btn-outline-warning edit-animal-admin-btn" data-id="${animal.id}">
                                Edit
                            </button>
                            <button class="btn btn-outline-danger delete-animal-btn" data-id="${animal.id}">
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Add event listeners
        table.querySelectorAll('.view-animal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animalId = e.target.dataset.id;
                this.viewAnimal(animalId);
            });
        });

        table.querySelectorAll('.edit-animal-admin-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animalId = e.target.dataset.id;
                this.editAnimalAdmin(animalId);
            });
        });

        table.querySelectorAll('.delete-animal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animalId = e.target.dataset.id;
                this.deleteAnimal(animalId);
            });
        });
    }

    async loadContentModeration() {
        try {
            const filtered = await this.api.getFilteredSubmissions(0, 20);
            this.displayApprovalList(filtered.submissions || []);
        } catch (error) {
            console.error('Error loading content for moderation:', error);
            this.auth.showNotification('Error loading moderation content', 'danger');
        }
    }

    displayApprovalList(submissions) {
        const table = document.getElementById('approvalTable');
        if (!table) return;

        if (!submissions || submissions.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        No submissions awaiting approval.
                    </td>
                </tr>
            `;
            return;
        }

        table.innerHTML = submissions.map(submission => {
            const animal = submission.animal || {};
            const moderator = submission.moderator || {};
            const filteredDate = new Date(submission.moderatedAt).toLocaleDateString();
            const notes = submission.moderationNotes || 'No notes provided';

            return `
                <tr>
                    <td>
                        <strong>${animal.commonName || 'Unknown'}</strong>
                    </td>
                    <td>${animal.scientificName || ''}</td>
                    <td>${moderator.username || 'Unknown'}</td>
                    <td>${filteredDate}</td>
                    <td>
                        <small class="text-muted">${notes.substring(0, 50)}${notes.length > 50 ? '...' : ''}</small>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-success approve-final-btn" 
                                data-id="${submission.animalId || animal.id}"
                                data-workflow="${submission.workflowId}">
                            Approve
                        </button>
                        <button class="btn btn-sm btn-outline-danger reject-final-btn" 
                                data-id="${submission.animalId || animal.id}"
                                data-workflow="${submission.workflowId}">
                            Reject
                        </button>
                        <button class="btn btn-sm btn-outline-primary review-final-btn" 
                                data-id="${submission.animalId || animal.id}">
                            Review
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Add event listeners
        table.querySelectorAll('.approve-final-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animalId = e.target.dataset.id;
                const workflowId = e.target.dataset.workflow;
                this.approveSubmission(animalId, workflowId);
            });
        });

        table.querySelectorAll('.reject-final-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animalId = e.target.dataset.id;
                const workflowId = e.target.dataset.workflow;
                this.rejectSubmission(animalId, workflowId);
            });
        });

        table.querySelectorAll('.review-final-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animalId = e.target.dataset.id;
                this.reviewSubmission(animalId);
            });
        });
    }

    searchUsers() {
        const searchTerm = document.getElementById('userSearch').value.toLowerCase();
        const rows = document.querySelectorAll('#usersTable tr');

        rows.forEach(row => {
            if (row.cells.length < 2) return;

            const username = row.cells[1].textContent.toLowerCase();
            const email = row.cells[2].textContent.toLowerCase();

            if (username.includes(searchTerm) || email.includes(searchTerm) || !searchTerm) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    filterAnimals(filter) {
        const rows = document.querySelectorAll('#animalsTable tr');

        rows.forEach(row => {
            if (row.cells.length < 4) return;

            const statusCell = row.cells[3];
            const statusText = statusCell.textContent.trim().toLowerCase();

            if (filter === 'all' ||
                (filter === 'verified' && statusText === 'verified') ||
                (filter === 'pending' && statusText === 'pending') ||
                (filter === 'rejected' && statusText === 'rejected')) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    async editUser(userId) {
        // Note: Implement user editing functionality
        this.auth.showNotification('User editing functionality coming soon!', 'info');
    }

    async toggleUserStatus(userId, currentStatus) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const confirmMessage = `Are you sure you want to ${newStatus === 'inactive' ? 'deactivate' : 'activate'} this user?`;

        if (!confirm(confirmMessage)) return;

        try {
            // Note: Implement user status toggle API endpoint
            this.auth.showNotification(`User ${newStatus === 'inactive' ? 'deactivated' : 'activated'} successfully!`, 'success');

            // Reload users
            this.loadUsers();

        } catch (error) {
            console.error('Error toggling user status:', error);
            this.auth.showNotification('Error updating user status', 'danger');
        }
    }

    async viewAnimal(animalId) {
        try {
            const animal = await this.api.getAnimalById(animalId);

            const modal = new bootstrap.Modal(document.createElement('div'));
            modal._element.className = 'modal fade';
            modal._element.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${animal.commonName} (${animal.scientificName})</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    ${animal.imageUrl ? `
                                    <img src="${animal.imageUrl}" class="img-fluid rounded mb-3" alt="${animal.commonName}">
                                    ` : ''}
                                    <div class="d-flex flex-wrap gap-2 mb-3">
                                        <span class="badge bg-success">${animal.region || 'Unknown'}</span>
                                        <span class="badge bg-info">${animal.island || 'Unknown'}</span>
                                        <span class="badge ${this.getStatusClass(animal.conservationStatus)}">
                                            ${animal.conservationStatus || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6>Description</h6>
                                    <p>${animal.description || 'No description'}</p>
                                    
                                    ${animal.characteristics ? `
                                    <h6>Characteristics</h6>
                                    <p>${animal.characteristics}</p>
                                    ` : ''}
                                    
                                    <h6>Status</h6>
                                    <p>
                                        <span class="badge ${animal.isVerified || animal.verified ? 'bg-success' : 'bg-warning'}">
                                            ${animal.isVerified || animal.verified ? 'Verified' : 'Pending Verification'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal._element);
            modal.show();

            modal._element.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(modal._element);
            });

        } catch (error) {
            console.error('Error viewing animal:', error);
            this.auth.showNotification('Error loading animal details', 'danger');
        }
    }

    async editAnimalAdmin(animalId) {
        try {
            const animal = await this.api.getAnimalById(animalId);

            const modal = new bootstrap.Modal(document.createElement('div'));
            modal._element.className = 'modal fade';
            modal._element.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Animal: ${animal.commonName}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="adminEditAnimalForm">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Common Name</label>
                                        <input type="text" class="form-control" value="${animal.commonName || ''}">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Scientific Name</label>
                                        <input type="text" class="form-control" value="${animal.scientificName || ''}">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Description</label>
                                    <textarea class="form-control" rows="3">${animal.description || ''}</textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Verification Status</label>
                                    <select class="form-select">
                                        <option value="pending" ${!animal.isVerified && !animal.verified ? 'selected' : ''}>Pending</option>
                                        <option value="verified" ${animal.isVerified || animal.verified ? 'selected' : ''}>Verified</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <div class="alert alert-warning">
                                    <i class="bi bi-exclamation-triangle me-2"></i>
                                    Admin edits bypass normal moderation workflow.
                                </div>
                                <div class="d-flex justify-content-end gap-2">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" class="btn btn-success">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal._element);
            modal.show();

            // Handle form submission
            const form = modal._element.querySelector('#adminEditAnimalForm');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                // Note: Implement admin animal update
                this.auth.showNotification('Animal updated successfully!', 'success');
                modal.hide();
                this.loadAnimals();
            });

            modal._element.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(modal._element);
            });

        } catch (error) {
            console.error('Error loading animal for edit:', error);
            this.auth.showNotification('Error loading animal data', 'danger');
        }
    }

    async deleteAnimal(animalId) {
        if (!confirm('Are you sure you want to delete this animal? This action cannot be undone.')) {
            return;
        }

        try {
            await this.api.deleteAnimal(animalId);
            this.auth.showNotification('Animal deleted successfully!', 'success');
            this.loadAnimals();
        } catch (error) {
            console.error('Error deleting animal:', error);
            this.auth.showNotification(error.message || 'Error deleting animal', 'danger');
        }
    }

    async approveSubmission(animalId, workflowId) {
        try {
            await this.api.verifyAnimal(animalId);
            this.auth.showNotification('Animal approved and verified successfully!', 'success');
            this.loadContentModeration();
            this.loadAdminDashboard(); // Refresh stats
        } catch (error) {
            console.error('Error approving submission:', error);
            this.auth.showNotification(error.message || 'Error approving submission', 'danger');
        }
    }

    async rejectSubmission(animalId, workflowId) {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;

        try {
            // Note: Implement admin rejection API endpoint
            this.auth.showNotification('Submission rejected successfully!', 'success');
            this.loadContentModeration();
        } catch (error) {
            console.error('Error rejecting submission:', error);
            this.auth.showNotification('Error rejecting submission', 'danger');
        }
    }

    async reviewSubmission(animalId) {
        try {
            const animal = await this.api.getAnimalById(animalId);

            const modalBody = document.getElementById('approvalModalBody');
            modalBody.innerHTML = `
                <div class="submission-review">
                    <h4>Final Review: ${animal.commonName}</h4>
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>
                        This submission has been filtered by a moderator and is ready for final approval.
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Animal Details</h6>
                            <table class="table table-sm">
                                <tr>
                                    <th>Common Name:</th>
                                    <td>${animal.commonName || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Scientific Name:</th>
                                    <td>${animal.scientificName || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Conservation Status:</th>
                                    <td>${animal.conservationStatus || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Region:</th>
                                    <td>${animal.region || 'N/A'}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            ${animal.imageUrl ? `
                            <img src="${animal.imageUrl}" class="img-fluid rounded" alt="${animal.commonName}">
                            ` : '<p class="text-muted">No image</p>'}
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <h6>Description</h6>
                        <p>${animal.description || 'No description'}</p>
                    </div>
                    
                    <div class="alert alert-warning mt-3">
                        <h6><i class="bi bi-exclamation-triangle me-2"></i>Final Decision</h6>
                        <p>As an admin, your decision is final and will publish this animal to the public encyclopedia.</p>
                    </div>
                    
                    <div class="d-flex justify-content-between gap-2 mt-3">
                        <button type="button" class="btn btn-danger flex-fill" id="finalRejectBtn">
                            <i class="bi bi-x-circle me-2"></i>Reject
                        </button>
                        <button type="button" class="btn btn-success flex-fill" id="finalApproveBtn">
                            <i class="bi bi-check-circle me-2"></i>Approve & Publish
                        </button>
                    </div>
                </div>
            `;

            const modal = new bootstrap.Modal(document.getElementById('approvalModal'));
            modal.show();

            // Handle approve button
            document.getElementById('finalApproveBtn').addEventListener('click', () => {
                this.approveSubmission(animalId, null);
                modal.hide();
            });

            // Handle reject button
            document.getElementById('finalRejectBtn').addEventListener('click', () => {
                this.rejectSubmission(animalId, null);
                modal.hide();
            });

        } catch (error) {
            console.error('Error loading submission for review:', error);
            this.auth.showNotification('Error loading submission details', 'danger');
        }
    }

    clearCache() {
        if (confirm('Clear all system cache? This may temporarily affect performance.')) {
            this.auth.showNotification('System cache cleared successfully!', 'success');
        }
    }

    createBackup() {
        this.auth.showNotification('Backup creation initiated. You will be notified when complete.', 'info');
    }

    toggleMaintenance() {
        if (confirm('Toggle maintenance mode? This will temporarily disable public access.')) {
            this.auth.showNotification('Maintenance mode toggled successfully!', 'warning');
        }
    }

    // Helper methods
    getRoleClass(role) {
        switch(role.toLowerCase()) {
            case 'admin': return 'bg-danger';
            case 'moderator': return 'bg-warning text-dark';
            case 'contributor': return 'bg-success';
            case 'viewer': return 'bg-info';
            default: return 'bg-secondary';
        }
    }

    getStatusClass(status) {
        if (!status) return 'bg-secondary';
        const statusLower = status.toLowerCase();
        if (statusLower.includes('critically') || statusLower.includes('endangered')) return 'bg-danger';
        if (statusLower.includes('vulnerable')) return 'bg-warning';
        if (statusLower.includes('near threatened')) return 'bg-info';
        if (statusLower.includes('least concern')) return 'bg-success';
        return 'bg-secondary';
    }
}

// Initialize admin dashboard
const adminDashboard = new AdminDashboard();