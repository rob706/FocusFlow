// Button fixes and additional functionality for Todo application
document.addEventListener('DOMContentLoaded', function() {
    // Only run this script on pages that include todo functionality
    if (window.location.href.indexOf('todo') === -1) return;
    
    console.log('Button fix script loaded');
    
    // Apply all fixes
    initButtonFixes();
    
    // Watch for dynamically added content
    observeDOM();
});

// Function to initialize all button fixes
function initButtonFixes() {
    fixGroupButtons();
    fixTaskButtons();
    fixFormSubmissions();
    fixCloseButtons();
}

// Fix Group buttons
function fixGroupButtons() {
    const groupButtons = document.querySelectorAll('.TODO__BUTTON .TODO__ADD');
    if (groupButtons.length >= 1) {
        groupButtons[0].addEventListener('click', function(e) {
            showGroupForm();
        });
    }
}

// Fix Task buttons
function fixTaskButtons() {
    const taskButtons = document.querySelectorAll('.TODO__BUTTON .TODO__ADD');
    if (taskButtons.length >= 2) {
        taskButtons[1].addEventListener('click', function(e) {
            const groupCount = document.querySelectorAll('.TODO__CARD').length;
            if (groupCount > 0) {
                showTaskForm();
            } else {
                alert('Please create at least one group first');
            }
        });
    }
}

// Fix form submissions to prevent defaults and handle correctly
function fixFormSubmissions() {
    // Group form
    const groupForm = document.getElementById('groupForm');
    if (groupForm) {
        groupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitGroupForm();
        });
    }
    
    // Task form (may be created dynamically)
    document.body.addEventListener('submit', function(e) {
        if (e.target.id === 'taskForm') {
            e.preventDefault();
            submitTaskForm();
        }
    });
}

// Fix close buttons for forms
function fixCloseButtons() {
    // Group form close button
    const closeGroupButton = document.getElementById('closeGroupAdd');
    if (closeGroupButton) {
        closeGroupButton.addEventListener('click', function() {
            hideGroupForm();
        });
    }
    
    // Task form close button (may be created dynamically)
    document.body.addEventListener('click', function(e) {
        if (e.target.id === 'closeTaskButton') {
            hideTaskForm();
        }
    });
}

// Function to observe DOM changes and fix new elements
function observeDOM() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                // Check for newly added elements that need fixes
                fixNewlyAddedElements();
            }
        });
    });
    
    // Start observing document for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Fix any newly added elements
function fixNewlyAddedElements() {
    // Ensure status toggle buttons are visible
    document.querySelectorAll('.status-toggle').forEach(button => {
        if (button.style.opacity !== '1') {
            button.style.opacity = '1';
            button.style.visibility = 'visible';
            
            // Make sure they have event listeners
            if (!button.hasAttribute('data-fixed')) {
                button.addEventListener('click', function() {
                    const task = button.closest('.TODO__TASK');
                    const title = task.querySelector('.TODO__TASK__HEAD h4').textContent;
                    const taskContent = task.querySelector('.TODO__TASK__CONTENT');
                    const category = taskContent.dataset.category || task.closest('.TODO__CARD').id;
                    
                    toggleTaskStatus(title, category, button);
                });
                button.setAttribute('data-fixed', 'true');
            }
        }
    });
    
    // Ensure task form close button works
    const closeTaskButton = document.getElementById('closeTaskButton');
    if (closeTaskButton && !closeTaskButton.hasAttribute('data-fixed')) {
        closeTaskButton.addEventListener('click', hideTaskForm);
        closeTaskButton.setAttribute('data-fixed', 'true');
    }
    
    // Ensure task form submission works
    const taskForm = document.getElementById('taskForm');
    if (taskForm && !taskForm.hasAttribute('data-fixed')) {
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitTaskForm();
        });
        taskForm.setAttribute('data-fixed', 'true');
    }
}

// Helper for showing the overlay and disabling main content
function showOverlay() {
    const overlay = document.querySelector('.Hiddenlayer');
    if (overlay) {
        overlay.style.display = 'block';
        // Do not disable pointer events on main content
        // This prevents form elements from being clickable
    }
}

// Helper for hiding the overlay and enabling main content
function hideOverlay() {
    const overlay = document.querySelector('.Hiddenlayer');
    if (overlay) {
        overlay.style.display = 'none';
        // No need to re-enable pointer events
    }
}

// Functions referencing the main Todo.js functionality
function showGroupForm() {
    const groupForm = document.querySelector('.TODO__GROUP__ADD');
    if (groupForm) {
        groupForm.style.display = 'block';
        showOverlay();
        
        // Focus the input field
        const groupNameInput = document.getElementById('groupName');
        if (groupNameInput) {
            groupNameInput.focus();
        }
    }
}

function hideGroupForm() {
    const groupForm = document.querySelector('.TODO__GROUP__ADD');
    if (groupForm) {
        groupForm.style.display = 'none';
        hideOverlay();
        
        // Reset the form
        const groupNameInput = document.getElementById('groupName');
        if (groupNameInput) {
            groupNameInput.value = '';
        }
    }
}

// Fix the fetch URL in submitGroupForm function
function submitGroupForm() {
    const groupNameInput = document.getElementById('groupName');
    if (!groupNameInput || !groupNameInput.value.trim()) {
        alert('Please enter a group name');
        return;
    }
    
    const groupName = groupNameInput.value.trim();
    
    // Check if the group name already exists
    if (document.getElementById(groupName)) {
        alert('A group with this name already exists');
        return;
    }
    
    // Use absolute path to ensure the backend file is found
    fetch('Todo/TodoBackend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'create_group',
            group_name: groupName
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Create group in the UI
            createNewGroup(groupName);
            
            // Hide the form
            hideGroupForm();
        } else {
            alert('Error creating group: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error creating group:', error);
        alert('Failed to create group. Please try again.');
    });
}

function showTaskForm() {
    // Create task form if it doesn't exist
    if (!document.querySelector('.TODO__TASK__ADD')) {
        createTaskForm();
    }
    
    const taskForm = document.querySelector('.TODO__TASK__ADD');
    if (taskForm) {
        // Populate group dropdown
        populateGroupDropdown();
        
        taskForm.style.display = 'block';
        showOverlay();
    }
}

function hideTaskForm() {
    const taskForm = document.querySelector('.TODO__TASK__ADD');
    if (taskForm) {
        taskForm.style.display = 'none';
        hideOverlay();
        
        // Reset the form
        const form = document.getElementById('taskForm');
        if (form) {
            form.reset();
        }
    }
}

function submitTaskForm() {
    // Gather form data
    const group = document.getElementById('taskGroup').value;
    const title = document.getElementById('taskTitle').value;
    const content = document.getElementById('taskContent').value;
    const days = parseInt(document.getElementById('timerDays').value) || 0;
    const hours = parseInt(document.getElementById('timerHours').value) || 0;
    const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
    
    // Validate form data
    if (!group || !title.trim() || !content.trim()) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Check if at least one time unit is set
    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
        alert('Please set a deadline for the task');
        return;
    }
    
    // Create task in the database
    fetch('Todo/TodoBackend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'create_task',
            category: group,
            title: title,
            content: content,
            timer: {
                days: days,
                hours: hours,
                minutes: minutes,
                seconds: seconds
            }
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Create task in the UI if we have the createTask function from Todo.js
            if (typeof createTask === 'function') {
                createTask(data.data);
            } else {
                // Refresh page if function not available
                location.reload();
            }
            
            // Hide the form
            hideTaskForm();
        } else {
            alert('Error creating task: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error creating task:', error);
        alert('Failed to create task. Please try again.');
    });
}