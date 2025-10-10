import { createSlice } from "@reduxjs/toolkit";
const reelSlice = createSlice({
    name:'reel',
    initialState:{
        reels:[],
        selectedReel:null,
    },
    reducers:{
        //actions
        setReels:(state,action) => {
            state.reels = action.payload;
        },
        setSelectedReel:(state,action) => {
            state.selectedReel   = action.payload;
        }
    }
});
export const {setReels, setSelectedReel} = reelSlice.actions;
export default reelSlice.reducer;