import RemindLibrary from "../RemindLibrary.js";
// Global variables to track drag and drop functionality
let dragging = false;
let dragTarget = null;
let originalDragParent = null;

// DOM loaded event listener
document.addEventListener('DOMContentLoaded', function () {
    // Hide forms and overlay by default
    const groupForm = document.querySelector('.TODO__GROUP__ADD');
    const taskForm = document.querySelector('.TODO__TASK__ADD');
    const overlay = document.querySelector('.Hiddenlayer');

    if (groupForm) groupForm.style.display = 'none';
    if (taskForm) taskForm.style.display = 'none';
    if (overlay) overlay.style.display = 'none';

    console.log('Forms hidden by default');

    // Initialize the application
    initTodoApp();

    // Initialize horizontal scrolling
    initHorizontalScrolling();
});

// Function to initialize the Todo app
function initTodoApp() {
    // Set up event listeners for buttons
    setupEventListeners();

    // Load groups and tasks from the database
    loadGroupAndTaskByDefault();

    // Initialize drag and drop functionality
    initDragAndDrop();

    // Start countdown timers for tasks
    initCountdownTimers();
}

// Function to set up event listeners
function setupEventListeners() {
    // Group button click handler
    const groupButtons = document.querySelectorAll('.TODO__ADD');
    if (groupButtons.length >= 1) {
        groupButtons[0].addEventListener('click', function () {
            showGroupForm();
        });
    }

    // Task button click handler (disabled if no groups exist)
    if (groupButtons.length >= 2) {
        groupButtons[1].addEventListener('click', function () {
            const groupCount = document.querySelectorAll('.TODO__CARD').length;
            if (groupCount > 0) {
                showTaskForm();
            } else {
                RemindLibrary.showErrorToast('Please create at least one group first');
            }
        });
    }

    // Close Group form button
    const closeGroupButton = document.getElementById('closeGroupAdd');
    if (closeGroupButton) {
        closeGroupButton.addEventListener('click', function () {
            hideGroupForm();
        });
    }

    // Group form submission
    const groupForm = document.getElementById('groupForm');
    if (groupForm) {
        groupForm.addEventListener('submit', function (e) {
            e.preventDefault();
            submitGroupForm();
        });
    }
}

// Function to show the group form
function showGroupForm() {
    const groupForm = document.querySelector('.TODO__GROUP__ADD');
    const overlay = document.querySelector('.Hiddenlayer');

    if (groupForm && overlay) {
        groupForm.style.display = 'block';
        overlay.style.display = 'block';

        // Focus on the input field
        const groupNameInput = document.getElementById('groupName');
        if (groupNameInput) {
            groupNameInput.focus();
        }
    }
}

// Function to hide the group form
function hideGroupForm() {
    const groupForm = document.querySelector('.TODO__GROUP__ADD');
    const overlay = document.querySelector('.Hiddenlayer');

    if (groupForm && overlay) {
        groupForm.style.display = 'none';
        overlay.style.display = 'none';

        // Reset the form
        const groupNameInput = document.getElementById('groupName');
        if (groupNameInput) {
            groupNameInput.value = '';
        }
    }
}

// Function to submit the group form
function submitGroupForm() {
    const groupNameInput = document.getElementById('groupName');
    if (!groupNameInput || !groupNameInput.value.trim()) {
        RemindLibrary.showErrorToast('Please enter a group name');
        return;
    }

    const groupName = groupNameInput.value.trim();

    // Check if the group name already exists
    if (document.getElementById(groupName)) {
        RemindLibrary.showErrorToast('A group with this name already exists');
        return;
    }

    // Create group in the database
    fetch('./Todo/TodoBackend.php', {
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
                RemindLibrary.showSuccessToast(`Group "${groupName}" created successfully`);
                // Hide the form
                hideGroupForm();
            } else {
                RemindLibrary.showErrorToast('Error creating group: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error creating group:', error);
            RemindLibrary.showErrorToast('Failed to create group. Please try again.');
        });
}

// Function to create a new group in the UI
function createNewGroup(groupName) {
    // Create the group card
    const cardDiv = document.createElement('div');
    cardDiv.className = 'TODO__CARD';
    cardDiv.id = groupName;

    // Create the card header
    const headerDiv = document.createElement('div');
    headerDiv.className = 'TODO__HEAD';
    headerDiv.style.display = 'flex';
    headerDiv.style.justifyContent = 'space-between';
    headerDiv.style.alignItems = 'center';

    // Create header content div (to hold title)
    const headerContent = document.createElement('div');

    // Create the header title
    const headerTitle = document.createElement('h3');
    headerTitle.textContent = groupName;
    headerContent.appendChild(headerTitle);

    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'group-delete-btn';
    deleteButton.innerHTML = "<span class='material-icons'> delete </span>";
    deleteButton.title = 'Delete Group';
    deleteButton.style.background = 'none';
    deleteButton.style.border = 'none';
    deleteButton.style.cursor = 'pointer';
    deleteButton.style.fontSize = '16px';
    deleteButton.style.padding = '5px';

    // Add click event to delete button
    deleteButton.addEventListener('click', function (e) {
        e.stopPropagation(); // Prevent event bubbling
        deleteGroup(groupName);
    });

    // Create the card body
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'TODO__BODY';

    // Add empty category placeholder
    const emptyPlaceholder = document.createElement('div');
    emptyPlaceholder.className = 'empty-category-placeholder';
    emptyPlaceholder.textContent = 'No tasks in this category';

    // Assemble the card
    headerDiv.appendChild(headerContent);
    headerDiv.appendChild(deleteButton);
    cardDiv.appendChild(headerDiv);
    bodyDiv.appendChild(emptyPlaceholder);
    cardDiv.appendChild(bodyDiv);

    // Add the card to the container
    const container = document.querySelector('.TODO__CONTAINER');
    if (container) {
        // Remove any "no-groups" message if it exists
        const noGroupsMessage = container.querySelector('.no-groups');
        if (noGroupsMessage) {
            noGroupsMessage.remove();
        }
        
        container.appendChild(cardDiv);
    }

    console.log(`Group '${groupName}' created successfully`);
}

// Function to delete a group
async function deleteGroup(groupName) {
    // Get group element
    const groupCard = document.getElementById(groupName);
    if (!groupCard) {
        console.error(`Group ${groupName} not found`);
        return;
    }

    // Check if group has tasks
    const tasks = groupCard.querySelectorAll('.TODO__TASK');
    let confirmMessage = `Are you sure you want to delete group "${groupName}"?`;

    if (tasks.length > 0) {
        confirmMessage += ` This will also delete ${tasks.length} task(s) in this group.`;
    }

    let Confirmation = await RemindLibrary.customConfirm(confirmMessage)
    // Ask for confirmation
    if (!Confirmation) {
        return;
    }

    // Show loading state
    groupCard.style.opacity = '0.5';

    // Send delete request to server
    fetch('./Todo/TodoBackend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'delete_group',
            group_name: groupName
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Remove group from UI
                groupCard.remove();

                // Check if there are no more groups
                const remainingGroups = document.querySelectorAll('.TODO__CARD');
                if (remainingGroups.length === 0) {
                    const container = document.querySelector('.TODO__CONTAINER');
                    if (container) {
                        // Create a new element rather than using innerHTML to ensure proper styling
                        container.innerHTML = '';
                        const noGroupsDiv = document.createElement('div');
                        noGroupsDiv.className = 'no-groups';
                        noGroupsDiv.textContent = 'No groups found. Click the "Group" button to create one.';
                        container.appendChild(noGroupsDiv);
                    }
                }
                // Show success message
                RemindLibrary.showSuccessToast(`Group "${groupName}" deleted successfully`);
            } else {
                // Restore opacity
                groupCard.style.opacity = '1';
                RemindLibrary.showErrorToast('Error deleting group: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            // Restore opacity
            groupCard.style.opacity = '1';
            console.error('Error:', error);
            RemindLibrary.showErrorToast('Failed to delete group. Please try again.');
        });
}

// Function to show the task form
function showTaskForm() {
    // Create the task form if it doesn't exist
    createTaskForm();

    const taskForm = document.querySelector('.TODO__TASK__ADD');
    const overlay = document.querySelector('.Hiddenlayer');

    if (taskForm && overlay) {
        // Populate the group dropdown
        populateGroupDropdown();

        taskForm.style.display = 'block';
        overlay.style.display = 'block';
    }
}

// Function to create the task form
function createTaskForm() {
    // Check if form already exists
    if (document.querySelector('.TODO__TASK__ADD')) {
        return;
    }

    // Create container
    const formContainer = document.createElement('div');
    formContainer.className = 'TODO__TASK__ADD';
    formContainer.style.display = 'none';

    // Create form content
    formContainer.innerHTML = `
        <h2>Add New Task</h2>
        <button id="closeTaskButton">&times;</button>
        <form id="taskForm" method="post">
            <label for="taskGroup">Select Group:</label>
            <select id="taskGroup" name="taskGroup" required>
                <option value="">Select a group</option>
            </select>
            
            <label for="taskTitle">Task Title:</label>
            <input type="text" id="taskTitle" name="taskTitle" placeholder="Enter task title" required>
            
            <label for="taskContent">Task Description:</label>
            <textarea id="taskContent" name="taskContent" placeholder="Enter task description" rows="3" required></textarea>
            
            <div class="timer-container">
                <h3>Set Deadline</h3>
                <div class="timer-inputs">
                    <div class="timer-input-group">
                        <label for="timerDays">Days</label>
                        <input type="number" id="timerDays" class="TIMER__INPUT" min="0" max="30" value="0">
                    </div>
                    <div class="timer-input-group">
                        <label for="timerHours">Hours</label>
                        <input type="number" id="timerHours" class="TIMER__INPUT" min="0" max="23" value="0">
                    </div>
                    <div class="timer-input-group">
                        <label for="timerMinutes">Minutes</label>
                        <input type="number" id="timerMinutes" class="TIMER__INPUT" min="0" max="59" value="0">
                    </div>
                    <div class="timer-input-group">
                        <label for="timerSeconds">Seconds</label>
                        <input type="number" id="timerSeconds" class="TIMER__INPUT" min="0" max="59" value="0">
                    </div>
                </div>
            </div>
            
            <button type="submit">Create Task</button>
        </form>
    `;

    // Add to document
    document.body.appendChild(formContainer);

    // Create overlay if it doesn't exist
    if (!document.querySelector('.Hiddenlayer')) {
        const overlay = document.createElement('div');
        overlay.className = 'Hiddenlayer';
        overlay.style.display = 'none';
        document.body.appendChild(overlay);
    }

    // Set up event listeners
    setupTaskFormListeners();
}

// Function to populate the group dropdown
function populateGroupDropdown() {
    const groupSelect = document.getElementById('taskGroup');
    if (!groupSelect) return;

    // Clear existing options
    groupSelect.innerHTML = '<option value="">Select a group</option>';

    // Get all groups
    const groups = document.querySelectorAll('.TODO__CARD');

    // Add each group as an option
    groups.forEach(group => {
        const groupName = group.id;
        const option = document.createElement('option');
        option.value = groupName;
        option.textContent = groupName;
        groupSelect.appendChild(option);
    });
}

// Function to set up task form event listeners
function setupTaskFormListeners() {
    // Close button
    const closeTaskButton = document.getElementById('closeTaskButton');
    if (closeTaskButton) {
        closeTaskButton.addEventListener('click', hideTaskForm);
    }

    // Form submission
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', function (e) {
            e.preventDefault();
            submitTaskForm();
        });
    }
}

// Function to hide the task form
function hideTaskForm() {
    const taskForm = document.querySelector('.TODO__TASK__ADD');
    const overlay = document.querySelector('.Hiddenlayer');

    if (taskForm && overlay) {
        taskForm.style.display = 'none';
        overlay.style.display = 'none';

        // Reset the form
        const taskFormElement = document.getElementById('taskForm');
        if (taskFormElement) {
            taskFormElement.reset();
        }
    }
}

// Function to submit the task form
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
        RemindLibrary.showErrorToast('Please fill in all required fields');
        return;
    }

    // Check if at least one time unit is set
    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
        RemindLibrary.showErrorToast('Please set a deadline for the task');
        return;
    }

    // Create task in the database
    fetch('./Todo/TodoBackend.php', {
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
                // Create task in the UI
                createTask(data.data);
                RemindLibrary.showSuccessToast(`Task "${title}" created successfully`);
                // Hide the form
                hideTaskForm();
            } else {
                RemindLibrary.showErrorToast('Error creating task: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error creating task:', error);
            RemindLibrary.showErrorToast('Failed to create task. Please try again.');
        });
}

// Function to create a task in the UI
async function createTask(taskData) {
    // Find the group container
    const groupCard = document.getElementById(taskData.category);
    if (!groupCard) {
        console.error(`Group ${taskData.category} not found`);
        return;
    }

    // Create task element
    const task = document.createElement('div');
    task.className = 'TODO__TASK';
    task.draggable = true;
    task.dataset.title = taskData.title;

    // Store task ID for unique identification
    if (taskData.id) {
        task.dataset.taskId = taskData.id;
    }

    // Create task header
    const taskHead = document.createElement('div');
    taskHead.className = 'TODO__TASK__HEAD';

    // Add task title
    const taskTitle = document.createElement('h4');
    taskTitle.textContent = taskData.title;
    taskHead.appendChild(taskTitle);

    // Add countdown timer if there's an end date/time
    if (taskData.end_date && taskData.end_time) {
        const timer = document.createElement('div');
        timer.className = 'task-countdown';
        timer.textContent = 'Loading timer...';
        timer.dataset.endDate = taskData.end_date;
        timer.dataset.endTime = taskData.end_time;
        taskHead.appendChild(timer);
    }

    // Create task content
    const taskContent = document.createElement('div');
    taskContent.className = 'TODO__TASK__CONTENT';
    taskContent.dataset.category = taskData.category;
    taskContent.dataset.title = taskData.title;

    // Create a span for text content
    const taskText = document.createElement('span');
    taskText.textContent = taskData.description;

    // Append the span to the div
    taskContent.appendChild(taskText);


    // Create task footer
    const taskFoot = document.createElement('div');
    taskFoot.className = 'TODO__TASK__FOOT';

    // Add status toggle button
    const statusToggle = document.createElement('button');
    statusToggle.className = 'status-toggle';

    // Ensure status is never undefined
    taskData.status = taskData.status || 'incomplete';
    statusToggle.dataset.status = taskData.status;

    // Set appropriate icon and class based on status
    if (taskData.status === 'complete') {
        statusToggle.innerHTML = "<span class='material-icons TODO_STATUS_ICON'>check_circle</span>";
        statusToggle.title = 'Mark as Incomplete';
        task.classList.add('task-complete');
        task.style.backgroundColor = '#d4edda'; // Green background
    } else if (taskData.status === 'timeout') {
        statusToggle.innerHTML = "<span class='material-icons TODO_STATUS_ICON'>timer</span>";
        statusToggle.title = 'Mark as Complete';
        task.classList.add('task-timeout');
        task.style.backgroundColor = '#f8d7da'; // Red background
    } else {
        statusToggle.innerHTML = "<span class='material-icons TODO_STATUS_ICON'>pending</span>";
        statusToggle.title = 'Mark as Complete';
        task.classList.add('task-incomplete');
        task.style.backgroundColor = '#fff3cd'; // Yellow background
    }

    // Add event listener for status toggle
    statusToggle.addEventListener('click', function () {
        const taskElement = this.closest('.TODO__TASK');
        const taskId = taskElement.dataset.taskId;

        // Create a task data object to pass to the toggle function
        const taskDataForToggle = {
            id: taskId,
            title: taskData.title,
            category: taskData.category,
            description: taskData.description
        };

        // Call the toggle function with correct parameters
        toggleTaskStatus(this, taskElement, taskDataForToggle);
    });

    // Add delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'task-delete';
    deleteButton.innerHTML = "<span class='material-icons'> delete </span>";
    deleteButton.title = 'Delete Task';
    deleteButton.addEventListener('click', async function () {

        let Confirmation = await RemindLibrary.customConfirm(`Are you sure you want to delete "${taskData.title}"?`)
        if (Confirmation) {
            deleteTask(task);
        }
    });

    // Assemble the task
    taskFoot.appendChild(statusToggle);
    taskFoot.appendChild(deleteButton);
    task.appendChild(taskHead);
    task.appendChild(taskContent);
    task.appendChild(taskFoot);

    // Remove any empty placeholder if it exists
    const emptyPlaceholder = groupCard.querySelector('.empty-category-placeholder');
    if (emptyPlaceholder) {
        emptyPlaceholder.remove();
    }

    // Add the task to the group
    const groupBody = groupCard.querySelector('.TODO__BODY');
    if (groupBody) {
        groupBody.appendChild(task);

        // Apply text overflow after rendering
        setTimeout(() => {
            const taskTitle = task.querySelector('.TODO__TASK__HEAD h4');
            const taskContent = task.querySelector('.TODO__TASK__CONTENT span');

            // Set initial styles for overflow detection
            if (taskTitle) {
                taskTitle.style.maxWidth = '100%';
                taskTitle.style.display = 'block';
                textOverflow(taskTitle, false); // Use ellipsis for titles
            }

            if (taskContent) {
                taskContent.style.maxWidth = '100%';
                taskContent.style.display = 'block';
                textOverflow(taskContent, true); // Use wrapping for descriptions (changed from scrolling)

                // Make task content clickable to show details
                taskContent.addEventListener('click', function (e) {
                    e.stopPropagation();
                    console.log('Task clicked, showing details for:', taskData.title);
                    displayTaskDetails(taskData);
                });
            }
        }, 100); // Short delay to ensure DOM is fully rendered
    }

    // Start the countdown timer
    updateTaskCountdown(task.querySelector('.task-countdown'));
}

function displayTaskDetails(taskData) {
    console.log('Displaying task details for:', taskData.title);

    // Get overlay
    const overlay = document.querySelector('.Hiddenlayer');
    if (!overlay) {
        console.error('Overlay element not found');
        return;
    }

    // Show overlay
    overlay.style.display = 'block';

    // Remove any existing task details modal
    const existingModal = document.querySelector('.task-details-modal');
    if (existingModal) existingModal.remove();

    // Create task details modal with inline styles for visibility
    const taskDetails = document.createElement('div');
    taskDetails.className = 'task-details-modal';

    // Apply inline styles to ensure visibility
    Object.assign(taskDetails.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        maxWidth: '500px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        zIndex: '2000',
        maxHeight: '80vh',
        overflowY: 'auto'
    });

    // Create task content with inline styles
    // Apply word-wrap to title to handle long text
    let taskContentHTML = `
        <h2 style="margin-top:0;color:#333;border-bottom:2px solid #eee;padding-bottom:10px;
                   word-wrap:break-word;overflow-wrap:break-word;white-space:normal;
                   line-height:1.3;max-width:100%;padding-right:25px;text-align:left;">
            ${taskData.title || 'Task Details'}
        </h2>
        <p style="margin:10px 0;"><strong>Category:</strong> ${taskData.category || 'Uncategorized'}</p>
        <p style="margin:10px 0;"><strong>Status:</strong> ${taskData.status || 'Pending'}</p>
    `;

    // Add deadline if available
    if (taskData.end_date) {
        taskContentHTML += `
            <p style="margin:10px 0;"><strong>Deadline:</strong> 
                ${taskData.end_date} ${taskData.end_time || ''}
            </p>
        `;
    }

    // Add description section with edit functionality
    taskContentHTML += `
        <div style="margin:15px 0;" id="description-container">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <p style="margin:0;"><strong>Description</strong></p>
                <button id="edit-description-btn" class="edit-btn" style="background:#f0f0f0;border:1px solid #ddd;
                        border-radius:4px;padding:5px 10px;cursor:pointer;font-size:0.9rem;color:#333;">
                    Edit
                </button>
            </div>
            
            <!-- View mode -->
            <div id="view-description" class="task-description-container" style="background-color:#f5f5f5;
                      border:1px solid #ddd;
                      border-radius:4px;
                      padding:12px;
                      margin:5px 0 15px;
                      line-height:1.5;
                      max-height:200px;
                      overflow-y:auto;
                      user-select:text;">
                <p class="task-description-text" style="margin:0;
                         white-space:normal;
                         word-wrap:break-word;
                         overflow-wrap:break-word;
                         overflow:visible;
                         text-align:left;
                         color:#333;">
                    ${taskData.description || 'No description provided'}
                </p>
            </div>
            
            <!-- Edit mode (hidden by default) -->
            <div id="edit-description" style="display:none;">
                <textarea id="description-editor" style="width:100%;min-height:150px;padding:10px;
                          border:1px solid #4CAF50;border-radius:4px;font-family:inherit;
                          font-size:0.95rem;resize:vertical;margin-bottom:10px;">${taskData.description || ''}</textarea>
                
                <div style="display:flex;gap:10px;justify-content:flex-end;">
                    <button id="cancel-edit-btn" style="padding:8px 15px;border-radius:4px;
                            border:1px solid #ddd;background:#f0f0f0;cursor:pointer;">
                        Cancel
                    </button>
                    <button id="save-description-btn" style="padding:8px 15px;border-radius:4px;
                            border:none;background:#4CAF50;color:white;cursor:pointer;">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add close button with inline styles
    taskContentHTML += `
        <button class="close-task-modal" style="position:absolute;top:10px;right:10px;
                font-size:24px;background:none;border:none;cursor:pointer;color:#aaa;">
            &times;
        </button>
    `;

    // Set the HTML content
    taskDetails.innerHTML = taskContentHTML;

    // Add the modal to the document
    document.body.appendChild(taskDetails);

    // Add click handler to close button
    const closeButton = taskDetails.querySelector('.close-task-modal');
    if (closeButton) {
        closeButton.addEventListener('click', function () {
            overlay.style.display = 'none';
            taskDetails.remove();
        });
    }

    // Set up edit description functionality
    const editBtn = document.getElementById('edit-description-btn');
    const viewDescription = document.getElementById('view-description');
    const editDescription = document.getElementById('edit-description');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const saveBtn = document.getElementById('save-description-btn');
    const descriptionEditor = document.getElementById('description-editor');

    // Edit button click handler
    editBtn.addEventListener('click', function() {
        viewDescription.style.display = 'none';
        editDescription.style.display = 'block';
        editBtn.style.display = 'none';
        descriptionEditor.focus();
    });

    // Cancel button click handler
    cancelBtn.addEventListener('click', function() {
        viewDescription.style.display = 'block';
        editDescription.style.display = 'none';
        editBtn.style.display = 'block';
        // Reset textarea to original value
        descriptionEditor.value = taskData.description || '';
    });

    // Save button click handler
    saveBtn.addEventListener('click', function() {
        const newDescription = descriptionEditor.value.trim();
        
        // Update the task description in the database
        updateTaskDescription(taskData.id, newDescription)
            .then(success => {
                if (success) {
                    // Update the displayed description
                    taskData.description = newDescription;
                    document.querySelector('.task-description-text').textContent = newDescription;
                    
                    // Update the task card in the main view
                    const taskElements = document.querySelectorAll(`.TODO__TASK[data-task-id="${taskData.id}"]`);
                    taskElements.forEach(taskEl => {
                        const descSpan = taskEl.querySelector('.TODO__TASK__CONTENT span');
                        if (descSpan) {
                            descSpan.textContent = newDescription;
                            // Reapply text overflow handling
                            textOverflow(descSpan, true);
                        }
                    });
                    
                    // Switch back to view mode
                    viewDescription.style.display = 'block';
                    editDescription.style.display = 'none';
                    editBtn.style.display = 'block';
                    
                    // Show success message
                    RemindLibrary.showSuccessToast('Description updated successfully');
                }
            });
    });

    // Also close when clicking on the overlay
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            overlay.style.display = 'none';
            taskDetails.remove();
        }
    });

    console.log('Task details modal created and displayed');
}

// Function to update a task's description
function updateTaskDescription(taskId, newDescription) {
    return fetch('./Todo/TodoBackend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'update_task_description',
            task_id: taskId,
            description: newDescription
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Update the task description in the UI
            RemindLibrary.showSuccessToast('Description updated successfully');
            return true;
        } else {
            RemindLibrary.showErrorToast('Error updating description: ' + (data.error || 'Unknown error'));
            return false;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        RemindLibrary.showErrorToast('Failed to update description. Please try again.');
        return false;
    });
}

// Function to toggle task status
function toggleTaskStatus(button, task, taskData) {
    // Check if this is a task, not a category
    if (!taskData.id) {
        RemindLibrary.showErrorToast("Cannot update status for categories");
        return;
    }

    RemindLibrary.showSuccessToast('Updating task status...');

    // Get current status and determine new status
    let currentStatus = (button.dataset.status || 'incomplete').toLowerCase();
    let newStatus;

    // Check if the task is expired
    const taskTimerElement = task.querySelector('.task-countdown');
    const isExpired = taskTimerElement &&
        taskTimerElement.textContent === 'Expired';

    // Determine new status based on current status and expiration
    if (currentStatus === 'incomplete') {
        newStatus = 'complete';
    } else if (currentStatus === 'complete') {
        // If the task is expired, toggle to timeout instead of incomplete
        newStatus = isExpired ? 'timeout' : 'incomplete';
    } else if (currentStatus === 'timeout') {
        newStatus = 'complete';
    } else {
        newStatus = 'incomplete';
    }

    // Show loading state
    button.disabled = true;
    button.textContent = '...';

    // Send status update to server
    fetch('./Todo/TodoBackend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'update_task_status',
            task_id: taskData.id,
            status: newStatus
        })
    })
        .then(response => response.json())
        .then(data => {
            button.disabled = false;

            if (data.status === 'success') {
                // Update UI
                updateTaskStatusUI(button, newStatus);
            } else {
                RemindLibrary.showErrorToast('Error updating status: ' + (data.error || 'Unknown error'));
                // Reset button
                button.innerHTML = currentStatus === 'complete' ? "<span class='material-icons TODO_STATUS_ICON'>check_circle</span>" :
                    (currentStatus === 'timeout' ? "<span class='material-icons TODO_STATUS_ICON'>timer</span>" : "<span class='material-icons TODO_STATUS_ICON'>pending</span>");
            }
        })
        .catch(error => {
            button.disabled = false;
            console.error('Error:', error);
            RemindLibrary.showErrorToast('Failed to update status. Please try again.');
            // Reset button
            button.innerHTML = currentStatus === 'complete' ? "<span class='material-icons TODO_STATUS_ICON'>check_circle</span>" :
                (currentStatus === 'timeout' ? "<span class='material-icons TODO_STATUS_ICON'>timer</span>" : "<span class='material-icons TODO_STATUS_ICON'>pending</span>");
        });
}

function updateTaskStatusUI(button, newStatus) {
    const taskElement = button.closest('.TODO__TASK');
    if (!taskElement) return;

    // Update button state
    button.dataset.status = newStatus;

    // Update task class and background
    taskElement.classList.remove('task-complete', 'task-incomplete', 'task-timeout');

    // Update based on new status
    switch (newStatus) {
        case 'complete':
            button.innerHTML = "<span class='material-icons TODO_STATUS_ICON'>check_circle</span>";
            button.title = 'Mark as Incomplete';
            taskElement.classList.add('task-complete');
            taskElement.style.backgroundColor = '#d4edda'; // Green background

            // If there's a timer, update it to show completed
            const timer = taskElement.querySelector('.task-countdown');
            if (timer) {
                timer.textContent = 'Completed';
                timer.classList.remove('time-warning', 'time-urgent', 'time-expired');
            }
            break;

        case 'timeout':
            button.innerHTML = "<span class='material-icons TODO_STATUS_ICON'>timer</span>";
            button.title = 'Mark as Complete';
            taskElement.classList.add('task-timeout');
            taskElement.style.backgroundColor = '#f8d7da'; // Red background
            break;

        default: // incomplete
            button.innerHTML = "<span class='material-icons TODO_STATUS_ICON'>pending</span>";
            button.title = 'Mark as Complete';
            taskElement.classList.add('task-incomplete');
            taskElement.style.backgroundColor = '#fff3cd'; // Yellow background
            break;
    }
    RemindLibrary.showSuccessToast('Task status updated successfully');
    console.log(`Task status updated to: ${newStatus}`);
}

// Modified text overflow function to wrap text down instead of horizontal scroll
function textOverflow(element, allowWrapping = false) {
    if (!element) return;

    // Force recalculation of element dimensions
    void element.offsetWidth;

    // Check for overflow (text content)
    const isOverflowing = element.scrollWidth > element.clientWidth;

    console.log('Element:', element.textContent.substring(0, 20),
        'ScrollWidth:', element.scrollWidth,
        'ClientWidth:', element.clientWidth,
        'Overflowing:', isOverflowing);

    // Apply appropriate styles based on preference
    if (isOverflowing) {
        // Add title attribute to show full text on hover regardless of style
        if (!element.title && element.textContent) {
            element.title = element.textContent.trim();
        }

        if (allowWrapping) {
            // Configure for wrapping behavior - text flows down
            element.style.whiteSpace = 'normal';         // Allow text to wrap
            element.style.wordWrap = 'break-word';       // Break long words if needed
            element.style.overflowWrap = 'break-word';   // Modern version of word-wrap
            element.style.overflow = 'visible';          // Allow content to expand
            element.style.maxHeight = 'none';            // Remove height restriction
            element.classList.add('text-overflow-wrap');

            // Remove other classes if they exist
            element.classList.remove('text-overflow', 'text-overflow-scroll');
        } else {
            // Standard ellipsis behavior (for titles that should stay compact)
            element.style.textOverflow = 'ellipsis';
            element.style.whiteSpace = 'nowrap';
            element.style.overflow = 'hidden';
            element.classList.add('text-overflow');

            // Add click handler to toggle wrapping view
            if (!element.hasClickHandler) {
                element.hasClickHandler = true;
                element.addEventListener('click', function (e) {
                    // Toggle between ellipsis and wrapping modes
                    if (element.classList.contains('text-overflow')) {
                        // Switch to wrapping mode
                        element.classList.remove('text-overflow');
                        element.style.whiteSpace = 'normal';
                        element.style.wordWrap = 'break-word';
                        element.style.overflow = 'visible';
                        element.classList.add('text-overflow-wrap');
                    } else {
                        // Switch back to ellipsis mode
                        element.classList.remove('text-overflow-wrap');
                        element.style.whiteSpace = 'nowrap';
                        element.style.overflow = 'hidden';
                        element.classList.add('text-overflow');
                    }
                    e.stopPropagation(); // Prevent other click handlers
                });
            }
        }

        return true;
    } else {
        // Remove overflow styles if not needed
        element.classList.remove('text-overflow', 'text-overflow-scroll', 'text-overflow-wrap');
        return false;
    }
}

// Add a window resize handler to recheck overflow when the window size changes
window.addEventListener('resize', debounce(() => {
    console.log('Rechecking text overflow after resize');
    document.querySelectorAll('.TODO__TASK__HEAD h4, .TODO__TASK__CONTENT span').forEach(element => {
        textOverflow(element);
    });
}, 250)); // Debounce to avoid excessive recalculations

// Debounce function to limit how often a function is called
function debounce(func, wait) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Function to load groups and tasks from the database
function loadGroupAndTaskByDefault() {
    // Show loading indicator
    const container = document.querySelector('.TODO__CONTAINER');
    if (container) {
        container.innerHTML = '<div class="loading">Loading your tasks...</div>';
    }
    
    // Fetch groups and tasks from server - FIX THE PATH HERE
    fetch('./Todo/TodoBackend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'fetch_group_and_task'
        })
    })
        .then(response => response.json())
        .then(data => {
            // Clear loading indicator
            if (container) {
                container.innerHTML = '';
            }

            if (data.status === 'success' && data.data) {
                // Create groups and tasks from the response
                if (data.data.length > 0) {
                    data.data.forEach(group => {
                        // Create group
                        createNewGroup(group.group);

                        // Create tasks for this group if there are any
                        if (group.tasks && group.tasks.length > 0) {
                            group.tasks.forEach(task => {
                                createTask({
                                    id: task.id,
                                    category: group.group,
                                    title: task.title,
                                    description: task.description,
                                    status: task.status || 'incomplete',
                                    end_date: task.end_date,
                                    end_time: task.end_time
                                });
                            });
                        }
                    });
                } else {
                    // No groups found
                    if (container) {
                        container.innerHTML = '<div class="no-groups">No groups found. Click the "Group" button to create one.</div>';
                    }
                }
            } else {
                console.error('Error loading data:', data.error);
                if (container) {
                    container.innerHTML = '<div class="error">Failed to load your tasks. Please refresh the page.</div>';
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (container) {
                container.innerHTML = `<div class="error">Error: ${error.message}. Please refresh the page.</div>`;
            }
        });
}

// Initialize drag and drop functionality
function initDragAndDrop() {
    document.addEventListener('dragstart', (e) => {
        if (!e.target.classList.contains('TODO__TASK')) return;
        
        console.log('Drag started:', e.target.dataset.title);
        
        // Set required dataTransfer for Firefox compatibility
        e.dataTransfer.setData('text/plain', e.target.dataset.taskId || 'task');
        e.dataTransfer.effectAllowed = 'move';
        
        // Add a small delay to improve drag visualization
        setTimeout(() => {
            dragging = true;
            dragTarget = e.target;
            // Store original parent
            originalDragParent = e.target.closest('.TODO__CARD');
            // Add dragging class
            e.target.classList.add('is-dragging');
        }, 0);
    });

    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!dragging) return;

        // Find nearest card - check both the target and its ancestors
        const card = e.target.closest('.TODO__CARD');
        if (card) {
            e.dataTransfer.dropEffect = 'move';
            card.classList.add('drag-highlight');
        }
    });

    document.addEventListener('dragleave', (e) => {
        if (!dragging) return;
        
        // Only remove highlight if we're leaving this specific card
        const card = e.target.closest('.TODO__CARD');
        if (card && !card.contains(e.relatedTarget)) {
            card.classList.remove('drag-highlight');
        }
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();
        console.log('Drop event triggered');
        
        if (!dragging || !dragTarget) {
            console.log('No active drag operation');
            return;
        }
        
        handleDrop(e);
        
        // Remove all highlights
        document.querySelectorAll('.drag-highlight').forEach(card => {
            card.classList.remove('drag-highlight');
        });
        
        dragging = false;
    });

    document.addEventListener('dragend', (e) => {
        console.log('Drag ended');
        
        if (dragTarget) {
            dragTarget.classList.remove('is-dragging');
        }

        // Remove all highlights
        document.querySelectorAll('.drag-highlight').forEach(card => {
            card.classList.remove('drag-highlight');
        });

        dragging = false;
        // Keep dragTarget reference until after the drop event
        setTimeout(() => {
            dragTarget = null;
            originalDragParent = null;
        }, 100);
    });
}

// Handle task dropping
function handleDrop(e) {
    console.log('Processing drop');
    
    // Get elements
    const draggedTask = document.querySelector('.is-dragging');
    const targetCard = e.target.closest('.TODO__CARD');

    if (!draggedTask) {
        console.error('No dragged task found with .is-dragging class');
        return;
    }
    
    if (!targetCard) {
        console.error('No target card found');
        return;
    }
    
    if (!originalDragParent) {
        console.error('Original parent not found');
        return;
    }

    console.log('Found dragged task:', draggedTask.dataset.title);
    console.log('Target category:', targetCard.id);
    
    // Get categories
    const originalCategory = originalDragParent.id;
    const targetCategory = targetCard.id;

    // Remove the empty placeholder if it exists in the target card
    const emptyPlaceholder = targetCard.querySelector('.empty-category-placeholder');
    if (emptyPlaceholder) {
        emptyPlaceholder.remove();
    }

    if (originalCategory === targetCategory) {
        console.log('Repositioning within same category');
        // Just reposition within same category
        insertTaskAtDropPosition(e, draggedTask, targetCard);
        draggedTask.classList.remove('is-dragging');
        return;
    }

    console.log('Moving between categories:', originalCategory, '->', targetCategory);
    
    // Visual feedback
    draggedTask.classList.add('task-moving');

    // Move the task in UI
    insertTaskAtDropPosition(e, draggedTask, targetCard);

    // Get task ID
    const taskId = draggedTask.dataset.taskId;
    if (!taskId) {
        console.error('Task ID not found in dragged task');
        return;
    }

    // Update in database
    fetch('./Todo/TodoBackend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'move_task',
            task_id: taskId,
            newCategory: targetCategory,
            oldCategory: originalCategory
        })
    })
        .then(response => response.json())
        .then(data => {
            draggedTask.classList.remove('task-moving');

            if (data.status === 'success') {
                console.log('Task moved successfully in database');
                // Update data attributes
                const taskContent = draggedTask.querySelector('.TODO__TASK__CONTENT');
                if (taskContent) {
                    taskContent.dataset.category = targetCategory;
                    RemindLibrary.showSuccessToast('Task moved successfully');
                }

                // Handle empty categories
                if (data.data && data.data.categoryNowEmpty) {
                    addEmptyPlaceholder(originalDragParent);
                }
            } else {
                // Move back on error
                console.error('Failed to move task:', data.error);
                RemindLibrary.showErrorToast('Failed to move task: ' + (data.error || 'Unknown error'));
                originalDragParent.querySelector('.TODO__BODY').appendChild(draggedTask);
            }
        })
        .catch(error => {
            draggedTask.classList.remove('task-moving');
            // Move back on error
            console.error('Error:', error);
            RemindLibrary.showErrorToast('Error: ' + error.message);
            originalDragParent.querySelector('.TODO__BODY').appendChild(draggedTask);
        });
}

// Insert task at correct position based on drop location
function insertTaskAtDropPosition(e, draggedTask, targetCard) {
    const targetBody = targetCard.querySelector('.TODO__BODY');
    const tasks = targetBody.querySelectorAll('.TODO__TASK:not(.is-dragging)');

    // If no other tasks, just append
    if (tasks.length === 0) {
        targetBody.appendChild(draggedTask);
        return;
    }

    // Find closest task based on mouse position
    const mouseY = e.clientY;
    let closestTask = null;
    let closestDistance = Number.POSITIVE_INFINITY;
    let insertAfter = false;

    tasks.forEach(task => {
        const taskRect = task.getBoundingClientRect();
        const taskMiddle = taskRect.top + taskRect.height / 2;
        const distance = Math.abs(mouseY - taskMiddle);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestTask = task;
            insertAfter = mouseY > taskMiddle;
        }
    });

    // Insert before or after closest task
    if (insertAfter) {
        closestTask.after(draggedTask);
    } else {
        closestTask.before(draggedTask);
    }
}

// Add empty placeholder to category
function addEmptyPlaceholder(categoryCard) {
    const body = categoryCard.querySelector('.TODO__BODY');
    if (!body.querySelector('.empty-category-placeholder')) {
        const placeholder = document.createElement('div');
        placeholder.className = 'empty-category-placeholder';
        placeholder.textContent = 'No tasks in this category';
        body.appendChild(placeholder);
    }
}

// Initialize countdown timers
function initCountdownTimers() {
    // Update all timers every second
    setInterval(function () {
        document.querySelectorAll('.task-countdown').forEach(updateTaskCountdown);
    }, 1000);
}

// Update a task countdown
function updateTaskCountdown(timerElement) {
    if (!timerElement || !timerElement.dataset.endDate || !timerElement.dataset.endTime) {
        return;
    }

    const task = timerElement.closest('.TODO__TASK');

    // Don't update completed tasks
    if (task && task.classList.contains('task-complete')) {
        timerElement.textContent = 'Completed';
        timerElement.classList.remove('time-warning', 'time-urgent', 'time-expired');
        return;
    }

    // Calculate time difference
    const endDateStr = timerElement.dataset.endDate;
    const endTimeStr = timerElement.dataset.endTime;
    const endDateTime = new Date(`${endDateStr}T${endTimeStr}`);
    const now = new Date();
    let diff = endDateTime - now;

    // Handle expired tasks - keep this code unchanged
    if (diff <= 0) {
        timerElement.textContent = 'Expired';
        timerElement.classList.add('time-expired');

        // Auto set timeout status if not already complete
        if (task && !task.classList.contains('task-complete')) {
            // Mark task as timed out in UI
            task.classList.add('task-timeout');
            task.style.backgroundColor = '#f8d7da'; // Make sure we set the red color

            // Get task ID and update status in database
            const taskId = task.dataset.taskId;
            const statusButton = task.querySelector('.status-toggle');

            if (taskId) {
                fetch('./Todo/TodoBackend.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: 'update_task_status',
                        task_id: taskId,
                        status: 'timeout'
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success' && statusButton) {
                            statusButton.dataset.status = 'timeout';
                            statusButton.innerHTML = "<span class='material-icons'>timer</span>";
                            statusButton.title = 'Mark as Complete';
                        }
                    })
                    .catch(error => console.error('Error updating timeout status:', error));
            }
        }

        return;
    }

    // Calculate time components - FIX THE MINUTES CALCULATION HERE
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    const minutes = Math.floor(diff / (1000 * 60)); // FIXED: Proper calculation for minutes
    diff -= minutes * (1000 * 60);

    const seconds = Math.floor(diff / 1000);

    // Build timer text
    let timeText = '';
    if (days > 0) {
        timeText = `${days} day${days > 1 ? 's' : ''} left`;
    } else if (hours > 0) {
        timeText = `${hours} hour${hours > 1 ? 's' : ''} left`;
    } else if (minutes > 0) {
        timeText = `${minutes} minute${minutes > 1 ? 's' : ''} left`;
    } else {
        timeText = `${seconds} second${seconds > 1 ? 's' : ''} left`;
    }

    // Add urgency classes
    timerElement.classList.remove('time-warning', 'time-urgent', 'time-expired');
    if (days === 0) {
        if (hours === 0 && minutes < 30) {
            timerElement.classList.add('time-urgent');
        } else if (hours < 2) {
            timerElement.classList.add('time-warning');
        }
    }

    timerElement.textContent = timeText;
}

// Delete task function
function deleteTask(taskElement) {
    if (!taskElement) return;

    // Get task ID
    const taskId = taskElement.dataset.taskId;
    if (!taskId) {
        RemindLibrary.showErrorToast('Cannot delete task: Missing task ID');
        return;
    }

    // Send delete request
    fetch('./Todo/TodoBackend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'delete_task',
            task_id: taskId
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Find parent card before removing task
                const categoryCard = taskElement.closest('.TODO__CARD');

                // Remove task from DOM
                taskElement.remove();

                // Check if category is now empty
                if (categoryCard) {
                    const remainingTasks = categoryCard.querySelectorAll('.TODO__TASK');
                    if (remainingTasks.length === 0) {
                        addEmptyPlaceholder(categoryCard);
                    }
                }
                RemindLibrary.showSuccessToast('Task deleted successfully');
            } else {
                RemindLibrary.showErrorToast('Error deleting task: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            RemindLibrary.showErrorToast('Failed to delete task. Please try again.');
        });
}

// Function to handle horizontal scrolling with indicators
function initHorizontalScrolling() {
    const container = document.querySelector('.TODO__CONTAINER');
    if (!container) return;
    
    // Check if scrolling is needed and update indicator
    function updateScrollIndicator() {
        if (container.scrollWidth <= container.clientWidth) {
            // No scrolling needed, hide indicator
            container.classList.add('scrolled-end');
        } else if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 20) {
            // Scrolled to the end (with small tolerance)
            container.classList.add('scrolled-end');
        } else {
            // More content to scroll
            container.classList.remove('scrolled-end');
        }
    }
    
    // Update on various events
    container.addEventListener('scroll', updateScrollIndicator);
    window.addEventListener('resize', updateScrollIndicator);
    
    // Also check after content loads or changes
    const observer = new MutationObserver(updateScrollIndicator);
    observer.observe(container, { childList: true, subtree: true });
    
    // Initial check
    updateScrollIndicator();
    
    // Re-check after a delay to account for dynamic content
    setTimeout(updateScrollIndicator, 1000);
}