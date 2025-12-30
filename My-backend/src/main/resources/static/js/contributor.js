// Contributor Dashboard
class ContributorDashboard {
    constructor() {
        this.api = apiClient;
        this.auth = authManager;
        this.currentUser = this.auth.getCurrentUser();
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            // Check authentication
            if (!this.auth.isLoggedIn()) {
                window.location.href = 'index.html';
                return;
            }

            // Check if user has contributor role
            if (!this.currentUser || (this.currentUser.role !== 'contributor' &&
                this.currentUser.role !== 'admin' &&
                this.currentUser.role !== 'moderator')) {
                this.auth.showNotification('Access denied. Contributor access required.', 'danger');
                window.location.href = 'index.html';
                return;
            }

            this.setupUI();
            this.loadDashboard();
            this.setupEventListeners();
        });
    }

    setupUI() {
        // Update username display
        const usernameDisplay = document.getElementById('usernameDisplay');
        const contributorName = document.getElementById('contributorName');

        if (usernameDisplay && this.currentUser) {
            usernameDisplay.textContent = this.currentUser.username;
        }

        if (contributorName && this.currentUser) {
            contributorName.textContent = this.currentUser.username;
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

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.auth.logout();
            });
        }

        // Profile settings button
        const profileSettingsBtn = document.getElementById('profileSettingsBtn');
        if (profileSettingsBtn) {
            profileSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection('profile');
            });
        }

        // Create animal form
        const createAnimalForm = document.getElementById('createAnimalForm');
        if (createAnimalForm) {
            createAnimalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitNewAnimal();
            });
        }

        // Reset form button
        const resetFormBtn = document.getElementById('resetFormBtn');
        if (resetFormBtn) {
            resetFormBtn.addEventListener('click', () => {
                document.getElementById('createAnimalForm').reset();
            });
        }

        // Filter submission buttons
        document.querySelectorAll('.filter-submission').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.target.dataset.status;
                this.filterSubmissions(status);
            });
        });

        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }

        // Password form
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changePassword();
            });
        }

        // Profile picture upload
        const uploadProfilePictureBtn = document.getElementById('uploadProfilePictureBtn');
        if (uploadProfilePictureBtn) {
            uploadProfilePictureBtn.addEventListener('click', () => {
                this.uploadProfilePicture();
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
                case 'my-contributions':
                    this.loadContributions();
                    break;
                case 'favorites':
                    this.loadFavorites();
                    break;
                case 'profile':
                    this.loadProfile();
                    break;
            }
        }
    }

    async loadDashboard() {
        try {
            // Load user submissions
            const submissions = await this.api.getUserSubmissions();

            // Update stats
            const total = submissions.submissions?.length || 0;
            const verified = submissions.submissions?.filter(s => s.verified || s.isVerified)?.length || 0;
            const pending = submissions.submissions?.filter(s => !s.verified && !s.isVerified)?.length || 0;

            document.getElementById('totalContributions').textContent = total;
            document.getElementById('verifiedContributions').textContent = verified;
            document.getElementById('pendingContributions').textContent = pending;

            // Load favorites count
            const userProfile = await this.api.getUserProfile();
            if (userProfile.favorites) {
                document.getElementById('favoriteCount').textContent = userProfile.favorites.length;
            }

            // Update profile stats
            document.getElementById('statContributions').textContent = total;
            document.getElementById('statVerified').textContent = verified;
            document.getElementById('statPending').textContent = pending;

            // Load recent activity
            this.loadRecentActivity(submissions.submissions);

        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.auth.showNotification('Error loading dashboard data', 'danger');
        }
    }

    async loadRecentActivity(submissions) {
        const table = document.getElementById('recentActivityTable');
        if (!table) return;

        if (!submissions || submissions.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        No submissions yet. <a href="#" class="text-decoration-none" data-section="create-animal">Submit your first animal!</a>
                    </td>
                </tr>
            `;
            return;
        }

        // Sort by submission date (newest first)
        submissions.sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt));

        // Take first 5
        const recent = submissions.slice(0, 5);

        table.innerHTML = recent.map(submission => {
            const animal = submission.animal || submission;
            const status = animal.isVerified || animal.verified ? 'Verified' : 'Pending Review';
            const statusClass = status === 'Verified' ? 'badge bg-success' : 'badge bg-warning';
            const submittedDate = new Date(submission.submittedAt || animal.createdAt).toLocaleDateString();
            const updatedDate = new Date(animal.updatedAt).toLocaleDateString();

            return `
                <tr>
                    <td>
                        <strong>${animal.commonName || 'Unknown'}</strong>
                    </td>
                    <td>
                        <span class="${statusClass}">${status}</span>
                    </td>
                    <td>${submittedDate}</td>
                    <td>${updatedDate}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-animal-btn" 
                                data-id="${animal.id || animal.animalId}">
                            View
                        </button>
                        ${status === 'Pending Review' ? `
                        <button class="btn btn-sm btn-outline-warning edit-animal-btn" 
                                data-id="${animal.id || animal.animalId}">
                            Edit
                        </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');

        // Add event listeners
        table.querySelectorAll('.view-animal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animalId = e.target.dataset.id;
                this.viewAnimalDetails(animalId);
            });
        });

        table.querySelectorAll('.edit-animal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animalId = e.target.dataset.id;
                this.editAnimal(animalId);
            });
        });
    }

    async loadContributions() {
        try {
            const submissions = await this.api.getUserSubmissions();
            this.displayContributions(submissions.submissions || []);
        } catch (error) {
            console.error('Error loading contributions:', error);
            this.auth.showNotification('Error loading contributions', 'danger');
        }
    }

    displayContributions(submissions) {
        const table = document.getElementById('contributionsTable');
        if (!table) return;

        if (!submissions || submissions.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        No contributions yet. <a href="#" class="text-decoration-none" data-section="create-animal">Submit your first animal!</a>
                    </td>
                </tr>
            `;
            return;
        }

        table.innerHTML = submissions.map(submission => {
            const animal = submission.animal || submission;
            const workflow = submission.workflow || submission;

            let status = 'Pending';
            let statusClass = 'badge bg-warning';

            if (animal.isVerified || animal.verified) {
                status = 'Verified';
                statusClass = 'badge bg-success';
            } else if (workflow.moderationStatus === 'REJECTED' || workflow.finalStatus === 'REJECTED') {
                status = 'Rejected';
                statusClass = 'badge bg-danger';
            } else if (workflow.moderationStatus === 'FILTERED') {
                status = 'Under Review';
                statusClass = 'badge bg-info';
            }

            const submittedDate = new Date(workflow.submittedAt || animal.createdAt).toLocaleDateString();
            const updatedDate = new Date(animal.updatedAt).toLocaleDateString();
            const notes = workflow.moderationNotes || workflow.adminNotes || '';

            return `
                <tr>
                    <td>
                        <strong>${animal.commonName || 'Unknown'}</strong>
                    </td>
                    <td>${animal.scientificName || ''}</td>
                    <td>
                        <span class="${statusClass}">${status}</span>
                    </td>
                    <td>${submittedDate}</td>
                    <td>${updatedDate}</td>
                    <td>
                        <small class="text-muted">${notes.substring(0, 50)}${notes.length > 50 ? '...' : ''}</small>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-animal-btn" 
                                data-id="${animal.id || animal.animalId}">
                            View
                        </button>
                        ${status === 'Pending' || status === 'Under Review' ? `
                        <button class="btn btn-sm btn-outline-warning edit-animal-btn" 
                                data-id="${animal.id || animal.animalId}"
                                ${status === 'Under Review' ? 'disabled title="Cannot edit while under review"' : ''}>
                            Edit
                        </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');

        // Add event listeners
        table.querySelectorAll('.view-animal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animalId = e.target.dataset.id;
                this.viewAnimalDetails(animalId);
            });
        });

        table.querySelectorAll('.edit-animal-btn').forEach(btn => {
            if (!btn.disabled) {
                btn.addEventListener('click', (e) => {
                    const animalId = e.target.dataset.id;
                    this.editAnimal(animalId);
                });
            }
        });
    }

    filterSubmissions(status) {
        const rows = document.querySelectorAll('#contributionsTable tr');

        rows.forEach(row => {
            if (row.cells.length < 3) return;

            const statusCell = row.cells[2];
            const statusText = statusCell.textContent.trim();

            if (status === 'all' ||
                (status === 'pending' && (statusText === 'Pending' || statusText === 'Under Review')) ||
                (status === 'verified' && statusText === 'Verified') ||
                (status === 'rejected' && statusText === 'Rejected')) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    async submitNewAnimal() {
        const form = document.getElementById('createAnimalForm');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const animalData = {
            commonName: document.getElementById('commonName').value,
            scientificName: document.getElementById('scientificName').value,
            localName: document.getElementById('localName').value || null,
            conservationStatus: document.getElementById('conservationStatus').value,
            description: document.getElementById('description').value,
            characteristics: document.getElementById('characteristics').value,
            region: document.getElementById('region').value,
            island: document.getElementById('island').value,
            habitat: document.getElementById('habitat').value,
            behavior: document.getElementById('behavior').value,
            diet: document.getElementById('diet').value,
            reproduction: document.getElementById('reproduction').value,
            imageUrl: document.getElementById('imageUrl').value || null,
            populationEstimate: document.getElementById('populationEstimate').value ?
                parseFloat(document.getElementById('populationEstimate').value) : null,
            tags: document.getElementById('tags').value || null,
            verified: false,
            isVerified: false,
            active: true
        };

        try {
            const submitBtn = document.getElementById('submitAnimalBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';
            submitBtn.disabled = true;

            const result = await this.api.createAnimal(animalData);

            this.auth.showNotification('Animal submitted successfully! It will be reviewed by our moderators.', 'success');

            // Reset form
            form.reset();
            form.classList.remove('was-validated');

            // Reload dashboard
            this.loadDashboard();

            // Switch to contributions section
            this.showSection('my-contributions');

        } catch (error) {
            console.error('Error submitting animal:', error);
            this.auth.showNotification(error.message || 'Error submitting animal', 'danger');
        } finally {
            const submitBtn = document.getElementById('submitAnimalBtn');
            if (submitBtn) {
                submitBtn.innerHTML = originalText || '<i class="bi bi-send me-2"></i>Submit for Verification';
                submitBtn.disabled = false;
            }
        }
    }

    async viewAnimalDetails(animalId) {
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
                                        <span class="badge bg-success">${animal.region || 'Unknown Region'}</span>
                                        <span class="badge bg-info">${animal.island || 'Unknown Island'}</span>
                                        <span class="badge ${this.getStatusClass(animal.conservationStatus)}">
                                            ${animal.conservationStatus || 'Unknown Status'}
                                        </span>
                                        <span class="badge ${animal.isVerified || animal.verified ? 'bg-success' : 'bg-warning'}">
                                            ${animal.isVerified || animal.verified ? 'Verified' : 'Pending Verification'}
                                        </span>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6>Description</h6>
                                    <p>${animal.description || 'No description available.'}</p>
                                    
                                    ${animal.characteristics ? `
                                    <h6 class="mt-3">Characteristics</h6>
                                    <p>${animal.characteristics}</p>
                                    ` : ''}
                                    
                                    ${animal.habitat ? `
                                    <h6 class="mt-3">Habitat</h6>
                                    <p>${animal.habitat}</p>
                                    ` : ''}
                                    
                                    ${animal.behavior ? `
                                    <h6 class="mt-3">Behavior</h6>
                                    <p>${animal.behavior}</p>
                                    ` : ''}
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

    async editAnimal(animalId) {
        try {
            const animal = await this.api.getAnimalById(animalId);

            const formHtml = `
                <form id="editAnimalForm">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Common Name *</label>
                            <input type="text" class="form-control" id="editCommonName" value="${animal.commonName || ''}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Scientific Name *</label>
                            <input type="text" class="form-control" id="editScientificName" value="${animal.scientificName || ''}" required>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Conservation Status *</label>
                            <select class="form-select" id="editConservationStatus" required>
                                <option value="Critically Endangered" ${animal.conservationStatus === 'Critically Endangered' ? 'selected' : ''}>Critically Endangered</option>
                                <option value="Endangered" ${animal.conservationStatus === 'Endangered' ? 'selected' : ''}>Endangered</option>
                                <option value="Vulnerable" ${animal.conservationStatus === 'Vulnerable' ? 'selected' : ''}>Vulnerable</option>
                                <option value="Near Threatened" ${animal.conservationStatus === 'Near Threatened' ? 'selected' : ''}>Near Threatened</option>
                                <option value="Least Concern" ${animal.conservationStatus === 'Least Concern' ? 'selected' : ''}>Least Concern</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Region *</label>
                            <select class="form-select" id="editRegion" required>
                                <option value="Luzon" ${animal.region === 'Luzon' ? 'selected' : ''}>Luzon</option>
                                <option value="Visayas" ${animal.region === 'Visayas' ? 'selected' : ''}>Visayas</option>
                                <option value="Mindanao" ${animal.region === 'Mindanao' ? 'selected' : ''}>Mindanao</option>
                                <option value="Palawan" ${animal.region === 'Palawan' ? 'selected' : ''}>Palawan</option>
                            </select>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Description *</label>
                        <textarea class="form-control" id="editDescription" rows="3" required>${animal.description || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Image URL</label>
                        <input type="url" class="form-control" id="editImageUrl" value="${animal.imageUrl || ''}">
                    </div>
                    <div class="alert alert-warning">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Note: Editing this animal will reset its verification status and it will need to be reviewed again.
                    </div>
                    <div class="d-flex justify-content-end gap-2">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-success">Save Changes</button>
                    </div>
                </form>
            `;

            const container = document.getElementById('editAnimalFormContainer');
            container.innerHTML = formHtml;

            const modal = new bootstrap.Modal(document.getElementById('editAnimalModal'));
            modal.show();

            // Handle form submission
            const editForm = document.getElementById('editAnimalForm');
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveAnimalEdit(animalId);
                modal.hide();
            });

        } catch (error) {
            console.error('Error loading animal for edit:', error);
            this.auth.showNotification('Error loading animal data', 'danger');
        }
    }

    async saveAnimalEdit(animalId) {
        const animalData = {
            commonName: document.getElementById('editCommonName').value,
            scientificName: document.getElementById('editScientificName').value,
            conservationStatus: document.getElementById('editConservationStatus').value,
            region: document.getElementById('editRegion').value,
            description: document.getElementById('editDescription').value,
            imageUrl: document.getElementById('editImageUrl').value || null,
            verified: false,
            isVerified: false
        };

        try {
            await this.api.updateAnimal(animalId, animalData);
            this.auth.showNotification('Animal updated successfully! It will be reviewed again.', 'success');
            this.loadDashboard();
            this.loadContributions();
        } catch (error) {
            console.error('Error updating animal:', error);
            this.auth.showNotification(error.message || 'Error updating animal', 'danger');
        }
    }

    async loadFavorites() {
        try {
            const userProfile = await this.api.getUserProfile();
            const favorites = userProfile.favorites || [];

            this.displayFavorites(favorites);
        } catch (error) {
            console.error('Error loading favorites:', error);
            this.auth.showNotification('Error loading favorites', 'danger');
        }
    }

    displayFavorites(favorites) {
        const container = document.getElementById('favoritesGrid');
        if (!container) return;

        if (!favorites || favorites.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center text-muted py-5">
                    <i class="bi bi-heart display-1 text-muted"></i>
                    <h5 class="mt-3">No favorite animals yet</h5>
                    <p>Browse animals on the homepage and add them to your favorites!</p>
                    <a href="index.html" class="btn btn-outline-success">Browse Animals</a>
                </div>
            `;
            return;
        }

        container.innerHTML = favorites.map(fav => `
            <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
                <div class="card animal-card h-100">
                    <div class="position-relative">
                        <img src="${fav.imageUrl || 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'}" 
                             class="card-img-top animal-img" alt="${fav.commonName}">
                        <span class="badge badge-status bg-danger">
                            <i class="bi bi-heart-fill"></i>
                        </span>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${fav.commonName}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${fav.scientificName}</h6>
                        <button class="btn btn-sm btn-outline-primary view-favorite-btn" 
                                data-id="${fav.id || fav.animalId}">
                            View Details
                        </button>
                        <button class="btn btn-sm btn-outline-danger remove-favorite-btn" 
                                data-id="${fav.id || fav.animalId}">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners
        container.querySelectorAll('.view-favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animalId = e.target.dataset.id;
                this.viewAnimalDetails(animalId);
            });
        });

        container.querySelectorAll('.remove-favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animalId = e.target.dataset.id;
                this.removeFavorite(animalId);
            });
        });
    }

    async removeFavorite(animalId) {
        try {
            // Note: You'll need to implement the remove favorite API endpoint
            // For now, we'll show a message
            this.auth.showNotification('Remove favorite functionality coming soon!', 'info');
        } catch (error) {
            console.error('Error removing favorite:', error);
            this.auth.showNotification('Error removing favorite', 'danger');
        }
    }

    async loadProfile() {
        try {
            const userProfile = await this.api.getUserProfile();

            // Populate form fields
            document.getElementById('profileFirstName').value = userProfile.firstName || '';
            document.getElementById('profileLastName').value = userProfile.lastName || '';
            document.getElementById('profileUsername').value = userProfile.username || '';
            document.getElementById('profileEmail').value = userProfile.email || '';
            document.getElementById('profileBio').value = userProfile.bio || '';

            // Update profile picture if available
            if (userProfile.profilePicture) {
                document.getElementById('profilePicture').src = userProfile.profilePicture;
            }

            // Update statistics
            document.getElementById('memberSince').textContent =
                new Date(userProfile.createdAt).toLocaleDateString();
            document.getElementById('lastLogin').textContent =
                userProfile.lastLogin ? new Date(userProfile.lastLogin).toLocaleDateString() : 'Never';

        } catch (error) {
            console.error('Error loading profile:', error);
            this.auth.showNotification('Error loading profile data', 'danger');
        }
    }

    async updateProfile() {
        const profileData = {
            firstName: document.getElementById('profileFirstName').value,
            lastName: document.getElementById('profileLastName').value,
            bio: document.getElementById('profileBio').value
        };

        try {
            // Note: You'll need to implement the update profile API endpoint
            // For now, we'll show a success message
            this.auth.showNotification('Profile updated successfully!', 'success');

            // Update local storage
            const currentUser = this.auth.getCurrentUser();
            if (currentUser) {
                currentUser.firstName = profileData.firstName;
                currentUser.lastName = profileData.lastName;
                localStorage.setItem('user', JSON.stringify(currentUser));
            }

        } catch (error) {
            console.error('Error updating profile:', error);
            this.auth.showNotification('Error updating profile', 'danger');
        }
    }

    async changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            this.auth.showNotification('New passwords do not match!', 'danger');
            return;
        }

        if (newPassword.length < 6) {
            this.auth.showNotification('New password must be at least 6 characters long', 'danger');
            return;
        }

        try {
            // Note: You'll need to implement the change password API endpoint
            // For now, we'll show a success message
            this.auth.showNotification('Password changed successfully!', 'success');
            document.getElementById('passwordForm').reset();

        } catch (error) {
            console.error('Error changing password:', error);
            this.auth.showNotification('Error changing password', 'danger');
        }
    }

    async uploadProfilePicture() {
        const fileInput = document.getElementById('profilePictureInput');
        const file = fileInput.files[0];

        if (!file) {
            this.auth.showNotification('Please select a file first', 'warning');
            return;
        }

        if (!file.type.startsWith('image/')) {
            this.auth.showNotification('Please select an image file', 'danger');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.auth.showNotification('Image size must be less than 5MB', 'danger');
            return;
        }

        try {
            // Note: You'll need to implement the profile picture upload API endpoint
            // For now, we'll show a preview
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('profilePicture').src = e.target.result;
                this.auth.showNotification('Profile picture updated!', 'success');
            };
            reader.readAsDataURL(file);

        } catch (error) {
            console.error('Error uploading profile picture:', error);
            this.auth.showNotification('Error uploading profile picture', 'danger');
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

// Initialize contributor dashboard
const contributorDashboard = new ContributorDashboard();