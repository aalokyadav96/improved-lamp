import { API_URL, state } from "../../state/state.js";
import { apiFetch } from "../../api/api.js";
import { handleError } from "../../utils/utils.js";
import Snackbar from '../../components/ui/Snackbar.mjs';
import { renderPage, navigate } from "../../routes/index.js";
import { logout } from "../../services/auth/authService.js";
import Modal from '../../components/ui/Modal.mjs';
import Sightbox from '../../components/ui/Sightbox.mjs';


// Fetch the profile either from localStorage or via an API request
async function fetchProfile() {
    // Try to get the profile from localStorage first
    const cachedProfile = localStorage.getItem("userProfile");

    // If cached profile is found, use it
    if (cachedProfile) {
        state.userProfile = JSON.parse(cachedProfile);
        return state.userProfile; // Return cached profile
    }

    // If there is no cached profile, fetch from the API
    if (state.token) {
        try {
            const response = await fetch(`${API_URL}/profile`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${state.token}`,
                },
            });

            // Check if the response is OK
            if (response.ok) {
                const profile = await response.json();
                state.userProfile = profile;
                localStorage.setItem("userProfile", JSON.stringify(profile)); // Cache the profile in localStorage
                return profile; // Return the fetched profile
            } else {
                const errorData = await response.json();
                console.error(`Error fetching profile: ${response.status} - ${response.statusText}`, errorData);

                Snackbar(`Error fetching profile: ${errorData.error || 'Unknown error'}`, 3000);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);

            Snackbar("An unexpected error occurred while fetching the profile.", 3000);
        }
    } else {
        // If no token exists, assume user is not logged in and clear the profile
        state.userProfile = null;
    }

    return null; // Return null if no profile found
}

// Display the profile content in the profile section
async function displayProfile(content) {
    content.textContent = ""; // Clear existing content

    try {
        const profile = await fetchProfile();
        if (profile) {
            const profileElement = generateProfileElement(profile);
            console.log(profile);
            content.appendChild(profileElement);
            attachProfileEventListeners(content); // Attach event listeners for buttons
            displayFollowSuggestions();
        } else {
            const loginMessage = document.createElement("p");
            loginMessage.textContent = "Please log in to see your profile.";
            profileSection.appendChild(loginMessage);
        }
    } catch (error) {
        const errorMessage = document.createElement("p");
        errorMessage.textContent = "Failed to load profile. Please try again later.";
        content.appendChild(errorMessage);
    }
}

// Generate the profile DOM elements
function generateProfileElement(profile) {
    const profileContainer = document.createElement("div");
    profileContainer.className = "profile-container hflex";

    const section = document.createElement("section");
    section.className = "channel";

    // Profile Picture and Background
    const bgImg = document.createElement("span");
    bgImg.className = "bg_img";
    bgImg.style.backgroundImage = `url(/userpic/${profile.profile_picture || 'default.png'})`;

    /************** */
    bgImg.addEventListener('click', () => {
        // Open the Sightbox with an image when the button is clicked
        Sightbox(`/userpic/${profile.profile_picture || 'default.png'}`, 'image');
    });
    /************** */

    const profileArea = document.createElement("div");
    profileArea.className = "profile_area";

    const thumb = document.createElement("span");
    thumb.className = "thumb";

    const img = document.createElement("img");
    img.src = `/userpic/${profile.profile_picture || 'default.png'}`;
    img.alt = "Profile Picture";
    img.className = "imgful";

    thumb.appendChild(img);
    profileArea.appendChild(thumb);

    /************** */
    thumb.addEventListener('click', () => {
        // Open the Sightbox with an image when the button is clicked
        Sightbox(`/userpic/${profile.profile_picture || 'default.png'}`, 'image');
    });
    /************** */

    // Profile Details
    const profileDetails = document.createElement("div");
    profileDetails.className = "profile-details";

    const username = document.createElement("h2");
    username.className = "username";
    username.textContent = profile.username || "Not provided";

    const name = document.createElement("p");
    name.className = "name";
    name.textContent = profile.name || "";

    const email = document.createElement("p");
    email.className = "email";
    email.textContent = profile.email || "";

    const bio = document.createElement("p");
    bio.className = "bio";
    bio.textContent = profile.bio || "";

    const profileActions = document.createElement("div");
    profileActions.className = "profile-actions";

    const editButton = document.createElement("button");
    editButton.className = "btn edit-btn";
    editButton.dataset.action = "edit-profile";
    editButton.textContent = "Edit Profile";

    profileActions.appendChild(editButton);

    const profileInfo = document.createElement("div");
    profileInfo.className = "profile-info";

    const infoItems = [
        { label: "Last Login", value: formatDate(profile.last_login) || "Never logged in" },
        { label: "Account Status", value: profile.is_active ? "Active" : "Inactive" },
        { label: "Verification Status", value: profile.is_verified ? "Verified" : "Not Verified" },
    ];

    infoItems.forEach(item => {
        const infoItem = document.createElement("div");
        infoItem.className = "info-item";
        infoItem.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
        profileInfo.appendChild(infoItem);
    });

    profileDetails.append(username, name, email, bio, profileActions, profileInfo);

    // Statistics
    const statistics = document.createElement("div");
    statistics.className = "statistics";

    const stats = [
        { label: "Posts", value: profile.profile_views || 0 },
        { label: "Followers", value: profile.followers?.length || 0 },
        { label: "Following", value: profile.follows?.length || 0 },
    ];

    stats.forEach(stat => {
        const statItem = document.createElement("p");
        statItem.className = "hflex";
        statItem.innerHTML = `<strong>${stat.value}</strong> ${stat.label}`;
        statistics.appendChild(statItem);
    });

    // Follow Suggestions
    const followSuggestions = document.createElement("div");
    followSuggestions.id = "follow-suggestions";
    followSuggestions.className = "follow-suggestions";

    // Delete Profile Button
    const deleteProfileButton = document.createElement("button");
    deleteProfileButton.className = "btn delete-btn";
    deleteProfileButton.dataset.action = "delete-profile";
    deleteProfileButton.textContent = "Delete Profile";

    const deleteActions = document.createElement("div");
    deleteActions.className = "profile-actions";
    deleteActions.appendChild(deleteProfileButton);

    // Assemble Section
    section.append(bgImg, profileArea, profileDetails, statistics, followSuggestions, deleteActions);
    profileContainer.appendChild(section);

    return profileContainer;
}

// Generate the HTML content for the profile
function generateProfileHTML(profile) {
    return `
        <div class="profile-container hflex">    
            <section class="channel">
                <span class="bg_img" style="background-image:url(/userpic/${profile.profile_picture || 'default.png'});"></span>
                <div class="profile_area">
                    <span class="thumb">
                        <img src="/userpic/${profile.profile_picture || 'default.png'}" class="imgful" alt="Profile Picture"/>
                    </span>     
                </div> 
                <div class="profile-details">
                    <h2 class="username">${profile.username || 'Not provided'}</h2>
                    <p class="name">${profile.name || ''}</p>
                    <p class="email">${profile.email || ''}</p>
                    <p class="bio">${profile.bio || ''}</p>
                    <div class="profile-actions">
                        <button class="btn edit-btn" data-action="edit-profile">Edit Profile</button>
                    </div>
                    <div class="profile-info">
                        <div class="info-item"><strong>Last Login:</strong> ${formatDate(profile.last_login) || 'Never logged in'}</div>
                        <div class="info-item"><strong>Account Status:</strong> ${profile.is_active ? 'Active' : 'Inactive'}</div>
                        <div class="info-item"><strong>Verification Status:</strong> ${profile.is_verified ? 'Verified' : 'Not Verified'}</div>
                    </div>
                </div>
                <div class="statistics">
                    <p class="hflex"><strong>${profile.profile_views || 0}</strong> Posts</p>
                    <p class="hflex"><strong>${profile.followers?.length || 0}</strong> Followers</p>
                    <p class="hflex"><strong>${profile.follows?.length || 0}</strong> Following</p>
                </div>
                <div id="follow-suggestions" class="follow-suggestions"></div>
                <br>
                <div class="profile-actions">
                    <button class="btn delete-btn" data-action="delete-profile">Delete Profile</button>
                </div>
            </section>
        </div>
    `;
}

// Fetch the user profile
async function fetchUserProfile(username) {
    try {
        const data = await apiFetch(`/user/${username}`);
        return data?.is_following !== undefined ? data : null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}


function renderUserProfile(profile) {
    const profileContainer = document.createElement("div");
    profileContainer.className = "profile-container";

    // Profile Header
    const profileHeader = document.createElement("div");
    profileHeader.className = "profile-header";

    const profilePicture = document.createElement("img");
    profilePicture.className = "profile-picture";
    profilePicture.src = `/userpic/${profile.profile_picture || "default.png"}`;
    profilePicture.alt = "Profile Picture";

    const profileDetails = document.createElement("div");
    profileDetails.className = "profile-details";

    const username = document.createElement("h2");
    username.className = "username";
    username.textContent = profile.username || "Not provided";

    const name = document.createElement("p");
    name.className = "name";
    name.textContent = profile.name || "Not provided";

    const email = document.createElement("p");
    email.className = "email";
    email.textContent = profile.email || "Not provided";

    const bio = document.createElement("p");
    bio.className = "bio";
    bio.textContent = profile.bio || "No bio available.";

    profileDetails.append(username, name, email, bio);
    profileHeader.append(profilePicture, profileDetails);

    // Profile Stats
    const profileStats = document.createElement("div");
    profileStats.className = "profile-stats";

    const stats = [
        { label: "Followers", value: profile.followers?.length || 0 },
        { label: "Following", value: profile.follows?.length || 0 },
        { label: "Profile Views", value: profile.profile_views || 0 },
    ];

    stats.forEach(stat => {
        const statDiv = document.createElement("div");
        statDiv.className = "stat";
        statDiv.innerHTML = `<strong>${stat.label}:</strong> ${stat.value}`;
        profileStats.appendChild(statDiv);
    });

    // Profile Actions
    const profileActions = document.createElement("div");
    profileActions.className = "profile-actions";

    if (state.token && profile.userid !== state.user) {
        const followButton = document.createElement("button");
        followButton.className = "btn follow-button";
        followButton.dataset.action = "toggle-follow";
        followButton.dataset.userid = profile.userid;
        followButton.textContent = profile.isFollowing ? "Unfollow" : "Follow";

        profileActions.appendChild(followButton);
    }

    // Profile Info
    const profileInfo = document.createElement("div");
    profileInfo.className = "profile-info";

    const infoItems = [
        { label: "Phone Number", value: profile.phone_number || "Not provided" },
        { label: "Address", value: profile.address || "Not provided" },
        { label: "Date of Birth", value: formatDate(profile.date_of_birth) || "Not provided" },
        { label: "Last Login", value: formatDate(profile.last_login) || "Never logged in" },
        { label: "Account Status", value: profile.is_active ? "Active" : "Inactive" },
        { label: "Verification Status", value: profile.is_verified ? "Verified" : "Not Verified" },
    ];

    infoItems.forEach(item => {
        const infoItem = document.createElement("div");
        infoItem.className = "info-item";
        infoItem.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
        profileInfo.appendChild(infoItem);
    });

    profileContainer.append(profileHeader, profileStats, profileActions, profileInfo);
    return profileContainer;
}

async function displayUserProfile(username) {
    const content = document.getElementById("content");
    content.textContent = ""; // Clear existing content

    try {
        const userProfile = await fetchUserProfile(username);

        if (userProfile) {
            const profileElement = renderUserProfile(userProfile);
            content.appendChild(profileElement);
            attachUserProfileListeners(userProfile); // Attach relevant event listeners
        } else {
            const notFoundMessage = document.createElement("p");
            notFoundMessage.textContent = "User not found.";
            content.appendChild(notFoundMessage);
        }
    } catch (error) {
        const errorMessage = document.createElement("p");
        errorMessage.textContent = "Failed to load user profile. Please try again later.";
        content.appendChild(errorMessage);


        Snackbar("Error fetching user profile.", 3000);
    }
}

// Attach event listeners for the profile page
function attachProfileEventListeners() {
    const editButton = document.querySelector('[data-action="edit-profile"]');
    const deleteButton = document.querySelector('[data-action="delete-profile"]');

    if (editButton) {
        editButton.addEventListener("click", () => {
            editProfile(content);
        });
    }

    if (deleteButton) {
        deleteButton.addEventListener("click", () => {
            deleteProfile();
        });
    }
}

// Attach event listeners for user-specific profile actions
function attachUserProfileListeners(profile) {
    const followButton = document.querySelector(`[data-userid="${profile.userid}"]`);
    if (followButton) {
        followButton.addEventListener("click", () => {
            toggleFollow(profile.userid);
        });
    }
}

// Utility function to format dates
function formatDate(dateString) {
    return dateString ? new Date(dateString).toLocaleString() : null;
}



// Toggle follow/unfollow status for a user
async function toggleFollow(userId) {
    if (!state.token) {

        Snackbar("Please log in to follow users.", 3000);
        return;
    }

    try {
        const data = await apiFetch(`/follows/${userId}`, 'POST');
        const followButton = document.getElementById(`user-${userId}`);

        if (followButton) {
            followButton.textContent = data.isFollowing ? 'Unfollow' : 'Follow';
            followButton.onclick = () => toggleFollow(userId); // Update onclick handler
        }


        Snackbar(`You have ${data.isFollowing ? 'followed' : 'unfollowed'} the user.`, 3000);
    } catch (error) {
        console.error("Error toggling follow status:", error);

        Snackbar(`Failed to update follow status: ${error.message}`, 3000);
    }
}

async function displayFollowSuggestions() {
    const suggestionsSection = document.getElementById("follow-suggestions");
    suggestionsSection.textContent = ""; // Clear existing content

    try {
        const suggestions = await apiFetch('/follow/suggestions');

        if (suggestions && suggestions.length > 0) {
            const heading = document.createElement("h3");
            heading.textContent = "Suggested Users to Follow:";
            suggestionsSection.appendChild(heading);

            const suggestionsList = document.createElement("ul");
            suggestionsList.id = "suggestions-list";

            suggestions.forEach(user => {
                const listItem = document.createElement("li");
                listItem.textContent = user.username;

                const viewProfileButton = document.createElement("button");
                viewProfileButton.className = "view-profile-btn";
                viewProfileButton.textContent = "View Profile";
                viewProfileButton.dataset.username = user.username;
                viewProfileButton.addEventListener("click", () => navigate(`/user/${user.username}`));

                listItem.appendChild(viewProfileButton);
                suggestionsList.appendChild(listItem);
            });

            suggestionsSection.appendChild(suggestionsList);
        } else {
            const noSuggestionsMessage = document.createElement("p");
            noSuggestionsMessage.textContent = "No follow suggestions available.";
            suggestionsSection.appendChild(noSuggestionsMessage);
        }
    } catch (error) {
        console.error("Error loading follow suggestions:", error);

        const errorMessage = document.createElement("p");
        errorMessage.textContent = "Failed to load suggestions.";
        suggestionsSection.appendChild(errorMessage);


        Snackbar("Error loading follow suggestions.", 3000);
    }
}

async function editProfile(content) {
    content.textContent = ""; // Clear existing content

    /************ */
    // Create a button to trigger the modal
    const showmodalbutton = document.createElement('button');
    showmodalbutton.textContent = 'Show Modal';
    showmodalbutton.className = 'show-modal-button';

    // Attach the click event to show the modal
    showmodalbutton.addEventListener('click', () => {
        const content = document.createElement('p');
        content.textContent = 'This is the modal content.';

        const modal = Modal({
            title: 'Example Modal',
            content,
            onClose: () => modal.remove(),
        });
    });

    content.appendChild(showmodalbutton);
    /******** */

    if (!state.userProfile) {

        Snackbar("Please log in to edit your profile.", 3000);
        return;
    }

    const { username, email, bio, phone_number, socialLinks, profile_picture } = state.userProfile;
    const profilePictureSrc = profile_picture ? `/userpic/${profile_picture}` : '';

    const heading = document.createElement("h2");
    heading.textContent = "Edit Profile";
    content.appendChild(heading);

    const form = document.createElement("form");
    form.id = "edit-profile-form";

    const fields = [
        { label: "Username", id: "edit-username", type: "text", value: username },
        { label: "Email", id: "edit-email", type: "email", value: email },
        { label: "Bio", id: "edit-bio", type: "textarea", value: bio || '' },
        { label: "Phone Number", id: "edit-phone", type: "text", value: phone_number || '' },
        { label: "Social Links", id: "edit-social", type: "text", value: socialLinks ? Object.values(socialLinks).join(', ') : '' },
        { label: "Profile Picture", id: "edit-profile-picture", type: "file", accept: "image/*" }
    ];

    fields.forEach(field => {
        const fieldGroup = document.createElement("div");
        fieldGroup.classList.add("form-group");

        const label = document.createElement("label");
        label.setAttribute("for", field.id);
        label.textContent = field.label;

        let input;
        if (field.type === "textarea") {
            input = document.createElement("textarea");
            input.textContent = field.value || '';
        } else {
            input = document.createElement("input");
            input.type = field.type;
            input.value = field.value || '';
            if (field.accept) input.accept = field.accept;
        }

        input.id = field.id;
        fieldGroup.appendChild(label);
        fieldGroup.appendChild(input);
        form.appendChild(fieldGroup);
    });

    if (profilePictureSrc) {
        const currentPictureDiv = document.createElement("div");
        const currentPictureLabel = document.createElement("p");
        currentPictureLabel.textContent = "Current Profile Picture:";

        const currentPictureImg = document.createElement("img");
        currentPictureImg.id = "current-profile-picture";
        currentPictureImg.src = profilePictureSrc;
        currentPictureImg.style.maxWidth = "200px";

        currentPictureDiv.appendChild(currentPictureLabel);
        currentPictureDiv.appendChild(currentPictureImg);
        form.appendChild(currentPictureDiv);
    }

    const previewImg = document.createElement("img");
    previewImg.id = "profile-picture-preview";
    previewImg.style.display = "none";
    previewImg.style.maxWidth = "200px";
    form.appendChild(previewImg);

    const updateButton = document.createElement("button");
    updateButton.type = "button";
    updateButton.id = "update-profile-btn";
    updateButton.textContent = "Update Profile";
    updateButton.addEventListener("click", updateProfile);

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.id = "cancel-profile-btn";
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", renderPage);

    form.appendChild(updateButton);
    form.appendChild(cancelButton);

    content.appendChild(form);
    document.getElementById("edit-profile-picture").addEventListener("change", previewProfilePicture);
}


// Update profile (only send changed fields)
async function updateProfile() {
    if (!state.token) {

        Snackbar("Please log in to update your profile.", 3000);
        return;
    }

    const profileSection = document.getElementById("content");
    const form = document.getElementById("edit-profile-form");

    if (!form) {

        Snackbar("Profile edit form is not available.", 3000);
        return;
    }

    // Get current profile data from the state
    const currentProfile = state.userProfile || {};

    // Extract form inputs
    const formData = new FormData(form);

    const newUsername = formData.get("edit-username")?.trim() || "";
    const newEmail = formData.get("edit-email")?.trim() || "";
    const newBio = formData.get("edit-bio")?.trim() || "";
    const newPhone = formData.get("edit-phone")?.trim() || "";
    const socialLinksInput = formData.get("edit-social") || "";
    const profilePictureFile = document.getElementById("edit-profile-picture").files[0];

    // Process social links
    let newSocialLinks = [];
    if (socialLinksInput) {
        newSocialLinks = socialLinksInput
            .split(',')
            .map(link => link.trim())
            .filter(link => link);
    }

    // Determine which fields have changed
    const updatedFields = {};
    if (newUsername && newUsername !== currentProfile.username) {
        updatedFields.username = newUsername;
    }
    if (newEmail && newEmail !== currentProfile.email) {
        updatedFields.email = newEmail;
    }
    if (newBio && newBio !== currentProfile.bio) {
        updatedFields.bio = newBio;
    }
    if (newPhone && newPhone !== currentProfile.phone_number) {
        updatedFields.phone_number = newPhone;
    }
    if (
        JSON.stringify(newSocialLinks) !== JSON.stringify(currentProfile.socialLinks)
    ) {
        updatedFields.social_links = newSocialLinks;
    }
    if (profilePictureFile) {
        updatedFields.profile_picture = profilePictureFile;
    }

    // If no fields have changed, notify the user and exit
    if (Object.keys(updatedFields).length === 0) {

        Snackbar("No changes were made to the profile.", 3000);
        return;
    }

    const loadingMsg = document.createElement("p");
    loadingMsg.id = "loading-msg";
    loadingMsg.textContent = "Updating...";
    profileSection.appendChild(loadingMsg);

    try {
        const updateFormData = new FormData();

        // Append only the changed fields to the FormData
        Object.entries(updatedFields).forEach(([key, value]) => {
            if (key === "social_links") {
                updateFormData.append(key, JSON.stringify(value));
            } else {
                updateFormData.append(key, value);
            }
        });

        // API call to update profile
        const updatedProfile = await apiFetch('/profile', 'PUT', updateFormData);

        if (!updatedProfile) {
            throw new Error("No response received for the profile update.");
        }

        // Update cached profile in state and localStorage
        state.userProfile = { ...currentProfile, ...updatedProfile };
        localStorage.setItem("userProfile", JSON.stringify(state.userProfile));


        Snackbar("Profile updated successfully.", 3000);
        renderPage(); // Reload the page after the update

    } catch (error) {
        console.error("Error updating profile:", error);
        handleError("Error updating profile. Please try again.");
    } finally {
        loadingMsg.remove();
    }
}

// Preview profile picture
function previewProfilePicture(event) {
    const file = event.target.files[0];
    const preview = document.getElementById("profile-picture-preview");

    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            preview.src = reader.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}


async function displaySuggested() {
    const content = document.getElementById("suggested");

    // Check if userProfile is available
    if (state.userProfile) {
        // If userProfile exists, display relevant details from the profile
        content.innerHTML = `
            <h1>Suggested for ${state.userProfile.username || state.user}</h1>
            <p>Email: ${state.userProfile.email || 'N/A'}</p>
            <p>Location: ${state.userProfile.location || 'N/A'}</p>
        `;
    } else {
        // If no userProfile is available, fall back to displaying the username
        content.innerHTML = `<h1>Welcome, ${state.user || 'Guest'}</h1>`;
    }
}

async function deleteProfile() {
    if (!state.token) {

        Snackbar("Please log in to delete your profile.", 3000);
        return;
    }

    const confirmDelete = confirm("Are you sure you want to delete your profile? This action cannot be undone.");
    if (!confirmDelete) {
        return;
    }

    try {
        await apiFetch('/profile', 'DELETE');

        Snackbar("Profile deleted successfully.", 3000);
        logout();
    } catch (error) {

        Snackbar(`Failed to delete profile: ${error.message}`, 3000);
    }
};


export { fetchProfile, displayProfile, generateProfileHTML, fetchUserProfile, renderUserProfile, displayUserProfile, deleteProfile, displayFollowSuggestions, editProfile, previewProfilePicture, updateProfile, displaySuggested, toggleFollow };