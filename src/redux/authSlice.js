import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        suggestedUsers: [],
        userProfile: null,
        selectedUser: null,
        chatSidebarOpen: false,
    },
    reducers: {
        setAuthUser: (state, action) => {
            state.user = action.payload;
        },
        setSuggestedUsers: (state, action) => {
            state.suggestedUsers = action.payload;
        },
        setUserProfile: (state, action) => {
            state.userProfile = action.payload;
        },
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },
        toggleChatSidebar: (state, action) => {
            state.chatSidebarOpen = action.payload;
        },
        // follow/unfollow
        toggleFollowUser: (state, action) => {
            const targetId = action.payload;
            if (!state.user) return;
            const isFollowing = state.user.following?.includes(targetId);
            if (!state.user.following) state.user.following = [];
            if (state.userProfile && !state.userProfile.followers) state.userProfile.followers = [];
            if (isFollowing) {
                state.user.following = state.user.following.filter(id => id !== targetId);
                if (state.userProfile?._id === targetId) {
                    state.userProfile.followers = state.userProfile.followers.filter(id => id !== state.user._id);
                }
            } else {
                state.user.following.push(targetId);
                if (state.userProfile?._id === targetId) {
                    state.userProfile.followers.push(state.user._id);
                }
            }
        },
        removeFromSuggested: (state, action) => {
            const id = action.payload;
            state.suggestedUsers = state.suggestedUsers.filter(u => u._id !== id);
        }
    }
});
export const {
    setAuthUser,
    setSuggestedUsers,
    setUserProfile,
    setSelectedUser,
    toggleChatSidebar, // Cette ligne a été ajoutée
    toggleFollowUser,
    removeFromSuggested
} = authSlice.actions;
export default authSlice.reducer;