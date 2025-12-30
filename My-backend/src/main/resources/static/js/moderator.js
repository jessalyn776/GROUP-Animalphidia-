// Moderator Dashboard
class ModeratorDashboard {
    constructor() {
        this.api = apiClient;
        this.auth = authManager;
        this.currentUser = this.auth.getCurrentUser();
        this.currentPage = 0;
        this.pageSize = 10;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            // Check authentication
            if (!this.auth.isLoggedIn()) {
                window.location.href = 'index.html';
                return;
            }

            // Check if user has moderator role
            if (!this.currentUser || (this.currentUser.role !== 'moderator' &&
                this.currentUser.role !== 'admin')) {
                this.auth.showNotification('Access denied. Moderator access required.', 'danger');
                window.location.href = 'index.html';
                return;
            }

            this.setupUI();
            this.loadModeratorDashboard();
            this.setupEventListeners();
        });
    }

    setupUI() {
        // Update moderator name display
        const moderatorName = document.getElementById('moderatorName');
        if (moderatorName && this.currentUser) {
            moderatorName.textContent = this.currentUser.username;
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
        const logoutBtn = document.getElementById('moderatorLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.auth.logout();
            });
        }

        // Refresh pending button
        const refreshPendingBtn = document.getElementById('refreshPendingBtn');
        if (refreshPendingBtn) {
            refreshPendingBtn.addEventListener('click', () => {
                this.loadPendingSubmissions();
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
                case 'pending-submissions':
                    this.loadPendingSubmissions();
                    break;
                case 'filtered-submissions':
                    this.loadFilteredSubmissions();
                    break;
            }
        }
    }

    async loadModeratorDashboard() {
        try {
            const dashboardData = await this.api.getModeratorDashboard();

            // Update stats
            document.getElementById('pendingCount').textContent =
                dashboardData.pendingSubmissions || 0;
            document.getElementById('filteredCount').textContent =
                dashboardData.filteredSubmissions || 0;

            // These would need additional API endpoints
            document.getElementById('approvedCount').textContent = '0';
            document.getElementById('rejectedCount').textContent = '0';

            // Load recent activity
            this.loadRecentActivity();

        } catch (error) {
            console.error('Error loading moderator dashboard:', error);
            this.auth.showNotification('Error loading dashboard data', 'danger');
        }
    }

    async loadRecentActivity() {
        try {
            const pending = await this.api.getPendingSubmissions(0, 5);
            const filtered = await this.api.getFilteredSubmissions(0, 5);

            const allSubmissions = [
                ...(pending.submissions || []),
                ...(filtered.submissions || [])
            ];

            // Sort by date (newest first)
            allSubmissions.sort((a, b) =>
                new Date(b.submittedAt || b.moderatedAt) - new Date(a.submittedAt || a.moderatedAt)
            );

            this.displayRecentActivity(allSubmissions.slice(0, 10));

        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    displayRecentActivity(submissions) {
        const table = document.getElementById('moderationActivityTable');
        if (!table) return;

        if (!submissions || submissions.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        No moderation activity yet.
                    </td>
                </tr>
            `;
            return;
        }

        table.innerHTML = submissions.map(submission => {
            const animal = submission.animal || {};
            const submitter = submission.submitter || {};
            const moderator = submission.moderator || {};

            let status = 'Pending';
            let statusClass = 'badge bg-warning';
            let action = 'Awaiting review';

            if (submission.moderationStatus === 'FILTERED') {
                status = 'Filtered';
                statusClass = 'badge bg-info';
                action = `Filtered by ${moderator.username || 'moderator'}`;
            } else if (submission.moderationStatus === 'REJECTED') {
                status = 'Rejected';
                statusClass = 'badge bg-danger';
                action = `Rejected by ${moderator.username || 'moderator'}`;
            }

            const date = new Date(submission.moderatedAt || submission.submittedAt).toLocaleDateString();

            return `
                <tr>
                    <td>
                        <strong>${animal.commonName || 'Unknown'}</strong>
                    </td>
                    <td>${submitter.username || 'Unknown'}</td>
                    <td>
                        <span class="${statusClass}">${status}</span>
                    </td>
                    <td>${action}</td>
                    <td>${date}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary review-submission-btn" 
                                data-id="${submission.animalId || animal.id}"
                                data-workflow="${submission.workflowId}">
                            Review
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Add event listeners
        table.querySelectorAll('.review-submission-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animalId = e.target.dataset.id;
                const workflowId = e.target.dataset.workflow;
                this.reviewSubmission(animalId, workflowId);
            });
        });
    }

    async loadPendingSubmissions(page = this.currentPage) {
        try {
            const submissions = await this.api.getPendingSubmissions(page, this.pageSize);
            this.displayPendingSubmissions(submissions);
        } catch (error) {
            console.error('Error loading pending submissions:', error);
            this.auth.showNotification('Error loading pending submissions', 'danger');
        }
    }

    displayPendingSubmissions(data) {
        const table = document.getElementById('pendingSubmissionsTable');
        const pagination = document.getElementById('pendingPagination');

        if (!table) return;

        if (!data.submissions || data.submissions.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        No pending submissions at the moment. Great work!
                    </td>
                </tr>
            `;
            if (pagination) pagination.innerHTML = '';
            return;
        }

        table.innerHTML = data.submissions.map(submission => {
            const animal = submission.animal || {};
            const submitter = submission.submitter || {};
            const submittedDate = new Date(submission.submittedAt).toLocaleDateString();

            return `
                <tr>
                    <td>
                        <strong>${animal.commonName || 'Unknown'}</strong>
                    </td>
                    <td>${animal.scientificName || ''}</td>
                    <td>${submitter.username || 'Unknown'}</td>
                    <td>${submittedDate}</td>
                    <td>
                        <span class="badge bg-warning">Pending</span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary review-btn" 
                                data-id="${submission.animalId || animal.id}"
                                data-workflow="${submission.workflowId}">
                            <i class="bi bi-eye me-1"></i>Review
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Update pagination
        this.updatePagination(data.totalPages, data.currentPage, pagination, 'pending');

        // Add event listeners
        table.querySelectorAll('.review-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animalId = e.target.closest('.review-btn').dataset.id;
                const workflowId = e.target.closest('.review-btn').dataset.workflow;
                this.reviewSubmission(animalId, workflowId);
            });
        });
    }

    async loadFilteredSubmissions() {
        try {
            const submissions = await this.api.getFilteredSubmissions(0, 20);
            this.displayFilteredSubmissions(submissions);
        } catch (error) {
            console.error('Error loading filtered submissions:', error);
            this.auth.showNotification('Error loading filtered submissions', 'danger');
        }
    }

    displayFilteredSubmissions(data) {
        const table = document.getElementById('filteredSubmissionsTable');
        if (!table) return;

        if (!data.submissions || data.submissions.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        No filtered submissions at the moment.
                    </td>
                </tr>
            `;
            return;
        }

        table.innerHTML = data.submissions.map(submission => {
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
                        <button class="btn btn-sm btn-outline-info view-filtered-btn" 
                                data-id="${submission.animalId || animal.id}">
                            View
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Add event listeners
        table.querySelectorAll('.view-filtered-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animalId = e.target.dataset.id;
                this.viewFilteredSubmission(animalId);
            });
        });
    }

    async reviewSubmission(animalId, workflowId) {
        try {
            // Load animal details
            const animal = await this.api.getAnimalById(animalId);

            const modalBody = document.getElementById('reviewModalBody');
            modalBody.innerHTML = `
                <div class="submission-review">
                    <h4>Review Submission</h4>
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>
                        Review this submission for accuracy and completeness before taking action.
                    </div>
                    
                    <!-- Animal Details -->
                    <div class="card mb-3">
                        <div class="card-header">
                            <h5 class="mb-0">Animal Information</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
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
                                        <tr>
                                            <th>Island:</th>
                                            <td>${animal.island || 'N/A'}</td>
                                        </tr>
                                    </table>
                                </div>
                                <div class="col-md-6">
                                    ${animal.imageUrl ? `
                                    <img src="${animal.imageUrl}" class="img-fluid rounded" alt="${animal.commonName}">
                                    ` : '<p class="text-muted">No image provided</p>'}
                                </div>
                            </div>
                            
                            <h6 class="mt-3">Description</h6>
                            <p>${animal.description || 'No description provided'}</p>
                            
                            ${animal.characteristics ? `
                            <h6>Characteristics</h6>
                            <p>${animal.characteristics}</p>
                            ` : ''}
                            
                            ${animal.habitat ? `
                            <h6>Habitat</h6>
                            <p>${animal.habitat}</p>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Moderation Actions -->
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Moderation Action</h5>
                        </div>
                        <div class="card-body">
                            <form id="moderationForm">
                                <input type="hidden" id="reviewAnimalId" value="${animalId}">
                                <input type="hidden" id="reviewWorkflowId" value="${workflowId || ''}">
                                
                                <div class="mb-3">
                                    <label class="form-label">Notes (Required for rejection)</label>
                                    <textarea class="form-control" id="moderationNotes" rows="3" 
                                              placeholder="Provide feedback or reasons for your decision..."></textarea>
                                </div>
                                
                                <div class="alert alert-warning">
                                    <div class="form-check mb-2">
                                        <input class="form-check-input" type="checkbox" id="checkAccuracy" required>
                                        <label class="form-check-label" for="checkAccuracy">
                                            I have verified the accuracy of this information
                                        </label>
                                    </div>
                                    <div class="form-check mb-2">
                                        <input class="form-check-input" type="checkbox" id="checkCompleteness" required>
                                        <label class="form-check-label" for="checkCompleteness">
                                            This submission is complete and follows guidelines
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="checkSources" required>
                                        <label class="form-check-label" for="checkSources">
                                            Credible sources are cited (or not needed for common knowledge)
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="d-flex justify-content-between gap-2">
                                    <button type="button" class="btn btn-danger flex-fill" id="rejectBtn">
                                        <i class="bi bi-x-circle me-2"></i>Reject
                                    </button>
                                    <button type="button" class="btn btn-success flex-fill" id="approveBtn">
                                        <i class="bi bi-check-circle me-2"></i>Approve (Filter)
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;

            const modal = new bootstrap.Modal(document.getElementById('reviewModal'));
            modal.show();

            // Handle approve button
            document.getElementById('approveBtn').addEventListener('click', () => {
                this.submitModerationAction(animalId, true);
            });

            // Handle reject button
            document.getElementById('rejectBtn').addEventListener('click', () => {
                this.submitModerationAction(animalId, false);
            });

        } catch (error) {
            console.error('Error loading submission for review:', error);
            this.auth.showNotification('Error loading submission details', 'danger');
        }
    }

    async submitModerationAction(animalId, isFactual) {
        const notes = document.getElementById('moderationNotes').value;

        // For rejection, notes are required
        if (!isFactual && !notes.trim()) {
            this.auth.showNotification('Please provide a reason for rejection', 'warning');
            return;
        }

        // Check if all checkboxes are checked for approval
        if (isFactual) {
            const checkAccuracy = document.getElementById('checkAccuracy');
            const checkCompleteness = document.getElementById('checkCompleteness');
            const checkSources = document.getElementById('checkSources');

            if (!checkAccuracy.checked || !checkCompleteness.checked || !checkSources.checked) {
                this.auth.showNotification('Please confirm all verification checks', 'warning');
                return;
            }
        }

        try {
            const result = await this.api.filterSubmission(animalId, notes, isFactual);

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
            modal.hide();

            // Show success message
            this.auth.showNotification(result.message || 'Action completed successfully', 'success');

            // Reload data
            this.loadModeratorDashboard();
            this.loadPendingSubmissions();
            this.loadFilteredSubmissions();

        } catch (error) {
            console.error('Error submitting moderation action:', error);
            this.auth.showNotification(error.message || 'Error submitting action', 'danger');
        }
    }

    async viewFilteredSubmission(animalId) {
        try {
            const animal = await this.api.getAnimalById(animalId);

            const modal = new bootstrap.Modal(document.createElement('div'));
            modal._element.className = 'modal fade';
            modal._element.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Filtered Submission: ${animal.commonName}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-info">
                                <i class="bi bi-info-circle me-2"></i>
                                This submission has been filtered and is awaiting admin approval.
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
                                    </table>
                                </div>
                                <div class="col-md-6">
                                    ${animal.imageUrl ? `
                                    <img src="${animal.imageUrl}" class="img-fluid rounded" alt="${animal.commonName}">
                                    ` : '<p class="text-muted">No image</p>'}
                                </div>
                            </div>
                            
                            <h6 class="mt-3">Description</h6>
                            <p>${animal.description || 'No description'}</p>
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
            console.error('Error viewing filtered submission:', error);
            this.auth.showNotification('Error loading submission details', 'danger');
        }
    }

    updatePagination(totalPages, currentPage, container, type) {
        if (!container || totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '';

        // Previous button
        html += `
            <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}" data-type="${type}">Previous</a>
            </li>
        `;

        // Page numbers
        const maxVisible = 5;
        let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages - 1, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(0, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            html += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}" data-type="${type}">${i + 1}</a>
                </li>
            `;
        }

        // Next button
        html += `
            <li class="page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}" data-type="${type}">Next</a>
            </li>
        `;

        container.innerHTML = html;

        // Add event listeners
        container.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                const type = e.target.dataset.type;
                if (!isNaN(page) && page >= 0 && page < totalPages) {
                    this.currentPage = page;
                    if (type === 'pending') {
                        this.loadPendingSubmissions(page);
                    }
                }
            });
        });
    }
}

// Initialize moderator dashboard
const moderatorDashboard = new ModeratorDashboard();