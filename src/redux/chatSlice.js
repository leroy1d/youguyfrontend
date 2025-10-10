import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        onlineUsers: [],
        messages: [],
    },
    reducers: {
        // actions
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        updateMessageLikes: (state, action) => {
            const { messageId, likes } = action.payload;
            const message = state.messages.find(m => m._id === messageId);
            if (message) {
                message.likes = likes;
            }
        },
    }
});

// Ajoutez addMessage et updateMessageLikes aux exports
export const { 
    setOnlineUsers, 
    setMessages, 
    addMessage, 
    updateMessageLikes 
} = chatSlice.actions;

export default chatSlice.reducer;