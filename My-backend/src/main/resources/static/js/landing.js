// landing.js - Landing page functionality
class LandingPage {
    constructor() {
        this.currentPage = 0;
        this.pageSize = 12;
        this.currentFilters = {};
        this.initEventListeners();
        this.loadInitialData();
    }

    initEventListeners() {
        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const heroSearchBtn = document.getElementById('heroSearchBtn');
        const searchInput = document.getElementById('searchInput');
        const heroSearch = document.getElementById('heroSearch');

        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => {
                this.searchAnimals(searchInput.value);
            });
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchAnimals(searchInput.value);
                }
            });
        }

        if (heroSearchBtn && heroSearch) {
            heroSearchBtn.addEventListener('click', () => {
                this.searchAnimals(heroSearch.value);
            });
            heroSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchAnimals(heroSearch.value);
                }
            });
        }

        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.target.dataset.status;
                this.filterByStatus(status);

                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Category dropdown
        const categoryLinks = document.querySelectorAll('[data-category]');
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.dataset.category;
                this.filterByCategory(category);
            });
        });

        // Apply filters button
        const applyFiltersBtn = document.getElementById('applyFilters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }

        // Sort select
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.loadAnimals();
            });
        }

        // Learn more button
        const learnMoreBtn = document.getElementById('learnMoreBtn');
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => {
                window.location.href = '#conservation';
            });
        }
    }

    async loadInitialData() {
        try {
            // Load featured animals
            await this.loadFeaturedAnimals();

            // Load all animals
            await this.loadAnimals();

            // Load stats
            await this.loadStats();

        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load data. Please try again later.');
        }
    }

    async loadFeaturedAnimals() {
        try {
            const response = await apiClient.get('/public/animals/featured');
            const container = document.getElementById('featuredAnimals');

            if (!container) return;

            if (response.featured && response.featured.length > 0) {
                container.innerHTML = response.featured.map(animal => this.createAnimalCard(animal)).join('');
            } else {
                container.innerHTML = `
                    <div class="col-12 text-center">
                        <p class="text-muted">No featured animals available</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading featured animals:', error);
            document.getElementById('featuredAnimals').innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-danger">Failed to load featured animals</p>
                </div>
            `;
        }
    }

    async loadAnimals() {
        try {
            const sortBy = document.getElementById('sortSelect')?.value || 'name';
            const queryParams = new URLSearchParams({
                page: this.currentPage,
                size: this.pageSize,
                ...this.currentFilters
            });

            // Add sorting
            if (sortBy === 'date') {
                queryParams.set('sort', 'createdAt,desc');
            } else if (sortBy === 'status') {
                queryParams.set('sort', 'conservationStatus');
            }

            const response = await apiClient.get(`/public/animals/limited?${queryParams}`);
            const container = document.getElementById('animalsGrid');
            const pagination = document.getElementById('pagination');

            if (!container) return;

            if (response.animals && response.animals.length > 0) {
                container.innerHTML = response.animals.map(animal => this.createAnimalCard(animal)).join('');

                // Setup pagination
                if (pagination && response.count > this.pageSize) {
                    this.setupPagination(response.count);
                }
            } else {
                container.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle"></i> No animals found matching your criteria.
                            ${this.hasFilters() ? 'Try changing your filters.' : ''}
                        </div>
                    </div>
                `;

                if (pagination) {
                    pagination.innerHTML = '';
                }
            }
        } catch (error) {
            console.error('Error loading animals:', error);
            document.getElementById('animalsGrid').innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle"></i> Failed to load animals. Please try again.
                    </div>
                </div>
            `;
        }
    }

    async loadStats() {
        try {
            // Try to get admin stats first
            try {
                const stats = await apiClient.get('/admin/stats');
                if (stats.totalAnimals) {
                    document.getElementById('totalAnimals').textContent = stats.totalAnimals;
                }
                if (stats.endangeredCount) {
                    document.getElementById('endangeredCount').textContent = stats.endangeredCount;
                }
                if (stats.protectedCount) {
                    document.getElementById('protectedCount').textContent = stats.protectedCount;
                }
            } catch (adminError) {
                console.log('Admin stats not available, using fallback');
                // Use public API as fallback
                const publicStats = await apiClient.get('/public/animals/limited');
                if (publicStats.count) {
                    document.getElementById('totalAnimals').textContent = publicStats.count;
                }
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            // Set default values
            document.getElementById('totalAnimals').textContent = '50+';
            document.getElementById('endangeredCount').textContent = '25+';
            document.getElementById('protectedCount').textContent = '100+';
        }
    }

    createAnimalCard(animal) {
        const statusClass = this.getStatusClass(animal.conservationStatus);

        return `
            <div class="col-md-4 col-lg-3 mb-4">
                <div class="card animal-card h-100" data-animal-id="${animal.id}">
                    <div class="card-img-top position-relative" style="height: 200px; overflow: hidden;">
                        <img src="${animal.imageUrl || 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'}" 
                             class="img-fluid w-100 h-100 object-fit-cover" 
                             alt="${animal.commonName}"
                             onerror="this.src='https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'">
                        <span class="badge ${statusClass} position-absolute top-0 end-0 m-2">
                            ${animal.conservationStatus || 'Unknown'}
                        </span>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${animal.commonName || 'Unknown'}</h5>
                        <p class="card-text text-muted"><small>${animal.scientificName || ''}</small></p>
                        <p class="card-text">${this.truncateText(animal.description || 'No description available', 100)}</p>
                    </div>
                    <div class="card-footer bg-transparent">
                        <div class="d-flex justify-content-between">
                            <small class="text-muted">
                                <i class="bi bi-geo-alt"></i> ${animal.region || 'Philippines'}
                            </small>
                            <button class="btn btn-sm btn-outline-success view-details" data-animal-id="${animal.id}">
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async searchAnimals(query) {
        if (!query || query.trim() === '') {
            this.showNotification('Please enter a search term', 'warning');
            return;
        }

        try {
            const response = await apiClient.get(`/public/animals/search?keyword=${encodeURIComponent(query)}`);
            const container = document.getElementById('animalsGrid');

            if (!container) return;

            if (response.results && response.results.length > 0) {
                container.innerHTML = response.results.map(animal => this.createAnimalCard(animal)).join('');

                // Update pagination
                const pagination = document.getElementById('pagination');
                if (pagination) {
                    pagination.innerHTML = '';
                }

                this.showNotification(`Found ${response.count} results for "${query}"`, 'success');
            } else {
                container.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-warning">
                            <i class="bi bi-search"></i> No animals found for "${query}"
                        </div>
                    </div>
                `;
            }

            // Add event listeners to new cards
            setTimeout(() => this.setupAnimalCardListeners(), 100);

        } catch (error) {
            console.error('Error searching animals:', error);
            this.showNotification('Search failed. Please try again.', 'danger');
        }
    }

    filterByStatus(status) {
        if (status === 'all') {
            delete this.currentFilters.status;
        } else {
            this.currentFilters.status = status;
        }
        this.loadAnimals();
    }

    filterByCategory(category) {
        // This is a placeholder - you'll need to implement actual category filtering
        this.currentFilters.category = category;
        this.showNotification(`Filtering by ${category}`, 'info');
        this.loadAnimals();
    }

    applyFilters() {
        const region = document.getElementById('regionFilter').value;
        const status = document.getElementById('statusFilter').value;
        const island = document.getElementById('islandFilter').value;

        this.currentFilters = {};

        if (region) this.currentFilters.region = region;
        if (status) this.currentFilters.conservationStatus = status;
        if (island) this.currentFilters.island = island;

        this.loadAnimals();

        if (region || status || island) {
            this.showNotification('Filters applied', 'success');
        }
    }

    setupPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.pageSize);
        const pagination = document.getElementById('pagination');

        if (!pagination || totalPages <= 1) {
            if (pagination) pagination.innerHTML = '';
            return;
        }

        let html = '';

        // Previous button
        html += `
            <li class="page-item ${this.currentPage === 0 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${this.currentPage - 1}">Previous</a>
            </li>
        `;

        // Page numbers
        for (let i = 0; i < totalPages; i++) {
            html += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
                </li>
            `;
        }

        // Next button
        html += `
            <li class="page-item ${this.currentPage >= totalPages - 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${this.currentPage + 1}">Next</a>
            </li>
        `;

        pagination.innerHTML = html;

        // Add event listeners
        pagination.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (!isNaN(page) && page >= 0 && page < totalPages) {
                    this.currentPage = page;
                    this.loadAnimals();
                    window.scrollTo({ top: document.getElementById('animals').offsetTop - 100, behavior: 'smooth' });
                }
            });
        });
    }

    setupAnimalCardListeners() {
        // View details buttons
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const animalId = e.target.dataset.animalId;
                this.showAnimalDetails(animalId);
            });
        });

        // Whole card click
        document.querySelectorAll('.animal-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('view-details')) {
                    const animalId = card.dataset.animalId;
                    this.showAnimalDetails(animalId);
                }
            });
        });
    }

    async showAnimalDetails(animalId) {
        try {
            const response = await apiClient.get(`/public/animals/${animalId}`);

            if (!response) {
                throw new Error('Animal not found');
            }

            const modalTitle = document.getElementById('animalModalTitle');
            const modalBody = document.getElementById('animalModalBody');

            if (!modalTitle || !modalBody) return;

            const statusClass = this.getStatusClass(response.conservationStatus);

            modalTitle.textContent = response.commonName;
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <img src="${response.imageUrl || 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}" 
                             class="img-fluid rounded mb-3" 
                             alt="${response.commonName}">
                        <div class="d-flex justify-content-between mb-3">
                            <span class="badge ${statusClass} fs-6">
                                ${response.conservationStatus || 'Status unknown'}
                            </span>
                            <span class="badge bg-secondary">
                                <i class="bi bi-geo-alt"></i> ${response.region || 'Philippines'}
                            </span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h5>${response.scientificName || ''}</h5>
                        <p><strong>Description:</strong></p>
                        <p>${response.description || 'No description available.'}</p>
                        
                        <div class="row mt-4">
                            ${response.habitat ? `
                                <div class="col-6 mb-2">
                                    <strong><i class="bi bi-house"></i> Habitat:</strong><br>
                                    <small>${response.habitat}</small>
                                </div>
                            ` : ''}
                            
                            ${response.diet ? `
                                <div class="col-6 mb-2">
                                    <strong><i class="bi bi-egg-fried"></i> Diet:</strong><br>
                                    <small>${response.diet}</small>
                                </div>
                            ` : ''}
                            
                            ${response.island ? `
                                <div class="col-6 mb-2">
                                    <strong><i class="bi bi-geo"></i> Island:</strong><br>
                                    <small>${response.island}</small>
                                </div>
                            ` : ''}
                            
                            ${response.populationEstimate ? `
                                <div class="col-6 mb-2">
                                    <strong><i class="bi bi-people"></i> Population:</strong><br>
                                    <small>${response.populationEstimate.toLocaleString()} estimated</small>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;

            const modal = new bootstrap.Modal(document.getElementById('animalModal'));
            modal.show();

        } catch (error) {
            console.error('Error loading animal details:', error);
            this.showNotification('Failed to load animal details', 'danger');
        }
    }

    getStatusClass(status) {
        if (!status) return 'bg-secondary';

        const statusLower = status.toLowerCase();
        if (statusLower.includes('critically') || statusLower.includes('endangered')) {
            return 'bg-danger';
        } else if (statusLower.includes('vulnerable')) {
            return 'bg-warning text-dark';
        } else if (statusLower.includes('near threatened')) {
            return 'bg-info text-dark';
        } else if (statusLower.includes('least concern')) {
            return 'bg-success';
        } else {
            return 'bg-secondary';
        }
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    hasFilters() {
        return Object.keys(this.currentFilters).length > 0;
    }

    showNotification(message, type = 'info') {
        // Use auth manager's notification if available
        if (window.authManager && window.authManager.showNotification) {
            window.authManager.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
            notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
            notification.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(notification);

            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 5000);
        }
    }

    showError(message) {
        this.showNotification(message, 'danger');
    }
}

// Initialize landing page
document.addEventListener('DOMContentLoaded', () => {
    window.landingPage = new LandingPage();

    // Setup animal card listeners after a delay
    setTimeout(() => {
        if (window.landingPage) {
            window.landingPage.setupAnimalCardListeners();
        }
    }, 500);
});