import RemindLibrary from '../RemindLibrary.js';
/**
 * Group Management Admin Functions
 * 
 * This module contains functions for managing group chats including:
 * - Viewing and managing members
 * - Editing group information
 * - Deleting groups
 */

// Import utility functions if needed
// If fetchDataOrsendData is defined in Message.js, you may need to create a separate utilities file

/**
 * Make a request to the server API
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} - Promise resolving to response data
 */
async function fetchDataOrsendData(url, options) {
    try {
        const response = await fetch(url, options);
        
        // Check if response is OK
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        
        // If response is empty or has no content, return a default success object
        const contentLength = response.headers.get('Content-Length');
        if (contentLength === '0' || response.status === 204) {
            console.warn('Empty response received from server');
            return { 
                status: 'success', 
                message: 'Operation completed successfully (no content returned)' 
            };
        }
        
        // Try to get response text first to debug issues
        const text = await response.text();
        
        // If empty response, return default success
        if (!text || text.trim() === '') {
            console.warn('Empty text response received from server');
            return { 
                status: 'success', 
                message: 'Operation completed successfully (empty response)' 
            };
        }
        
        // Check if the response looks like HTML (indicates PHP error)
        if (text.trim().startsWith('<')) {
            console.error("Server returned HTML instead of JSON:", text);
            throw new Error("Server returned HTML instead of JSON. Check server logs.");
        }
        
        // Parse as JSON if it looks valid
        try {
            const data = JSON.parse(text);
            return data;
        } catch (jsonError) {
            console.error("JSON Parse Error:", jsonError);
            console.error("Raw response:", text);
            throw new Error("Failed to parse server response as JSON");
        }
    } catch(error) {
        console.error('Fetch Error:', error);
        throw error;
    }
}

/**
 * Shows the manage group modal with admin options
 * @param {string} groupName - Name of the group
 * @param {string} groupId - ID of the group
 */
function manageGroup(groupName, groupId) {
    console.log(`Managing group: ${groupName} (ID: ${groupId})`);
    
    // Create overlay for the modal
    const overlay = document.createElement('div');
    overlay.className = 'profile-overlay';
    
    // Create container
    const manageContainer = document.createElement('div');
    manageContainer.className = 'profile-container';
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-form';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    manageContainer.appendChild(closeButton);
    
    // Header
    const header = document.createElement('div');
    header.className = 'profile-header';
    
    const groupIcon = document.createElement('div');
    groupIcon.className = 'profile-avatar';
    const icon = document.createElement('span');
    icon.className = 'material-icons';
    icon.textContent = 'admin_panel_settings';
    groupIcon.appendChild(icon);
    
    const groupInfo = document.createElement('div');
    groupInfo.className = 'profile-user-info';
    const title = document.createElement('h2');
    title.textContent = `Manage ${groupName}`;
    groupInfo.appendChild(title);
    
    header.appendChild(groupIcon);
    header.appendChild(groupInfo);
    manageContainer.appendChild(header);
    
    // Management options
    const optionsList = document.createElement('div');
    optionsList.className = 'admin-options-list';
    console.log(groupName)
    const options = [
        {
            icon: 'people', 
            title: 'Manage members',
            description: 'Add, remove, or change member roles',
            action: () => {
                document.body.removeChild(overlay);
                viewGroupMembers(groupName, groupId);
            }
        },
        {
            icon: 'edit',
            title: 'Edit group info',
            description: 'Change group name or description',
            action: () => {
                document.body.removeChild(overlay);
                editGroupInfo(groupName, groupId);
            }
        },
        {
            icon: 'delete',
            title: 'Delete group',
            description: 'Permanently delete this group',
            danger: true,
            action: () => {
                document.body.removeChild(overlay);
                deleteGroup(groupName, groupId);
            }
        }
    ];
    
    options.forEach(option => {
        const optionItem = document.createElement('div');
        optionItem.className = `admin-option-item ${option.danger ? 'danger' : ''}`;
        
        const optionIcon = document.createElement('span');
        optionIcon.className = 'material-icons';
        optionIcon.textContent = option.icon;
        
        const optionContent = document.createElement('div');
        optionContent.className = 'option-content';
        
        const optionTitle = document.createElement('h3');
        optionTitle.textContent = option.title;
        
        const optionDesc = document.createElement('p');
        optionDesc.textContent = option.description;
        
        optionContent.appendChild(optionTitle);
        optionContent.appendChild(optionDesc);
        
        optionItem.appendChild(optionIcon);
        optionItem.appendChild(optionContent);
        
        optionItem.addEventListener('click', option.action);
        
        optionsList.appendChild(optionItem);
    });
    
    manageContainer.appendChild(optionsList);
    
    // Add to DOM
    overlay.appendChild(manageContainer);
    document.body.appendChild(overlay);

    // Get group status
    fetchDataOrsendData(`./Communication/Message.php?Type=GetGroupInfo&GroupID=${groupId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    })
    .then(response => {
        if (response.status === 'success' && response.message) {
            const groupInfo = response.message;
            const groupStatus = groupInfo.GroupStatus || 'Active';
            
            // Add mute/unmute group option to admin options list
            const adminOptionsList = document.querySelector('.admin-options-list');
            if (adminOptionsList) {
                const muteGroupOption = document.createElement('div');
                muteGroupOption.className = 'admin-option-item';
                
                const muteIcon = document.createElement('span');
                muteIcon.className = 'material-icons';
                muteIcon.textContent = groupStatus === 'Muted' ? 'volume_up' : 'volume_off';
                
                const optionContent = document.createElement('div');
                optionContent.className = 'option-content';
                
                const optionTitle = document.createElement('h3');
                optionTitle.textContent = groupStatus === 'Muted' ? 'Unmute Group' : 'Mute Group';
                
                const optionDesc = document.createElement('p');
                optionDesc.textContent = groupStatus === 'Muted' ? 
                    'Allow messages to be sent in this group again' : 
                    'Prevent all members from sending messages to this group';
                
                optionContent.appendChild(optionTitle);
                optionContent.appendChild(optionDesc);
                
                muteGroupOption.appendChild(muteIcon);
                muteGroupOption.appendChild(optionContent);
                
                muteGroupOption.addEventListener('click', () => {
                    toggleMuteGroup(groupId, groupName, groupStatus);
                });
                
                // Insert at the second position (after view members)
                const firstChild = adminOptionsList.firstChild;
                if (firstChild && firstChild.nextSibling) {
                    adminOptionsList.insertBefore(muteGroupOption, firstChild.nextSibling);
                } else {
                    adminOptionsList.appendChild(muteGroupOption);
                }
            }
        }
    });
}

/**
 * Displays a list of group members with admin controls
 * @param {string} groupName - The name of the group
 * @param {string} groupId - The ID of the group
 */
function viewGroupMembers(groupName, groupId) {
    console.log(`Viewing members of group: ${groupName} (ID: ${groupId})`);
    
    // Remove any existing profile overlays before creating a new one
    const existingOverlay = document.querySelector('.profile-overlay');
    if (existingOverlay) {
        document.body.removeChild(existingOverlay);
    }
    
    // Create overlay for the modal
    const overlay = document.createElement('div');
    overlay.className = 'profile-overlay';
    
    // Create container - with increased width and max-height
    const membersContainer = document.createElement('div');
    membersContainer.className = 'profile-container';
    membersContainer.style.width = '500px'; // Increase width from default 400px
    membersContainer.style.maxWidth = '95%';
    membersContainer.style.maxHeight = '95vh'; // Allow more vertical space
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-form';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    membersContainer.appendChild(closeButton);
    
    // Header
    const header = document.createElement('div');
    header.className = 'profile-header';
    
    const groupIcon = document.createElement('div');
    groupIcon.className = 'profile-avatar';
    const icon = document.createElement('span');
    icon.className = 'material-icons';
    icon.textContent = 'group';
    groupIcon.appendChild(icon);
    
    const groupInfo = document.createElement('div');
    groupInfo.className = 'profile-user-info';
    const title = document.createElement('h2');
    title.textContent = `${groupName} Members`;
    groupInfo.appendChild(title);
    
    header.appendChild(groupIcon);
    header.appendChild(groupInfo);
    membersContainer.appendChild(header);
    
    // Members list with increased padding
    const membersList = document.createElement('div');
    membersList.className = 'members-list';
    membersList.style.padding = '25px'; // Increase padding from default 20px
    membersList.innerHTML = '<p class="loading-message">Loading members...</p>';
    membersContainer.appendChild(membersList);
    
    // Add to DOM
    overlay.appendChild(membersContainer);
    document.body.appendChild(overlay);
    
    // Fetch group members from server
    fetchDataOrsendData(`./Communication/Message.php?Type=GetGroupMembers&GroupID=${groupId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    })
    .then(data => {
        console.log('Group members:', data);
        membersList.innerHTML = ''; // Clear loading message
        if (data.status === 'success' && data.message && data.message.length > 0) {
            // Check if current user is admin using EMAIL instead of UID
            const currentUserEmail = getCookieValue('EMAIL');
            console.log('Current user email:', currentUserEmail);
            
            // Use email to identify the current user
            const currentUser = data.message.find(m => m.email && m.email.toLowerCase() === currentUserEmail.toLowerCase());
            console.log('Current user found:', currentUser);
            
            const isAdmin = currentUser && currentUser.role === 'ADMIN';
            console.log('Is admin:', isAdmin);
            
            data.message.forEach(member => {
                console.log('Processing member:', member.name, 'Role:', member.role, 'ID:', member.id);
                
                const memberItem = document.createElement('div');
                memberItem.className = 'member-item';
                memberItem.style.display = 'flex';
                memberItem.style.justifyContent = 'space-between';
                memberItem.style.alignItems = 'center';
                memberItem.style.padding = '15px 0'; // Increase padding vertically
                memberItem.style.borderBottom = '1px solid #eee';
                memberItem.style.marginBottom = '10px'; // Increase space between items
                
                // Member info section (left side)
                const memberInfo = document.createElement('div');
                memberInfo.className = 'member-info';
                memberInfo.style.display = 'flex';
                memberInfo.style.alignItems = 'center';
                memberInfo.style.flex = '1';
                
                const memberName = document.createElement('div');
                memberName.className = 'member-name';
                memberName.textContent = member.name;
                memberName.style.fontWeight = 'bold';
                memberName.style.marginRight = '10px';
                
                const memberRole = document.createElement('div');
                memberRole.className = 'member-role';
                memberRole.textContent = member.role || 'MEMBER';
                memberRole.style.backgroundColor = '#edf2ff';
                memberRole.style.color = '#5e72e4';
                memberRole.style.padding = '3px 8px';
                memberRole.style.borderRadius = '12px';
                memberRole.style.fontSize = '0.75rem';
                memberRole.style.fontWeight = 'bold';
                
                // Add status indicator
                const statusIndicator = document.createElement('div');
                statusIndicator.className = `member-status ${(member.status || 'active').toLowerCase()}`;
                statusIndicator.textContent = member.status || 'Active';
                statusIndicator.style.marginLeft = '10px';
                statusIndicator.style.fontSize = '0.75rem';
                statusIndicator.style.padding = '3px 8px';
                statusIndicator.style.borderRadius = '12px';
                
                if ((member.status || 'Active') === 'Active') {
                    statusIndicator.style.backgroundColor = '#dcfce7';
                    statusIndicator.style.color = '#166534';
                } else if (member.status === 'Muted') {
                    statusIndicator.style.backgroundColor = '#fee2e2';
                    statusIndicator.style.color = '#991b1b';
                } else if (member.status === 'Banned') {
                    statusIndicator.style.backgroundColor = '#fef3c7';
                    statusIndicator.style.color = '#92400e';
                }
                
                memberInfo.appendChild(memberName);
                memberInfo.appendChild(memberRole);
                memberInfo.appendChild(statusIndicator);
                memberItem.appendChild(memberInfo);
                
                // Add actions for admins (except for their own profile and other admins)
                if (isAdmin && 
                    (member.email ? member.email.toLowerCase() !== currentUserEmail.toLowerCase() : member.id !== currentUser.id) && 
                    member.role !== 'ADMIN') {
                    console.log('Adding action buttons for:', member.name);
                    
                    const memberActions = document.createElement('div');
                    memberActions.className = 'member-actions';
                    memberActions.style.display = 'flex';
                    memberActions.style.gap = '10px'; // Increase gap between buttons
                    memberActions.style.flexWrap = 'nowrap'; // Prevent wrapping on small screens
                    memberActions.style.marginLeft = '15px'; // More space from member info
                    
                    // MUTE BUTTON
                    const muteToggle = document.createElement('button');
                    muteToggle.className = 'member-action-btn toggle-mute';
                    muteToggle.title = member.status === 'Muted' ? 'Unmute member' : 'Mute member';
                    muteToggle.style.backgroundColor = '#f0f9ff';
                    muteToggle.style.color = '#0284c7';
                    muteToggle.style.border = 'none';
                    muteToggle.style.borderRadius = '4px';
                    muteToggle.style.padding = '8px 12px'; // Increase padding
                    muteToggle.style.display = 'flex';
                    muteToggle.style.alignItems = 'center';
                    muteToggle.style.cursor = 'pointer';
                    muteToggle.style.minWidth = '80px'; // Ensure minimum width
                    muteToggle.style.justifyContent = 'center'; // Center content
                    
                    const muteIcon = document.createElement('span');
                    muteIcon.className = 'material-icons';
                    muteIcon.textContent = member.status === 'Muted' ? 'volume_up' : 'volume_off';
                    muteIcon.style.fontSize = '16px';
                    muteIcon.style.marginRight = '4px';
                    
                    const muteText = document.createElement('span');
                    muteText.textContent = member.status === 'Muted' ? 'Unmute' : 'Mute';
                    muteText.style.fontSize = '12px';
                    muteText.style.fontWeight = 'bold';
                    
                    muteToggle.appendChild(muteIcon);
                    muteToggle.appendChild(muteText);
                    
                    // REMOVE BUTTON
                    const kickBtn = document.createElement('button');
                    kickBtn.className = 'member-action-btn kick-member';
                    kickBtn.title = 'Remove from group';
                    kickBtn.style.backgroundColor = '#fee2e2';
                    kickBtn.style.color = '#b91c1c';
                    kickBtn.style.border = 'none';
                    kickBtn.style.borderRadius = '4px';
                    kickBtn.style.padding = '8px 12px'; // Increase padding
                    kickBtn.style.display = 'flex';
                    kickBtn.style.alignItems = 'center';
                    kickBtn.style.cursor = 'pointer';
                    kickBtn.style.minWidth = '80px'; // Ensure minimum width
                    kickBtn.style.justifyContent = 'center'; // Center content
                    
                    const kickIcon = document.createElement('span');
                    kickIcon.className = 'material-icons';
                    kickIcon.textContent = 'person_remove';
                    kickIcon.style.fontSize = '16px';
                    kickIcon.style.marginRight = '4px';
                    
                    const kickText = document.createElement('span');
                    kickText.textContent = 'Remove';
                    kickText.style.fontSize = '12px';
                    kickText.style.fontWeight = 'bold';
                    
                    kickBtn.appendChild(kickIcon);
                    kickBtn.appendChild(kickText);
                    
                    // BAN BUTTON
                    const banBtn = document.createElement('button');
                    banBtn.className = 'member-action-btn ban-member';
                    banBtn.title = member.status === 'Banned' ? 'Unban member' : 'Ban member';
                    banBtn.style.backgroundColor = '#fff7ed';
                    banBtn.style.color = '#c2410c';
                    banBtn.style.border = 'none';
                    banBtn.style.borderRadius = '4px';
                    banBtn.style.padding = '8px 12px'; // Increase padding
                    banBtn.style.display = 'flex';
                    banBtn.style.alignItems = 'center';
                    banBtn.style.cursor = 'pointer';
                    banBtn.style.minWidth = '80px'; // Ensure minimum width
                    banBtn.style.justifyContent = 'center'; // Center content
                    
                    const banIcon = document.createElement('span');
                    banIcon.className = 'material-icons';
                    banIcon.textContent = member.status === 'Banned' ? 'how_to_reg' : 'gpp_bad';
                    banIcon.style.fontSize = '16px';
                    banIcon.style.marginRight = '4px';
                    
                    const banText = document.createElement('span');
                    banText.textContent = member.status === 'Banned' ? 'Unban' : 'Ban';
                    banText.style.fontSize = '12px';
                    banText.style.fontWeight = 'bold';
                    
                    banBtn.appendChild(banIcon);
                    banBtn.appendChild(banText);
                    
                    // Set up event listeners
                    muteToggle.addEventListener('click', () => {
                        toggleMuteMember(groupId, member.id, member.name, member.status || 'Active');
                    });
                    
                    kickBtn.addEventListener('click', () => {
                        removeGroupMember(groupId, member.id, member.name);
                    });
                    
                    banBtn.addEventListener('click', () => {
                        toggleBanMember(groupId, member.id, member.name, member.status || 'Active');
                    });
                    
                    memberActions.appendChild(muteToggle);
                    memberActions.appendChild(kickBtn);
                    memberActions.appendChild(banBtn);
                    memberItem.appendChild(memberActions);
                } else {
                    // Show message if user can't modify this member
                    if (isAdmin) {
                        if (member.email && member.email.toLowerCase() === currentUserEmail.toLowerCase()) {
                            const adminNote = document.createElement('div');
                            adminNote.className = 'admin-note';
                            adminNote.textContent = 'This is you';
                            adminNote.style.color = '#9ca3af';
                            adminNote.style.fontSize = '0.8rem';
                            adminNote.style.fontStyle = 'italic';
                            memberItem.appendChild(adminNote);
                        } else if (member.role === 'ADMIN') {
                            const adminNote = document.createElement('div');
                            adminNote.className = 'admin-note';
                            adminNote.textContent = 'Admin';
                            adminNote.style.color = '#9ca3af';
                            adminNote.style.fontSize = '0.8rem';
                            adminNote.style.fontStyle = 'italic';
                            memberItem.appendChild(adminNote);
                        }
                    }
                }
                
                membersList.appendChild(memberItem);
            });
            
            // Add invitation button for admins
            if (isAdmin) {
                const inviteRow = document.createElement('div');
                inviteRow.className = 'invite-members-row';
                
                const inviteBtn = document.createElement('button');
                inviteBtn.className = 'invite-members-btn';
                inviteBtn.innerHTML = '<span class="material-icons">person_add</span> Add members';
                inviteBtn.addEventListener('click', () => {
                    showAddMembersForm(groupId, groupName);
                });
                
                inviteRow.appendChild(inviteBtn);
                membersList.appendChild(inviteRow);
            }
        }else if (data.status === 'warning'){
            membersList.innerHTML = `<p class="error-message">${data.message}</p>`;

        } else {
            membersList.innerHTML = '<p class="error-message">No members found or failed to load</p>';
        }
    })
    .catch(error => {
        console.error('Error fetching group members:', error);
        membersList.innerHTML = '<p class="error-message">Failed to load group members</p>';
    });
}

/**
 * Change a user's role in the group (admin/member)
 * @param {string} groupId - The group ID
 * @param {string} userId - The user ID to change
 * @param {string} newRole - The new role (ADMIN or MEMBER)
 */
async function changeUserRole(groupId, userId, newRole) {
    const confirmed = await RemindLibrary.customConfirm(`Are you sure you want to change this user's role to ${newRole}?`);

    if (!confirmed) {
        return;
    }
    
    fetchDataOrsendData("./Communication/Message.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            Type: 'ChangeUserRole',
            GroupID: groupId,
            UserID: userId,
            NewRole: newRole
        })
    })
    .then(data => {
        if (data.status === 'success') {
            RemindLibrary.showSuccessToast(`User role changed to ${newRole}`);
            // Refresh the member list
            viewGroupMembers(document.querySelector('.recipient-info h3').textContent, groupId);
        } else {
            RemindLibrary.showErrorToast('Failed to change user role: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error changing user role:', error);
        RemindLibrary.showErrorToast('Failed to change user role');
    });
}

/**
 * Remove a member from the group
 * @param {string} groupId - The group ID
 * @param {string} userId - The user ID to remove
 * @param {string} userName - The user's name for confirmation
 */
async function removeGroupMember(groupId, userId, userName) {

    const confirmed = await RemindLibrary.customConfirm(`Are you sure you want to remove ${userName} from the group?`);

    if (!confirmed) {
        return;
    }
    // Show loading indicator
    const memberItem = document.querySelector(`.members-list [data-user-id="${userId}"]`);
    if (memberItem) {
        memberItem.style.opacity = '0.5';
    }
    
    fetchDataOrsendData("./Communication/Message.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            Type: 'RemoveGroupMember',
            GroupID: groupId,
            UserID: userId
        })
    })
    .then(data => {
        console.log('Remove member response:', data);
        
        if (data.status === 'success') {
            // Close the current members view
            const existingOverlay = document.querySelector('.profile-overlay');
            if (existingOverlay) {
                document.body.removeChild(existingOverlay);
            }
            
            // Show success toast instead of alert
            RemindLibrary.showSuccessToast(`${userName} has been removed from the group`);
            
            // Reopen members view with fresh data after a short delay
            setTimeout(() => {
                const groupName = document.querySelector('.recipient-info h3')?.textContent || 'Group';
                viewGroupMembers(groupName, groupId);
            }, 300);
        } else {
            // Reset the opacity if operation failed
            if (memberItem) {
                memberItem.style.opacity = '1';
            }
            RemindLibrary.showErrorToast('Failed to remove member: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error removing member:', error);
        // Reset the opacity on error
        if (memberItem) {
            memberItem.style.opacity = '1';
        }
        RemindLibrary.showErrorToast('Failed to remove member');
    });
}

/**
 * Show form to add new members to the group
 * @param {string} groupId - The group ID
 * @param {string} groupName - The group name
 */
function showAddMembersForm(groupId, groupName) {
    // Create overlay for the modal
    const overlay = document.createElement('div');
    overlay.className = 'DM-form-overlay';
    overlay.id = 'add-members-overlay';
    
    // Create the form container
    const addMembersForm = document.createElement('div');
    addMembersForm.className = 'DM-form';
    addMembersForm.id = 'add-members-form';
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = `Add members to ${groupName}`;
    addMembersForm.appendChild(title);
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-form';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    addMembersForm.appendChild(closeButton);
    
    // Members email input
    const membersInput = document.createElement('input');
    membersInput.type = 'email';
    membersInput.placeholder = 'Email addresses (comma separated)';
    membersInput.className = 'members-email-input';
    membersInput.id = 'members-email-input';

    const errorMessage = document.createElement('p');
    errorMessage.className = 'error-message-members hidden';
    errorMessage.id = 'error-message-members';
    errorMessage.textContent = '';
    errorMessage.style = 'color: red; font-size: 0.8rem; margin-top: 0.5rem;';

    const suggestions = document.createElement('ul');
    suggestions.id = 'member-suggestions';
    suggestions.style = "list-style: none; padding: 0;";

    // Add button
    const addButton = document.createElement('button');
    addButton.textContent = 'Add members';
    addButton.className = 'add-members-btn';
    addButton.id = 'add-members-btn';

    // Add form event handler
    addButton.addEventListener('click', function() {
        const emails = membersInput.value.trim();

        if (!emails) {
            errorMessage.textContent = 'Please enter at least one email address';
            errorMessage.classList.remove('hidden');
            return;
        }
        
        addMembersToGroup(groupId, emails.split(',').map(e => e.trim()));

        document.body.removeChild(overlay);
    });

    // Add all elements to the form
    addMembersForm.appendChild(membersInput);
    addMembersForm.appendChild(errorMessage);
    addMembersForm.appendChild(suggestions);
    addMembersForm.appendChild(addButton);
    
    // Add the form to the overlay and the overlay to the body
    overlay.appendChild(addMembersForm);
    document.body.appendChild(overlay);
    
    // Focus on the input
    membersInput.focus();
    
    // Setup email suggestion functionality
    setupEmailSuggestions(membersInput, suggestions);
}

/**
 * Sets up email suggestions for an input field
 * @param {HTMLElement} inputField - The input field to attach suggestions to
 * @param {HTMLElement} suggestionsList - The list element to show suggestions in
 */
function setupEmailSuggestions(inputField, suggestionsList) {
    // This function depends on debounce from the main file
    // We assume debounce is defined globally or is imported
    inputField.addEventListener('input', debounce(function(e) {
        const email = e.target.value.trim();
        if (email.length < 3) {
            suggestionsList.innerHTML = '';
            return;
        }

        fetchDataOrsendData(`./Communication/Message.php?Type=GetSuggestions&Email=${email}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(data => {
            if (data && data.length) {
                suggestionsList.innerHTML = '';
                data.forEach(suggestion => {
                    const li = document.createElement('li');
                    li.textContent = suggestion.email;
                    li.style = "cursor: pointer; padding: 5px;";
                    suggestionsList.appendChild(li);
                    
                    li.addEventListener('click', function() {
                        inputField.value = this.textContent;
                        suggestionsList.innerHTML = '';
                        inputField.focus();
                    });
                });
            }
        })
        .catch(error => {
            console.error('Error getting suggestions:', error);
        });
    }, 500));
}

/**
 * Add members to a group
 * @param {string} groupId - The group ID
 * @param {Array} emails - Array of email addresses to add
 */
function addMembersToGroup(groupId, emails) {
    fetchDataOrsendData("./Communication/Message.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            Type: 'AddGroupMembers',
            GroupID: groupId,
            Emails: emails
        })
    })

    .then(data => {
        console.log('Add members response:', data);
        if (data.status === 'success') {
            RemindLibrary.showSuccessToast(`New members have been added to the group`);
            // Refresh the member list
            viewGroupMembers(document.querySelector('.recipient-info h3').textContent, groupId);
        }else if(data.status === 'info'){
            RemindLibrary.showErrorToast(data.message);
        } else {
            RemindLibrary.showErrorToast('Failed to add members: ' + (data.message || 'Unknown error'));
        }
    })

    .catch(error => {
        console.error('Error adding members:', error);
        RemindLibrary.showErrorToast('Failed to add members');
    });
}

/**
 * Edit group information (name, description)
 * @param {string} groupName - Current group name
 * @param {string} groupId - The group ID
 */
function editGroupInfo(groupName, groupId) {
    // Create overlay for the modal
    const overlay = document.createElement('div');
    overlay.className = 'group-form-overlay';
    
    // Create form container
    const editForm = document.createElement('div');
    editForm.className = 'group-form';
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Edit Group Information';
    editForm.appendChild(title);
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-form';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    editForm.appendChild(closeButton);
    
    // Create error message element
    const errorMessage = document.createElement('p');
    errorMessage.className = 'form-error-message';
    errorMessage.style.color = '#ef4444';
    errorMessage.style.fontSize = '0.85rem';
    errorMessage.style.margin = '0.5rem 0';
    errorMessage.style.display = 'none';
    
    // Get current group info
    fetchDataOrsendData(`./Communication/Message.php?Type=GetGroupInfo&GroupID=${groupId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    })
    .then(data => {
        if (data.status === 'success') {
            console.log(data.message);
            // Group name input
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.placeholder = 'Group Name';
            nameInput.className = 'group-name';
            nameInput.value = groupName;
            editForm.appendChild(nameInput);
            
            // Add error message after name input
            editForm.appendChild(errorMessage);
            
            // Group description input
            const descInput = document.createElement('input');
            descInput.type = 'text';
            descInput.placeholder = 'Group Description';
            descInput.className = 'group-desc';
            descInput.value = data.message.GroupDesc || '';
            editForm.appendChild(descInput);
            
            // Status message for success feedback
            const statusMessage = document.createElement('p');
            statusMessage.className = 'form-status-message';
            statusMessage.style.color = '#22c55e'; // Green color
            statusMessage.style.fontSize = '0.85rem';
            statusMessage.style.margin = '0.5rem 0';
            statusMessage.style.display = 'none';
            editForm.appendChild(statusMessage);
            
            // Save button
            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save Changes';
            saveButton.className = 'group-submit';
            saveButton.addEventListener('click', () => {
                // Validate input first
                if (!nameInput.value.trim()) {
                    // Show error message instead of alert
                    errorMessage.textContent = 'Group name cannot be empty';
                    errorMessage.style.display = 'block';
                    nameInput.focus();
                    return;
                }
                
                // Clear any previous error
                errorMessage.style.display = 'none';
                
                // Call the update function with a callback for success/error handling
                updateGroupInfoWithCallback(
                    groupId, 
                    nameInput.value, 
                    descInput.value,
                    // Success callback
                    () => {
                        statusMessage.textContent = 'Group information updated successfully!';
                        statusMessage.style.display = 'block';
                        setTimeout(() => {
                            document.body.removeChild(overlay);
                        }, 1500);
                    },
                    // Error callback
                    (errorMsg) => {
                        errorMessage.textContent = errorMsg || 'Failed to update group info';
                        errorMessage.style.display = 'block';
                    }
                );
            });
            editForm.appendChild(saveButton);
            
            // Add to DOM
            overlay.appendChild(editForm);
            document.body.appendChild(overlay);
            
            // Focus on the name input
            nameInput.focus();
            
        } else {
            // Show error in form instead of alert
            errorMessage.textContent = 'Failed to get group info: ' + (data.message || 'Unknown error');
            errorMessage.style.display = 'block';
            editForm.appendChild(errorMessage);
            
            overlay.appendChild(editForm);
            document.body.appendChild(overlay);
        }
    })
    .catch(error => {
        console.error('Error getting group info:', error);
        
        // Show error in form instead of alert
        errorMessage.textContent = 'Failed to get group info: ' + error.message;
        errorMessage.style.display = 'block';
        editForm.appendChild(errorMessage);
        
        overlay.appendChild(editForm);
        document.body.appendChild(overlay);
    });
}

/**
 * Update group information with callback handling for success/error
 * @param {string} groupId - The group ID
 * @param {string} name - New group name
 * @param {string} description - New group description
 * @param {Function} onSuccess - Callback function on success
 * @param {Function} onError - Callback function on error
 */
function updateGroupInfoWithCallback(groupId, name, description, onSuccess, onError) {
    console.log(description);
    fetchDataOrsendData("./Communication/Message.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            Type: 'UpdateGroupInfo',
            GroupID: groupId,
            GroupUniqueCode: name.split('_')[1],
            GroupName: name.trim(),
            GroupDesc: description.trim()
        })
    })
    .then(data => {
        if (data.status === 'success') {
            // Update UI elements
            const groupItem = document.getElementById(groupId);
            if (groupItem) {
                const nameElement = groupItem.querySelector('h4');
                if (nameElement) nameElement.textContent = name.trim();
            }
            // Update the message header
            const recipientName = document.querySelector('.recipient-info h3');
            if (recipientName) recipientName.textContent = name.trim();
            
            // Call success callback
            if (onSuccess) onSuccess();
        } else {
            // Call error callback
            if (onError) onError(data.message || 'Unknown error');
        }
    })
    .catch(error => {
        console.error('Error updating group info:', error);
        // Call error callback
        if (onError) onError(error.message || 'Network error');
    });
}

/**
 * Update group information (keep for backward compatibility)
 * @param {string} groupId - The group ID
 * @param {string} name - New group name
 * @param {string} description - New group description
 */
function updateGroupInfo(groupId, name, description) {
    // Validate input
    if (!name.trim()) {
        RemindLibrary.showErrorToast('Group name cannot be empty');
        return;
    }
    
    // Use the new callback version
    updateGroupInfoWithCallback(
        groupId, 
        name, 
        description,
        // Success callback - use alert for backward compatibility
        () => RemindLibrary.showSuccessToast('Group information updated'),
        // Error callback - use alert for backward compatibility
        (errorMsg) => RemindLibrary.showErrorToast('Failed to update group info: ' + errorMsg)
    );
}

/**
 * Delete a group
 * @param {string} groupName - The group name
 * @param {string} groupId - The group ID
 */
async function deleteGroup(groupName, groupId) {

    const confirmed = await RemindLibrary.customConfirm(`Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`);

    if (!confirmed) {
        return;
    }
    
    fetchDataOrsendData("./Communication/Message.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            Type: 'DeleteGroup',
            GroupID: groupId
        })
    })
    .then(data => {
        if (data.status === 'success') {
            RemindLibrary.showSuccessToast(`The group "${groupName}" has been deleted`);
            
            // Remove group from the list
            const groupItem = document.getElementById(groupId);
            if (groupItem && groupItem.parentNode) {
                groupItem.parentNode.removeChild(groupItem);
            }
            
            // Clear the message panel
            const messagePanel = document.querySelector('.messages-panel');
            messagePanel.innerHTML = '<div class="select-conversation"><span>No conversation selected</span>Select a conversation from the sidebar to start messaging</div>';
            
        } else {
            RemindLibrary.showErrorToast('Failed to delete group: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error deleting group:', error);
        RemindLibrary.showErrorToast('Failed to delete group');
    });
}

// Create a debounce function if it's needed here and not imported
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Export functions for use in other files
export {
    manageGroup,
    viewGroupMembers,
    changeUserRole,
    removeGroupMember,
    showAddMembersForm,
    addMembersToGroup,
    editGroupInfo,
    updateGroupInfo,
    deleteGroup,
    fetchDataOrsendData,
    getCookieValue
};

/**
 * Function to mute/unmute a member in a group
 * @param {string} groupId - The ID of the group
 * @param {string} memberId - The ID of the member to mute/unmute
 * @param {boolean} mute - True to mute, false to unmute
 */
export async function toggleMuteMember(groupId, memberId, memberName, currentStatus) {
    const newStatus = currentStatus === 'Muted' ? 'Active' : 'Muted';
    const action = newStatus === 'Muted' ? 'mute' : 'unmute';

    const confirmed = await RemindLibrary.customConfirm(`Are you sure you want to ${action} ${memberName}?`);
    
    if (confirmed) {
        fetchDataOrsendData("./Communication/Message.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                Type: 'ToggleMuteMember',
                GroupID: groupId,
                MemberID: memberId,
                Status: newStatus
            })
        })
        .then(data => {
            if (data.status === 'success') {
                RemindLibrary.showSuccessToast(`${memberName} has been ${action}d`);
                // Refresh member list to show updated status
                viewGroupMembers(undefined, groupId);
            } else {
                RemindLibrary.showErrorToast(`Failed to ${action} member: ` + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error(`Error ${action}ing member:`, error);
            RemindLibrary.showErrorToast(`Failed to ${action} member`);
        });
    }
}

/**
 * Function to mute/unmute an entire group
 * @param {string} groupId - The ID of the group
 * @param {string} groupName - The name of the group
 * @param {string} currentStatus - Current status of the group ('Muted' or 'Active')
 */
async function toggleMuteGroup(groupId, groupName, currentStatus) {
    const newStatus = currentStatus === 'Muted' ? 'Active' : 'Muted';
    const action = newStatus === 'Muted' ? 'mute' : 'unmute';

    const confirmed = await RemindLibrary.customConfirm(`Are you sure you want to ${action} the entire "${groupName}" group?`);
    
    if (confirmed) {
        console.log(`Toggling group ${groupName} (${groupId}) to ${newStatus}`);
        fetchDataOrsendData("./Communication/Message.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                Type: 'ToggleMuteGroup',
                GroupID: groupId,
                Status: newStatus
            })
        })
        .then(data => {
            if (data.status === 'success') {
                RemindLibrary.showSuccessToast(`Group "${groupName}" has been ${action}d`);
                
                // Instead of opening a new manage form, close the current overlay
                const overlay = document.querySelector('.profile-overlay');
                if (overlay) {
                    document.body.removeChild(overlay);
                }
                
                // Update the UI to reflect the new status - pass groupName as parameter
                updateGroupStatusInUI(groupId, newStatus, groupName);
            } else {
                RemindLibrary.showErrorToast(`Failed to ${action} group: ` + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error(`Error ${action}ing group:`, error);
            RemindLibrary.showErrorToast(`Failed to ${action} group`);
        });
    }
}

/**
 * Updates the UI to reflect a group's muted/active status
 * @param {string} groupId - The ID of the group
 * @param {string} newStatus - The new status ('Muted' or 'Active')
 * @param {string} groupName - The name of the group
 */
function updateGroupStatusInUI(groupId, newStatus, groupName) {
    // Find the group contact in the sidebar
    const groupContact = document.getElementById(groupId);
    if (groupContact) {
        // If a muted icon already exists, remove it
        const existingIcon = groupContact.querySelector('.group-muted-icon');
        if (existingIcon) {
            existingIcon.remove();
        }
        
        // If group is muted, add a muted icon
        if (newStatus === 'Muted') {
            const infoElement = groupContact.querySelector('.contact-info');
            if (infoElement) {
                const mutedIcon = document.createElement('span');
                mutedIcon.className = 'material-icons group-muted-icon';
                mutedIcon.textContent = 'volume_off';
                mutedIcon.title = 'This group is muted';
                infoElement.appendChild(mutedIcon);
            }
        }
    }
    
    // If the group chat is currently open, update the message area
    const messagePanel = document.querySelector('.messages-panel');
    const recipientName = document.querySelector('.recipient-info h3');
    
    if (messagePanel && recipientName && recipientName.textContent === groupName) {
        // Check if muted indicator exists and handle accordingly
        let mutedIndicator = messagePanel.querySelector('.group-muted-indicator');
        
        if (newStatus === 'Muted' && !mutedIndicator) {
            // Add muted indicator
            mutedIndicator = document.createElement('div');
            mutedIndicator.className = 'group-muted-indicator';
            mutedIndicator.innerHTML = '<span class="material-icons">volume_off</span> This group is muted. Messages cannot be sent until an admin unmutes it.';
            
            // Insert after the header
            const header = messagePanel.querySelector('.message-header');
            if (header) {
                messagePanel.insertBefore(mutedIndicator, header.nextSibling);
            }
            
            // Disable input field
            const inputField = messagePanel.querySelector('.message-input input');
            const sendButton = messagePanel.querySelector('.send-button');
            if (inputField) {
                inputField.disabled = true;
                inputField.placeholder = 'Group is muted';
            }
            if (sendButton) {
                sendButton.disabled = true;
                sendButton.classList.add('disabled');
            }
            
        } else if (newStatus === 'Active' && mutedIndicator) {
            // Remove muted indicator
            mutedIndicator.remove();
            
            // Enable input field
            const inputField = messagePanel.querySelector('.message-input input');
            const sendButton = messagePanel.querySelector('.send-button');
            if (inputField) {
                inputField.disabled = false;
                inputField.placeholder = 'Type a message...';
            }
            if (sendButton) {
                sendButton.disabled = false;
                sendButton.classList.remove('disabled');
            }
        }
    }
}

/**
 * Ban or unban a member from the group
 * @param {string} groupId - The ID of the group
 * @param {string} memberId - The ID of the member to ban/unban
 * @param {string} memberName - Name of the member for confirmation message
 * @param {string} currentStatus - Current status of the member
 */
export async function toggleBanMember(groupId, memberId, memberName, currentStatus) {
    const isBanned = currentStatus === 'Banned';
    const action = isBanned ? 'unban' : 'ban';
    const newStatus = isBanned ? 'Active' : 'Banned';

    const confirmed = RemindLibrary.customConfirm(`Are you sure you want to ${action} ${memberName}?${!isBanned ? ' This will remove them from the group and prevent them from rejoining.' : ''}`);
    
    if (confirmed) {
        fetchDataOrsendData("./Communication/Message.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                Type: 'ToggleBanMember',
                GroupID: groupId,
                MemberID: memberId,
                Status: newStatus
            })
        })
        .then(data => {
            if (data.status === 'success') {
                RemindLibrary.showErrorToast(`${memberName} has been ${action}ned`);
                // Refresh member list to show updated status
                viewGroupMembers(undefined, groupId);
            } else {
                RemindLibrary.showErrorToast(`Failed to ${action} member: ${data.message || 'Unknown error'}`);
            }
        })
        .catch(error => {
            console.error(`Error ${action}ning member:`, error);
            RemindLibrary.showErrorToast(`Failed to ${action} member`);
        });
    }
}

// Helper function to get current user's ID - Updated to use email fallback
function getUserId() {
    const userId = getCookieValue('UID');
    if (userId) return userId;
    
    // If UID not available, use EMAIL as an alternative identifier
    return getCookieValue('EMAIL');
}

// Helper function to determine current user's role in the group - Updated to check by email if needed
function getUserRoleInGroup(members) {
    const userId = getUserId();
    // First try to find by ID
    let currentUserMember = members.find(member => member.id === userId);
    
    // If not found and userId looks like an email address
    if (!currentUserMember && userId && userId.includes('@')) {
        // Try to find by email
        currentUserMember = members.find(member => 
            member.email && member.email.toLowerCase() === userId.toLowerCase()
        );
    }
    
    return currentUserMember ? currentUserMember.role : 'MEMBER';
}

// Update getCookieValue to be more robust and case-insensitive
function getCookieValue(item) {
    // Split document.cookie into an array of "name=value" strings.
    const cookies = document.cookie.split(';');
    
    // Loop through each cookie.
    for (let cookie of cookies) {
        // Split each cookie into name and value, and trim extra spaces.
        let [name, value] = cookie.split('=').map(c => c.trim());
        
        // Check if the name matches the requested cookie (case insensitive)
        if (name.toLowerCase() === item.toLowerCase()) {
            // Return the decoded value
            return decodeURIComponent(value);
        }
    }
    
    console.warn(`Cookie '${item}' not found`);
    return null;
}

function validateEmail(email) {
	const re = /\S+@gmail\.com/;

	return re.test(email);
}