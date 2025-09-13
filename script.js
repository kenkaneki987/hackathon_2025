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
    const cameraBox = document.getElementById('cameraBox');
    const fileInput = document.getElementById('fileInput');
    const chooseFileBtn = document.getElementById('chooseFileBtn');
    const submitBtn = document.getElementById('submitBtn');
    const testTypeSelect = document.getElementById('testType');
    const toast = document.getElementById('toast');
    
    // Upload/Record toggle
    const uploadOption = document.getElementById('uploadOption');
    const recordOption = document.getElementById('recordOption');
    
    // Camera elements
    const videoPreview = document.getElementById('videoPreview');
    const recordedVideoPreview = document.getElementById('recordedVideoPreview');
    const cameraControls = document.getElementById('cameraControls');
    const recordingControls = document.getElementById('recordingControls');
    const recordedVideo = document.getElementById('recordedVideo');
    const startRecordBtn = document.getElementById('startRecordBtn');
    const stopRecordBtn = document.getElementById('stopRecordBtn');
    const useRecordedBtn = document.getElementById('useRecordedBtn');
    const recordAgainBtn = document.getElementById('recordAgainBtn');
    const recordingTimer = document.getElementById('recordingTimer');
    const cameraSwitchBtn = document.getElementById('cameraSwitchBtn');
    const cameraInfo = document.getElementById('cameraInfo');
    
    // Camera recording variables
    let mediaRecorder;
    let recordedChunks = [];
    let recordingStartTime;
    let recordingInterval;
    let currentStream;
    let currentFacingMode = 'user'; // 'user' for front, 'environment' for back
    let availableDevices = [];
    let currentDeviceId = null;
    
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
    
    // Upload/Record toggle functionality
    uploadOption.addEventListener('click', function() {
        uploadOption.classList.add('active');
        recordOption.classList.remove('active');
        uploadBox.style.display = 'block';
        cameraBox.style.display = 'none';
        stopCamera();
    });
    
    recordOption.addEventListener('click', function() {
        recordOption.classList.add('active');
        uploadOption.classList.remove('active');
        uploadBox.style.display = 'none';
        cameraBox.style.display = 'block';
        initializeCamera();
    });
    
    // Camera functionality
    async function initializeCamera() {
        try {
            // Get available devices first
            await getAvailableCameras();
            
            // Start with front camera by default
            await startCamera('user');
            
            videoPreview.style.display = 'block';
            cameraControls.style.display = 'block';
            recordingControls.style.display = 'none';
            recordedVideo.style.display = 'none';
            
            // Update camera info
            updateCameraInfo();
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please check permissions and try again.');
            // Fallback to upload option
            uploadOption.click();
        }
    }
    
    // Get available camera devices
    async function getAvailableCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            availableDevices = devices.filter(device => device.kind === 'videoinput');
            console.log('Available cameras:', availableDevices);
        } catch (error) {
            console.error('Error getting camera devices:', error);
            availableDevices = [];
        }
    }
    
    // Start camera with specific facing mode
    async function startCamera(facingMode) {
        try {
            // Stop current stream if exists
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
            
            const constraints = {
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: facingMode
                }, 
                audio: true 
            };
            
            // If we have specific device IDs, try to use them
            if (availableDevices.length > 1) {
                if (facingMode === 'user') {
                    const frontCamera = availableDevices.find(device => 
                        device.label.toLowerCase().includes('front') || 
                        device.label.toLowerCase().includes('user')
                    );
                    if (frontCamera) {
                        constraints.video.deviceId = { exact: frontCamera.deviceId };
                    }
                } else {
                    const backCamera = availableDevices.find(device => 
                        device.label.toLowerCase().includes('back') || 
                        device.label.toLowerCase().includes('rear') ||
                        device.label.toLowerCase().includes('environment')
                    );
                    if (backCamera) {
                        constraints.video.deviceId = { exact: backCamera.deviceId };
                    }
                }
            }
            
            currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            videoPreview.srcObject = currentStream;
            currentFacingMode = facingMode;
            
        } catch (error) {
            console.error('Error starting camera:', error);
            throw error;
        }
    }
    
    // Update camera info display
    function updateCameraInfo() {
        const cameraType = currentFacingMode === 'user' ? 'front' : 'back';
        const infoText = availableDevices.length > 1 ? 
            `Using ${cameraType} camera` : 
            'Using camera';
        
        cameraInfo.innerHTML = `
            <span class="material-icons">info</span>
            <span>${infoText}</span>
        `;
        
        // Show/hide switch button based on available cameras
        cameraSwitchBtn.style.display = availableDevices.length > 1 ? 'flex' : 'none';
    }
    
    // Switch camera
    cameraSwitchBtn.addEventListener('click', async function() {
        if (availableDevices.length <= 1) {
            alert('Only one camera available on this device');
            return;
        }
        
        try {
            // Show loading state
            this.disabled = true;
            const originalContent = this.innerHTML;
            this.innerHTML = '<span class="material-icons">refresh</span>';
            
            // Switch to opposite camera
            const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
            await startCamera(newFacingMode);
            updateCameraInfo();
            
            // Restore button
            this.innerHTML = originalContent;
            this.disabled = false;
            
        } catch (error) {
            console.error('Error switching camera:', error);
            alert('Unable to switch camera. Please try again.');
            
            // Restore button
            this.innerHTML = '<span class="material-icons">flip_camera_ios</span>';
            this.disabled = false;
        }
    });
    
    function stopCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
        }
        videoPreview.style.display = 'none';
        cameraControls.style.display = 'block';
        recordingControls.style.display = 'none';
        recordedVideo.style.display = 'none';
    }
    
    // Start recording
    startRecordBtn.addEventListener('click', function() {
        if (!currentStream) {
            alert('Camera not available. Please try again.');
            return;
        }
        
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(currentStream, {
            mimeType: 'video/webm;codecs=vp9'
        });
        
        mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = function() {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            recordedVideoPreview.src = url;
            
            // Show recorded video
            cameraControls.style.display = 'none';
            recordingControls.style.display = 'none';
            recordedVideo.style.display = 'block';
            videoPreview.style.display = 'none';
        };
        
        mediaRecorder.start();
        recordingStartTime = Date.now();
        
        // Show recording controls
        cameraControls.style.display = 'none';
        recordingControls.style.display = 'block';
        
        // Start timer
        recordingInterval = setInterval(updateTimer, 1000);
    });
    
    // Stop recording
    stopRecordBtn.addEventListener('click', function() {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            clearInterval(recordingInterval);
        }
    });
    
    // Update recording timer
    function updateTimer() {
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        recordingTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Use recorded video
    useRecordedBtn.addEventListener('click', function() {
        // Convert recorded video to file input
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const file = new File([blob], 'recorded-video.webm', { type: 'video/webm' });
        
        // Create a data transfer object to simulate file selection
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        // Update UI to show file selected
        const uploadContent = uploadBox.querySelector('.upload-content');
        uploadContent.innerHTML = `
            <span class="material-icons upload-icon">check_circle</span>
            <h3>Video Recorded Successfully!</h3>
            <p>Duration: ${recordingTimer.textContent}</p>
            <button class="btn btn-primary" id="chooseFileBtn">Choose Different File</button>
        `;
        
        // Re-attach event listener
        document.getElementById('chooseFileBtn').addEventListener('click', function() {
            fileInput.click();
        });
        
        // Switch back to upload view
        uploadOption.click();
        showToast();
    });
    
    // Record again
    recordAgainBtn.addEventListener('click', function() {
        cameraControls.style.display = 'block';
        recordingControls.style.display = 'none';
        recordedVideo.style.display = 'none';
        videoPreview.style.display = 'block';
    });
    
    // Clean up camera when page is hidden
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopCamera();
        }
    });
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
