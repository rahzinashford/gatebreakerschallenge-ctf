// Check authentication status and handle admin-only elements
function checkAuthStatusForIndex() {
    fetch('php/auth_status.php')
        .then(response => response.json())
        .then(data => {
            if (data.authenticated && data.role === "admin") {
                // Show admin-only elements
                const adminElements = document.querySelectorAll('.admin-only');
                adminElements.forEach(el => el.style.display = 'flex');

                // Set up the announcement add button for admins
                setupAnnouncementModal();
            }

            const registerButton = document.querySelector('.cta-button.guest-only');
            if (registerButton) {
                if (data.authenticated) {
                    registerButton.style.display = 'none';
                }
            }

            // Load announcements (for all users)
            loadAnnouncements();
        })
        .catch(error => console.error("Error checking auth status:", error));
}

// Load announcements from JSON file
function loadAnnouncements() {
    fetch('php/get_announcements.php')
        .then(response => response.json())
        .then(announcements => {
            displayAnnouncements(announcements);
        })
        .catch(error => console.error("Error loading announcements:", error));
}

// Display announcements in the DOM
function displayAnnouncements(announcements) {
    const announcementList = document.querySelector('.announcement-list');
    announcementList.innerHTML = ''; // Clear existing announcements

    announcements.forEach(announcement => {
        const announcementItem = document.createElement('div');
        announcementItem.className = 'announcement-item';
        announcementItem.dataset.id = announcement.id;

        announcementItem.innerHTML = `
            <div class="announcement-date">${announcement.date}</div>
            <div class="announcement-content">
                <h3>${announcement.title}</h3>
                <p>${announcement.description}</p>
            </div>
            <div class="announcement-actions admin-only" style="display: none;">
                <button class="action-btn edit-announcement-btn"><i class="fa-solid fa-pencil"></i></button>
                <button class="action-btn delete-announcement-btn"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        announcementList.appendChild(announcementItem);

        // Add event listeners to action buttons
        setupAnnouncementItemActions(announcementItem);
    });

    // Show admin controls if user is admin
    checkIfAdmin();
}

// Check if user is admin and show admin controls
function checkIfAdmin() {
    fetch('php/auth_status.php')
        .then(response => response.json())
        .then(data => {
            if (data.authenticated && data.role === "admin") {
                const adminElements = document.querySelectorAll('.admin-only');
                adminElements.forEach(el => el.style.display = 'flex');
            }
        })
        .catch(error => console.error("Error checking admin status:", error));
}

// Set up the announcement modal functionality
function setupAnnouncementModal() {
    const addButton = document.getElementById('add-announcement-btn');
    const modal = document.getElementById('announcement-modal');
    const closeBtn = modal.querySelector('.close-modal');
    const form = document.getElementById('announcement-form');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('announcement-submit-btn');

    // Open modal when add button is clicked
    addButton.addEventListener('click', () => {
        // Reset form for adding new announcement
        form.reset();
        document.getElementById('announcement-id').value = '';
        modalTitle.textContent = 'Add New Announcement';
        submitBtn.textContent = 'Add Announcement';
        modal.style.display = 'block';
    });

    // Close modal when X is clicked
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Handle form submission (for both add and edit)
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const announcementId = document.getElementById('announcement-id').value;
        const title = document.getElementById('announcement-title').value;
        const description = document.getElementById('announcement-description').value;

        const announcementData = {
            id: announcementId,
            title: title,
            description: description
        };

        saveAnnouncement(announcementData);

        // Reset form and close modal
        form.reset();
        modal.style.display = 'none';
    });
}

function saveAnnouncement(announcementData) {
    // Convert to proper JSON format
    const jsonData = JSON.stringify(announcementData);

    fetch('php/save_announcement.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: jsonData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Reload announcements after successful save
                loadAnnouncements();
            } else {
                console.error('Server error:', data.message);
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error saving announcement:', error);
            alert('An error occurred while saving the announcement.');
        });
}

function setupAnnouncementItemActions(announcementItem) {
    const editBtn = announcementItem.querySelector('.edit-announcement-btn');
    const deleteBtn = announcementItem.querySelector('.delete-announcement-btn');

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            const announcementId = announcementItem.dataset.id;
            openEditModal(announcementId);
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const announcementId = announcementItem.dataset.id;
            openDeleteConfirmation(announcementId);
        });
    }
}

// Open the edit modal with announcement data
function openEditModal(announcementId) {
    const announcement = document.querySelector(`.announcement-item[data-id="${announcementId}"]`);

    if (announcement) {
        const title = announcement.querySelector('h3').textContent;
        const description = announcement.querySelector('p').textContent;

        // Set form values
        document.getElementById('announcement-id').value = announcementId;
        document.getElementById('announcement-title').value = title;
        document.getElementById('announcement-description').value = description;

        // Update modal title and button
        document.getElementById('modal-title').textContent = 'Edit Announcement';
        document.getElementById('announcement-submit-btn').textContent = 'Update Announcement';

        // Show modal
        document.getElementById('announcement-modal').style.display = 'block';
    }
}

// Open delete confirmation modal
function openDeleteConfirmation(announcementId) {
    const modal = document.getElementById('confirm-delete-modal');
    const confirmBtn = document.getElementById('confirm-delete-btn');
    const cancelBtn = document.getElementById('cancel-delete-btn');
    const closeBtn = modal.querySelector('.close-modal');

    // Show modal
    modal.style.display = 'block';

    // Set up confirm button
    confirmBtn.onclick = function () {
        deleteAnnouncement(announcementId);
        modal.style.display = 'none';
    };

    // Set up cancel button
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal when X is clicked
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function deleteAnnouncement(announcementId) {
    // Ensure ID is properly sent
    const jsonData = JSON.stringify({ id: announcementId });

    fetch('php/delete_announcement.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: jsonData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Reload announcements after successful delete
                loadAnnouncements();
            } else {
                console.error('Server error:', data.message);
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting announcement:', error);
            alert('An error occurred while deleting the announcement.');
        });
}

// Load Navbar and Footer
document.addEventListener('DOMContentLoaded', function () {
    // Initialize the countdown timer
    initCountdown();

    // Initialize matrix animation
    initMatrixBackground();

    // Register button event listener (part of index page, not navbar)
    const registerButton = document.querySelector('.cta-button');

    if (registerButton) {
        registerButton.addEventListener('click', function () {
            // Redirect to registration page or show modal
            toggleRegisterModal();
            // In a real implementation, you would redirect to a registration page
            // window.location.href = 'register.html';
        });
    }

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for navbar height
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Countdown Timer function remains the same
/* function initCountdown() {
    
    const competitionStart = new Date("March 16, 2025 23:15:00").getTime();
    const competitionDuration = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
    let countdownTarget = competitionStart; // Initial target

    const countdownTimer = setInterval(function () {
        const now = new Date().getTime();
        let distance = countdownTarget - now;

        if (distance > 0) {
            document.querySelector(".countdown-container h2").innerHTML = "Competition Begins In:";
        } else {
            // If competition has started, switch to "Competition Ends In!" and set new countdown
            document.querySelector(".countdown-container h2").innerHTML = "Competition Ends In!";
            countdownTarget = competitionStart + competitionDuration;
            distance = countdownTarget - now;
        }

        // Time calculations
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display countdown, including days
        document.getElementById("days").innerHTML = days > 0 ? days.toString().padStart(2, '0') : "00";
        document.getElementById("hours").innerHTML = hours.toString().padStart(2, '0');
        document.getElementById("minutes").innerHTML = minutes.toString().padStart(2, '0');
        document.getElementById("seconds").innerHTML = seconds.toString().padStart(2, '0');

        // If the competition has ended, stop the timer
        if (distance <= 0 && now > countdownTarget) {
            clearInterval(countdownTimer);
            document.querySelector(".countdown-container h2").innerHTML = "Competition Has Ended!";
            document.getElementById("days").innerHTML = "00";
            document.getElementById("hours").innerHTML = "00";
            document.getElementById("minutes").innerHTML = "00";
            document.getElementById("seconds").innerHTML = "00";
        }
    }, 1000);
} */

function initCountdown() {
    const competitionStart = new Date("April 08, 2025 10:30:00").getTime();
    const competitionDuration = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
    const competitionEnd = competitionStart + competitionDuration;

    const countdownTimer = setInterval(function () {
        const now = new Date().getTime();

        // Determine which phase we're in
        if (now < competitionStart) {
            // Before competition starts
            let distance = competitionStart - now;
            updateCountdown("Competition Begins In:", distance);
        } else if (now < competitionEnd) {
            // During competition
            let distance = competitionEnd - now;
            updateCountdown("Competition Ends In!", distance);
        } else {
            // After competition ends
            clearInterval(countdownTimer);
            document.querySelector(".countdown-container h2").innerHTML = "Competition Has Ended!";
            document.getElementById("days").innerHTML = "00";
            document.getElementById("hours").innerHTML = "00";
            document.getElementById("minutes").innerHTML = "00";
            document.getElementById("seconds").innerHTML = "00";
        }
    }, 1000);

    function updateCountdown(headerText, distance) {
        document.querySelector(".countdown-container h2").innerHTML = headerText;

        // Time calculations
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display countdown
        document.getElementById("days").innerHTML = days > 0 ? days.toString().padStart(2, '0') : "00";
        document.getElementById("hours").innerHTML = hours.toString().padStart(2, '0');
        document.getElementById("minutes").innerHTML = minutes.toString().padStart(2, '0');
        document.getElementById("seconds").innerHTML = seconds.toString().padStart(2, '0');
    }
}

// Matrix Animation function remains the same
function initMatrixBackground() {
    const canvas = document.createElement('canvas');
    const matrixBackground = document.querySelector('.matrix-background');
    matrixBackground.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Make canvas full screen
    canvas.width = matrixBackground.offsetWidth;
    canvas.height = matrixBackground.offsetHeight;

    // Characters to be displayed
    const characters = "01001010111001010101001010101010";

    // Converting the string into an array of single characters
    const charactersArray = characters.split("");

    const fontSize = 14;
    const columns = canvas.width / fontSize; // Number of columns for the rain

    // An array of drops - one per column
    const drops = [];

    // x below is the x coordinate
    // 1 = y coordinate of the drop (same for every drop initially)
    for (let x = 0; x < columns; x++) {
        drops[x] = Math.random() * canvas.height;
    }

    // Drawing the characters
    function draw() {
        // Black BG for the canvas
        // Semi-transparent to show trail
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set color and font
        ctx.fillStyle = "#0099ff"; // Blue text
        ctx.font = fontSize + "px monospace";

        // Loop through drops
        for (let i = 0; i < drops.length; i++) {
            // Get a random character
            const text = charactersArray[Math.floor(Math.random() * charactersArray.length)];

            // x = i * fontSize, y = value of drops[i]
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            // Sending the drop back to the top randomly after it has crossed the screen
            // Adding randomness to the reset to make the drops scattered on the Y axis
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }

            // Incrementing Y coordinate
            drops[i]++;
        }
    }

    // Set up animation
    setInterval(draw, 35);

    // Resize canvas on window resize
    window.addEventListener('resize', function () {
        canvas.width = matrixBackground.offsetWidth;
        canvas.height = matrixBackground.offsetHeight;
    });
}
