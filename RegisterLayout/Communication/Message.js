import {
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
} from './CommunicationAdmin.js';

import RemindLibrary from '../RemindLibrary.js';

document.addEventListener('DOMContentLoaded', function() {
    // Existing tab functionality
	const createContactBtn = document.getElementById('addContactBtn');
	const messagepanel = document.querySelectorAll('.contacts-panel');
    const tabButtons = document.querySelectorAll('.tab-button');
    const createGroupBtn = document.getElementById('createGroupBtn');
	const contactsPanelGroup = document.querySelector('.contacts-panel.group');
	const contactsPanelDM = document.querySelector('.contacts-panel.DirectMessages');

	console.log('Message Panel:', messagepanel);
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Clear all active contacts when switching tabs
            document.querySelectorAll('.contact-item').forEach(contact => {
                contact.classList.remove('active');
            });
            
            const tabType = this.dataset.tab;
            // Show/hide create group button based on active tab
            if (tabType === 'groups') {
				createContactBtn.style.display = 'none';
                createGroupBtn.style.display = 'flex';
				contactsPanelGroup.classList.remove('hidden');
				contactsPanelDM.classList.add('hidden');
                
                // Clear the message panel when switching tabs
                const messagepanel = document.querySelector('.messages-panel');
                messagepanel.innerHTML = '<div class="select-conversation"><span>No conversation selected</span>Select a conversation from the sidebar to start messaging</div>';
            } else {
				createContactBtn.style.display = 'flex';
                createGroupBtn.style.display = 'none';
				contactsPanelGroup.classList.add('hidden');
				contactsPanelDM.classList.remove('hidden');
                
                // Clear the message panel when switching tabs
                const messagepanel = document.querySelector('.messages-panel');
                messagepanel.innerHTML = '<div class="select-conversation"><span>No conversation selected</span>Select a conversation from the sidebar to start messaging</div>';
            }
        });
    });
	
	loadDefaultPage();
	
	setTimeout(function() {
		
		addEventListenerToMessage();
        // Remove duplicate function calls
        setupSendButton();
		
    }, 500);

    // Initially hide the button if not on groups tab
    if (!document.querySelector('.contacts-panel.group').classList.contains('hidden')) {// this 
    }else{
		createGroupBtn.style.display = 'none';
	}
    createGroupBtn.addEventListener('click', function() {
      GroupForm();
    });

	createContactBtn.addEventListener('click', function() {
	  DirectMessageForm();
	});
	setInterval(ContinousUpdatePage, 1000);
});

function GroupForm() { 
	// Create overlay for the modal
	const overlay = document.createElement('div');
	overlay.className = 'group-form-overlay';
	overlay.id = 'group-form-overlay';
	
	// Create the form container
	const GroupForm = document.createElement('div');
	GroupForm.className = 'group-form';
	GroupForm.id = 'group-form';
	
	// Add title
	const title = document.createElement('h3');
	title.textContent = 'Create a New Group';
	GroupForm.appendChild(title);
	
	// Close button
	const closeButton = document.createElement('button');
	closeButton.className = 'close-form';
	closeButton.innerHTML = '&times;'; // × symbol
	closeButton.addEventListener('click', () => {
		document.body.removeChild(overlay);
	});
	GroupForm.appendChild(closeButton);
	
	// Group name input
	const GroupName = document.createElement('input');
	GroupName.type = 'text';
	GroupName.placeholder = 'Group Name';
	GroupName.className = 'group-name';
	GroupName.id = 'group-name';

	const GroupNameErrorMessage = document.createElement('p');
	GroupNameErrorMessage.className = 'group-name-error';
	GroupNameErrorMessage.textContent = '';
	GroupNameErrorMessage.style.display = 'none';
	GroupNameErrorMessage.style.color = 'red';

	// Group description input
	const GroupDesc = document.createElement('input');
	GroupDesc.type = 'text';
	GroupDesc.placeholder = 'Group Description';
	GroupDesc.className = 'group-desc';
	GroupDesc.id = 'group-desc';

	// Group members input
	const GroupMembers = document.createElement('input');
	GroupMembers.type = 'text';
	GroupMembers.placeholder = 'Emails of Group Members (comma separated)';
	GroupMembers.className = 'group-members';
	GroupMembers.id = 'group-members';
	
	const EmailErrorMessage = document.createElement('p');
	EmailErrorMessage.className = 'email-error';
	EmailErrorMessage.textContent = '';
	EmailErrorMessage.style.display = 'none';
	EmailErrorMessage.style.color = 'red';

	// Create button
	const GroupSubmit = document.createElement('button');
	GroupSubmit.textContent = 'Create Group';
	GroupSubmit.className = 'group-submit';
	GroupSubmit.id = 'group-submit';

	// Add form event handler
	const adminEmail = getCookieValue('EMAIL');
	GroupSubmit.addEventListener('click', function() {
		let groupmemberArray = GroupMembers.value.split(',').map(email => email.trim());
		groupmemberArray.push(adminEmail);
		console.log('Group members:', groupmemberArray);
		const GroupData = {
			name: GroupName.value.trim(),
			description: GroupDesc.value.trim(),
			members: groupmemberArray // it should be an array of emails
		}

		console.log('Group Data:', GroupData);
		EmailErrorMessage.style.display = 'none';
		GroupNameErrorMessage.style.display = 'none';
		// Form validation
		if (!GroupName.value.trim() || !GroupMembers.value.trim()) {
			GroupNameErrorMessage.textContent = 'Please enter a group name';
			EmailErrorMessage.textContent = 'Please enter group members';
			EmailErrorMessage.style.display = 'block';
			GroupNameErrorMessage.style.display = 'block';
		return;
		}
		let errorMessage = [];
		GroupMembers.value.split(',').forEach(email => {
			let UserOwnEmail = getCookieValue('EMAIL');
			if (UserOwnEmail === email.trim()) {
				errorMessage.push('You cannot add yourself to the group');
			}
			if (!validateEmail(email.trim())) {
				errorMessage.push('Invalid email address');
			}

		});
		if (errorMessage.length > 0) {
			EmailErrorMessage.textContent = errorMessage.join('. '); // Join errors with a dot
			EmailErrorMessage.style.display = 'block';
		} else {
			EmailErrorMessage.style.display = 'none'; // Hide if no errors
			CheckExistEmail(GroupData);
			overlay.remove();
		}

	},{ once: true });

	// Add all elements to the form
	GroupForm.appendChild(GroupName);
	GroupForm.appendChild(GroupNameErrorMessage);
	GroupForm.appendChild(GroupDesc);
	GroupForm.appendChild(GroupMembers);
	GroupForm.appendChild(EmailErrorMessage);
	GroupForm.appendChild(GroupSubmit);
	
	// Add the form to the overlay and the overlay to the body
	overlay.appendChild(GroupForm);
	document.body.appendChild(overlay);
	
	// Focus on the first field
	GroupName.focus();
}

function CheckExistEmail(GroupData){
	// Check if the email exists in the database
	console.log(GroupData.members);
	const overlay = document.getElementById('group-form-overlay');
	const EmailErrorMessage = document.querySelector('.email-error');
	const GroupMemberID = document.querySelector('.group-members');
	fetchDataOrsendData("./Communication/Message.php?Type=CheckEmail&Email="+GroupData.members, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		}
	})
	.then(data => {
		console.log('Email checked:', data);
		let checkIfAllEmaiExist = true; // Properly declare the variable with let
		data.forEach(email => {
			console.log('Email:', email);
			if (email.status === 'warning') {
				EmailErrorMessage.textContent = 'Email not found Please enter a valid email address';
				EmailErrorMessage.style.display = 'block';
				GroupMemberID.value = '';
				GroupMemberID.focus();
				checkIfAllEmaiExist = false;
			}else if(email.status === 'error'){
				EmailErrorMessage.textContent = 'Email'+ email.email +' not found Please enter a valid email address';
				EmailErrorMessage.style.display = 'block';
				GroupMemberID.value = '';
				GroupMemberID.focus();
				checkIfAllEmaiExist = false;
			}
		});
		if (checkIfAllEmaiExist) { // Use the properly declared variable 
			console.log('Email found Creating Group');

		let GroupMembersNum = GroupData.members.length;
		
		if (!GroupMembersNum) {
			return;
		}
		// Get form data
		const NewgroupData = {
		name: GroupData.name,
		description: GroupData.description,
		members: GroupData.members,
		role: "MEMBER"
		};
		createGroup(NewgroupData);

		return;
		}else if(data.status === 'warning'){
			RemindLibrary.showErrorToast('Email not found');
		}else {
			EmailErrorMessage.textContent = 'Email not found Please enter a valid email address';
			EmailErrorMessage.style.display = 'block';
			GroupMemberID.value = '';
			GroupMemberID.focus();
		}
	})
	.catch(error => {
		console.error('Email check error:', error);
		RemindLibrary.showErrorToast('Failed to check email');
		// Handle the error appropriately
	});
}

function validateEmail(email) {
	const re = /\S+@gmail\.com/;

	return re.test(email);
}

function ContinousUpdatePage(){
	// First fetch updates group contacts
	fetchDataOrsendData("./Communication/Message.php?Type=GetGroupContactList", {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	})
	.then(data => {
		if (data.status === 'success') {
			const NewData = data.message;
			NewData.forEach(contact => {
				let lastIndex = contact.GroupName.lastIndexOf("_");
				let groupName = contact.GroupName.substring(0, lastIndex);
				EditGroupContactList({
					ContactID: contact.GroupID,
					name: groupName,
					message: contact.GroupMessages,
					time: contact.GroupMessageTime
				});
				sortContactsByTime('.contacts-panel.group .contacts-list');
			});
		}
	})
	.catch(error => {
		console.error('Contact List error:', error);
	});

	// Second fetch updates direct message contacts - fixed endpoint name
	fetchDataOrsendData("./Communication/Message.php?Type=GetContactListForDM", {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	})
	.then(data => {
		if (data.status === 'success') {
			const NewData = data.message;
			// Updated property names to match API response
			NewData.forEach(contact => {
				EditDMContactList({
					ContactID: contact.ID,
					name: contact.friendName,
					message: contact.MessageText,
					time: contact.created_at
					});
				sortContactsByTime('.contacts-panel.DirectMessages .contacts-list');
			});
		}
	})
	.catch(error => {
		console.error('Contact List error:', error);
	});
	
	// Add this line to update active conversation
	updateActiveConversation();
}

// Improve the updateActiveConversation function for better message tracking
function updateActiveConversation() {
    // Check if there's an active conversation
    const activeContact = document.querySelector('.contact-item.active');
    if (!activeContact) return; // No active conversation to update
    
    const contactId = activeContact.id;
    if (!contactId) return;
    
    // Track message IDs to prevent duplicates
    const existingMessageIds = new Set();
    const existingContentIds = new Set();
    
    // Get existing message elements and track their IDs
    const messageElements = document.querySelectorAll('.message-content .message');
    messageElements.forEach(el => {
        if (el.dataset.messageId) {
            existingMessageIds.add(el.dataset.messageId);
        }
        if (el.dataset.contentId) {
            existingContentIds.add(el.dataset.contentId);
        }
    });
    
    // Get the newest timestamp if available
    let lastMessageTime = 0;
    if (messageElements.length > 0) {
        // Try to get the last message's timestamp
        const lastMessage = messageElements[messageElements.length - 1];
        const timeElement = lastMessage.querySelector('.message-time');
        if (timeElement) {
            const timestampAttr = timeElement.getAttribute('data-timestamp');
            if (timestampAttr) {
                try {
                    lastMessageTime = new Date(timestampAttr).getTime();
                } catch (e) {
                    console.warn('Failed to parse last message timestamp:', e);
                    lastMessageTime = 0;
                }
            }
        }
    }
    
    // Determine if this is a group chat or direct message
    const isGroupChat = !!activeContact.closest('.contacts-panel.group');
    
    if (isGroupChat) {
        // Fetch latest group messages
        fetchDataOrsendData(`./Communication/Message.php?Type=GetMessageInfo&GroupID=${contactId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        })
        .then(response => {
            if (response.status === 'success' && response.message && Array.isArray(response.message)) {
                const messages = response.message;
                
                // Find messages that are newer than our last displayed message
                // and filter out any we already have by content ID
                const newMessages = messages.filter(msg => {
                    // Skip if we already have this message by content ID (if available)
                    if (msg.id && existingContentIds.has(msg.id)) {
                        return false;
                    }
                    
                    // Check timestamp if available
                    if (!msg.timestamp) return false;
                    
                    try {
                        const msgTime = new Date(msg.timestamp).getTime();
                        // Get messages newer than our last one, with a small buffer
                        return msgTime > (lastMessageTime + 100);
                    } catch (e) {
                        console.warn('Error comparing message timestamps:', e);
                        return false;
                    }
                });
                
                // If we have new messages, process and append them
                if (newMessages.length > 0) {
                    console.log(`Found ${newMessages.length} new group messages to display`);
                    
                    // Process into our standard message format
                    const processedMessages = SaveGroupMessageIntoArray(newMessages);
                    
                    // Append each new message to the chat WITHOUT auto-scrolling
                    let anyNewMessagesAdded = false;
                    processedMessages.forEach(msg => {
                        appendMessageToChat(msg);
                        anyNewMessagesAdded = true;
                    });
                    
                    // Only scroll to bottom once after all messages are added
                    if (anyNewMessagesAdded) {
                        scrollToBottom();
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error updating group conversation:', error);
        });
    } else {
        // Fetch latest DM messages
        fetchDataOrsendData(`./Communication/Message.php?Type=GetMessageInfoForDM&Contact_ID=${contactId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        })
        .then(data => {
            if (data.status === 'success' && data.message && Array.isArray(data.message)) {
                // Process messages to find ones newer than our last displayed message
                const newMessages = data.message.filter(msg => {
                    // Skip if we already have this message by content ID (if available)
                    if (msg.id && existingContentIds.has(msg.id)) {
                        return false;
                    }
                    
                    // Try to get the message time
                    const msgTimeStr = msg.time || msg.created_at || msg.timestamp;
                    if (!msgTimeStr) return false;
                    
                    try {
                        const msgTime = new Date(msgTimeStr).getTime();
                        // Get messages newer than our last one, with a small buffer
                        return msgTime > (lastMessageTime + 100);
                    } catch (e) {
                        console.warn('Error comparing DM timestamps:', e);
                        return false;
                    }
                });
                
                if (newMessages.length > 0) {
                    console.log(`Found ${newMessages.length} new DM messages to display`);
                    
                    // Append each new message to the chat WITHOUT auto-scrolling
                    let anyNewMessagesAdded = false;
                    newMessages.forEach(msg => {
                        const currentUsername = getCookieValue('USERNAME');
                        const isCurrentUser = msg.sender === 'You' || msg.sender === currentUsername;
                        
                        appendMessageToChat({
                            id: msg.id, // Add message ID if available for deduplication
                            type: isCurrentUser ? 'sent' : 'received',
                            sender: isCurrentUser ? 'You' : msg.sender,
                            content: msg.content || msg.message || msg.MessageText,
                            time: msg.time || msg.created_at || "now",
                            timestamp: msg.time || msg.created_at // Store original timestamp
                        });
                        anyNewMessagesAdded = true;
                    });
                    
                    // Only scroll to bottom once after all messages are added
                    if (anyNewMessagesAdded) {
                        scrollToBottom();
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error updating DM conversation:', error);
        });
    }
}

// Adding the missing EditDMContactList function
function EditDMContactList(DMlistData){
	const DMContactList = document.querySelectorAll('.contacts-list.DirectMessages .contact-item');
	DMContactList.forEach(contact => {
		if (contact.id === String(DMlistData.ContactID)) {
			contact.querySelector('h4').textContent = DMlistData.name;
			contact.querySelector('p').textContent = DMlistData.message;
			const timeElement = contact.querySelector('.contact-time');
			timeElement.setAttribute('data-timestamp', DMlistData.time);
			timeElement.textContent = DisplayHourMin(DMlistData.time);
		}
	});
}

function EditGroupContactList(GrouplistData){
	const GroupContactList = document.querySelectorAll('.contacts-list.group .contact-item');
	GroupContactList.forEach(contact => {
		if (contact.id === String(GrouplistData.ContactID)) {
			contact.querySelector('h4').textContent = GrouplistData.name;
			contact.querySelector('p').textContent = GrouplistData.message;
			const timeElement = contact.querySelector('.contact-time');
			timeElement.setAttribute('data-timestamp', GrouplistData.time);
			timeElement.textContent = DisplayHourMin(GrouplistData.time);
		}
	});
}

function createGroup(GroupData) {

    // Add Type to the GroupData object instead of the fetch options
    GroupData.Type = 'createGroup';

	// Send the group data to the server using POST method
	fetchDataOrsendData("./Communication/Message.php", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify(GroupData)
	})
	.then(data => {
		console.log('Group created:', data);
		renderGroups(data.message);

	})
	.catch(error => {
		console.error('Group create error:', error);
		RemindLibrary.showErrorToast('Failed to create group');
		// Handle the error appropriately
	});
}

function loadDefaultPage() {
	// Fetch group contact list from server
	fetchGroupContactListFromServer();
	// Fetch DM contact list from server
	VerifyDMContactListExist();

    // Set initial message panel state
    const messagepanel = document.querySelector('.messages-panel');
    messagepanel.innerHTML = '<div class="select-conversation"><span>Welcome to FocusFlow Chat</span>Select a conversation from the sidebar to start messaging</div>';
}

function createdTime() {
	const date = new Date();
	const options = {
		timeZone: 'Asia/Kuala_Lumpur', // Specify desired timezone
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		hour12: false
	};
	return (date.toLocaleString('en-US', options));
}

function GetTime(){
	const date = new Date();
	const options = {
		timeZone: 'Asia/Kuala_Lumpur', // Specify desired timezone
		hour: 'numeric',
		minute: 'numeric',
		hour12: false
	};
	console.log(date.toLocaleString('en-US', options).trim(" "));
	return (date.toLocaleString('en-US', options));
}

//GroupData must have name, message, members, time, id, role, description, status
function renderGroups(GroupData) {

	// Clear existing content
	let contactpanel = document.querySelector('.contacts-panel.group');
	let contactlist = document.querySelector('.contacts-list.group');
	// Create the group item
	let Group = document.createElement('div');
	Group.className = 'contact-item';
	Group.id = GroupData.id;
	Group.dataset.groupName = GroupData.name;

	let avatar = document.createElement('div');
	avatar.className = 'contact-avatar';
	Group.appendChild(avatar);

	let avatarspan = document.createElement('span');
	avatarspan.className = 'material-icons';
	avatarspan.textContent = 'group';
	avatar.appendChild(avatarspan);

	let groupInfo = document.createElement('div');
	groupInfo.className = 'contact-info';
	Group.appendChild(groupInfo);

	let groupInfoHeader = document.createElement('h4');
	groupInfoHeader.textContent = GroupData.name;
	groupInfo.appendChild(groupInfoHeader);

	let groupInfoDesc = document.createElement('p');
	groupInfoDesc.textContent = GroupData.message? GroupData.message : 'Enter something here';
	groupInfo.appendChild(groupInfoDesc);

	let groupDate = document.createElement('div');
	groupDate.className = 'contact-time';
	groupDate.id = GroupData.Time ? GroupData.Time : createdTime();
	if (GroupData.Time){
		groupDate.textContent = DateAndTimeDisplay(GroupData.Time);
	}else{
		groupDate.textContent = GetTime();
	}
	Group.appendChild(groupDate);

	
	contactlist.appendChild(Group);
	contactpanel.appendChild(contactlist);


	// Add event listener to the newly created group
    Group.addEventListener('click', function() {
        const contactItems = document.querySelectorAll('.contact-item');
        contactItems.forEach(contact => contact.classList.remove('active'));
        this.classList.add('active');
        
    });
	
	console.log('Group added:', GroupData.name);
	
}

function DisplayHourMin(lastTime) {
    // Early return for null, undefined or empty values
    if (!lastTime) {
        return "now";
    }
    
    // Handle when lastTime is just a time (HH:MM or HH:MM:SS)
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(lastTime)) {
        return lastTime.substring(0, 5); // Return just HH:MM
    }
    
    const oneDayMs = 24 * 60 * 60 * 1000; // 86400000 ms
    const date = new Date();
    const options = {
        timeZone: 'Asia/Kuala_Lumpur',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    };
    
    try {
        let newTime = formatDate(lastTime);
        let newtimeStamp = getTimestamp(newTime);
        const currentTime = date.toLocaleString('en-US', options);
        const currentTimestamp = new Date(currentTime).getTime();
        const timeDifference = currentTimestamp - newtimeStamp;
        
        // Check if lastTime contains a space and has date-time parts
        let dateTimeParts = lastTime.split(" ");
        let datePart = dateTimeParts[0] || "";
        let timePart = dateTimeParts[1] || "";
        
        if (timeDifference < 60000) {
            return "now"; // Less than 1 min ago
        } else if (timeDifference < oneDayMs) {
            // If we have a time part, use it, otherwise format from the full timestamp
            return timePart ? timePart.slice(0, 5) : "today"; // Return HH:MM
        } else if (timeDifference < oneDayMs * 2) {
            return "yesterday";
        } else if (datePart && GetCurrentYear() !== datePart.slice(0, 4)) {
            return datePart.replace(/-/g, "/");
        } else if (datePart) {
            // Return MM/DD format from the date part if available
            return datePart.slice(5, 10).replace("-", "/");
        } else {
            // Fallback if format is unexpected
            return formatShortDate(lastTime);
        }
    } catch (e) {
        console.warn("Error in DisplayHourMin:", e, "Time value was:", lastTime);
        return "unknown time";
    }
}

// Helper function to format dates when standard parsing fails
function formatShortDate(dateString) {
    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return `${date.getMonth() + 1}/${date.getDate()}`;
        }
        return dateString;
    } catch (e) {
        return dateString;
    }
}

// display time when the page is loaded
function DateAndTimeDisplay(lastTime){
	if (!lastTime) {
        return "now";
    }
	const oneDayMs = 24 * 60 * 60 * 1000; // 86400000 ms
	const date = new Date();
	const options = {
		timeZone: 'Asia/Kuala_Lumpur', // Specify desired timezone
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		hour12: false
	};
	let newTime = formatDate(lastTime);
	let newtimeStamp = getTimestamp(newTime);
	const currentTime = date.toLocaleString('en-US', options);
	const currentTimestamp = new Date(currentTime).getTime();
	const timeDifference = currentTimestamp - newtimeStamp;

	if (timeDifference > oneDayMs){
		return "yesterday";
	}else {
		return lastTime.split(" ")[1];
	}
}

function convertToMilliseconds(timeString) {
    let date = new Date(timeString);
    return date.getTime(); // Returns milliseconds since Unix epoch
}

function GetCurrentYear(){
	const date = new Date();
	const options = {
		timeZone: 'Asia/Kuala_Lumpur', // Specify desired timezone
		year: 'numeric',
		hour12: false
	};
	return (date.toLocaleString('en-US', options));
}

function formatDate(Time) {

	if (Time === "now") {
        const now = new Date();
        return now.toLocaleString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        });
    }
    // Check if Time is undefined or null
    if (!Time) {
        console.warn("Received undefined or null timestamp");
        // Return current time as fallback
        const now = new Date();
        return now.toLocaleString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        });
    }
    
    try {
        let replacements = { "-": "/", " ": ", "};
        let newTime = Time.replace(/[-, ]/g, match => replacements[match]);
        let date = new Date(newTime);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            throw new Error("Invalid date created");
        }

        // Extract components
        let month = date.getMonth() + 1; // Months are 0-based
        let day = date.getDate();
        let year = date.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();

        // Format with leading zeros if needed
        month = month.toString();
        day = day.toString();
        hours = hours.toString().padStart(2, "0");
        minutes = minutes.toString().padStart(2, "0");
        seconds = seconds.toString().padStart(2, "0");

        return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds}`;
    } catch (e) {
        console.error("Error formatting date:", e, "Time value was:", Time);
        return "Invalid date";
    }
}

function getTimestamp(dateString) {
    return new Date(dateString).getTime();
}
//name, message, messageType, membersRole, time, id, role, description, status
async function renderMessagePage(MessagePageData){
	console.log('Render Message Page:', MessagePageData);
	const AllContact = document.querySelectorAll('.contact-item');
    
	let ContactID = null;
	let isGroupChat = false;

	//Check if user is a blocker
	AllContact.forEach(function(contact) {  // Directly use forEach on NodeList
		if (contact.classList.contains('active')) {
            console.log('Active contact found:', contact.id);
			ContactID = contact.id; // Update ContactID if active class is found
			// Check if this is a group chat by checking which panel it belongs to
			isGroupChat = !!contact.closest('.contacts-panel.group');
		}
	});

    if (!ContactID) {
        console.warn("No active contact found. Cannot render message page.");
        return;
    }
	let isUseraBlocker = await isUserBlocker(ContactID);
	// console.log('isUseraBlocker:', isUseraBlocker);

	// console.log(MessagePageData)
	let messagepanel = document.querySelector('.messages-panel');
	// Clear existing content
	messagepanel.innerHTML = '';
	// Create message header
	let messageHeader = document.createElement('div');
	messageHeader.className = 'message-header';
	messagepanel.appendChild(messageHeader);

	let messageRecipient = document.createElement('div');
	messageRecipient.className = 'message-recipient';
	messageHeader.appendChild(messageRecipient);

	let recipientAvatar = document.createElement('div');
	recipientAvatar.className = 'recipient-avatar';
	messageRecipient.appendChild(recipientAvatar);

	let avatarSpan = document.createElement('span');
	avatarSpan.className = 'material-icons';
	avatarSpan.textContent = isGroupChat ? 'group' : 'account_circle'; // Use 'group' icon for group chats
	recipientAvatar.appendChild(avatarSpan);

	let recipientInfo = document.createElement('div');
	recipientInfo.className = 'recipient-info';
	messageRecipient.appendChild(recipientInfo);

	let recipientName = document.createElement('h3');
	recipientName.textContent = MessagePageData?.name || 'None';
	recipientInfo.appendChild(recipientName);

	let recipientStatus = document.createElement('p');
	
	if (isGroupChat) {
		// For group chats, show member count instead of status
		// First, fetch the current group member count
		fetchDataOrsendData(`./Communication/Message.php?Type=GetGroupMembers&GroupID=${ContactID}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json"
			}
		})
		.then(response => {
			if (response.status === 'success' && Array.isArray(response.message)) {
				const memberCount = response.message.length;
				recipientStatus.textContent = `${memberCount} member${memberCount !== 1 ? 's' : ''}`;
				recipientStatus.style.color = "#5e72e4"; // Use primary color for member count
			} else {
				recipientStatus.textContent = 'Loading members...';
			}
		})
		.catch(error => {
			console.error('Error fetching group members:', error);
			recipientStatus.textContent = 'Unknown members';
		});
	} else {
		// For direct messages, keep showing user status
		recipientStatus.textContent = MessagePageData?.status || 'Offline';
		if (recipientStatus && recipientStatus.textContent.trim().toLowerCase() === "offline") {
			recipientStatus.style.color = "red";
		}

		if (isUseraBlocker) {
			const messagepanel = document.querySelector('.messages-panel');
			
			const BlockerMessage = document.createElement('div');
			BlockerMessage.className = 'blocked-banner';
			BlockerMessage.innerHTML = `
				<span class="material-icons">block</span>
				<span>You've blocked ${MessagePageData.name}. You can see previous messages but cannot send new ones until You unblock him.</span>
			`;
			messagepanel.appendChild(BlockerMessage);
		}

	}
	recipientInfo.appendChild(recipientStatus);

	let messageActions = document.createElement('div');
	messageActions.className = 'message-actions';
	messageHeader.appendChild(messageActions);

	let actionButton1 = document.createElement('button');
	actionButton1.className = 'action-button';
	messageActions.appendChild(actionButton1);

	let actionButton1Span = document.createElement('span');
	actionButton1Span.className = 'material-icons';
	actionButton1Span.textContent = 'call';
	actionButton1.appendChild(actionButton1Span);

	let actionButton2 = document.createElement('button');
	actionButton2.className = 'action-button';
	messageActions.appendChild(actionButton2);

	let actionButton2Span = document.createElement('span');
	actionButton2Span.className = 'material-icons';
	actionButton2Span.textContent = 'videocam';
	actionButton2.appendChild(actionButton2Span);

	let actionButton3 = document.createElement('button');
	actionButton3.className = 'action-button more-options-button';
	messageActions.appendChild(actionButton3);

	let actionButton3Span = document.createElement('span');
	actionButton3Span.className = 'material-icons';
	actionButton3Span.textContent = 'more_vert';
	actionButton3.appendChild(actionButton3Span);
	
	// Create dropdown menu for more options with different options based on chat type
	let optionsDropdown = document.createElement('div');
	optionsDropdown.className = 'options-dropdown hidden';

	// Fetch user status for direct messages
	if (!isGroupChat) {
		fetchDataOrsendData("./Communication/Message.php?Type=GetUserStatus&Contact_ID="+ContactID, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json"
			}
		})
		.then(data => {
			console.log('User status:', data);
			if (data.status === 'success') {
				recipientStatus.textContent = data.message;
				if (recipientStatus.textContent.trim().toLowerCase() === "offline") {
					recipientStatus.style.color = "red";
				}
			}
		})
		.catch(error => {
			console.error('User status error:', error);
		});
	}

    console.log('Contact ID:', ContactID);

	// Add menu options based on whether this is a group or direct message
	const menuOptions = isGroupChat ? 
		// Group chat options - different options for admins vs. regular members
		[
			{ icon: 'group', text: 'View members', action: () => viewGroupMembers(MessagePageData.name, ContactID) },
			// Move rename group option to admin-only section
			...(MessagePageData.membersRole === "ADMIN" ? [
				{ icon: 'edit', text: 'Rename group', action: () => renameGroup(MessagePageData.name, ContactID) },
				{ icon: 'manage_accounts', text: 'Manage group', action: () => manageGroup(MessagePageData.name, ContactID) }
			] : []),
			{ icon: 'exit_to_app', text: 'Leave group', action: () => leaveGroup(MessagePageData.name, ContactID) }
		] : 
		// Direct message options (unchanged)			
		[
			{ 
				icon: isUseraBlocker ? 'check_circle' : 'block', 
				text: isUseraBlocker ? 'Unblock' : 'Block', 
				action:isUseraBlocker ?
				() => unblockUser(MessagePageData.name, ContactID) :
				() => blockUser(MessagePageData.name, ContactID) 
			},
			{ icon: 'person', text: 'View profile', action: () => viewProfile(MessagePageData.name) },
			{ icon: 'flag', text: 'Report', action: () => reportUser(MessagePageData.name) }
		];
	
	menuOptions.forEach(option => {
		const menuItem = document.createElement('div');
		menuItem.className = 'dropdown-item';
		
		const icon = document.createElement('span');
		icon.className = 'material-icons';
		icon.textContent = option.icon;
		
		const text = document.createElement('span');
		text.textContent = option.text;
		
		menuItem.appendChild(icon);
		menuItem.appendChild(text);
		menuItem.addEventListener('click', () => {
			option.action();
			optionsDropdown.classList.add('hidden');
		});
		
		optionsDropdown.appendChild(menuItem);
	});
	
	// Add dropdown to the page
	messageActions.appendChild(optionsDropdown);
	
	// Toggle dropdown when more options button is clicked
	actionButton3.addEventListener('click', function(e) {
		e.stopPropagation();
		optionsDropdown.classList.toggle('hidden');
	});
	
	// Close dropdown when clicking elsewhere
	document.addEventListener('click', function() {
		if (!optionsDropdown.classList.contains('hidden')) {
			optionsDropdown.classList.add('hidden');
		}
	});

	let messageContent = document.createElement('div');
	messageContent.className = 'message-content';
	messagepanel.appendChild(messageContent);

	let messages = null;
	if(MessagePageData.messages.length === 0){
		messages = "Enter Something to continue"
	}
	console.log('Message page rendered:', MessagePageData.messages);
	messages = MessagePageData.messages;

	// Create messages with sender profiles
	let previousTime = null; // Move this outside the loop

	// Convert time to milliseconds and sort messages in descending order (newest first)
	messages.sort((a, b) => convertToMilliseconds(a.time) - convertToMilliseconds(b.time));
	
	const sortedMessages = [];
	
	messages.forEach(msg => {
		const currentUsername = getCookieValue('USERNAME');
		const isCurrentUser = msg.sender === 'You' || msg.sender === currentUsername;
		let NewTime = convertToMilliseconds(msg.time);
	
		if (previousTime === null || NewTime > previousTime) {
			// console.log('New Time:', NewTime, 'Previous Time:', previousTime);
			previousTime = NewTime;
		}
	
		const ProcessedMsg = {
			type: isCurrentUser ? 'sent' : 'received',
			sender: msg.sender === currentUsername ? 'You' : msg.sender,
			content: msg.content,
			time: DisplayHourMin(msg.time)
		};
	
		sortedMessages.push(ProcessedMsg); // Store sorted messages in an array
	});
	
	// Now, sortedMessages contains the messages in ascending order based on time

	// console.log('Sorted Messages:', sortedMessages);
	
	// You can now append them to the chat in the correct order
	sortedMessages.forEach(msg => appendMessageToChat(msg));
	
	// After all messages are rendered, THEN scroll to bottom once, with a slight delay
    // Use force=true to ensure we always scroll on initial render
    setTimeout(() => scrollToBottom(true), 100);

	// Message input area
	let messageInput = document.createElement('div');
	
	if (isUseraBlocker) {
		// Disable input field and add a disabled class
		messageInput.classList.add('disabled'); // Add disabled class if user is a blocker
		messageInput.className = 'message-input disabled'; // Add disabled class if user is a blocker

	}else{
		messageInput.className = 'message-input'; // Default class for message input
	}
	messagepanel.appendChild(messageInput);

	let attachmentButton = document.createElement('button');
	attachmentButton.className = 'attachment-button';
	messageInput.appendChild(attachmentButton);

	let attachmentButtonSpan = document.createElement('span');
	attachmentButtonSpan.className = 'material-icons';
	attachmentButtonSpan.textContent = 'attach_file';
	attachmentButton.appendChild(attachmentButtonSpan);

	let inputText = document.createElement('input');
	if (isUseraBlocker) {
		inputText.disabled = true; // Disable input field if user is a blocker
		inputText.placeholder = 'You have blocked this user';
	}else{
		inputText.type = 'text';
		inputText.placeholder = 'Type a message...';
	}
	messageInput.appendChild(inputText);

	let emojiButton = document.createElement('button');
	emojiButton.className = 'emoji-button';
	messageInput.appendChild(emojiButton);

	let emojiButtonSpan = document.createElement('span');
	emojiButtonSpan.className = 'material-icons';
	emojiButtonSpan.textContent = 'sentiment_satisfied_alt';
	emojiButton.appendChild(emojiButtonSpan);

	let sendButton = document.createElement('button');
	sendButton.className = 'send-button';
	sendButton.id = 'sendMessageBtn'; // Add an ID for easier selection

	if (isUseraBlocker) {
		sendButton.disabled = true; // Disable send button if user is a blocker
		sendButton.classList.add('disabled'); // Add disabled class if user is a blocker

	}
	
	messageInput.appendChild(sendButton);

	let sendButtonSpan = document.createElement('span');
	sendButtonSpan.className = 'material-icons';
	sendButtonSpan.textContent = 'send';
	sendButton.appendChild(sendButtonSpan);

	// After creating the message header, check if group is muted and add visual indicator
    if (isGroupChat && MessagePageData.groupStatus === 'Muted') {
        // Check if the current user is an admin
        const isAdmin = MessagePageData.membersRole === 'ADMIN';
        
        console.log('Group mute check - Status:', MessagePageData.groupStatus, 'User role:', MessagePageData.membersRole, 'Is admin:', isAdmin);
        
        // Only show mute indicator and disable input for non-admins
        if (!isAdmin) {
            // Add muted indicator below header
            const mutedIndicator = document.createElement('div');
            mutedIndicator.className = 'group-muted-indicator';
            mutedIndicator.innerHTML = '<span class="material-icons">volume_off</span> This group is muted by an admin. Messages cannot be sent until an admin unmutes it.';
            messagepanel.insertBefore(mutedIndicator, messageContent);
            
            // Disable input field if group is muted
            inputText.disabled = true;
            inputText.placeholder = 'Group is muted';
            sendButton.disabled = true;
            sendButton.classList.add('disabled');
        } else {
            // For admins, show a different indicator but don't disable input
            const mutedIndicator = document.createElement('div');
            mutedIndicator.className = 'group-muted-indicator admin';
            mutedIndicator.innerHTML = '<span class="material-icons">volume_off</span> Group is muted. As an admin, you can still send messages.';
            messagepanel.insertBefore(mutedIndicator, messageContent);
        }
    }

	// After rendering the message content, check if we should show suggestion
    // Only show suggestions for direct messages, never for group contacts
	
    // if (MessagePageData.messages.length === 0 && MessagePageData.name !== 'None' && !isGroupChat) {
    //     // Add a slight delay so the popup appears after the page renders
    //     setTimeout(() => {
    //         showFriendSuggestion({ 
    //             name: MessagePageData.name,
    //             // You could include email if available
    //             // email: MessagePageData.email 
    //         });
    //     }, 300);
    // }
}

function unblockUser(name, ContactID) {
	// Send unblock request to server
	fetchDataOrsendData(`./Communication/Message.php`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({
			Type: 'UnblockUser',
			 ContactID: ContactID // Changed from Contact_ID to match server parameter
		})
	})
	.then(data => {
		console.log('Unblock user response:', data);
		if (data.status === 'success') {
			// Update UI to reflect unblock status
			const messagepanel = document.querySelector('.messages-panel');
			if (!messagepanel) {
                console.error("Message panel not found.");
                return;
            }
			
			// Remove the blocked banner if exists
			const blockerMessage = document.querySelector('.blocked-banner');
			if (blockerMessage) {
				blockerMessage.remove();
			}
			
			// Fix input field re-enabling
			const messageInputContainer = messagepanel.querySelector('.message-input');
			if (messageInputContainer) {
				// Remove disabled class from container
				messageInputContainer.classList.remove('disabled');
				
				// Enable the input field
				const inputField = messageInputContainer.querySelector('input');
				if (inputField) {
					inputField.disabled = false;
					inputField.type = 'text';
					inputField.placeholder = 'Type a message...';
					console.log('Input field re-enabled:', inputField);
				} else {
					console.error('Input field not found');
				}
				
				// Re-enable send button
				const sendButton = messageInputContainer.querySelector('.send-button');
				if (sendButton) {
					sendButton.disabled = false;
					sendButton.classList.remove('disabled');
				}
			} else {
				console.error('Message input container not found');
			}
			
			// Reload the conversation to refresh UI completely
			const activeContact = document.querySelector('.contact-item.active');

            const optionsDropdown = messagepanel.querySelector('.options-dropdown');
            if (optionsDropdown) {
                // Instead of cloning, directly update the existing option
                const blockOption = optionsDropdown.querySelector('.dropdown-item:first-child');
                if (blockOption) {
                    // Update the icon and text directly
                    const icon = blockOption.querySelector('.material-icons');
                    const text = blockOption.querySelector('span:last-child');
                    
                    if (icon) icon.textContent = 'block';
                    if (text) text.textContent = 'Block';
                    
                    // Remove all existing listeners (key fix)
                    blockOption.replaceWith(blockOption.cloneNode(true));
                    
                    // Re-select the new cloned element
                    const newBlockOption = optionsDropdown.querySelector('.dropdown-item:first-child');
                    
                    // Add new click listener with proper closure for parameters
                    newBlockOption.addEventListener('click', function() {
                        console.log('Block user clicked:', name, ContactID);
                        blockUser(name, ContactID);
                        optionsDropdown.classList.add('hidden');
                    });
                }
            }

			if (activeContact) {
				// Trigger a re-render of the conversation
				fetchDataOrsendData(`./Communication/Message.php?Type=GetMessageInfoForDM&Contact_ID=${ContactID}`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/json"
					}
				})
				.then(msgData => {
					if (msgData.status === 'success') {
						renderMessagePage({
							name: name,
							messages: msgData.message,
							status: 'Online'
						});
					}
				})
				.catch(err => console.error('Error refreshing messages:', err));
			}
			
			RemindLibrary.showSuccessToast('User unblocked successfully!');
		}
		else {
			RemindLibrary.showErrorToast('Failed to unblock user: ' + (data.message || 'Unknown error'));
		}
	})
	.catch(error => {
		console.error('Unblock user error:', error);
		RemindLibrary.showErrorToast('Failed to unblock user');
	});
}

async function isUserBlocker(ContactID){
	// console.log('Checking if user is a blocker for contact ID:', ContactID);
	const response = await fetchDataOrsendData(
		`./Communication/Message.php?Type=CheckUserBlock&Contact_ID=${ContactID}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json",
			}
		}
	)
	.then(response => {
		console.log('Block status response:', response);
		if (response.status === 'success') {
			return response.message; // Return true or false based on the response
		}
		return false; // Default to not blocked on error
	})
	.catch(error => {
		console.error('Error checking block status:', error);
		return false; // Default to not blocked on error
	});
	return response;
}

/**
 * Adds click event listeners to all contact items in the contacts list.
 * When a contact is clicked, it:
 * 1. Highlights the selected contact by adding 'active' class
 * 2. If the contact item has an ID (represents a group):
 *    - Fetches message information from server via AJAX
 *    - Renders the message page with real data from the server
 * 3. If the contact has no ID:
 *    - Renders the message page with mock conversation data
 * 
 * The function manages the UI state by removing the 'active' class from all contacts
 * and applying it only to the selected contact.
 * 
 * @returns {void}
 */
function addEventListenerToMessage() {
    console.log('Adding event listeners to contacts...');
    
    // Use event delegation for better reliability with dynamically added elements
    document.addEventListener('click', function(event) {
        // Find the closest contact-item parent (if any)
        const contactItem = event.target.closest('.contact-item');
        if (!contactItem) return; // Not a contact item click
        
        console.log('Contact item clicked:', contactItem);

        // Check which panel this contact belongs to
        const isGroupContact = contactItem.closest('.contacts-panel.group');
        const isDMContact = contactItem.closest('.contacts-panel.DirectMessages');
        
        // Get all similar contacts in the same category
        let allContacts;
        if (isGroupContact) {
            allContacts = document.querySelectorAll('.contacts-panel.group .contact-item');
            handleGroupContact(contactItem, allContacts);
        } else if (isDMContact) {
			console.log('DM Contact Clicked');
            allContacts = document.querySelectorAll('.contacts-panel.DirectMessages .contact-item');
            handleDMContact(contactItem, allContacts);
        }
    });
    
    // Helper function for group contacts
    function handleGroupContact(contactItem, allContacts) {
        const name = contactItem.querySelector('h4')?.textContent || 'Unknown';
        console.log('Selected group contact:', name, contactItem.id);
        // Remove active class from all and add to clicked one
        allContacts.forEach(contact => contact.classList.remove('active'));
        contactItem.classList.add('active');
        
        if (contactItem.id) {
            // Show loading indicator
            const messagepanel = document.querySelector('.messages-panel');
            messagepanel.innerHTML = '<div class="loading-messages">Loading messages...</div>';
            
            // First fetch group info to get status and members
            fetchDataOrsendData(`./Communication/Message.php?Type=GetGroupInfo&GroupID=${contactItem.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            })
            .then(groupInfoResponse => {
                if (groupInfoResponse.status === 'success' && groupInfoResponse.message) {
                    const groupInfo = groupInfoResponse.message;
                    
                    // Now fetch the current user's role in this group
                    fetchDataOrsendData(`./Communication/Message.php?Type=GetCurrentUserRole&GroupID=${contactItem.id}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        }
                    })
                    .then(roleResponse => {
                        // Get the user role from response or default to MEMBER
                        const userRole = (roleResponse.status === 'success' && roleResponse.role) 
                            ? roleResponse.role 
                            : 'MEMBER';
                        
                        // Then fetch messages
                        fetchDataOrsendData(`./Communication/Message.php?Type=GetMessageInfo&GroupID=${contactItem.id}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Accept": "application/json"
                            }
                        })
                        .then(response => {
                            console.log('Group message response:', response);
                            
                            // Check if we have a valid response with messages
                            if (response.status === 'success' && response.message) {
                                const data = {
                                    name: name,
                                    messages: SaveGroupMessageIntoArray(response.message),
                                    message: 'TEXT',
                                    membersRole: userRole, // Use the fetched role
                                    groupStatus: groupInfo.GroupStatus || 'Active',
                                    memberCount: groupInfo.GroupMemberNo || 0 // Include member count
                                };
                                renderMessagePage(data);
                                
                                // Explicitly scroll to bottom after rendering is complete
                                setTimeout(scrollToBottom, 200);
                            } else {
                                // Handle empty messages or error case
                                renderMessagePage({
                                    name: name,
                                    messages: [],
                                    message: 'TEXT',
                                    membersRole: userRole, // Use the fetched role
                                    groupStatus: groupInfo.GroupStatus || 'Active',
                                    memberCount: 0 // Include member count
                                });
                            }
                        })
                        .catch(error => {
                            console.error('Message Info error:', error);
                            messagepanel.innerHTML = `<div class="error-message">Failed to load messages: ${error.message}</div>`;
                        });
                    })
                    .catch(error => {
                        console.error('Role Info error:', error);
                        // Proceed with default role MEMBER
                        // ...rest of the message fetching code...
                    });
                } else {
                    // If we can't get group info, render with default status
                    renderMessagePage({
                        name: name,
                        messages: [],
                        message: 'TEXT',
                        membersRole: 'MEMBER',
                        groupStatus: 'Active',
                        memberCount: 0 // Default member count
                    });
                }
            })
            .catch(error => {
                console.error('Group Info error:', error);
                messagepanel.innerHTML = `<div class="error-message">Failed to load group info: ${error.message}</div>`;
            });
        }
    }
    
    // Helper function for DM contacts
    function handleDMContact(contactItem, allContacts) {
        const name = contactItem.querySelector('h4')?.textContent || 'Unknown';
        
        // Remove active class from all and add to clicked one
        allContacts.forEach(contact => contact.classList.remove('active'));
        contactItem.classList.add('active');
        
        if (contactItem.id) {
            // Show loading indicator
            const messagepanel = document.querySelector('.messages-panel');
            messagepanel.innerHTML = '<div class="loading-messages">Loading messages...</div>';
            
            // First check if the current user is blocked by this contact
            fetchDataOrsendData(`./Communication/Message.php?Type=CheckIfBlockedBy&ContactID=${contactItem.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            })
            .then(blockData => {
                console.log('Block check response:', blockData);
                if (blockData.status === 'success' && blockData.isBlockedBy) {
                    // Show blocked UI with message history if the other user has blocked the current user
                    renderBlockedByMessageUI(name, contactItem.id);
                    return; // Stop further processing
                }
                
                // Continue with normal flow if not blocked
                fetchDataOrsendData(`./Communication/Message.php?Type=GetMessageInfoForDM&Contact_ID=${contactItem.id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                })
                .then(data => {
                    console.log('DM Message Info (raw):', data);
                    if (data.status === 'error') {
                        console.error('Error fetching DM message info:', data.message);
                    } else if (data.status === 'warning') {
                        console.warn('Warning:', data.message);
                        // console.log('No chat log found - rendering empty message page');
                        renderMessagePage({
                            name: name,
                            messages: [],
                            status: 'Offline'
                        });
                    } else if (data.status === 'success') {
                        if (data && data.data) {
                            const messageData = data.data;
                            // console.log('Message Data Type:', messageData);
                            
                            // Handle empty chat
                            // console.log('No chat log found - rendering empty message page');
                            renderMessagePage({
                                name: name,
                                messages: [],
                                status: 'Offline'
                            });
                        } else {
                            const ContactName = contactItem.querySelector('h4').textContent;
                            const messageData = data.message;
                            // console.log('Message Data Type:', messageData);
                            renderMessagePage({
                                name: ContactName,
                                messages: data.message,
                                status: 'Offline'
                            });
                        }
                    }
                })
                .catch(error => {
                    console.error('DM Message Info error:', error);
                    // Show error message in message panel
                    messagepanel.innerHTML = `<div class="error-message">Failed to load messages: ${error.message}</div>`;
                });
            })
            .catch(error => {
                console.error('Block check error:', error);
                // Continue with normal message loading on error
                fetchDataOrsendData(`./Communication/Message.php?Type=GetMessageInfoForDM&Contact_ID=${contactItem.id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                })
                .then(data => {
                    console.log('DM Message Info (raw):', data);
                    if (data.status === 'error') {
                        console.error('Error fetching DM message info:', data.message);
                    } else if (data.status === 'warning') {
                        console.warn('Warning:', data.message);
                        console.log('No chat log found - rendering empty message page');
                        renderMessagePage({
                            name: name,
                            messages: [],
                            status: 'Offline'
                        });
                    } else if (data.status === 'success') {
                        if (data && data.data) {
                            const messageData = data.data;
                            console.log('Message Data Type:', messageData);
                            
                            // Handle empty chat
                            console.log('No chat log found - rendering empty message page');
                            renderMessagePage({
                                name: name,
                                messages: [],
                                status: 'Offline'
                            });
                        } else {
                            const ContactName = contactItem.querySelector('h4').textContent;
                            const messageData = data.message;
                            console.log('Message Data Type:', messageData);
                            renderMessagePage({
                                name: ContactName,
                                messages: data.message,
                                status: 'Offline'
                            });
                        }
                    }
                })
                .catch(error => {
                    console.error('DM Message Info error:', error);
                    // Show error message in message panel
                    messagepanel.innerHTML = `<div class="error-message">Failed to load messages: ${error.message}</div>`;
                });
            });
        }
    }
    
    console.log('Event delegation set up for contact items');
}

/**
 * Renders a UI showing that the current user has been blocked by the other user
 * @param {string} username - The name of the user who blocked the current user
 * @param {string} contactID - The contact ID 
 */
async function renderBlockedByMessageUI(username, contactID) {
	console.log('Rendering blocked message UI for:', username, 'Contact ID:', contactID);
    const messagepanel = document.querySelector('.messages-panel');
    if (!messagepanel) return;
    // First fetch previous messages so we can still display them
    fetchDataOrsendData(`./Communication/Message.php?Type=GetMessageInfoForDM&Contact_ID=${contactID}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    })
    .then(data => {
        console.log('Blocked user message history:', data);
        let messages = [];
        
        if (data.status === 'success' && Array.isArray(data.message) && data.message.length > 0) {
            messages = data.message;
        }
        
        // Add blocked class to message panel
        messagepanel.classList.add('blocked');
        
        // Clear existing content
        messagepanel.innerHTML = '';
        
        // Create message header
        let messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        messagepanel.appendChild(messageHeader);

        let messageRecipient = document.createElement('div');
        messageRecipient.className = 'message-recipient';
        messageHeader.appendChild(messageRecipient);

        let recipientAvatar = document.createElement('div');
        recipientAvatar.className = 'recipient-avatar';
        messageRecipient.appendChild(recipientAvatar);

        let avatarSpan = document.createElement('span');
        avatarSpan.className = 'material-icons';
        avatarSpan.textContent = 'account_circle';
        recipientAvatar.appendChild(avatarSpan);

        let recipientInfo = document.createElement('div');
        recipientInfo.className = 'recipient-info';
        messageRecipient.appendChild(recipientInfo);

        let recipientName = document.createElement('h3');
        recipientName.textContent = username;
        recipientInfo.appendChild(recipientName);

        let recipientStatus = document.createElement('p');
        recipientStatus.className = 'user-status blocked';
        recipientStatus.textContent = 'You are blocked';
        recipientInfo.appendChild(recipientStatus);

        // Add blocked banner with explanation
        const blockedBanner = document.createElement('div');
        blockedBanner.className = 'blocked-banner';
        blockedBanner.innerHTML = `
            <span class="material-icons">block</span>
            <span>You've been blocked by ${username}. You can see previous messages but cannot send new ones.</span>
        `;
        messagepanel.appendChild(blockedBanner);
        
        // Create message content area with actual messages
        let messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messagepanel.appendChild(messageContent);
        
        // If we have messages, display them
        if (messages.length > 0) {
            const sortedMessages = [];
            
            messages.forEach(msg => {
                const currentUsername = getCookieValue('USERNAME');
                const isCurrentUser = msg.sender === 'You' || msg.sender === currentUsername;
                
                const ProcessedMsg = {
                    type: isCurrentUser ? 'sent' : 'received',
                    sender: msg.sender === currentUsername ? 'You' : msg.sender,
                    content: msg.content,
                    time: DisplayHourMin(msg.time)
                };
                
                sortedMessages.push(ProcessedMsg);
            });
            
            // Render the messages
            sortedMessages.forEach(msg => appendMessageToChat(msg));
            setTimeout(scrollToBottom, 100);
        } else {
            // Show empty state if no messages
            messageContent.innerHTML = `
                <div class="blocked-empty-state">
                    <span>No previous messages</span>
                    You cannot send new messages to this user
                </div>
            `;
        }

        // Disabled message input area
        let messageInput = document.createElement('div');
        messageInput.className = 'message-input';
        messagepanel.appendChild(messageInput);

        let inputText = document.createElement('input');
        inputText.type = 'text';
        inputText.placeholder = 'You cannot send messages to this user';
        inputText.disabled = true;
        messageInput.appendChild(inputText);

        let sendButton = document.createElement('button');
        sendButton.className = 'send-button disabled';
        sendButton.disabled = true;
        messageInput.appendChild(sendButton);

        let sendButtonSpan = document.createElement('span');
        sendButtonSpan.className = 'material-icons';
        sendButtonSpan.textContent = 'send';
        sendButton.appendChild(sendButtonSpan);
    })
    .catch(error => {
        console.error('Error fetching messages for blocked user:', error);
        // Fallback to simple blocked message if we can't fetch message history
        messagepanel.innerHTML = `
            <div class="message-header">
                <div class="message-recipient">
                    <div class="recipient-avatar">
                        <span class="material-icons">account_circle</span>
                    </div>
                    <div class="recipient-info">
                        <h3>${username}</h3>
                        <p class="user-status blocked">You are blocked</p>
                    </div>
                </div>
            </div>
            <div class="blocked-banner">
                <span class="material-icons">block</span>
                <span>You've been blocked by ${username}</span>
            </div>
            <div class="message-content">
                <div class="blocked-empty-state">
                    <span>Messages unavailable</span>
                    You cannot send messages to this user
                </div>
            </div>
            <div class="message-input">
                <input type="text" placeholder="You cannot send messages to this user" disabled>
                <button class="send-button disabled" disabled>
                    <span class="material-icons">send</span>
                </button>
            </div>
        `;
    });
}

/**
 * Appends a new message to the chat interface
 * @param {Object} messageData - The data for the message to be appended
 * @param {string} messageData.type - Type of message ("sent" or "received")
 * @param {string} messageData.sender - Name of the message sender
 * @param {string} messageData.content - The message content text
 * @param {string} messageData.time - The timestamp for the message
 */

function appendMessageToChat(messageData) {
	console.log("Appending message to chat:", messageData);
	const messageContent = document.querySelector('.message-content');
	
	// Determine if this is the current user's message based on sender name
	const isCurrentUser = messageData.sender === 'You' || 
                          messageData.sender === getCookieValue('USERNAME');
	
	// Generate a unique ID for this message to prevent duplicates
	const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	
	let messageDiv = document.createElement('div');
	// Set class based on sender rather than relying on message.type
	messageDiv.className = `message ${isCurrentUser ? 'sent' : 'received'}`;
	messageDiv.dataset.messageId = messageId;
	
	// If message has a content ID (from server), store it for deduplication
	if (messageData.id) {
		messageDiv.dataset.contentId = messageData.id;
	}
	
	// Add sender profile
	let senderProfile = document.createElement('div');
	senderProfile.className = 'message-sender';
	
	let senderAvatar = document.createElement('div');
	senderAvatar.className = 'message-avatar';
	
	let avatarIcon = document.createElement('span');
	avatarIcon.className = 'material-icons';
	avatarIcon.textContent = 'account_circle';
	
	senderAvatar.appendChild(avatarIcon);
	senderProfile.appendChild(senderAvatar);
	
	let senderName = document.createElement('div');
	senderName.className = 'sender-name';
	senderName.textContent = messageData.sender;
	senderProfile.appendChild(senderName);
	
	// Content wrapper
	let contentWrapper = document.createElement('div');
	contentWrapper.className = 'message-content-wrapper';
	
	let messageBubble = document.createElement('div');
	messageBubble.className = 'message-bubble';
	
	let messageText = document.createElement('p');
	messageText.textContent = messageData.content;
	messageBubble.appendChild(messageText);
	
	// Store timestamp in data attribute for easier comparison
	let messageTime = document.createElement('span');
	messageTime.className = 'message-time';
	
	// Process the time through DisplayHourMin if it's not already "now"
	messageTime.textContent = messageData.time === "now" ? 
							  "now" : 
							  DisplayHourMin(messageData.time);
	
	// Store the original timestamp as data attribute for future comparisons
	if (messageData.time && messageData.time !== "now") {
		messageTime.setAttribute('data-timestamp', messageData.timestamp || messageData.time);
	} else {
		// If no timestamp provided, use current time
		const now = new Date().toISOString();
		messageTime.setAttribute('data-timestamp', now);
	}
	
	messageBubble.appendChild(messageTime);
	contentWrapper.appendChild(messageBubble);
	
	messageDiv.appendChild(senderProfile);
	messageDiv.appendChild(contentWrapper);
	messageContent.appendChild(messageDiv);
}

// Modify scrollToBottom to be more efficient and only scroll if needed
function scrollToBottom(force = false) {
    const messageContent = document.querySelector('.message-content');
    if (!messageContent) return;
    
    // Only scroll if we're already close to the bottom or if forced
    // This prevents disrupting users who might be reading older messages
    const isNearBottom = messageContent.scrollHeight - messageContent.clientHeight - messageContent.scrollTop < 100;
    
    if (isNearBottom || force) {
        messageContent.scrollTop = messageContent.scrollHeight;
        // console.log('Scrolled to bottom, height:', messageContent.scrollHeight);
    }
}

function setupSendButton() {
    console.log("Setting up send button");

    // Common function to process the send action
    function processSendAction() {
        const messageInput = document.querySelector('.message-input input');
        if (!messageInput || messageInput.disabled) {
            console.log('Message input is disabled or not found');
            return;
        }
        
        const message = messageInput.value.trim();
        if (!message) return;
        
        // Find the active group/contact
        const activeItem = document.querySelector('.contact-item.active');
        if (!activeItem) {
            console.error('No active conversation selected');
            return;
        }
		const GroupStatus = document.querySelector('.contacts-panel.group');
        
		if (GroupStatus.classList.contains('hidden')) {
			// For direct messages - ONLY append message AFTER successful send
			// Remove the appendMessageToChat call here
			console.log('Active item:', activeItem.id);
			
			// Prepare message data
			const messageData = {
				message: message,
				FriendID: activeItem.id,
				messageType: 'TEXT',
				status: 'sent'
			};
			sendUserMessageToServer(messageData);
			
			// Still clear the input field immediately for better UX
			messageInput.value = '';
			
		}else{
			// For group messages, check if group is muted
			const groupId = activeItem.id;
			
			// Get group status before sending message
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
					
					// Check if group is muted
					if (groupInfo.GroupStatus === 'Muted') {
						RemindLibrary.showErrorToast('This group is muted. Messages cannot be sent until an admin unmutes it.');
						return;
					}
					
					// If not muted, proceed with sending the message
					// Remove appendMessageToChat call here to avoid duplication
					
					const messageData = {
						message: message,
						GroupID: groupId || 0,
						messageType: 'TEXT',
						status: 'sent'
					};
					sendGroupMessageToServer(messageData);
					messageInput.value = '';
				}
			})
			.catch(error => {
				console.error('Error checking group status:', error);
				RemindLibrary.showErrorToast('Error sending message. Please try again.');
			});
		}
    }

    // Keydown listener for Enter key on the send button
    document.addEventListener('keydown', function(e) {
		if (
			e.key === 'Enter' && 
			(e.target.classList.contains('input') || 
			(e.target.parentElement && e.target.parentElement.classList.contains('message-input')))
		) {
			e.preventDefault();
			processSendAction();
			
		}
		
    });
    
    // Click listener using event delegation for the send button
    document.addEventListener('click', function(e) {
		console.log('Send Button:', e.target);
        if (
            (e.target && e.target.classList.contains('send-button')) ||
            (e.target.parentElement && e.target.parentElement.classList.contains('send-button'))
        ) {
            processSendAction();
			
        }
    });
}

function sendUserMessageToServer(messageData) {
	console.log('Sending user message:', messageData);

	// Add Type to the messageData object instead of in the URL
	messageData.Type = 'sendUserMessageToServer';
	
	fetchDataOrsendData("./Communication/Message.php", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify(messageData)
	})
	.then(response => {
		console.log('User message response:', response);
		if (response.status === 'success') {
			console.log('User message sent successfully:', response.message);
			appendMessageToChat({
				sender: 'You',
				content: messageData.message,
				time: "now",
				type: 'sent'
			});
			
			// Scroll to bottom after sending - this is a user-initiated action
            // so we always want to scroll to show the new message
            scrollToBottom(true);
			
			// Update timestamp on contact and move to top
			const contactItem = document.getElementById(messageData.FriendID);
			if (contactItem) {
				const timeElement = contactItem.querySelector('.contact-time');
				const now = new Date().toISOString();
				timeElement.setAttribute('data-timestamp', now);
				timeElement.textContent = 'now';
				// Sort contacts to move this one to the top
				sortContactsByTime('.contacts-panel.DirectMessages .contacts-list');
			}
		} else {
			console.error('Error sending user message:', response.message);
			RemindLibrary.showErrorToast('Error sending message. Please try again.');
		}
	})
	.catch(error => {
		console.error('User message error:', error);
		RemindLibrary.showErrorToast('Error sending message. Please try again.');
	});
}

function sendGroupMessageToServer(messageData) {
    
    // Add Type to the messageData object instead of in the URL
    messageData.Type = 'sendMessageToServer';
	console.log('Sending group message:', messageData);

    fetchDataOrsendData("./Communication/Message.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(messageData)
    })
    .then(response => {
        console.log('Group message response:', response);
        if (response.status === 'success') {
            console.log('Group message sent successfully:', response.message);
            appendMessageToChat({
                sender: 'You',
                content: messageData.message,
                time: "now",
                type: 'sent'
            });
            
            // Scroll to bottom after sending - this is a user-initiated action
            // so we always want to scroll to show the new message
            scrollToBottom(true);
            
            // Update timestamp on group contact and move to top
            const contactItem = document.getElementById(messageData.GroupID);
            if (contactItem) {
                const timeElement = contactItem.querySelector('.contact-time');
                const now = new Date().toISOString();
                timeElement.setAttribute('data-timestamp', now);
                timeElement.textContent = 'now';
                // Sort contacts to move this one to the top
                sortContactsByTime('.contacts-panel.group .contacts-list');
            }
        } else {
            console.error('Error sending group message:', response.message);
            RemindLibrary.showErrorToast('Error sending message. Please try again.');
        }
    })
    .catch(error => {
        console.error('Group message error:', error);
        RemindLibrary.showErrorToast('Error sending message. Please try again.');
    });
}

function SaveMessageIntoArray(messageData) {
    let messageArray = [];
    
    // Add debugging to see what we're receiving
    console.log("SaveMessageIntoArray input:", messageData);
    
    if (!Array.isArray(messageData)) {
        console.warn("messageData is not an array:", messageData);
        return [];
    }
    
	const Username = getCookieValue('USERNAME');
    
    for (let i = 0; i < messageData.length; i++) {
        const messageItem = messageData[i];
        
        // Set default values for missing properties
        const timestamp = messageItem.timestamp || messageItem.CreatedTime || null;
        const messageContent = messageItem.message || messageItem.MessageText || "";
        
        // Check if this message was sent by the current user
        const isSentByCurrentUser = messageItem.username === Username;
        console.log(`Message ${i} - isSentByCurrentUser: ${isSentByCurrentUser}`);
        
        let NewMessageData = {
            sender: isSentByCurrentUser ? "You" : (messageItem.SenderName || "Unknown"),
            content: messageContent,
            time: timestamp ? DisplayHourMin(timestamp) : "now",
            type: isSentByCurrentUser ? "sent" : "received",
            messageStatus: messageItem.messageStatus || "delivered"
        };
        
        messageArray.push(NewMessageData);
    }
    
    console.log("Processed messages:", messageArray);
    return messageArray;
}

function DirectMessageForm(prefilledEmail = '') {
	// Create overlay for the modal
	const overlay = document.createElement('div');
	overlay.className = 'DM-form-overlay';
	overlay.id = 'DM-form-overlay';
	
	// Create the form container
	const DMForm = document.createElement('div');
	DMForm.className = 'DM-form';
	DMForm.id = 'DM-form';
	
	// Add title
	
	const title = document.createElement('h3');
	title.textContent = 'Add Contact';
	DMForm.appendChild(title);
	
	// Close button
	const closeButton = document.createElement('button');
	closeButton.innerHTML = '&times;'; // × symbol
	closeButton.className = 'close-form';
	closeButton.addEventListener('click', () => {
		document.body.removeChild(overlay);
	});
	DMForm.appendChild(closeButton);
	
	// Recipient email input
	const recipientEmail = document.createElement('input');
	recipientEmail.type = 'email';
	recipientEmail.placeholder = 'user Email';
	recipientEmail.className = 'recipient-email';
	recipientEmail.id = 'recipient-email';
	if (prefilledEmail) {
        recipientEmail.value = prefilledEmail;
    }

	const errorMessage = document.createElement('p');
	errorMessage.className = 'error-message-DM hidden';
	errorMessage.id = 'error-message-DM';
	errorMessage.textContent = '';
	errorMessage.style = 'color: red; font-size: 0.8rem; margin-top: 0.5rem;';

	const suggestions = document.createElement('ul');
	suggestions.id = 'suggestions';
	suggestions.style = "list-style: none; padding: 0;";

	// Create button
	const sendButton = document.createElement('button');
	sendButton.textContent = 'Add contact';
	sendButton.className = 'send-message-btn';
	sendButton.id = 'send-message-btn';

	// Add form event handler
	sendButton.addEventListener('click', function(e) {
		if (!errorMessage.classList.contains('hidden')){
			errorMessage.classList.add('hidden');
		}
		e.preventDefault();
		AddContact(recipientEmail, overlay);
	});

	DMForm.addEventListener('keydown', function(e) {
		console.log('Key:', e.key);
		console.log(DMForm);
		if (!errorMessage.classList.contains('hidden')){
			errorMessage.classList.add('hidden');
		}
		
		if (e.key === 'Escape') {
			document.body.removeChild(overlay);
		}
		if(e.key === 'Enter'){
			console.log('Enter pressed');
			e.preventDefault();
			AddContact(recipientEmail, overlay);
		}
	});

	// Add all elements to the form
	DMForm.appendChild(recipientEmail);
	DMForm.appendChild(errorMessage);
	DMForm.appendChild(suggestions);
	DMForm.appendChild(sendButton);
	
	// Add the form to the overlay and the overlay to the body
	overlay.appendChild(DMForm);
	document.body.appendChild(overlay);
	
	// Focus on the first field
	recipientEmail.focus();
	suggestionsForContact();

	

}

// Helper function to render a new direct message contact in the UI need to have ContactID, name, message, time

function renderDirectMessageContact(contactData) {
	const contactsList = document.querySelector('.contacts-panel.DirectMessages .contacts-list');
	// Create new contact item
	const contactItem = document.createElement('div');
	contactItem.className = 'contact-item';
	contactItem.id = contactData.ContactID;
	
	// Avatar
	const avatar = document.createElement('div');
	avatar.className = 'contact-avatar';
	const avatarIcon = document.createElement('span');
	avatarIcon.className = 'material-icons';
	avatarIcon.textContent = 'person';
	avatar.appendChild(avatarIcon);
	
	// Contact info
	const info = document.createElement('div');
	info.className = 'contact-info';
	const name = document.createElement('h4');
	name.textContent = contactData.name;
	const message = document.createElement('p');
	message.textContent = contactData.message;
	info.appendChild(name);
	info.appendChild(message);
	
	// Time
	const time = document.createElement('div');
	time.className = 'contact-time';
	time.setAttribute('data-timestamp', contactData.time);
	time.textContent = DisplayHourMin(contactData.time);
	
	// Add all elements to contact item
	contactItem.appendChild(avatar);
	contactItem.appendChild(info);
	contactItem.appendChild(time);
	
	// Add to contacts list - prepend instead of append to put at top
	contactsList.prepend(contactItem);
	
	// Add direct click handler to the new contact
	contactItem.addEventListener('click', function() {
		// Clear any active class from other contacts
		document.querySelectorAll('.contacts-panel.DirectMessages .contact-item').forEach(item => {
			item.classList.remove('active');
		});
		
		// Add active class to this contact
		this.classList.add('active');
		
		// Show loading indicator
		const messagepanel = document.querySelector('.messages-panel');
		messagepanel.innerHTML = '<div class="loading-messages">Loading messages...</div>';
		// debug
        fetchDataOrsendData(`./Communication/Message.php?Type=GetMessageInfoForDM&Contact_ID=${contactData.ContactID}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        })
        .then(data => {
            if (data.status === 'success') {
                renderMessagePage({
                    name: contactData.name,
                    messages: data.message || [],
                    status: 'Online'
                });
            } else {
                // Handle empty chat case
                renderMessagePage({
                    name: contactData.name,
                    messages: [],
                    status: 'Online'
                });
            }
        })
        .catch(err => {
            console.error('Error loading messages:', err);
            // Still render empty page on error
            renderMessagePage({
                name: contactData.name,
                messages: [],
                status: 'Online'
            });
        });
	});
}

/**
 * Creates a debounced version of a function that delays its execution until after a specified delay
 * has passed since the last time it was invoked.
 * 
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay time in milliseconds
 * @returns {Function} A debounced function that will invoke the original function only after
 * the delay has passed without any new invocations
 */
function debounce(func, delay) {
	let timeout;
	return function() {
		const context = this;
		const args = arguments;
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(context, args), delay);
	};
}

/**
 * Adds autocomplete functionality to the user email input field.
 * This function attaches an event listener to the email input which triggers
 * a debounced AJAX request to fetch email suggestions when the user types.
 * 
 * The suggestions appear only when the input contains at least 3 characters.
 * Each suggestion is displayed as a list item in the 'suggestions' element.
 * 
 * @function suggestionsForContact
 * @returns {void} This function does not return a value
 * @example
 * // Initialize email suggestions functionality
 * suggestionsForContact();
 */
function suggestionsForContact(){
	const recipientEmail = document.getElementById('recipient-email');
	recipientEmail.addEventListener('input', debounce(function (e){
		const ErrorElement = document.getElementById('error-message-DM');
		const suggestions = document.getElementById('suggestions');
		const recipientEmail = document.getElementById('recipient-email');
		const email = recipientEmail.value.trim();
		if (email.length < 3) {
			suggestions.innerHTML = '';
			return;
		}
		
		const query = e.target.value.trim();
		console.log('Query:', query);
		if (query.length < 3) {
			suggestions.innerHTML = '';
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
			if (data) {
				console.log('Suggestions:', data);
				ErrorElement.classList.add('hidden');
				// Check if the response is an error
				if (data.status === 'error') {
					if (data.message === 'No user found with that email') {
						ErrorElement.textContent = data.message;
						ErrorElement.classList.remove('hidden');
						recipientEmail.focus();
						suggestions.innerHTML = '';
						console.log('No user found');
						return;
					}
				}
				// Clear the suggestions list
				if (data.length) {
					suggestions.innerHTML = '';
					data.forEach(suggestion => {
						suggestionListClickable(suggestion.email);
					});
				}
			}
		})
		.catch(error => {
			resultDiv.innerHTML = `<div style="color:red">Error: ${error.message}</div>`;
		});
	}
	, 500));

}

function suggestionListClickable(suggestedEmail){
	const suggestions = document.getElementById('suggestions');
	const li = document.createElement('li');
	const recipientEmail = document.getElementById('recipient-email');
	li.textContent = suggestedEmail;
	li.style = "cursor: pointer; padding: 5px;";
	suggestions.appendChild(li);
	li.addEventListener('click', function() {
		document.getElementById('recipient-email').value = this.textContent;
		suggestions.innerHTML = '';
		recipientEmail.focus();
	});
}

function VerifyDMContactListExist(){	
	fetchDataOrsendData ("./Communication/Message.php?Type=VerifyDMContactListExist", {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	})
	.then(data => {
		if(data.status === 'success'){
			console.log('User already have DM contact list (Ignore)');
			// Fetch the contacts list from the server
			console.log("fetching DM contact list from database");
			renderDMContactList();
		}else if (data.status === 'warning' || data.status === 'error') {
			console.log('Warning:', data.message);
			console.log('User does not have DM contact list Create a DM contact list for user');
			// Create the contacts list in database
			CreateDMContactListForUser();
		}
	})
	.catch(error => {
		console.error('Contact List error:', error);
	})
}

function CreateDMContactListForUser(){
	fetchDataOrsendData("./Communication/Message.php", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		body: JSON.stringify({
			Type: 'CreateDMContactListForUser'
		})
	})
	.then(data => {
		if (data.status === 'success') {
			console.log('DM Contact List Created:', data);
			renderDMContactList();
		}else if(data.status === 'warning'){
			console.log('Warning:', data.message);
		}else{
			console.log('No groups found or invalid data format');
		}
	})
	.catch(error => {
		console.error('Default Page Error:', error);
		// Handle the error appropriately
	});
}

function AddContact(recipientEmail, overlay){
	
	const ErrorElement = document.getElementById('error-message-DM');
	const suggestions = document.getElementById('suggestions');
	let errorMessage = [];
	if (!recipientEmail.value.trim()) {
		errorMessage.push('Please enter an email address');
	}
	
	if (!validateEmail(recipientEmail.value.trim())) {
		errorMessage.push('Please enter a valid email address');
	}
	if (recipientEmail.value.trim() === getCookieValue('email')) {
		errorMessage.push('You cannot add yourself as a contact');
	}

	if (errorMessage.length > 0) {
		console.log('Error:', errorMessage);
		ErrorElement.textContent = errorMessage.join(', ');
		ErrorElement.classList.remove('hidden');
		recipientEmail.value = '';
		recipientEmail.focus();
		return;
	}
	ErrorElement.classList.add('hidden');
	console.log('Adding contact:', recipientEmail.value.trim());
	// Check if the email is already in the contact list
	checkIfFriendInFriendContactList(recipientEmail, overlay, ErrorElement, errorMessage, suggestions);
}

function checkIfFriendInFriendContactList(recipientEmail, overlay, ErrorElement, errorMessage, suggestions){
	fetchDataOrsendData("./Communication/Message.php", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		body: JSON.stringify({
			Type: 'checkIfFriendInFriendContactList',
			Email: recipientEmail.value.trim()
		})
	})
	.then(data => {
		console.log('Check if the email is valid:', data);
		if (data.status === 'success') {
			if(data.message === 'Contact already exists' || data.message === 'Friend already exists in Contact List'){
				errorMessage.push('Contact already exists');
				ErrorElement.textContent = errorMessage.join(', ');
				ErrorElement.classList.remove('hidden');
				recipientEmail.focus();
				suggestions.innerHTML = '';
				return;
			}
		}				
		else if (data.status === 'warning') {
			if(data.message === 'Friend does not exist' || data.message === 'Contact does not exist' || data.message === 'Contact list not found'){
				console.log('Friend does not exist');
				// Send the email to the server to add the contact
				sendAddContact(recipientEmail, overlay);
			}
		}
		else{
			if(data.message === 'Friend does not exist in friend table'){
				sendAddContact(recipientEmail, overlay);

			}
			errorMessage.push('Failed to add contact');
			ErrorElement.textContent = errorMessage.join(', ');
			ErrorElement.classList.remove('hidden');
			recipientEmail.focus();
			suggestions.innerHTML = '';
		}
	})
	.catch(error => {
		console.error('Error:', error);
		RemindLibrary.showErrorToast('Failed to add contact');
	})
}

function sendAddContact(recipientEmail, overlay){
	console.log('Adding contact:', recipientEmail.value.trim());
	fetchDataOrsendData("./Communication/Message.php", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		body: JSON.stringify({
			Type: 'sendAddContact',
			Email: recipientEmail.value.trim()
		})
	})
	.then(data => {
		console.log(data)
		if (data.status === 'success') {
			if (data.message === 'User Does not exist in the contact list'){
				console.log('User Does not exist in the contact list');
				suggestions.innerHTML = '';
			}else{
				// GetDMContactList(recipientEmail);

				renderDMContactList();

				// // Add a short delay to allow the contact to be added to the DOM
				// setTimeout(function() {
				// 	// Find and click the newly added contact
				// 	const allContacts = document.querySelectorAll('.contacts-panel.DirectMessages .contact-item');
				// 	const newContact = allContacts[allContacts.length - 1]; // Get the last added contact

				// }, 300);
			}
			// Success case - no special handling needed
			console.log('Success:', data);
		}
		else if (data.status === 'warning') {
			// This is for users that don't exist yet
			console.log('Warning:', data.message);
			// Optional: Show a notification that the user doesn't exist yet
			// but will be invited when they register
		}
		recipientEmail.value = '';
		recipientEmail.focus();
		document.body.removeChild(overlay);
	})
	.catch(error => {
		console.error('Error:', error);
		RemindLibrary.showErrorToast('Failed to add contact');
	})
}

// function GetDMContactList(recipientEmail){
// 	console.log('Get DM Contact List:', recipientEmail.value.trim());
// 	fetchDataOrsendData(`./Communication/Message.php?Type=GetOnlyOneContactListForDM&Email=${recipientEmail.value.trim()}`, {
// 		method: 'GET',
// 		headers: {
// 			'Accept': 'application/json',
// 			'Content-Type': 'application/json'
// 		}
// 	})
// 	.then(data => {
// 		console.log(data);
// 		if (data.status === 'success') {
// 			// Check if data is an object and has properties
// 			if (data && typeof data === 'object') {
// 				// Loop through the group objects and render each one
// 				// console.log(Object.values(data).ID);
// 				console.log(data.message[0].ID);
// 				console.log(data.message[0].MessageText);
// 				RemindLibrary.showSuccessToast(data.message[0].ID);
// 				//ContactID, name, message, time
// 				const NewDMContactlist = {
// 					FriendID: data.message[0].ID,
// 					name: data.message[0].friendName,
// 					message: data.message[0].MessageText,
// 					time: DisplayHourMin(data.message[0].created_at)
// 				}
// 				appendContactToContactList(NewDMContactlist);
// 			} else {
// 				console.log('No groups found or invalid data format');
// 			}
// 		}else if(data.status === 'warning'){
// 			console.log('Warning:', data.message);
// 		}else{
// 			console.log('No groups found or invalid data format');
// 		}
// 	})
// 	.catch(error => {
// 		console.error('Default Page Error:', error);
// 		// Handle the error appropriately
// 	});
// }

/** 
 * Fetches the contact list from the server and renders it in the UI.
 * This function is called when the page loads.
 * 
 * @returns {void}
 * @example
 * // Fetch and render the contact list
 * fetchAndRenderContactList();
 * 
 * @note This function is called when the page loads
 * 
 * @todo Implement the function to fetch and render the contact list
 * 
 * @todo Implement the function to append a new contact to the contact list
 * 
 * @todo Implement the function to fetch the last message and time for each contact
 * 
 * @contactData {Object} contactData - The data for the contact to be appended
 * @contactData {string} contactData.name - The name of the contact
 * @contactData {string} contactData.message - The last message from the contact
 * @contactData {string} contactData.time - The time of the last message
 * @contactData {string} contactData.FriendID - The ID of the contact
 * 
 * @example
 * // Append a new contact to the contact list
 * appendContactToContactList({
 *   name: 'John Doe',
 *  message: 'Hello there!',
 * time: '12:30 PM',
 * FriendID: 123
 * });
 * 
 * @example
 * // Fetch the last message and time for each contact
 * fetchLastMessageAndTime();
 * 
*/

function appendContactToContactList(contactData) {
	console.log('Appending contact to contact list:', contactData);
	const contactsList = document.querySelector('.contacts-panel.DirectMessages .contacts-list');
	// Create new contact item
	const contactItem = document.createElement('div');
	contactItem.className = 'contact-item';
	contactItem.id = contactData.FriendID;
	
	// Avatar
	const avatar = document.createElement('div');
	avatar.className = 'contact-avatar';
	const avatarIcon = document.createElement('span');
	avatarIcon.className = 'material-icons';
	avatarIcon.textContent = 'person';
	avatar.appendChild(avatarIcon);
	
	// Contact info
	const info = document.createElement('div');
	info.className = 'contact-info';
	const name = document.createElement('h4');
	name.textContent = contactData.name;
	const message = document.createElement('p');
	message.textContent = contactData.message? contactData.message : 'Enter something here';
	info.appendChild(name);
	info.appendChild(message);
	
	// Time
	const time = document.createElement('div');
	time.className = 'contact-time';
	time.textContent = DisplayHourMin(contactData.time);
	
	// Add all elements to contact item
	contactItem.appendChild(avatar);
	contactItem.appendChild(info);
	contactItem.appendChild(time);
	
	// Add to contacts list
	contactsList.appendChild(contactItem);
	
	// Add direct click handler to the new contact
	contactItem.addEventListener('click', function() {
		// Clear any active class from other contacts
		// document.querySelectorAll('.contacts-panel.DirectMessages .contact-item').forEach(item => {
		// 	item.classList.remove('active');
		// });
		
		// // Add active class to this contact
		// this.classList.add('active');
		
		// Show loading indicator
		const messagepanel = document.querySelector('.messages-panel');
		messagepanel.innerHTML = '<div class="loading-messages">Loading messages...</div>';
		
		// Render empty conversation for brand new contacts
		// renderMessagePage({
		// 	name: contactData.name,
		// 	messages: [],
		// 	status: 'Online'
		// });
	});
}

function fetchGroupContactListFromServer(){
    fetchDataOrsendData("./Communication/Message.php?Type=GetGroupContactList", {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(data => {
        console.log('Contact List Group:', data);
        if (data.status === 'success') {
            const NewData = data.message;
            
            // Sort the contacts by timestamp (most recent first)
            NewData.sort((a, b) => {
                // Convert time strings to Date objects for comparison
                const timeA = new Date(a.GroupMessageTime || 0);
                const timeB = new Date(b.GroupMessageTime || 0);
                return timeB - timeA; // Sort in descending order (newest first)
            });
            
            console.log('Sorted Data:', NewData);
            
            // Clear existing contacts to prevent duplicates when re-sorting
            const contactsList = document.querySelector('.contacts-panel.group .contacts-list.group');
            contactsList.innerHTML = '';
            
            // Render contacts in sorted order
            NewData.forEach(contact => {
                let newGroupName = contact.GroupName.split("_");
                renderGroupContact({
                    ContactID: contact.GroupID,
                    name: newGroupName[0],
                    message: contact.GroupMessages,
                    time: contact.GroupMessageTime,
                    status: contact.GroupStatus || 'Active' // Include group status
                });
            });
        }
    })
    .catch(error => {
        console.error('Contact List error:', error);
    });
}

// Also apply sorting to the DM contact list for consistency
function renderDMContactList(){
    fetchDataOrsendData("./Communication/Message.php?Type=GetContactListForDM", {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(data => {
        console.log('DM page success get data:', data);
        if (data.status === 'success') {
            // Check if data is an object and has properties
            if (data && typeof data === 'object') {
                // Clear existing contacts
                const contactsList = document.querySelector('.contacts-panel.DirectMessages .contacts-list');
                contactsList.innerHTML = '';
                
                // Sort contacts by timestamp (most recent first)
                const contacts = Object.values(data.message);
                contacts.sort((a, b) => {
                    const timeA = new Date(a.created_at || 0);
                    const timeB = new Date(b.created_at || 0);
                    return timeB - timeA; // Descending order
                });
                
                // Loop through the sorted contacts and render each one
                contacts.forEach(DM => {
                    const NewDMContactlist = {
                        ContactID: DM.ID,
                        name: DM.friendName,
                        message: DM.MessageText,
                        time: DM.created_at
                    }
                    renderDirectMessageContact(NewDMContactlist);
                });
            } else {
                console.log('No groups found or invalid data format');
            }
        } else if(data.status === 'warning'){
            console.log('Warning:', data.message);
        } else {
            console.log('No groups found or invalid data format');
        }
    })
    .catch(error => {
        console.error('Default Page Error:', error);
        // Handle the error appropriately
    });
}

/**
 * Creates and displays a friend suggestion popup in the message panel, positioned below the header
 * @param {Object} userData - User data for the person to suggest adding as friend
 * @param {string} userData.name - Name of the user
 * @param {string} userData.email - Email of the user (optional)
 */
async function showFriendSuggestion(userData) {
    const messagesPanel = document.querySelector('.messages-panel');
    const messageHeader = document.querySelector('.message-header');
	let isFriend = await CheckIfStatusisFriend();
    console.log('Friend suggestion:', isFriend);
    if (!messagesPanel || !messageHeader) return;
    
    // Check if suggestion already exists
    if (document.querySelector('.friend-suggestion-popup')) {
        return;
    }
    if (isFriend) {
		console.log('User is already a friend, no suggestion needed');
		return;
	}
    // Create the suggestion popup
    const popup = document.createElement('div');
    popup.className = 'friend-suggestion-popup';
    
    // Content section (left side)
    const content = document.createElement('div');
    content.className = 'friend-suggestion-content';
    
    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'friend-suggestion-avatar';
    const avatarIcon = document.createElement('span');
    avatarIcon.className = 'material-icons';
    avatarIcon.textContent = 'person';
    avatar.appendChild(avatarIcon);
    content.appendChild(avatar);
    
    // User info
    const info = document.createElement('div');
    info.className = 'friend-suggestion-info';
    const name = document.createElement('h4');
    name.textContent = userData.name;
    const description = document.createElement('p');
    description.textContent = 'Add as your friend';
    info.appendChild(name);
    info.appendChild(description);
    content.appendChild(info);
    
    popup.appendChild(content);
    
    // Actions section (right side)
    const actions = document.createElement('div');
    actions.className = 'friend-suggestion-actions';
    
    const addButton = document.createElement('button');
    addButton.className = 'add-friend-btn';
    addButton.innerHTML = '<span class="material-icons">person_add</span> Add friend';
    addButton.addEventListener('click', function() {
        // Handle adding the contact
        handleAddFriend(userData);
        popup.remove();
    });
    actions.appendChild(addButton);
    
    // Dismiss button
    const dismissButton = document.createElement('button');
    dismissButton.className = 'dismiss-suggestion-btn';
    dismissButton.innerHTML = '<span class="material-icons">close</span>';
    dismissButton.addEventListener('click', function() {
        popup.remove();
    });
    actions.appendChild(dismissButton);
    
    popup.appendChild(actions);
    
    // Insert after the header
    messagesPanel.insertBefore(popup, messageHeader.nextSibling);
}

/**
 * Handles adding a friend from the suggestion popup
 * @param {Object} userData - User data for the person being added
 */
const handleAddFriend = (userData) => {
	const CurrentUserID = document.querySelector('.contact-item.active');
    console.log(`Adding ${userData.name} as a contact`);
    console.log('Current User:', CurrentUserID.id);
    // // If there's an email available, use it to pre-fill the add contact form
	if (CurrentUserID){
		SendFriendRequest({
			CurrentUserID: CurrentUserID.id,
			CurrentFriendName: userData.name,
			status: 'Pending'
		});
	}
}

/**
 * Checks if the user is already a friend
 * @param {string} ContactID - The ID of the contact to check
 * @return {Promise<boolean>} - Returns true if the user is a friend, false otherwise
 * */
async function CheckIfStatusisFriend(){

	const DMContactID = document.querySelector('.contact-item.active');
	if (!DMContactID) {
		console.error('No active contact found');
		return false;
	}

	const response = await fetchDataOrsendData("./Communication/Message.php", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		body: JSON.stringify({
			Type: 'CheckIfStatusisFriend',
			ContactID: DMContactID.id
		})
	})
	.then(data => {
		if (data.status === 'success') {
			return data.message;
		} else if (data.status === 'warning') {
			console.log('Warning:', data.message);
			return false;
		} else {
			console.log('Error:', data.message);
			return false;
		}
	})
	.catch(error => {
		console.error('Error:', error);
		RemindLibrary.showErrorToast('Failed to check friendship status');
		return false;
	});

	return response;
}

// no type in php
function SendFriendRequest(messageData){
	messageData.Type = 'SendFriendRequest';
	console.log('Sending friend request:', messageData);
	fetchDataOrsendData("./Communication/Message.php", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify(messageData)
	})
	.then(data => {
		console.log('Message sent:', data);
	})
	.catch(error => {
		console.error('Message send error:', error);
		RemindLibrary.showErrorToast('Failed to send message');
		// Handle the error appropriately
	});
}

/**
 * Modified DirectMessageForm that can accept a pre-filled email
 * @param {string} prefilledEmail - Optional email to pre-fill in the form
 */

// You might also want to add a function to check friendship status
// This is a placeholder that would normally check against your database
function checkIfFriends(userId) {
    // For demo purposes, randomly return true or false
    // In a real app, this would check your database
    const isFriend = Math.random() > 0.5;
    return isFriend;
}

function blockUser(username, ContactID) {
    fetchDataOrsendData("./Communication/Message.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            Type: "BlockUser",
            Username: username,
            ContactID: ContactID
        })
    })
    .then(data => {
        console.log('Block user response:', data);
        if (data.status === 'success') {
            // Update UI to reflect blocked status
            const messagepanel = document.querySelector('.messages-panel');
            if (!messagepanel) {
                console.error("Message panel not found.");
                return;
            }
            
            // Find the message header and content elements
            const messageHeader = messagepanel.querySelector('.message-header');
            const messageContent = messagepanel.querySelector('.message-content');
            
            if (!messageHeader) {
                console.error("Message header not found.");
                return;
            }
            
            // Add blocked banner if it doesn't exist
            if (!messagepanel.querySelector('.blocked-banner')) {
                const blockerMessage = document.createElement('div');
                blockerMessage.className = 'blocked-banner';
                blockerMessage.innerHTML = `
                    <span class="material-icons">block</span>
                    <span>You've blocked ${username}. You can see previous messages but cannot send new ones until you unblock them.</span>
                `;
                
                // Insert after header (before message content)
                messagepanel.insertBefore(blockerMessage, messageContent);
            }
            
            // Disable the input field and send button
            const messageInputContainer = messagepanel.querySelector('.message-input');
            if (messageInputContainer) {
                // Add disabled class to container
                messageInputContainer.classList.add('disabled');
                
                // Disable the input field
                const inputField = messageInputContainer.querySelector('input');
                if (inputField) {
                    inputField.disabled = true;
                    inputField.placeholder = 'You have blocked this user';
                    console.log('Input field disabled:', inputField);
                }
                
                // Disable send button
                const sendButton = messageInputContainer.querySelector('.send-button');
                if (sendButton) {
                    sendButton.disabled = true;
                    sendButton.classList.add('disabled');
                }
            }
            
            // Re-render the dropdown to update the Unblock option
            const optionsDropdown = messagepanel.querySelector('.options-dropdown');
            if (optionsDropdown) {
                const blockOption = optionsDropdown.querySelector('.dropdown-item:first-child');
                if (blockOption) {
                    const icon = blockOption.querySelector('.material-icons');
                    const text = blockOption.querySelector('span:last-child');
                    
                    if (icon) icon.textContent = 'check_circle';
                    if (text) text.textContent = 'Unblock';
                    
                    // Update the action for this menu option
                    blockOption.onclick = () => {
                        unblockUser(username, ContactID);
                        optionsDropdown.classList.add('hidden');
                    };
                }
            }
            
            RemindLibrary.showSuccessToast(`User ${username} has been blocked`);
        }
        else if (data.status === 'warning') {
            console.log('Warning:', data.message);
            RemindLibrary.showErrorToast(data.message);
        }
        else {
            console.log('Error:', data.message);
            RemindLibrary.showErrorToast(data.message);
        }
    })
    .catch(error => {
        console.error('Block user error:', error);
        RemindLibrary.showErrorToast('Failed to block user');
    });
}

function viewProfile(username) {
    console.log(`Viewing profile for: ${username}`);
    
    // Create profile overlay
    const overlay = document.createElement('div');
    overlay.className = 'profile-overlay';
    
    // Create profile container
    const profileContainer = document.createElement('div');
    profileContainer.className = 'profile-container';
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-form';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    profileContainer.appendChild(closeButton);
    
    // Profile header
    const profileHeader = document.createElement('div');
    profileHeader.className = 'profile-header';
    
    // Avatar
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'profile-avatar';
    const avatarIcon = document.createElement('span');
    avatarIcon.className = 'material-icons';
    avatarIcon.textContent = 'account_circle';
    avatarDiv.appendChild(avatarIcon);
    profileHeader.appendChild(avatarDiv);
    
    // User info
    const userInfo = document.createElement('div');
    userInfo.className = 'profile-user-info';
    
    const userName = document.createElement('h2');
    userName.textContent = username;
    userInfo.appendChild(userName);
    
    const userStatus = document.createElement('p');
    userStatus.textContent = 'Online'; // You can make this dynamic based on real status
    userStatus.className = 'user-status online';
    userInfo.appendChild(userStatus);
    
    profileHeader.appendChild(userInfo);
    profileContainer.appendChild(profileHeader);
    
    // Profile details
    const profileDetails = document.createElement('div');
    profileDetails.className = 'profile-details';
    
    // Add some mock details - in a real app, you'd fetch this from the server
    const details = [
        { icon: 'email', label: 'Email', value: `${username.toLowerCase().replace(/\s+/g, '.')}@gmail.com` },
        { icon: 'work', label: 'Position', value: 'Student' },
        { icon: 'schedule', label: 'Member since', value: 'January 2023' }
    ];
    
    details.forEach(detail => {
        const detailRow = document.createElement('div');
        detailRow.className = 'profile-detail-row';
        
        const icon = document.createElement('span');
        icon.className = 'material-icons';
        icon.textContent = detail.icon;
        
        const labelDiv = document.createElement('div');
        labelDiv.className = 'detail-label';
        labelDiv.textContent = detail.label;
        detailRow.appendChild(icon);
        detailRow.appendChild(labelDiv);
        
        const valueDiv = document.createElement('div');
        valueDiv.className = 'detail-value';
        valueDiv.textContent = detail.value;
        detailRow.appendChild(valueDiv);
        
        profileDetails.appendChild(detailRow);
    });
    
    profileContainer.appendChild(profileDetails);
    
    // Action buttons
    const actionButtons = document.createElement('div');
    actionButtons.className = 'profile-actions';
    
    const messageButton = document.createElement('button');
    messageButton.className = 'profile-action-btn message-btn';
    messageButton.innerHTML = '<span class="material-icons">chat</span> Message';
    messageButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        // This would normally focus the message input
    });
    actionButtons.appendChild(messageButton);
    
    const blockButton = document.createElement('button');
    blockButton.className = 'profile-action-btn block-btn';
    blockButton.innerHTML = '<span class="material-icons">block</span> Block';
    blockButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        blockUser(username);
    });
    actionButtons.appendChild(blockButton);
    
    profileContainer.appendChild(actionButtons);
    
    // Add to DOM
    overlay.appendChild(profileContainer);
    document.body.appendChild(overlay);
}

function reportUser(username) {
    console.log(`Reported user: ${username}`);
    RemindLibrary.showSuccessToast(`User ${username} has been reported`);
    // In a real app, this would open a report form
}

/**
 * Handle renaming a group - opens the full edit form
 * @param {string} groupName - Current group name
 * @param {string} groupId - The group ID
 */
function renameGroup(groupName, groupId) {
    // Instead of using a simple prompt, open the full edit form
    editGroupInfo(groupName, groupId);
    
    // Put focus on the name field after a short delay to ensure the form is rendered
    setTimeout(() => {
        const nameInput = document.querySelector('.group-form .group-name');
        if (nameInput) {
            nameInput.focus();
            nameInput.select(); // Select all text for easy replacement
        }
    }, 100);
}

/**
 * Handle the user leaving a group
 */
async function leaveGroup(groupName, groupId) {
	const confirmed = await RemindLibrary.customConfirm(`Are you sure you want to leave "${groupName}"?`);
    if (confirmed) {
        // Show a loading indication
        const groupItem = document.getElementById(groupId);
        if (groupItem) {
            groupItem.style.opacity = '0.5';
        }
        
        fetchDataOrsendData("./Communication/Message.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                Type: 'LeaveGroup',
                GroupID: groupId
            })
        })
        .then(data => {
			console.log('Leave group response:', data);
            // Reset opacity
            if (groupItem) {
                groupItem.style.opacity = '1';
            }
            
            if (data.status === 'success') {
                // Remove group from the list
                if (groupItem && groupItem.parentNode) {
                    groupItem.parentNode.removeChild(groupItem);
                }
                
                // Clear the message panel
                const messagePanel = document.querySelector('.messages-panel');
                messagePanel.innerHTML = '<div class="select-conversation"><span>No conversation selected</span>Select a conversation from the sidebar to start messaging</div>';
                
                // Show success toast instead of alert
                RemindLibrary.showSuccessToast(`You have left "${groupName}"`);
            } else {
                // Show error toast
                RemindLibrary.showErrorToast((data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            // Reset opacity on error
            if (groupItem) {
                groupItem.style.opacity = '1';
            }
            
            console.error('Error leaving group:', error);
            RemindLibrary.showErrorToast('Failed to leave group: ' + error.message);
        });
    }
}

function SaveGroupMessageIntoArray(messageData) {
    let messageArray = [];
    
    console.log("Processing group messages:", messageData);
    
    if (!Array.isArray(messageData)) {
        console.warn("Group message data is not an array:", messageData);
        return [];
    }
    
    const Username = getCookieValue('USERNAME');
    
    for (let i = 0; i < messageData.length; i++) {
        const messageItem = messageData[i];
        
        try {
            // Extract the correct fields from group message format
            const timestamp = messageItem.timestamp || null;
            const messageContent = messageItem.message || "";
            const sender = messageItem.username || "Unknown";
            
            // Check if this message was sent by the current user
            const isSentByCurrentUser = sender === Username;
            
            // Format time safely
            let formattedTime = "now";
            if (timestamp) {
                try {
                    formattedTime = DisplayHourMin(timestamp);
                } catch (e) {
                    console.warn("Error formatting time:", e);
                }
            }
            
            let newMessageData = {
                sender: isSentByCurrentUser ? "You" : sender,
                content: messageContent,
                time: formattedTime,
                rawTime: timestamp, // Add raw timestamp for sorting
                type: isSentByCurrentUser ? "sent" : "received",
                messageStatus: "delivered"
            };
            
            messageArray.push(newMessageData);
        } catch (e) {
            console.error("Error processing message:", e, messageItem);
        }
    }
    
    // Sort messages by original timestamp
    messageArray.sort((a, b) => {
        // Try to compare using rawTime if available
        if (a.rawTime && b.rawTime) {
            return new Date(a.rawTime) - new Date(b.rawTime);
        }
        return 0; // Keep original order if no valid timestamps
    });
    
    console.log("Processed group messages:", messageArray);
    return messageArray;
}

function renderGroupContact(contactData) {
    const contactsList = document.querySelector('.contacts-panel.group .contacts-list.group');
    // Create new contact item
    const contactItem = document.createElement('div');
    contactItem.className = 'contact-item';
    contactItem.id = contactData.ContactID;
    
    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'contact-avatar';
    const avatarIcon = document.createElement('span');
    avatarIcon.className = 'material-icons';
    avatarIcon.textContent = 'group';
    avatar.appendChild(avatarIcon);
    
    // Contact info
    const info = document.createElement('div');
    info.className = 'contact-info';
    const name = document.createElement('h4');
    name.textContent = contactData.name;
    const message = document.createElement('p');
    message.textContent = contactData.message || 'Enter something here';
    info.appendChild(name);
    info.appendChild(message);
    
    // Add member count as a subtle indicator (optional enhancement)
    if (contactData.memberCount) {
        const memberCountBadge = document.createElement('span');
        memberCountBadge.className = 'group-member-count';
        memberCountBadge.textContent = contactData.memberCount;
        memberCountBadge.title = `${contactData.memberCount} members`;
        memberCountBadge.style.fontSize = '0.7rem';
        memberCountBadge.style.color = '#5e72e4';
        memberCountBadge.style.marginLeft = '5px';
        info.appendChild(memberCountBadge);
    }
    
    // Time
    const time = document.createElement('div');
    time.className = 'contact-time';
    time.setAttribute('data-timestamp', contactData.time || new Date()); // Add timestamp as data attribute
    time.textContent = DisplayHourMin(contactData.time || new Date());
    
    // Add muted indicator if the group is muted
    if (contactData.status === 'Muted') {
        const mutedIcon = document.createElement('span');
        mutedIcon.className = 'material-icons group-muted-icon';
        mutedIcon.textContent = 'volume_off';
        mutedIcon.title = 'This group is muted';
        info.appendChild(mutedIcon);
    }
    
    // Add all elements to contact item
    contactItem.appendChild(avatar);
    contactItem.appendChild(info);
    contactItem.appendChild(time);
    
    // Add to contacts list - prepend instead of append to put at top
    contactsList.prepend(contactItem);
    
    // Add click handler to the new contact
    contactItem.addEventListener('click', function() {
        // Clear any active class from other contacts
        document.querySelectorAll('.contacts-panel.group .contact-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to this contact
        this.classList.add('active');
        
        // Show loading indicator
        const messagepanel = document.querySelector('.messages-panel');
        messagepanel.innerHTML = '<div class="loading-messages">Loading messages...</div>';
        
        // Fetch and render group messages
        fetchDataOrsendData(`./Communication/Message.php?Type=GetMessageInfo&GroupID=${contactData.ContactID}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        })
        .then(response => {
            if (response.status === 'success' && response.message) {
                renderMessagePage({
                    name: contactData.name,
                    messages: SaveGroupMessageIntoArray(response.message),
                    message: 'TEXT',
                    membersRole: "ADMIN",
                });
            } else {
                renderMessagePage({
                    name: contactData.name,
                    messages: [],
                    message: 'TEXT',
                    membersRole: "ADMIN",
                });
            }
        })
        .catch(error => {
            console.error('Failed to load group messages:', error);
            messagepanel.innerHTML = `<div class="error-message">Failed to load messages: ${error.message}</div>`;
        });
    });
}

function sortContactsByTime(containerSelector) {
    const contactsList = document.querySelector(containerSelector);
    if (!contactsList) return;
    
    // Convert NodeList to Array for easier manipulation
    const contactItems = Array.from(contactsList.querySelectorAll('.contact-item'));
    
    // Sort contacts by timestamp (newest first)
    contactItems.sort((a, b) => {
        // Get the timestamp from the time element
        // First try to get it from a data attribute if it exists
        const timeA = a.querySelector('.contact-time').getAttribute('data-timestamp') || 
                     a.querySelector('.contact-time').id || 
                     a.querySelector('.contact-time').textContent;
        const timeB = b.querySelector('.contact-time').getAttribute('data-timestamp') || 
                     b.querySelector('.contact-time').id || 
                     b.querySelector('.contact-time').textContent;
        
        // Try to convert to timestamps for comparison
        try {
            const dateA = new Date(timeA);
            const dateB = new Date(timeB);
            
            // If both are valid dates, compare them
            if (!isNaN(dateA) && !isNaN(dateB)) {
                return dateB - dateA; // Newest first
            }
        } catch (e) {
            console.warn('Error comparing dates:', e);
        }
        
        // Fallback to string comparison if dates are invalid
        return String(timeB).localeCompare(String(timeA));
    });
    
    // Reattach nodes in sorted order
    contactItems.forEach(item => {
        contactsList.appendChild(item); // Moving DOM node also removes it from previous position
    });
}