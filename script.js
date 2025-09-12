// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    // Navigation click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav links and pages
            navLinks.forEach(l => l.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding page
            const targetPage = this.getAttribute('data-page');
            const targetPageElement = document.getElementById(targetPage + '-page');
            if (targetPageElement) {
                targetPageElement.classList.add('active');
            }
        });
    });
    
    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
});

// File upload functionality
document.addEventListener('DOMContentLoaded', function() {
    const uploadBox = document.getElementById('uploadBox');
    const fileInput = document.getElementById('fileInput');
    const chooseFileBtn = document.getElementById('chooseFileBtn');
    const submitBtn = document.getElementById('submitBtn');
    const testTypeSelect = document.getElementById('testType');
    const toast = document.getElementById('toast');
    
    // Click to choose file
    chooseFileBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Drag and drop functionality
    uploadBox.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    
    uploadBox.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });
    
    uploadBox.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });
    
    // Handle file selection
    function handleFileSelection(file) {
        // Check file type
        const allowedTypes = ['video/mp4', 'video/mov', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please select a valid video file (MP4 or MOV)');
            return;
        }
        
        // Check file size (max 100MB)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            alert('File size must be less than 100MB');
            return;
        }
        
        // Update upload box content
        const uploadContent = uploadBox.querySelector('.upload-content');
        uploadContent.innerHTML = `
            <span class="material-icons upload-icon">check_circle</span>
            <h3>File Selected: ${file.name}</h3>
            <p>Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            <button class="btn btn-primary" id="chooseFileBtn">Choose Different File</button>
        `;
        
        // Re-attach event listener to new button
        document.getElementById('chooseFileBtn').addEventListener('click', function() {
            fileInput.click();
        });
    }
    
    // Submit button functionality
    submitBtn.addEventListener('click', function() {
        const selectedFile = fileInput.files[0];
        const selectedTest = testTypeSelect.value;
        
        if (!selectedFile) {
            alert('Please select a video file first');
            return;
        }
        
        if (!selectedTest) {
            alert('Please select a test type');
            return;
        }
        
        // Simulate upload process
        this.textContent = 'Uploading...';
        this.disabled = true;
        
        setTimeout(() => {
            this.textContent = 'Submit Video';
            this.disabled = false;
            showToast();
            resetUploadForm();
        }, 2000);
    });
    
    // Show success toast
    function showToast() {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Reset upload form
    function resetUploadForm() {
        const uploadContent = uploadBox.querySelector('.upload-content');
        uploadContent.innerHTML = `
            <span class="material-icons upload-icon">cloud_upload</span>
            <h3>Drag & Drop Your Video Here</h3>
            <p>or</p>
            <button class="btn btn-primary" id="chooseFileBtn">Choose File</button>
        `;
        
        // Re-attach event listener
        document.getElementById('chooseFileBtn').addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.value = '';
        testTypeSelect.value = '';
    }
});

// Leaderboard filter functionality
document.addEventListener('DOMContentLoaded', function() {
    const testFilter = document.getElementById('testFilter');
    const leaderboardBody = document.getElementById('leaderboardBody');
    
    // Sample data for different test types
    const leaderboardData = {
        'all': [
            { rank: 1, name: 'Aarav Sharma', state: 'Delhi', test: 'Push-ups', score: '45' },
            { rank: 2, name: 'Kavya Nair', state: 'Kerala', test: 'Sit-ups', score: '52' },
            { rank: 3, name: 'Rohit Verma', state: 'Maharashtra', test: 'High Jump', score: '1.4m' },
            { rank: 4, name: 'Priya Singh', state: 'Punjab', test: 'Push-ups', score: '42' },
            { rank: 5, name: 'Arjun Patel', state: 'Gujarat', test: 'Sit-ups', score: '48' },
            { rank: 6, name: 'Ananya Reddy', state: 'Telangana', test: 'High Jump', score: '1.3m' },
            { rank: 7, name: 'Vikram Kumar', state: 'Bihar', test: '50m Sprint', score: '6.2s' },
            { rank: 8, name: 'Meera Joshi', state: 'Rajasthan', test: 'Push-ups', score: '38' }
        ],
        'push-ups': [
            { rank: 1, name: 'Aarav Sharma', state: 'Delhi', test: 'Push-ups', score: '45' },
            { rank: 2, name: 'Priya Singh', state: 'Punjab', test: 'Push-ups', score: '42' },
            { rank: 3, name: 'Meera Joshi', state: 'Rajasthan', test: 'Push-ups', score: '38' },
            { rank: 4, name: 'Suresh Kumar', state: 'Tamil Nadu', test: 'Push-ups', score: '35' },
            { rank: 5, name: 'Deepika Sharma', state: 'Himachal Pradesh', test: 'Push-ups', score: '32' }
        ],
        'sit-ups': [
            { rank: 1, name: 'Kavya Nair', state: 'Kerala', test: 'Sit-ups', score: '52' },
            { rank: 2, name: 'Arjun Patel', state: 'Gujarat', test: 'Sit-ups', score: '48' },
            { rank: 3, name: 'Rahul Mehta', state: 'Madhya Pradesh', test: 'Sit-ups', score: '45' },
            { rank: 4, name: 'Sunita Devi', state: 'Jharkhand', test: 'Sit-ups', score: '42' },
            { rank: 5, name: 'Amit Singh', state: 'Uttarakhand', test: 'Sit-ups', score: '40' }
        ],
        'high-jump': [
            { rank: 1, name: 'Rohit Verma', state: 'Maharashtra', test: 'High Jump', score: '1.4m' },
            { rank: 2, name: 'Ananya Reddy', state: 'Telangana', test: 'High Jump', score: '1.3m' },
            { rank: 3, name: 'Kiran Mehta', state: 'Karnataka', test: 'High Jump', score: '1.2m' },
            { rank: 4, name: 'Pooja Gupta', state: 'Chhattisgarh', test: 'High Jump', score: '1.1m' },
            { rank: 5, name: 'Vishal Yadav', state: 'Uttar Pradesh', test: 'High Jump', score: '1.0m' }
        ],
        'sprint-50m': [
            { rank: 1, name: 'Vikram Kumar', state: 'Bihar', test: '50m Sprint', score: '6.2s' },
            { rank: 2, name: 'Neha Sharma', state: 'Haryana', test: '50m Sprint', score: '6.5s' },
            { rank: 3, name: 'Rajesh Patel', state: 'Odisha', test: '50m Sprint', score: '6.8s' },
            { rank: 4, name: 'Suman Devi', state: 'Assam', test: '50m Sprint', score: '7.0s' },
            { rank: 5, name: 'Manoj Kumar', state: 'Manipur', test: '50m Sprint', score: '7.2s' }
        ]
    };
    
    // Filter change handler
    testFilter.addEventListener('change', function() {
        const selectedTest = this.value;
        const data = leaderboardData[selectedTest] || leaderboardData['all'];
        
        // Clear current table body
        leaderboardBody.innerHTML = '';
        
        // Populate with filtered data
        data.forEach((participant, index) => {
            const row = document.createElement('tr');
            
            // Add rank styling for top 3
            if (index < 3) {
                row.classList.add(`rank-${index + 1}`);
            }
            
            // Create rank badge for top 3
            let rankCell = '';
            if (index < 3) {
                const badgeClass = index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze';
                rankCell = `<span class="rank-badge ${badgeClass}">${participant.rank}</span>`;
            } else {
                rankCell = participant.rank;
            }
            
            row.innerHTML = `
                <td>${rankCell}</td>
                <td>${participant.name}</td>
                <td>${participant.state}</td>
                <td>${participant.test}</td>
                <td>${participant.score}</td>
            `;
            
            leaderboardBody.appendChild(row);
        });
    });
});

// Dashboard animations and interactions
document.addEventListener('DOMContentLoaded', function() {
    // Animate metric cards on page load
    const metricCards = document.querySelectorAll('.metric-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    });
    
    metricCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Animate chart bars
    const bars = document.querySelectorAll('.bar');
    const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'growUp 1s ease-out forwards';
            }
        });
    });
    
    bars.forEach(bar => {
        const originalHeight = bar.style.height;
        bar.style.height = '0%';
        bar.style.animation = 'none';
        chartObserver.observe(bar);
    });
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes growUp {
        from {
            height: 0%;
        }
        to {
            height: var(--original-height);
        }
    }
    
    .nav-menu.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--white);
        box-shadow: var(--shadow);
        padding: 20px;
        gap: 10px;
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            display: none;
        }
    }
`;
document.head.appendChild(style);
