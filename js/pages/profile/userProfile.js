import {fetchProfile, displayProfile, generateProfileHTML, fetchUserProfile, renderUserProfile, displayUserProfile, deleteProfile, displayFollowSuggestions, editProfile, previewProfilePicture, updateProfile, displaySuggested, toggleFollow} from "../../services/profile/userProfileService";

function UserProfile(contentContainer) {
    contentContainer.innerHTML = '';
    displayProfile(contentContainer);
}

export { UserProfile, displayUserProfile };
