// Dans votre slice user
const userSlice = createSlice({
    name: 'user',
    initialState: {
        suggestedUsers: [],
        // ... autres états
    },
    reducers: {
        setSuggestedUsers: (state, action) => {
            state.suggestedUsers = action.payload;
        },
        removeSuggestedUser: (state, action) => {
            state.suggestedUsers = state.suggestedUsers.filter(
                user => user._id !== action.payload
            );
        },
        // ... autres reducers
    }
});